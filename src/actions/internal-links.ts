'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { redis } from '@/lib/redis'

async function ensureAdmin() {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    // Production-grade Redis Rate Limiting (30 requests per minute)
    try {
        const rateLimitKey = `rate_limit:internal_links_admin:${userId}`
        const currentCount = await redis.incr(rateLimitKey)
        await redis.expire(rateLimitKey, 60)

        if (currentCount > 30) {
            throw new Error("Too many requests. Please slow down.")
        }
    } catch (e: any) {
        if (e.message === "Too many requests. Please slow down.") throw e;
        console.error("[RedisError] Rate limiting failed:", e.message)
    }

    const user = await prisma.users.findUnique({
        where: { clerkId: userId }
    })

    if (!user || user.role !== 'ADMIN') {
        throw new Error("Unauthorized: Admin access required")
    }
    return userId
}

export async function createInternalLink(data: {
    keyword: string
    url: string
    category: string
    isActive?: boolean
}) {
    await ensureAdmin()

    try {
        const link = await prisma.internalLink.create({
            data: {
                keyword: data.keyword,
                url: data.url,
                category: data.category,
                isActive: data.isActive ?? true
            }
        })
        revalidatePath('/admin/internal-links')
        return { success: true, id: link.id }
    } catch (error) {
        console.error("Failed to create internal link:", error)
        return { success: false, error: "Failed to create internal link" }
    }
}

export async function updateInternalLink(id: string, data: {
    keyword?: string
    url?: string
    category?: string
    isActive?: boolean
}) {
    await ensureAdmin()

    try {
        await prisma.internalLink.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            }
        })
        revalidatePath('/admin/internal-links')
        return { success: true }
    } catch (error) {
        console.error("Failed to update internal link:", error)
        return { success: false, error: "Failed to update internal link" }
    }
}

export async function deleteInternalLink(id: string) {
    await ensureAdmin()

    try {
        await prisma.internalLink.delete({
            where: { id }
        })
        revalidatePath('/admin/internal-links')
        return { success: true }
    } catch (error) {
        console.error("Failed to delete internal link:", error)
        return { success: false, error: "Failed to delete internal link" }
    }
}

export async function listInternalLinks(filter?: { category?: string, isActive?: boolean }) {
    await ensureAdmin()

    try {
        return await prisma.internalLink.findMany({
            where: {
                category: filter?.category,
                isActive: filter?.isActive
            },
            orderBy: { keyword: 'asc' }
        })
    } catch (error) {
        console.error("Failed to list internal links:", error)
        return []
    }
}

// Category Management Actions (Section 5.5)
export async function listBlogCategories() {
    try {
        return await prisma.blogCategory.findMany({
            orderBy: { name: 'asc' }
        })
    } catch (error) {
        console.error("Failed to list categories:", error)
        return []
    }
}

export async function createBlogCategory(name: string, slug: string) {
    await ensureAdmin()
    try {
        const category = await prisma.blogCategory.create({
            data: { name, slug }
        })
        revalidatePath('/admin/blog')
        return { success: true, id: category.id }
    } catch (error) {
        console.error("Failed to create category:", error)
        return { success: false, error: "Failed to create category" }
    }
}
