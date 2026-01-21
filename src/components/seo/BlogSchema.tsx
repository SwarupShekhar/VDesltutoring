import React from 'react';

export function BlogSchema({ post, slug, locale }: { post: any, slug: string, locale: string }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: "Practical English fluency insights for professionals. Learn to speak naturally without translating.", // Fallback as metaDescription isn't in model yet
        image: post.cover ? [post.cover] : ["https://englivo.com/og-image.png"],
        author: {
            "@type": "Organization", // Or Person if we have author details
            name: "Englivo",
            url: "https://englivo.com"
        },
        publisher: {
            "@type": "Organization",
            name: "Englivo",
            logo: {
                "@type": "ImageObject",
                url: "https://englivo.com/logo.png", // Assuming logo path
            },
        },
        datePublished: post.createdAt,
        dateModified: post.updatedAt,
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://englivo.com/${locale}/blog/${slug}`,
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(jsonLd),
            }}
        />
    );
}
