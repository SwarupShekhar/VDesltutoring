import { type SchemaTypeDefinition } from 'sanity'
import { pageType } from './pageType'
import { heroBlock } from './heroBlock'
import { featuresBlock } from './featuresBlock'
import { textBlock } from './textBlock'
import { ctaBlock } from './ctaBlock'
import { faqBlock } from './faqBlock'
import { imageBlock } from './imageBlock'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [pageType, heroBlock, featuresBlock, textBlock, ctaBlock, faqBlock, imageBlock],
}
