import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { canAccessCollection } from '../access/isAgentStarter'
import { slugField } from '@/fields/slug'

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: {
    singular: { en: 'Tag', th: 'แท็ก' },
    plural: { en: 'Tags', th: 'แท็ก' },
  },
  access: {
    create: canAccessCollection('tags', 'create'),
    delete: canAccessCollection('tags', 'delete'),
    read: anyone,
    update: canAccessCollection('tags', 'update'),
  },
  versions: { drafts: false, maxPerDoc: 5 },
  hooks: {
    beforeDelete: [],
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Tag Name',
    },
    ...slugField('name'),
  ],
}
