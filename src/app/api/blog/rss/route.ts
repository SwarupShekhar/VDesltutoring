import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    const posts = await prisma.blog_posts.findMany({
        where: { status: 'published' },
        orderBy: { createdAt: 'desc' },
        take: 20
    })

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
    <title>Englivo Blog</title>
    <link>https://englivo.com/blog</link>
    <description>Speak English naturally. Practical fluency insights for professionals.</description>
    <language>en-us</language>
    <atom:link href="https://englivo.com/api/blog/rss" rel="self" type="application/rss+xml" />
    ${posts.map(post => `
    <item>
        <title>${escapeXml(post.title)}</title>
        <link>https://englivo.com/blog/${post.slug}</link>
        <guid>https://englivo.com/blog/${post.slug}</guid>
        <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
        <description>${escapeXml(post.excerpt || post.meta_description || '')}</description>
    </item>`).join('')}
</channel>
</rss>`

    return new NextResponse(rss, {
        headers: {
            'Content-Type': 'application/xml'
        }
    })
}

function escapeXml(unsafe: string) {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}
