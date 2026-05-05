import { defineField, defineType } from 'sanity'

export const pageType = defineType({
  name: 'page',
  title: 'SEO Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'language',
      type: 'string',
      options: {
        list: [
          { title: 'English', value: 'en' },
          { title: 'German', value: 'de' },
          { title: 'French', value: 'fr' },
          { title: 'Spanish', value: 'es' },
          { title: 'Vietnamese', value: 'vi' },
          { title: 'Japanese', value: 'ja' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'seoTitle',
      type: 'string',
      title: 'SEO Title',
    }),
    defineField({
      name: 'seoDescription',
      type: 'text',
      title: 'SEO Description',
    }),
    defineField({
      name: 'ogImage',
      type: 'image',
      title: 'OG Image',
      description: 'Image for social media sharing (Open Graph)',
    }),
    defineField({
      name: 'noindex',
      type: 'boolean',
      title: 'Hide from search engines (noindex)',
      initialValue: false,
    }),
    defineField({
      name: 'canonicalUrl',
      type: 'url',
      title: 'Canonical URL Override',
      description: 'Leave empty to use the default URL.',
    }),
    defineField({
      name: 'showInResources',
      type: 'boolean',
      title: 'Show in Resources Menu',
      description: 'If enabled, this page will appear in the top navbar under Resources.',
      initialValue: false,
    }),
    defineField({
      name: 'showInFooter',
      type: 'boolean',
      title: 'Show in Footer',
      description: 'If enabled, this page will appear in the site footer.',
      initialValue: false,
    }),
    defineField({
      name: 'blocks',
      type: 'array',
      title: 'Page Blocks',
      of: [
        { type: 'heroBlock' },
        { type: 'featuresBlock' },
        { type: 'textBlock' },
        { type: 'ctaBlock' },
        { type: 'faqBlock' },
        { type: 'imageBlock' },
      ],
    }),
  ],
})
