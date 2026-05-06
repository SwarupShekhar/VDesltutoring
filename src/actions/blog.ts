'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { redis } from '@/lib/redis'
import { sendWorkflowEmail } from '@/lib/mail'
import { AuditLogger } from '@/lib/audit-logger'

async function ensureAdmin() {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    // Production-grade Redis Rate Limiting (30 requests per minute)
    try {
        const rateLimitKey = `rate_limit:blog_admin:${userId}`
        const currentCount = await redis.incr(rateLimitKey)
        
        // Safety: Always set or refresh TTL to prevent "Eternal Ban" if expire fails
        await redis.expire(rateLimitKey, 60)

        if (currentCount > 30) {
            console.warn(`[RateLimit] Admin ${userId} exceeded limit on Redis.`)
            throw new Error("Too many requests. Please slow down.")
        }
    } catch (e: any) {
        // If it's our own rate limit error, rethrow it
        if (e.message === "Too many requests. Please slow down.") throw e;
        // Otherwise, log connection error but allow admin to proceed
        console.error("[RedisError] Rate limiting failed, falling back to open access:", e.message)
    }

    const user = await prisma.users.findUnique({
        where: { clerkId: userId }
    })

    if (!user || user.role !== 'ADMIN') {
        console.error(`[AuthError] Access denied for user ${userId}. Role: ${user?.role || 'NONE'}`)
        throw new Error("Unauthorized: Admin access required")
    }
    return { clerkId: userId, dbId: user.id }
}

async function ensureTutorOrAdmin(postId?: string) {
    const { userId: clerkId } = await auth()
    if (!clerkId) throw new Error("Unauthorized")

    const user = await prisma.users.findUnique({
        where: { clerkId }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'TUTOR')) {
        console.error(`[AuthError] Access denied for user ${clerkId}. Role: ${user?.role || 'NONE'}`)
        throw new Error("Unauthorized: Access denied")
    }

    // If a postId is provided and the user is a TUTOR, ensure they own the post
    if (postId && user.role === 'TUTOR') {
        const post = await prisma.blog_posts.findUnique({
            where: { id: postId },
            select: { author_id: true }
        })
        if (post && post.author_id !== user.id) {
            console.error(`[AuthError] Tutor ${user.id} attempted to access post ${postId} owned by ${post.author_id}`)
            throw new Error("Unauthorized: You do not have permission to modify this post")
        }
    }

    return { clerkId, dbId: user.id, role: user.role }
}

function extractTitleFromContent(content: string): string | null {
    const match = content.match(/^#\s+(.+)$/m);
    if (!match) return null;
    // Strip markdown formatting like [Link](URL), **, etc from the extracted title
    return match[1]
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Strip links
        .replace(/[*_~`]/g, '') // Strip basic formatting
        .trim();
}

function sanitizeSlug(slug: string): string {
    return slug
        .toLowerCase()
        .replace(/^blog\//, '')
        .replace(/^\//, '')
        .replace(/\/$/, '')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

export async function checkSlugUniqueness(slug: string, excludeId?: string) {
    const cleanSlug = sanitizeSlug(slug)
    const existing = await prisma.blog_posts.findFirst({
        where: {
            slug: cleanSlug,
            id: excludeId ? { not: excludeId } : undefined
        }
    })
    return { isUnique: !existing }
}

export async function createPost(title: string, slug: string) {
    const { dbId, role } = await ensureTutorOrAdmin()
    const cleanSlug = sanitizeSlug(slug)

    try {
        const post = await prisma.blog_posts.create({
            data: {
                title,
                slug: cleanSlug,
                content: '',
                status: 'draft',
                author_id: dbId,
            }
        })

        // Audit Logging
        await AuditLogger.logUserAction(prisma, {
            userId: dbId,
            userType: role === 'ADMIN' ? 'ADMIN' : 'TUTOR',
            action: `Blog post created: ${title}`,
            resourceId: post.id,
            resourceType: 'blog_post',
            details: { initialSlug: cleanSlug, status: 'draft' }
        })

        return { success: true, id: post.id }
    } catch (error) {
        console.error("Failed to create post:", error)
        return { success: false, error: "Failed to create post. Slug might be taken." }
    }
}

export async function updatePost(id: string, data: {
    title?: string,
    content?: string,
    cover?: string,
    status?: string,
    slug?: string,
    seo_title?: string,
    meta_description?: string,
    excerpt?: string,
    category?: string,
    focal_keyword?: string,
    alt_text?: string,
    published_at?: Date | null,
    relatedPostIds?: string[]
}) {
    const { role, dbId } = await ensureTutorOrAdmin(id)

    // Capture current state
    const currentPost = await prisma.blog_posts.findUnique({ where: { id } })
    if (!currentPost) throw new Error("Post not found")

    // Security Guard: Tutors cannot self-publish or edit under-review/published posts
    if (role === 'TUTOR') {
        if (data.status === 'published') {
            throw new Error("Unauthorized: Tutors cannot publish posts directly")
        }
        if (currentPost.status === 'submitted' || currentPost.status === 'published') {
            throw new Error("Unauthorized: You cannot edit a post that is under review or published")
        }
        if (data.status && data.status !== 'draft') {
            throw new Error("Unauthorized: Tutors can only save posts as 'draft'")
        }
    }

    try {
        // Automatically extract title from content if H1 is present
        let finalTitle = data.title;
        if (data.content) {
            const extractedTitle = extractTitleFromContent(data.content);
            if (extractedTitle) {
                finalTitle = extractedTitle;
            }
        }

        // Capture revision snapshot before applying update
        const post = currentPost as any;
        
        // Track changes in content OR metadata
        const hasContentChange = post && post.content !== data.content
        const hasMetaChange = post && (
            post.title !== data.title ||
            post.cover !== data.cover ||
            post.seo_title !== data.seo_title ||
            post.meta_description !== data.meta_description
        )

        if (post && (hasContentChange || hasMetaChange)) {
            // @ts-ignore - revisions model definitely exists in DB
            await prisma.blog_post_revisions.create({
                data: {
                    postId: id,
                    content: post.content,
                    title: post.title,
                    authorId: post.author_id,
                    metadata: {
                        cover: post.cover,
                        focal_keyword: post.focal_keyword,
                        seo_title: post.seo_title,
                        meta_description: post.meta_description
                    }
                }
            })
        }

        // Resolve manual related posts if provided
        let manualRelatedPosts: any[] | undefined = undefined
        if (data.relatedPostIds !== undefined) {
            if (data.relatedPostIds.length > 0) {
                const picked = await prisma.blog_posts.findMany({
                    where: { id: { in: data.relatedPostIds }, status: 'published' },
                    select: { id: true, slug: true, title: true, cover: true, excerpt: true, category: true }
                })
                // Preserve user-specified order
                manualRelatedPosts = data.relatedPostIds
                    .map(pid => picked.find(p => p.id === pid))
                    .filter(Boolean)
                    .map(p => ({ slug: p!.slug, title: p!.title, cover: p!.cover, excerpt: p!.excerpt, category: p!.category }))
            } else {
                manualRelatedPosts = []
            }
        }

        // Remove relatedPostIds from data before spreading into Prisma (not a DB column)
        const { relatedPostIds: _rids, ...prismaData } = data

        await prisma.blog_posts.update({
            where: { id },
            data: {
                ...prismaData,
                slug: prismaData.slug ? sanitizeSlug(prismaData.slug) : undefined,
                title: finalTitle,
                updatedAt: new Date(),
                ...(manualRelatedPosts !== undefined ? { related_posts: manualRelatedPosts as any } : {})
            }
        })

        // Log transition if status changed
        if (data.status && data.status !== currentPost.status) {
            await AuditLogger.logUserAction(prisma, {
                userId: dbId,
                userType: role === 'ADMIN' ? 'ADMIN' : 'TUTOR',
                action: `Blog post status updated to ${data.status}: ${currentPost.title}`,
                resourceId: id,
                resourceType: 'blog_post',
                details: { previousStatus: currentPost.status, newStatus: data.status }
            })
        }

        // Recompute related posts — skip if user manually set them
        if (manualRelatedPosts === undefined) {
            await computeRelatedPosts(id)
            const categoryToRefresh = prismaData.category || (currentPost as any)?.category
            if (categoryToRefresh) {
                await cascadeRefreshRelated(categoryToRefresh, id)
            }
        }

        // Revalidate with wildcard to handle localized routes
        revalidatePath('/', 'layout')
        
        return { success: true }
    } catch (error) {
        console.error("Failed to update post:", error)
        return { success: false, error: "Failed to update post" }
    }
}

export async function deletePost(id: string) {
    const { dbId, role } = await ensureTutorOrAdmin(id)

    try {
        // Fetch post to check status before deletion
        const post = await prisma.blog_posts.findUnique({
            where: { id },
            select: { status: true, title: true }
        })
        if (!post) {
            throw new Error("Post not found")
        }

        // State machine guard: tutors cannot delete submitted or published posts
        if (role === 'TUTOR' && (post.status === 'submitted' || post.status === 'published')) {
            throw new Error(`Cannot delete post in '${post.status}' status`)
        }

        await prisma.blog_posts.delete({
            where: { id }
        })

        // Audit Logging
        await AuditLogger.logUserAction(prisma, {
            userId: dbId,
            userType: role === 'ADMIN' ? 'ADMIN' : 'TUTOR',
            action: `Blog post deleted: ${post.title}`,
            resourceId: id,
            resourceType: 'blog_post',
            details: { previousStatus: post.status }
        })

        revalidatePath('/blog')
        revalidatePath('/admin/blog')
        revalidatePath('/tutor/blog')
        return { success: true }
    } catch (error: any) {
        console.error("Failed to delete post:", error)
        return { success: false, error: error.message || "Failed to delete post" }
    }
}

export async function submitForReview(id: string) {
    const { dbId, role } = await ensureTutorOrAdmin(id)
    
    const post = await prisma.blog_posts.findUnique({
        where: { id },
        include: { author: true }
    })
    
    if (!post) throw new Error("Post not found")

    // State machine guard
    if (post.status !== 'draft' && post.status !== 'needs_rework') {
        throw new Error(`Unauthorized: Cannot submit post in '${post.status}' status`)
    }
    
    await prisma.blog_posts.update({
        where: { id },
        data: {
            status: 'submitted',
            submitted_at: new Date(),
            submitted_by: dbId
        }
    })

    // Audit Logging
    await AuditLogger.logUserAction(prisma, {
        userId: dbId,
        userType: role === 'ADMIN' ? 'ADMIN' : 'TUTOR',
        action: `Blog post submitted for review: ${post.title}`,
        resourceId: id,
        resourceType: 'blog_post',
        details: { previousStatus: post.status, newStatus: 'submitted' }
    })

    // Notify Admin (swarupshekhar.vaidikedu@gmail.com)
    const admin = await prisma.users.findUnique({
        where: { email: 'swarupshekhar.vaidikedu@gmail.com' }
    })

    if (admin) {
        await prisma.notifications.create({
            data: {
                user_id: admin.id,
                title: "New Blog Post Submitted",
                message: `Post "${post.title}" by ${post.author.full_name} has been submitted for review.`
            }
        })

        await sendWorkflowEmail({
            to: admin.email,
            subject: "Blog Post Ready for Review",
            html: `
                <p>A new blog post <strong>"${post.title}"</strong> has been submitted by <strong>${post.author.full_name}</strong>.</p>
                <p>Please review it in the admin panel.</p>
                <a href="https://vaidikedu.com/admin/blog/edit/${post.id}" style="display: inline-block; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 5px;">Review Post</a>
            `
        })
    }

    revalidatePath('/admin/blog')
    revalidatePath('/tutor/blog')
    return { success: true }
}

export async function approvePost(id: string) {
    const { dbId: adminId } = await ensureAdmin()
    
    const post = await prisma.blog_posts.findUnique({
        where: { id },
        include: { author: true }
    })
    if (!post) throw new Error("Post not found")

    // State machine guard
    if (post.status !== 'submitted' && post.status !== 'draft' && post.status !== 'needs_rework') {
        throw new Error(`Unauthorized: Cannot approve post in '${post.status}' status`)
    }

    await prisma.blog_posts.update({
        where: { id },
        data: {
            status: 'published',
            published_at: new Date(),
            reviewed_at: new Date(),
            reviewed_by: adminId
        }
    })

    // Audit Logging
    await AuditLogger.logUserAction(prisma, {
        userId: adminId,
        userType: 'ADMIN',
        action: `Blog post approved and published: ${post.title}`,
        resourceId: id,
        resourceType: 'blog_post',
        details: { previousStatus: post.status, newStatus: 'published' }
    })

    // Notify Author
    if (post.author) {
        await prisma.notifications.create({
            data: {
                user_id: post.author.id,
                title: "Post Published!",
                message: `Your post "${post.title}" has been approved and published.`
            }
        })

        await sendWorkflowEmail({
            to: post.author.email,
            subject: "Your Blog Post has been Published!",
            html: `
                <p>Congratulations! Your post <strong>"${post.title}"</strong> is now live on the blog.</p>
                <a href="https://vaidikedu.com/blog/${post.slug}" style="display: inline-block; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 5px;">View Post</a>
            `
        })
    }

    revalidatePath('/')
    revalidatePath('/blog')
    revalidatePath('/admin/blog')
    revalidatePath('/tutor/blog')
    return { success: true }
}

export async function rejectPost(id: string, notes: string) {
    const { dbId: adminId } = await ensureAdmin()
    
    const post = await prisma.blog_posts.findUnique({
        where: { id },
        include: { author: true }
    })
    if (!post) throw new Error("Post not found")

    // State machine guard
    if (post.status !== 'submitted') {
        throw new Error(`Unauthorized: Cannot reject post in '${post.status}' status`)
    }

    await prisma.blog_posts.update({
        where: { id },
        data: {
            status: 'needs_rework',
            review_notes: notes,
            reviewed_at: new Date(),
            reviewed_by: adminId
        }
    })

    // Audit Logging
    await AuditLogger.logUserAction(prisma, {
        userId: adminId,
        userType: 'ADMIN',
        action: `Blog post rejected with feedback: ${post.title}`,
        resourceId: id,
        resourceType: 'blog_post',
        details: { previousStatus: post.status, newStatus: 'needs_rework', feedback: notes }
    })

    // Notify Author
    if (post.author) {
        await prisma.notifications.create({
            data: {
                user_id: post.author.id,
                title: "Feedback on your Post",
                message: `Your post "${post.title}" requires some rework. Feedback: ${notes}`
            }
        })

        await sendWorkflowEmail({
            to: post.author.email,
            subject: "Feedback on your Blog Post",
            html: `
                <p>Your post <strong>"${post.title}"</strong> requires some changes before it can be published.</p>
                <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #f44336; margin: 20px 0;">
                    <strong>Admin Feedback:</strong><br/>
                    ${notes}
                </div>
                <p>Please update the post and submit it again for review.</p>
                <a href="https://vaidikedu.com/tutor/blog/edit/${post.id}" style="display: inline-block; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 5px;">Edit Post</a>
            `
        })
    }

    revalidatePath('/admin/blog')
    revalidatePath('/tutor/blog')
    return { success: true }
}

export async function getPost(id: string) {
    await ensureTutorOrAdmin(id)
    return await prisma.blog_posts.findUnique({ where: { id } })
}

export async function getPostsAdmin() {
    await ensureAdmin()
    return await prisma.blog_posts.findMany({
        include: { author: true },
        orderBy: { updatedAt: 'desc' }
    })
}

export async function getTutorPosts(params?: {
    status?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    search?: string;
}) {
    const { dbId } = await ensureTutorOrAdmin()
    
    const whereClause: any = { author_id: dbId }
    
    if (params?.status && params.status !== 'all') {
        whereClause.status = params.status
    }
    
    if (params?.search) {
        whereClause.OR = [
            { title: { contains: params.search, mode: 'insensitive' } },
            { slug: { contains: params.search, mode: 'insensitive' } },
            { category: { contains: params.search, mode: 'insensitive' } }
        ]
    }

    const sortByField = params?.sortBy || 'updatedAt'
    const sortOrder = params?.order || 'desc'
    
    const queryOptions: any = {
        where: whereClause,
        orderBy: { [sortByField]: sortOrder }
    }

    if (params?.page && params?.limit) {
        queryOptions.skip = (params.page - 1) * params.limit
        queryOptions.take = params.limit
    }

    return await prisma.blog_posts.findMany(queryOptions)
}

export async function getBlogRevisions(postId: string) {
    await ensureAdmin()
    // @ts-ignore - Local types may be stale
    return await prisma.blog_post_revisions.findMany({
        where: { postId },
        orderBy: { createdAt: 'desc' },
        take: 20
    })
}

export async function trackShare(postId: string, platform: string) {
    const key = `blog:share_count:${postId}`
    await redis.hincrby(key, platform, 1)
    await redis.hincrby(key, 'total', 1)
    return { success: true }
}

// Public Actions
export async function getPublishedPosts() {
    return await prisma.blog_posts.findMany({
        where: { status: 'published' },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            title: true,
            slug: true,
            cover: true,
            createdAt: true,
            excerpt: true,
            category: true
        }
    })
}

export async function getPublishedPostBySlug(slug: string) {
    try {
        const post = await prisma.blog_posts.findFirst({
            where: { slug: { in: [slug, `blog/${slug}`] } },
            select: {
                id: true,
                title: true,
                slug: true,
                content: true,
                cover: true,
                status: true,
                excerpt: true,
                category: true,
                focal_keyword: true,
                meta_description: true,
                related_posts: true,
                createdAt: true,
                updatedAt: true,
                published_at: true,
                author_id: true,
                views: true
            }
        })

        if (!post || post.status !== 'published') return null

        // Increment views (fire and forget) with error handling
        // We use a separate async block to avoid blocking the main thread
        const incrementViews = async (id: string) => {
            try {
                await prisma.blog_posts.update({
                    where: { id },
                    data: { views: { increment: 1 } }
                })
            } catch (err) {
                console.error(`[BlogViewsError] Failed to increment for ${id}:`, err)
            }
        }
        
        incrementViews(post.id).catch(e => console.error("[BlogViewsError] Promise failure:", e))

        return post
    } catch (e) {
        console.error(`[BlogFetchError] Failed to fetch post by slug "${slug}":`, e)
        return null
    }
}
export async function computeRelatedPosts(postId: string) {
    const post = await prisma.blog_posts.findUnique({
        where: { id: postId },
        select: { id: true, category: true, focal_keyword: true }
    });
    if (!post) return;

    const allPosts = await prisma.blog_posts.findMany({
        where: { 
            id: { not: postId }, 
            status: 'published' 
        },
        select: { id: true, slug: true, title: true, cover: true, excerpt: true, category: true, focal_keyword: true }
    });

    const focalWords = (post.focal_keyword || '').toLowerCase().split(/\s+/).filter(Boolean);

    const scored = allPosts.map(p => {
        let score = 0;
        if (p.category && post.category && p.category.toLowerCase() === post.category.toLowerCase()) {
            score += 2;
        }

        if (focalWords.length > 0) {
            const pText = `${p.title} ${p.focal_keyword || ''}`.toLowerCase();
            focalWords.forEach(word => {
                if (pText.includes(word)) score += 1;
            });
        }

        return {
            slug: p.slug.replace(/^blog\//, ''),
            title: p.title,
            cover: p.cover,
            excerpt: p.excerpt,
            category: p.category,
            score
        };
    }).filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    await prisma.blog_posts.update({
        where: { id: postId },
        data: { related_posts: scored as any }
    });

    return scored;
}

async function cascadeRefreshRelated(categoryId: string | null | undefined, excludeId: string) {
    if (!categoryId) return;
    const siblingPosts = await prisma.blog_posts.findMany({
        where: { 
            category: categoryId, 
            id: { not: excludeId },
            status: 'published' 
        },
        take: 10,
        select: { id: true }
    });
    
    // Process in parallel with minimal concurrency or just Promise.all since it's capped at 10
    await Promise.all(siblingPosts.map(p => computeRelatedPosts(p.id)));
}

export async function backfillRelatedPosts() {
    await ensureAdmin();
    const posts = await prisma.blog_posts.findMany({
        where: { status: 'published' },
        select: { id: true }
    });

    console.log(`[Backfill] Starting for ${posts.length} posts...`);
    let count = 0;
    for (const post of posts) {
        await computeRelatedPosts(post.id);
        count++;
    }
    
    revalidatePath('/blog');
    return { success: true, count };
}

export async function getTutorNotifications() {
    const { dbId } = await ensureTutorOrAdmin()
    // @ts-ignore - Local notifications schema may vary in metadata/relation definition
    return await prisma.notifications.findMany({
        where: { user_id: dbId },
        orderBy: { created_at: 'desc' },
        take: 10
    })
}

export async function getUnreadNotificationCount() {
    const { dbId } = await ensureTutorOrAdmin()
    const count = await prisma.notifications.count({
        where: { user_id: dbId, is_read: false }
    })
    return { count }
}

export async function markNotificationRead(id: string) {
    const { dbId } = await ensureTutorOrAdmin()
    await prisma.notifications.updateMany({
        where: { id, user_id: dbId },
        data: { is_read: true }
    })
    return { success: true }
}

export async function bulkDeletePosts(ids: string[]) {
    const { dbId, role } = await ensureTutorOrAdmin()
    const posts = await prisma.blog_posts.findMany({
        where: { id: { in: ids } },
        select: { id: true, author_id: true, status: true }
    })

    const unauthorized = posts.some(p => role !== 'ADMIN' && p.author_id !== dbId)
    if (unauthorized) {
        throw new Error("Unauthorized: You do not have permission to delete one or more of these posts")
    }

    // Tutors can only delete drafts or needs_rework. Admins can delete any status.
    const deleteIds = role === 'ADMIN'
        ? posts.map(p => p.id)
        : posts
            .filter(p => p.status === 'draft' || p.status === 'needs_rework')
            .map(p => p.id)

    if (deleteIds.length === 0) {
        const errMsg = role === 'ADMIN'
            ? "No posts selected for deletion"
            : "No valid draft or rework posts selected for deletion"
        return { success: false, error: errMsg }
    }

    await prisma.blog_posts.deleteMany({
        where: { id: { in: deleteIds } }
    })

    await AuditLogger.logUserAction(prisma, {
        userId: dbId,
        userType: role === 'ADMIN' ? 'ADMIN' : 'TUTOR',
        action: `Bulk deleted ${deleteIds.length} blog drafts`,
        resourceId: dbId,
        resourceType: 'blog_post',
        details: { deletedIds: deleteIds }
    })

    revalidatePath('/tutor/blog')
    revalidatePath('/admin/blog')
    return { success: true, count: deleteIds.length }
}

export async function bulkSubmitForReview(ids: string[]) {
    const { dbId, role } = await ensureTutorOrAdmin()
    const posts = await prisma.blog_posts.findMany({
        where: { id: { in: ids } },
        select: { id: true, author_id: true, status: true, title: true }
    })

    const unauthorized = posts.some(p => role !== 'ADMIN' && p.author_id !== dbId)
    if (unauthorized) {
        throw new Error("Unauthorized: You do not have permission to submit one or more of these posts")
    }

    const submitIds = posts
        .filter(p => p.status === 'draft' || p.status === 'needs_rework')
        .map(p => p.id)

    if (submitIds.length === 0) {
        return { success: false, error: "No valid draft or needs_rework posts selected for submission" }
    }

    await prisma.blog_posts.updateMany({
        where: { id: { in: submitIds } },
        data: {
            status: 'submitted',
            submitted_at: new Date(),
            submitted_by: dbId
        }
    })

    await AuditLogger.logUserAction(prisma, {
        userId: dbId,
        userType: role === 'ADMIN' ? 'ADMIN' : 'TUTOR',
        action: `Bulk submitted ${submitIds.length} blog posts for review`,
        resourceId: dbId,
        resourceType: 'blog_post',
        details: { submittedIds: submitIds }
    })

    // Notify Admin (swarupshekhar.vaidikedu@gmail.com)
    const admin = await prisma.users.findUnique({
        where: { email: 'swarupshekhar.vaidikedu@gmail.com' }
    })

    if (admin) {
        const titlesList = posts.filter(p => submitIds.includes(p.id)).map(p => `• "${p.title}"`).join('<br/>')
        await prisma.notifications.create({
            data: {
                user_id: admin.id,
                title: "Multiple Blog Posts Submitted",
                message: `${submitIds.length} posts have been submitted for review.`
            }
        })

        await sendWorkflowEmail({
            to: admin.email,
            subject: `${submitIds.length} Blog Posts Ready for Review`,
            html: `
                <p>The following blog posts are ready for your review:</p>
                <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; font-family: sans-serif;">
                    ${titlesList}
                </div>
                <p>Please log in to the Admin Dashboard to review them.</p>
                <a href="https://vaidikedu.com/admin/blog" style="display: inline-block; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 5px;">Go to Admin Blog Hub</a>
            `
        })
    }

    revalidatePath('/tutor/blog')
    revalidatePath('/admin/blog')
    return { success: true, count: submitIds.length }
}

export async function duplicatePost(id: string) {
    const { dbId, role } = await ensureTutorOrAdmin(id)
    const post = await prisma.blog_posts.findUnique({
        where: { id }
    })
    if (!post) throw new Error("Post not found")

    const cleanTitle = `${post.title} (Copy)`
    let cleanSlug = `${post.slug}-copy`

    let isUnique = false
    let iterations = 0
    while (!isUnique) {
        const existing = await prisma.blog_posts.findUnique({
            where: { slug: cleanSlug }
        })
        if (!existing) {
            isUnique = true
        } else {
            iterations++
            cleanSlug = `${post.slug}-copy-${iterations}`
        }
    }

    const duplicated = await prisma.blog_posts.create({
        data: {
            title: cleanTitle,
            slug: cleanSlug,
            content: post.content,
            cover: post.cover,
            status: 'draft',
            author_id: dbId,
            category: post.category,
            excerpt: post.excerpt,
            focal_keyword: post.focal_keyword,
            meta_description: post.meta_description,
            alt_text: post.alt_text,
            seo_title: post.seo_title,
            views: 0
        }
    })

    await AuditLogger.logUserAction(prisma, {
        userId: dbId,
        userType: role === 'ADMIN' ? 'ADMIN' : 'TUTOR',
        action: `Duplicated blog post "${post.title}" as draft`,
        resourceId: duplicated.id,
        resourceType: 'blog_post',
        details: { originalPostId: id, newPostId: duplicated.id }
    })

    revalidatePath('/tutor/blog')
    return { success: true, id: duplicated.id }
}

export async function getTutorBlogAuditLogs() {
    const { dbId } = await ensureTutorOrAdmin()
    const posts = await prisma.blog_posts.findMany({
        where: { author_id: dbId },
        select: { id: true }
    })
    const postIds = posts.map(p => p.id)
    if (postIds.length === 0) return []

    return await prisma.audit_logs.findMany({
        where: {
            resource_type: 'blog_post',
            resource_id: { in: postIds }
        },
        orderBy: { created_at: 'desc' }
    })
}
