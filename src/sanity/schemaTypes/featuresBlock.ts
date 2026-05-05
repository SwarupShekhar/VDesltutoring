import { defineField, defineType } from 'sanity'

export const featuresBlock = defineType({
  name: 'featuresBlock',
  title: 'Features Block',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'features',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'description', type: 'text' },
            { name: 'icon', type: 'string', title: 'Lucide Icon Name or Cloudinary Icon URL' },
          ],
        },
      ],
    }),
  ],
})
