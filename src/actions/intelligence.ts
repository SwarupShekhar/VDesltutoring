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
        // Source 1: InternalLink table (active only)
        const dbLinks = await prisma.internalLink.findMany({
            where: { isActive: true }
        })

        // Source 2: Published blog posts
        const otherPosts = await prisma.blog_posts.findMany({
            where: {
                id: { not: currentPostId },
                status: 'published'
            },
            select: {
                id: true,
                title: true,
                slug: true,
                focal_keyword: true,
                category: true
            }
        })

        const combinedSources: Array<{ keyword: string, url: string, category: string }> = [
            ...dbLinks.map((l: any) => ({ keyword: l.keyword, url: l.url, category: l.category })),
            ...otherPosts.map(p => ({ 
                keyword: p.title, 
                url: `/blog/${p.slug}`, 
                category: 'blog' 
            })),
            ...otherPosts.filter(p => p.focal_keyword).map(p => ({ 
                keyword: p.focal_keyword!, 
                url: `/blog/${p.slug}`, 
                category: 'blog' 
            }))
        ]

        const suggestions: Array<{ keyword: string, url: string, category: string, matchCount: number, firstPosition: number }> = []
        
        // Escape regex helper
        const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

        for (const source of combinedSources) {
            // Find unlinked occurrences only (negative lookbehind/lookahead)
            // Regex: keyword not preceded by [ or followed by ] or ( or word character
            const regex = new RegExp(`(?<!\\[)${escapeRegex(source.keyword)}(?!\\]|\\(|\\w)`, 'gi');
            const matches = content.match(regex);
            
            if (matches && matches.length > 0) {
                // Ensure we haven't already added this keyword from another source (e.g. title vs focal keyword)
                if (!suggestions.find(s => s.keyword.toLowerCase() === source.keyword.toLowerCase())) {
                    const firstMatch = regex.exec(content);
                    suggestions.push({
                        keyword: source.keyword,
                        url: source.url,
                        category: source.category || 'blog',
                        matchCount: matches.length,
                        firstPosition: firstMatch ? firstMatch.index : 0
                    })
                }
            }
        }

        // Grouping and sorting is handled by the UI as per spec
        return { 
            success: true, 
            suggestions: suggestions.sort((a, b) => b.matchCount - a.matchCount)
        }
    } catch (error) {
        console.error("Magic Scan failed:", error)
        return { success: false, error: "Failed to perform intelligence scan" }
    }
}
