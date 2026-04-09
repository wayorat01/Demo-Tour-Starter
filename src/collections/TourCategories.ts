import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { canAccessCollection } from '../access/isAgentStarter'
import { preventDeleteIfInUse } from './hooks/preventDelete'
import { slugField } from '@/fields/slug'

export const TourCategories: CollectionConfig = {
  slug: 'tour-categories',
  labels: {
    singular: { en: 'Tour Category', th: 'หมวดหมู่ทัวร์' },
    plural: { en: 'Tour Categories', th: 'หมวดหมู่ทัวร์' },
  },
  access: {
    create: canAccessCollection('tourCategories', 'create'),
    delete: canAccessCollection('tourCategories', 'delete'),
    read: anyone,
    update: canAccessCollection('tourCategories', 'update'),
  },
  versions: { drafts: false, maxPerDoc: 5 },
  hooks: {
    beforeDelete: [
      preventDeleteIfInUse([
        { collection: 'intertours', field: 'category', label: 'International Tours' },
        { collection: 'inbound-tours', field: 'category', label: 'Inbound Tours' },
      ]),
    ],
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'order'],
    group: { en: 'Tours', th: 'ทัวร์' },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: 'Category Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        description: 'URL-friendly identifier (e.g., asia, europe)',
      },
    },
    {
      name: 'heroBanner',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero Banner',
      admin: {
        description: {
          en: 'Category Hero Banner image — displayed on Tag Listing page (recommended 1920×400 px)',
          th: 'รูป Hero Banner ของหมวดหมู่ — แสดงในหน้า Tag Listing (แนะนำ 1920×400 px)',
        },
      },
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      label: 'Category Icon',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Display Order',
      admin: {
        description: 'Lower numbers appear first',
      },
    },
  ],
}
