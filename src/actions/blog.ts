'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'

// Helper to ensure admin
async function ensureAdmin() {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    // In a real app check role, but for now we assume /admin layout does the check
    // or we can fetch user and check role
    const user = await prisma.users.findUnique({
        where: { clerkId: userId }
    })

    if (user?.role !== 'ADMIN') {
        throw new Error("Unauthorized: Admin only")
    }
    return userId
}

export async function createPost(title: string, slug: string) {
    const userId = await ensureAdmin()

    try {
        const post = await prisma.blog_posts.create({
            data: {
                title,
                slug,
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
    slug?: string
}) {
    await ensureAdmin()

    try {
        await prisma.blog_posts.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            }
        })
        revalidatePath('/blog')
        revalidatePath(`/blog/${data.slug || ''}`)
        revalidatePath('/admin/blog')
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
            // Don't fetch full content for list
            content: false
        }
    })
}

export async function getPublishedPostBySlug(slug: string) {
    const post = await prisma.blog_posts.findUnique({
        where: { slug }
    })

    if (!post || post.status !== 'published') return null

    // Increment views (fire and forget)
    // We don't await this to keep response fast
    prisma.blog_posts.update({
        where: { id: post.id },
        data: { views: { increment: 1 } }
    }).catch(console.error)

    return post
}
