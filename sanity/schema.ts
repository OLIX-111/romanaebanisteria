// schema.ts

import { SchemaTypeDefinition } from 'sanity'

import noticias from './schemas/noticias'
import empresas from './schemas/empresas'

export const schemaTypes = [noticias, empresas]
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [noticias, empresas],
}
