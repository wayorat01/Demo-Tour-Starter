import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { canAccessCollection } from '../access/isAgentStarter'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: { en: 'Media', th: 'สื่อ/รูปภาพ' },
    plural: { en: 'Media', th: 'สื่อ/รูปภาพ' },
  },
  access: {
    create: canAccessCollection('media', 'create'),
    delete: canAccessCollection('media', 'delete'),
    read: anyone,
    update: canAccessCollection('media', 'update'),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
    },
    {
      name: 'caption',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    imageSizes: [
      {
        name: 'thumbnail',
        width: 320,
        height: undefined,
        position: 'centre',
      },
      {
        name: 'card',
        width: 480,
        height: 320,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 768,
        height: undefined,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
  },
}
