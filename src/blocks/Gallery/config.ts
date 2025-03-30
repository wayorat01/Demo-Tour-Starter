import { Block } from 'payload'
import {
  HeadingFeature,
  ParagraphFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { link } from '@/fields/link'
import { backgroundColor } from '@/fields/color'
import { designVersionPreview } from '@/components/AdminDashboard/DesignVersionPreview/config'

export const allGalleryDesignVersions = [
  // 'GALLERY1',
  // 'GALLERY2',
  // 'GALLERY3',
  { label: 'Gallery 4 (Large Images with Overlay)', value: 'GALLERY4', image: '/admin/previews/gallery/gallery4.jpeg' },
  { label: 'Gallery 5 (Carousel)', value: 'GALLERY5', image: '/admin/previews/gallery/gallery5.jpeg' },
  { label: 'Gallery 6 (Card Layout)', value: 'GALLERY6', image: '/admin/previews/gallery/gallery6.jpeg' },
] as const


/**
 * mutable copy of allGalleryDesignVersions as payload needs this type
 */
const galleryDesignVersions: string[] = allGalleryDesignVersions.map(item => item.value)

export type GalleryDesignVersion = (typeof allGalleryDesignVersions)[number]

export const Gallery: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  labels: {
    singular: 'Gallery',
    plural: 'Gallery Blocks',
  },
  fields: [
    backgroundColor,
    designVersionPreview(allGalleryDesignVersions),
    {
      name: 'richText',
      type: 'richText',
      localized: true,
      admin: {
        description: 'Optional heading and description for the gallery',
        condition: (_, { designVersion = "" } = {}) => !["GALLERY1"].includes(designVersion),
      },
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          ParagraphFeature(),
        ],
      }),
    },
    {
      name: "tagline",
      type: "text",
      localized: true,
      admin: {
        condition: (_, { designVersion = "" } = {}) => ["GALLERY6"].includes(designVersion),
      },
    },
    link({
      appearances: false,
      overrides: {
        admin: {
          description: 'Single link for this gallery. Might look best with arrowRight icon',
          condition: (_, { designVersion }: any) => ["GALLERY6"].includes(designVersion),
        },
      },
    }),
    {
      name: 'elements',
      label: "Gallery Items",
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'Add images to the gallery',
        condition: (_, { designVersion = "" } = {}) => galleryDesignVersions.includes(designVersion),
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'icon',
          type: 'text',
          admin: {
            description: 'Select an icon to display with this item',
            components: {
              Field: {
                path: '@/components/AdminDashboard/IconSelect',
              }
            },
          },
        },
        {
          name: 'richText',
          type: 'richText',
          localized: true,
          editor: lexicalEditor({
            features: ({ defaultFeatures }) => [
              ...defaultFeatures,
              HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
              ParagraphFeature(),
            ],
          }),
        },
        link({
          appearances: false,
        }),
      ],
    }
  ],
};