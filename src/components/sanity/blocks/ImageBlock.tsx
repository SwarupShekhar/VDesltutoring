import React from 'react'
import Image from 'next/image'
import { urlForImage } from '@/sanity/lib/image'
import type { SanityImage } from '@/types/sanity'

interface ImageBlockProps {
  _key?: string
  image?: SanityImage
  maxWidth?: string
}

export function ImageBlock({ image, maxWidth = 'max-w-3xl' }: ImageBlockProps) {
  if (!image?.asset) return null

  // Build image URL (hotspot is automatically handled by @sanity/image-url if the image object has crop/hotspot data)
  const imageUrl = urlForImage(image as any)?.width(1200).auto('format').url()
  
  if (!imageUrl) return null
  const alt = image.alt || ''
  const caption = image.caption

  return (
    <section className="py-12">
      <div className={`container mx-auto px-4 ${maxWidth}`}>
        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
          <Image
            src={imageUrl}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
        </div>
        {caption && (
          <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400 italic">
            {caption}
          </p>
        )}
      </div>
    </section>
  )
}
