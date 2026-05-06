import { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { EXPLORE_PAGES_QUERY } from '@/sanity/lib/queries'
import { urlForImage } from '@/sanity/lib/image'
import Link from 'next/link'
import Image from 'next/image'
import { FontWeight } from '@/components/font-weight'
import type { SanityImage } from '@/types/sanity'

interface PageCard {
  _id: string
  title: string
  slug: string
  seoDescription?: string
  ogImage?: SanityImage
  language?: string
}

export const metadata: Metadata = {
  title: 'Explore Resources | Englivo',
  description: 'Discover our complete collection of resources, guides, and tools to achieve English fluency.',
}

export const revalidate = 3600

export default async function ExplorePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  
  const allPages = await client.fetch<PageCard[]>(EXPLORE_PAGES_QUERY)
  const pages = allPages.filter((p) => p.language === locale || !p.language)

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="max-w-3xl mb-20">
          <FontWeight 
            text="Explore" 
            fontSize={64} 
            className="text-slate-900 dark:text-white mb-6 tracking-tight"
          />
          <p className="text-xl text-slate-600 dark:text-slate-400 font-serif leading-relaxed">
            A curated collection of resources, methodologies, and deep-dives designed to bridge the gap between intermediate plateaus and natural fluency.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page, index) => {
            const isFeatured = index === 0;
            const imageUrl = page.ogImage ? urlForImage(page.ogImage as any)?.width(800).height(600).url() : null;
            const cleanSlug = page.slug ? page.slug.replace(/^\//, '') : '';

            return (
              <Link 
                href={locale === 'en' ? `/p/${cleanSlug}` : `/${locale}/p/${cleanSlug}`}
                key={page._id}
                className={`group relative overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${isFeatured ? 'md:col-span-2 lg:col-span-2 row-span-2' : ''}`}
              >
                {/* Background Image / Gradient */}
                {imageUrl ? (
                  <div className="absolute inset-0 z-0">
                    <Image 
                      src={imageUrl}
                      alt={page.title}
                      fill
                      className="object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/60 to-transparent" />
                  </div>
                ) : (
                  <div className="absolute inset-0 z-0 bg-linear-to-br from-electric/5 to-transparent group-hover:from-electric/10 transition-colors duration-500" />
                )}

                {/* Content */}
                <div className={`relative z-10 flex flex-col h-full justify-end p-8 ${isFeatured ? 'min-h-[400px]' : 'min-h-[300px]'}`}>
                  <h2 className={`font-medium tracking-tight ${imageUrl ? 'text-white' : 'text-slate-900 dark:text-white'} ${isFeatured ? 'text-4xl mb-4' : 'text-2xl mb-3'}`}>
                    {page.title}
                  </h2>
                  <p className={`font-serif line-clamp-3 ${imageUrl ? 'text-slate-200' : 'text-slate-600 dark:text-slate-400'} ${isFeatured ? 'text-lg max-w-xl' : 'text-base'}`}>
                    {page.seoDescription || 'Explore this comprehensive guide on the Englivo platform.'}
                  </p>
                  
                  {/* Subtle hover indicator - Always visible on mobile, hover-only on desktop */}
                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold tracking-wider uppercase text-electric opacity-100 translate-x-0 md:opacity-0 md:-translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    Learn More <span className="text-lg">→</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
        
        {pages.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-500 font-serif text-lg">New resources are being crafted. Check back soon.</p>
          </div>
        )}

      </div>
    </div>
  )
}
