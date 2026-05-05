import { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { client } from '@/sanity/lib/client'
import { PAGE_QUERY, PAGES_SLUGS_QUERY } from '@/sanity/lib/queries'
import { PageBuilder } from '@/components/sanity/PageBuilder'
import { constructCanonicalMetadata } from '@/lib/seo'
import { urlForImage } from '@/sanity/lib/image'
import type { Page, Block, FAQBlock as FAQBlockType } from '@/types/sanity'

interface PageProps {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export const revalidate = 3600

export async function generateStaticParams() {
  const pages = await client.fetch<{ slug: string; language: string }[]>(PAGES_SLUGS_QUERY)
  return pages.map((p) => ({
    locale: p.language,
    slug: p.slug,
  }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  
  const { isEnabled } = await draftMode()
  const fetchClient = isEnabled ? client.withConfig({
    perspective: 'previewDrafts',
    useCdn: false,
    token: process.env.SANITY_API_READ_TOKEN,
    stega: {
      enabled: true,
      studioUrl: '/studio',
    }
  }) : client

  const page = await fetchClient.fetch<Page | null>(PAGE_QUERY, { slug, locale })

  if (!page) return {}

  const canonicalMetadata = constructCanonicalMetadata(`/p/${slug}`, locale)
  
  // Handle canonical override
  if (page.canonicalUrl && canonicalMetadata.alternates) {
    canonicalMetadata.alternates.canonical = page.canonicalUrl
  }

  // Handle OG Image
  const ogImageUrl = page.ogImage ? urlForImage(page.ogImage as any)?.width(1200).height(630).url() : null

  return {
    ...canonicalMetadata,
    title: page.seoTitle || page.title,
    description: page.seoDescription,
    robots: page.noindex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      title: page.seoTitle || page.title,
      description: page.seoDescription,
      url: canonicalMetadata.alternates?.canonical as string,
      images: ogImageUrl ? [{ url: ogImageUrl }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.seoTitle || page.title,
      description: page.seoDescription,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  }
}

export default async function SeoPage({ params }: PageProps) {
  const { locale, slug } = await params
  
  const { isEnabled } = await draftMode()
  const fetchClient = isEnabled ? client.withConfig({
    perspective: 'previewDrafts',
    useCdn: false,
    token: process.env.SANITY_API_READ_TOKEN,
    stega: {
      enabled: true,
      studioUrl: '/studio',
    }
  }) : client

  const page = await fetchClient.fetch<Page | null>(PAGE_QUERY, { slug, locale })

  if (!page) {
    notFound()
  }

  // Structured Data
  const jsonLd: any[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.title,
      description: page.seoDescription,
      url: locale === 'en'
        ? `https://englivo.com/p/${slug}`
        : `https://englivo.com/${locale}/p/${slug}`,
      inLanguage: locale,
    }
  ]

  // Add FAQ Schema if FAQ block exists
  const faqBlock = page.blocks.find((b): b is FAQBlockType => b._type === 'faqBlock')
  if (faqBlock?.faqs) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqBlock.faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
    })
  }

  const baseUrl = 'https://englivo.com'
  const canonicalUrl = locale === 'en'
    ? `${baseUrl}/p/${slug}`
    : `${baseUrl}/${locale}/p/${slug}`

  // Structured Data for Breadcrumbs
  const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
          {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": baseUrl
          },
          {
              "@type": "ListItem",
              "position": 2,
              "name": page.title,
              "item": canonicalUrl
          }
      ]
  };

  return (
    <div className="flex flex-col w-full">
      {jsonLd.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PageBuilder blocks={page.blocks} />
    </div>
  )
}
