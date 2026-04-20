'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

// Helper to ensure admin
async function ensureAdmin() {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    const user = await prisma.users.findUnique({
        where: { clerkId: userId }
    })

    if (!user || user.role !== 'ADMIN') {
        throw new Error("Unauthorized: Admin access required")
    }
    return userId
}

export async function magicScanContent(currentPostId: string, content: string) {
    await ensureAdmin()

    try {
        // Fetch all other published posts
        const otherPosts = await prisma.blog_posts.findMany({
            where: {
                id: { not: currentPostId },
                status: 'published'
            },
            select: {
                id: true,
                title: true,
                slug: true,
                focal_keyword: true
            }
        })

        const suggestions: Array<{ title: string, slug: string, reason: string }> = []
        const lowercaseContent = content.toLowerCase()

        // Very simple matching for now
        for (const post of otherPosts) {
            // Check if title or focal keyword is mentioned in content
            const titleMentioned = lowercaseContent.includes(post.title.toLowerCase())
            const keywordMentioned = post.focal_keyword && lowercaseContent.includes(post.focal_keyword.toLowerCase())

            if (titleMentioned || keywordMentioned) {
                // Check if already linked (basic [text](slug) check)
                const isAlreadyLinked = lowercaseContent.includes(post.slug.toLowerCase())
                
                if (!isAlreadyLinked) {
                    suggestions.push({
                        title: post.title,
                        slug: post.slug,
                        reason: titleMentioned 
                            ? `Found mention of title: "${post.title}"` 
                            : `Matches focal keyword: "${post.focal_keyword}"`
                    })
                }
            }
        }

        // Limit to top 5 suggestions to keep UI clean
        return { 
            success: true, 
            suggestions: suggestions.slice(0, 5) 
        }
    } catch (error) {
        console.error("Magic Scan failed:", error)
        return { success: false, error: "Failed to perform intelligence scan" }
    }
}
