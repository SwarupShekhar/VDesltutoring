import { defineQuery, groq } from 'next-sanity'

export const PAGE_QUERY = defineQuery(`
  *[_type == "page" && (slug.current == $slug || slug.current == "/" + $slug || "/" + slug.current == $slug) && language == $locale][0] {
    _id,
    title,
    language,
    seoTitle,
    seoDescription,
    ogImage,
    noindex,
    canonicalUrl,
    blocks[] {
      ...,
      _type == "heroBlock" => {
        title,
        subtitle,
        ctaLabel,
        ctaLink,
        backgroundImage {
          ...,
          asset->
        }
      },
      _type == "featuresBlock" => {
        title,
        features[] {
          title,
          description,
          icon
        }
      },
      _type == "textBlock" => {
        content
      },
      _type == "ctaBlock" => {
        title,
        label,
        link,
        variant
      },
      _type == "faqBlock" => {
        title,
        faqs[] {
          question,
          answer
        }
      },
      _type == "imageBlock" => {
        image {
          ...,
          asset->
        },
        maxWidth
      }
    }
  }
`)

export const PAGES_SLUGS_QUERY = defineQuery(`
  *[_type == "page" && defined(slug.current)] {
    "slug": slug.current,
    language,
    _updatedAt
  }
`)

export const NAV_PAGES_QUERY = groq`*[_type == "page" && (showInResources == true || showInFooter == true) && language == $locale] {
  title,
  "slug": slug.current,
  showInResources,
  showInFooter
}`

export const EXPLORE_PAGES_QUERY = defineQuery(`
  *[_type == "page" && defined(slug.current) && !noindex] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    seoDescription,
    ogImage {
      asset->
    },
    language
  }
`)
