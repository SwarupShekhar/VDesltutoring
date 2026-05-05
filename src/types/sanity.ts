export interface SanityImage {
  asset: { _ref: string; _type: string }
  alt?: string
  caption?: string
  _hotspot?: any
  hotspot?: any
}

export interface Page {
  _id: string
  title: string
  language: string
  seoTitle?: string
  seoDescription?: string
  noindex?: boolean
  canonicalUrl?: string
  ogImage?: SanityImage
  blocks: Block[]
  _updatedAt: string
}

export type HeroBlock = { _type: 'heroBlock'; _key: string; title: string; subtitle?: string; ctaLabel?: string; ctaLink?: string; backgroundImage?: SanityImage }
export type FeaturesBlock = { _type: 'featuresBlock'; _key: string; title?: string; features: { title: string; description?: string; icon?: string }[] }
export type TextBlock = { _type: 'textBlock'; _key: string; content: any[] }
export type CTABlock = { _type: 'ctaBlock'; _key: string; title?: string; label?: string; link?: string; variant?: 'primary' | 'secondary' | 'outline' }
export type FAQBlock = { _type: 'faqBlock'; _key: string; title?: string; faqs: { question: string; answer: string }[] }
export type ImageBlock = { _type: 'imageBlock'; _key: string; image: SanityImage; maxWidth?: string }

export type Block =
  | HeroBlock
  | FeaturesBlock
  | TextBlock
  | CTABlock
  | FAQBlock
  | ImageBlock

export interface NavPage {
  title: string
  slug: string
  showInResources: boolean
  showInFooter: boolean
}

export interface PageCard {
  _id: string
  title: string
  slug: string
  seoDescription?: string
  ogImage?: SanityImage
  language?: string
}
