// schema.ts

import { SchemaTypeDefinition } from 'sanity'
import category from './schemas/category'
import finish from './schemas/finish'
import material from './schemas/material'
import product from './schemas/product'
import service from './schemas/service'

export const schemaTypes = [category, finish, material, product, service]
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [category, finish, material, product, service],
}
