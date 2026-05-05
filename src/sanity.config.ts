import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { presentationTool, defineLocations, defineDocuments } from 'sanity/presentation'
import { schema } from './sanity/schemaTypes'
import { projectId, dataset } from './sanity/env'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool(), 
    visionTool(),
    presentationTool({
      resolve: {
        locations: {
          page: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
              language: 'language',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Untitled',
                  href: `/${doc?.language || 'en'}/p/${doc?.slug}`,
                },
              ],
            }),
          }),
        },
        mainDocuments: defineDocuments([
          {
            route: '/:locale/p/:slug',
            filter: `_type == "page" && slug.current == $slug && language == $locale`,
          },
        ]),
      },
      previewUrl: {
        origin: typeof location !== 'undefined' ? location.origin : 'http://localhost:3000',
        previewMode: {
          enable: '/api/draft',
          // Use NEXT_PUBLIC if available to ensure it reaches the browser Studio
          // Added 'Vaidik@1234' as a fallback to ensure stability during sync
          secret: process.env.NEXT_PUBLIC_SANITY_PREVIEW_SECRET || process.env.SANITY_PREVIEW_SECRET || 'Vaidik@1234',
        },
      },
    }),
  ],
})
