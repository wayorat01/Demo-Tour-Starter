import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { canAccessCollection } from '../access/isAgentStarter'

const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: { en: 'Category', th: 'หมวดหมู่' },
    plural: { en: 'Categories', th: 'หมวดหมู่' },
  },
  access: {
    create: canAccessCollection('categories', 'create'),
    delete: canAccessCollection('categories', 'delete'),
    read: anyone,
    update: canAccessCollection('categories', 'update'),
  },
  versions: { drafts: false, maxPerDoc: 5 },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
  ],
}

export default Categories
