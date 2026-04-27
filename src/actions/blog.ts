'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { redis } from '@/lib/redis'

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
    return userId
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
    const userId = await ensureAdmin()
    const cleanSlug = sanitizeSlug(slug)

    try {
        const post = await prisma.blog_posts.create({
            data: {
                title,
                slug: cleanSlug,
                content: '',
                status: 'draft',
                author_id: userId,
            }
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
    await ensureAdmin()

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
        const currentPost = await prisma.blog_posts.findUnique({ where: { id } })
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
    await ensureAdmin()

    try {
        await prisma.blog_posts.delete({
            where: { id }
        })
        revalidatePath('/blog')
        revalidatePath('/admin/blog')
        return { success: true }
    } catch (error) {
        console.error("Failed to delete post:", error)
        return { success: false, error: "Failed to delete post" }
    }
}

export async function getPost(id: string) {
    // Admin read
    await ensureAdmin()
    return await prisma.blog_posts.findUnique({ where: { id } })
}

export async function getPostsAdmin() {
    await ensureAdmin()
    return await prisma.blog_posts.findMany({
        orderBy: { updatedAt: 'desc' }
    })
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
