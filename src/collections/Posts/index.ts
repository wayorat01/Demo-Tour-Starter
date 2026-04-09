import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
  OrderedListFeature,
  UnorderedListFeature,
  BlockquoteFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { Banner } from '@/blocks/LexicalBlocks/Banner/config'
import { Code } from '@/blocks/Code/config'
import { checkRole } from '@/utilities/checkRole'
import { hasPermission, canAccessCollection } from '@/access/isAgentStarter'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { populateAuthors } from './hooks/populateAuthors'
import { revalidatePost } from './hooks/revalidatePost'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from '@/fields/slug'
import { serverUrl as NEXT_PUBLIC_SERVER_URL } from '@/config/server'
import { Breadcrumb } from '@payloadcms/plugin-nested-docs/types'
import { designVersionPreview } from '@/components/AdminDashboard/DesignVersionPreview/config'
import { calculateReadTime } from './hooks/calculcateReadTime'

export const allPostDesignVersions = [
  {
    label: 'BLOG18',
    value: 'BLOG18',
    image: '/admin/previews/blog/blog18.jpeg',
  },
  {
    label: 'BLOG20',
    value: 'BLOG20',
    image: '/admin/previews/blog/blog20.jpeg',
  },
]

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: { en: 'Post', th: 'บทความ' },
    plural: { en: 'Posts', th: 'บทความ' },
  },
  access: {
    create: canAccessCollection('posts', 'create'),
    delete: canAccessCollection('posts', 'delete'),
    read: authenticatedOrPublished,
    update: canAccessCollection('posts', 'update'),
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, locale, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          breadcrumbs: data?.breadcrumbs,
          collection: 'posts',
          locale: locale.code,
          req,
        })

        return `${NEXT_PUBLIC_SERVER_URL}${path}`
      },
    },
    preview: (data, options) => {
      const path = generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        breadcrumbs: data?.breadcrumbs as Breadcrumb[],
        collection: 'posts',
        locale: options.locale,
        req: options.req,
      })

      return `${NEXT_PUBLIC_SERVER_URL}${path}`
    },
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: { en: 'Post Title', th: 'ชื่อบทความ' },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: { en: 'Excerpt', th: 'สรุปบทความ' },
      required: true,
      maxLength: 220,
      admin: {
        position: 'sidebar',
        description: {
          en: 'Article excerpt (max 220 characters) for display on the post card',
          th: 'สรุปย่อบทความ (ไม่เกิน 220 ตัวอักษร) สำหรับแสดงที่การ์ดบทความ',
        },
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      label: { en: 'Cover Image', th: 'รูปปกบทความ' },
      relationTo: 'media',
      required: true,
      admin: {
        position: 'sidebar',
        description: {
          en: 'Cover image (recommended 4:3 ratio)',
          th: 'รูปปกบทความ (แนะนำอัตราส่วน 4:3)',
        },
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'bannerImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Banner image displayed at the top of the blog post',
                condition: (data) => data?.designVersion === 'BLOG20',
                position: 'sidebar',
              },
            },
            {
              name: 'content',
              type: 'richText',
              localized: true,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                    OrderedListFeature(),
                    UnorderedListFeature(),
                    BlockquoteFeature(),
                    UploadFeature({
                      collections: {
                        media: {
                          fields: [],
                        },
                      },
                    }),
                  ]
                },
              }),
              label: false,
              required: true,
            },
          ],
          label: { en: 'Content', th: 'เนื้อหา' },
        },
        {
          fields: [
            {
              name: 'relatedPosts',
              type: 'relationship',
              label: { en: 'Related Posts', th: 'บทความที่เกี่ยวข้อง' },
              admin: {
                position: 'sidebar',
              },
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                }
              },
              hasMany: true,
              relationTo: 'posts',
            },
            {
              name: 'categories',
              type: 'relationship',
              label: { en: 'Categories', th: 'หมวดหมู่' },
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              relationTo: 'categories',
            },
            {
              name: 'tags',
              type: 'relationship',
              label: { en: 'Tags', th: 'แท็ก' },
              admin: {
                position: 'sidebar',
                description: { en: 'Post tags', th: 'แท็กสำหรับบทความ' },
              },
              hasMany: true,
              relationTo: 'tags',
            },
          ],
          label: { en: 'Meta', th: 'เมตา (Meta)' },
        },
        {
          name: 'meta',
          label: { en: 'SEO', th: 'การทำ SEO' },
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({
            }),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    designVersionPreview(allPostDesignVersions, {
      admin: {
        position: 'sidebar',
        condition: (data, siblingData, { user }) => {
          if (user) {
            return hasPermission('canManageDesign', user)
          }
          return true
        },
      },
    }),
    {
      name: 'publishedAt',
      type: 'date',
      label: { en: 'Published At', th: 'วันที่เผยแพร่' },
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: { en: 'Draft', th: 'แบบร่าง (Draft)' }, value: 'draft' },
        { label: { en: 'Published', th: 'เผยแพร่แล้ว (Published)' }, value: 'published' },
      ],
      admin: {
        position: 'sidebar',
        description: { en: 'Publish status', th: 'สถานะการเผยแพร่' },
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      label: { en: 'Authors', th: 'ผู้เขียน' },
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
    },
    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    // GraphQL will also not return mutated user data that differs from the underlying schema
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: 'id',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    // This is an internal, hidden field to store the average read time. We calculate this in a hook
    {
      name: 'readTime',
      type: 'number',
      admin: {
        disabled: true,
        readOnly: true,
      },
    },
    ...slugField(),
  ],
  hooks: {
    beforeChange: [calculateReadTime],
    afterChange: [revalidatePost],
    afterRead: [populateAuthors],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
    },
    maxPerDoc: 50,
  },
}
