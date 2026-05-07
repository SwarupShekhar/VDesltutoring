import React from 'react';
import { JsonLd } from './JsonLd';

export function BlogSchema({ post, slug, locale }: { post: any, slug: string, locale: string }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": "Practical English fluency insights for professionals. Learn to speak naturally without translating.",
        "image": post.cover ? [post.cover] : ["https://englivo.com/og-image.png"],
        "author": {
            "@type": "Organization",
            "name": "Englivo",
            "url": "https://englivo.com"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Englivo",
            "logo": {
                "@type": "ImageObject",
                "url": "https://englivo.com/logo.png"
            }
        },
        "datePublished": post.createdAt,
        "dateModified": post.updatedAt,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://englivo.com/${locale}/blog/${slug}`
        },
        "audience": {
            "@type": "Audience",
            "audienceType": "Non-native English speaking professionals, language learners, global job seekers"
        },
        "about": [
            {
                "@type": "Thing",
                "name": "English as a second or foreign language",
                "sameAs": "https://en.wikipedia.org/wiki/English_as_a_second_or_foreign_language"
            },
            {
                "@type": "Thing",
                "name": "Speech Automaticity",
                "sameAs": "https://en.wikipedia.org/wiki/Automaticity"
            }
        ]
    };

    return <JsonLd schema={jsonLd} />;
}

