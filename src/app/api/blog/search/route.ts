import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
        return NextResponse.json({ posts: [] })
    }

    try {
        const posts = await prisma.blog_posts.findMany({
            where: {
                status: 'published',
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { content: { contains: query, mode: 'insensitive' } },
                    { focal_keyword: { contains: query, mode: 'insensitive' } }
                ]
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                cover: true,
                createdAt: true
            }
        })

        return NextResponse.json({ posts })
    } catch (error) {
        console.error("Blog search failed:", error)
        return NextResponse.json({ error: "Search failed" }, { status: 500 })
    }
}
