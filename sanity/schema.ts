// schema.ts

import { SchemaTypeDefinition } from 'sanity'

import caseStudy from './schemas/caseStudy'

export const schemaTypes = [caseStudy]
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [caseStudy],
}
