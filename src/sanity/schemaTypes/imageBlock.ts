import { defineField, defineType } from 'sanity'

export const imageBlock = defineType({
  name: 'imageBlock',
  title: 'Image Block',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Required for SEO and accessibility.',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'maxWidth',
      type: 'string',
      title: 'Max Width',
      options: {
        list: [
          { title: 'Small (3xl)', value: 'max-w-3xl' },
          { title: 'Medium (5xl)', value: 'max-w-5xl' },
          { title: 'Full', value: 'max-w-full' },
        ],
      },
      initialValue: 'max-w-3xl',
    }),
  ],
})
