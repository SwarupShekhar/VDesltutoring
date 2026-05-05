import React from 'react'
import { HeroBlock } from '@/components/sanity/blocks/HeroBlock'
import { FeaturesBlock } from '@/components/sanity/blocks/FeaturesBlock'
import { TextBlock } from '@/components/sanity/blocks/TextBlock'
import { CTABlock } from '@/components/sanity/blocks/CTABlock'
import { FAQBlock } from '@/components/sanity/blocks/FAQBlock'
import { ImageBlock } from '@/components/sanity/blocks/ImageBlock'
import type { Block } from '@/types/sanity'

interface PageBuilderProps {
  blocks?: Block[]
}

export function PageBuilder({ blocks }: PageBuilderProps) {
  if (!blocks) return null

  return (
    <>
      {blocks.map((block) => {
        switch (block._type) {
          case 'heroBlock':
            return <HeroBlock key={block._key} {...block} />
          case 'featuresBlock':
            return <FeaturesBlock key={block._key} {...block} />
          case 'textBlock':
            return <TextBlock key={block._key} {...block} />
          case 'ctaBlock':
            return <CTABlock key={block._key} {...block} />
          case 'faqBlock':
            return <FAQBlock key={block._key} {...block} />
          case 'imageBlock':
            return <ImageBlock key={block._key} {...block} />
          default: {
            const unknownBlock = block as any;
            return <div key={unknownBlock._key}>Unknown block type: {unknownBlock._type}</div>
          }
        }
      })}
    </>
  )
}
