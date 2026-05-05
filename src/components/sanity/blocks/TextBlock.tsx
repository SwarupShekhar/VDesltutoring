import React from 'react'
import { PortableText } from '@portabletext/react'
import type { SanityImage } from '@/types/sanity'

interface TextBlockProps {
  _key?: string
  content: any
}

export function TextBlock({ content }: TextBlockProps) {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="prose prose-lg dark:prose-invert prose-slate max-w-none">
          <PortableText 
            value={content} 
            components={{
              marks: {
                link: ({ children, value }) => {
                  const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined
                  const target = !value.href.startsWith('/') ? '_blank' : undefined
                  return (
                    <a 
                      href={value.href} 
                      rel={rel} 
                      target={target}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {children}
                    </a>
                  )
                },
              },
            }}
          />
        </div>
      </div>
    </section>
  )
}
