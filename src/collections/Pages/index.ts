import type { Block, CollectionConfig } from 'payload'
import { APIError } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { canAccessCollection, hasGlobalPermission } from '@/access/isAgentStarter'
import { checkRole } from '@/utilities/checkRole'

import { FormBlock } from '@/blocks/Form/config'
import { FeatureBlock } from '@/blocks/Feature/config'
import { CtaBlock } from '@/blocks/Cta/config'
import { AboutBlock } from '@/blocks/About/config'
import { LogosBlock } from '@/blocks/Logos/config'
import { Gallery } from '@/blocks/Gallery/config'
import { TestimonialBlock } from '@/blocks/Testimonial/config'
import { FaqBlock } from '@/blocks/Faq/config'
import { StatBlock } from '@/blocks/Stat/config'
import { SplitViewBlock } from '@/blocks/SplitView/config'
import { TextBlock } from '@/blocks/TextBlock/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { hero } from '@/heros/config'
import { CustomBlock } from '@/blocks/CustomBlock/config'
import { ChangelogBlock } from '@/blocks/Changelog/config'

import { slugField } from '@/fields/slug'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { serverUrl as NEXT_PUBLIC_SERVER_URL } from '@/config/server'
import { ContactBlock } from '@/blocks/Contact/config'
import { Breadcrumb } from '@payloadcms/plugin-nested-docs/types'
import { Blog } from '@/blocks/Blog/config'
import { BannerBlock } from '@/blocks/Banner/config'
import { CasestudiesBlock } from '@/blocks/Casestudies/config'
import { TimelineBlock } from '@/blocks/Timeline/config'
import { LoginBlock } from '@/blocks/Login/config'
import { SignupBlock } from '@/blocks/Signup/config'
import { BannerSlideBlock } from '@/blocks/BannerSlide/config'
import { WowtourPopularCountryBlock } from '@/blocks/PopularCountry/config'
import { WowtourSearchTourBlock } from '@/blocks/SearchTour/config'
import { WowtourTourTypeBlock } from '@/blocks/TourType/config'
import { WowtourGalleryAlbumBlock } from '@/blocks/GalleryAlbum/config'
import { WowtourBlogCardBlock } from '@/blocks/BlogCard/config'
import { WowtourBlogListingBlock } from '@/blocks/BlogListing/config'
import { WowtourGalleryListingBlock } from '@/blocks/GalleryListing/config'
import { WowtourPromotionCardBlock } from '@/blocks/PromotionCard/config'
import { StaticContentBlock } from '@/blocks/StaticContent/config'
import { TourGroupBlock } from '@/blocks/TourGroup/config'
import { WowtourVisaListBlock } from '@/blocks/VisaList/config'
import { FestivalTourBlock } from '@/blocks/Festival/config'
import { WowtourProductCardBlock } from '@/blocks/ProductCard/config'

export const PageBlocks: Block[] = [
  FeatureBlock,
  FormBlock,
  CtaBlock,
  LogosBlock,
  AboutBlock,
  ContactBlock,
  Gallery,
  TestimonialBlock,
  FaqBlock,
  StatBlock,
  SplitViewBlock,
  TextBlock,
  MediaBlock,
  CustomBlock,
  ChangelogBlock,
  Blog,
  BannerBlock,
  CasestudiesBlock,
  TimelineBlock,
  LoginBlock,
  SignupBlock,
  BannerSlideBlock,
  WowtourPopularCountryBlock,
  WowtourSearchTourBlock,
  WowtourTourTypeBlock,
  WowtourGalleryAlbumBlock,
  WowtourBlogCardBlock,
  WowtourBlogListingBlock,
  WowtourGalleryListingBlock,
  WowtourPromotionCardBlock,
  StaticContentBlock,
  TourGroupBlock,
  WowtourVisaListBlock,
  FestivalTourBlock,
  WowtourProductCardBlock,
]

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    plural: {
      en: 'Pages',
      th: 'หน้าเว็บ',
    },
    singular: {
      en: 'Page',
      th: 'หน้าเว็บ',
    },
  },
  access: {
    create: canAccessCollection('pages', 'create'),
    delete: canAccessCollection('pages', 'delete'),
    read: authenticatedOrPublished,
    update: canAccessCollection('pages', 'update'),
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, locale, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          breadcrumbs: data?.breadcrumbs,
          collection: 'pages',
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
        collection: 'pages',
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
      label: { en: 'Page Title', th: 'ชื่อหน้าเว็บ' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: PageBlocks,
              required: true,
              label: { en: 'Layout', th: 'รูปแบบที่แสดงผล (Layout)' },
            },
          ],
          label: { en: 'Content', th: 'เนื้อหา' },
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
    {
      name: 'publishedAt',
      type: 'date',
      label: { en: 'Published At', th: 'วันที่เผยแพร่' },
      admin: {
        position: 'sidebar',
      },
    },

    ...slugField(),
    {
      name: 'enableBreadcrumbs',
      type: 'checkbox',
      defaultValue: false,
      label: { en: 'Enable Breadcrumbs', th: 'เปิดใช้งาน Breadcrumbs' },
      admin: {
        position: 'sidebar',
        description: {
          en: 'Enable breadcrumbs for the page',
          de: 'Breadcumbs für die Seite aktivieren',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [
      populatePublishedAt,
      /**
       * ล็อคโครงสร้าง layout สำหรับ user ที่ไม่มี canManageDesign
       * - ห้ามเพิ่ม/ลบ Block
       * - ห้ามสลับตำแหน่ง Block
       * - ห้ามเปลี่ยนประเภท Block
       */
      async ({ data, originalDoc, req }) => {
        try {
          if (!req.user || checkRole(['admin'], req.user) || hasGlobalPermission('canManageDesign', req.user)) return data
          if (!originalDoc?.layout || !data?.layout) return data

          const prevLayout = originalDoc.layout
          const newLayout = data.layout

          // ตรวจจำนวน Block
          if (newLayout.length !== prevLayout.length) {
            throw new APIError('สิทธิ์ของคุณไม่สามารถเพิ่มหรือลบ Block ได้ กรุณาติดต่อผู้ดูแลระบบ', 403, undefined, true)
          }

          // ตรวจลำดับและประเภท Block
          for (let i = 0; i < prevLayout.length; i++) {
            if (newLayout[i].blockType !== prevLayout[i].blockType) {
              throw new APIError(
                'สิทธิ์ของคุณไม่สามารถสลับตำแหน่งหรือเปลี่ยนประเภท Block ได้ กรุณาติดต่อผู้ดูแลระบบ',
                403,
                undefined,
                true
              )
            }
          }
        } catch (err) {
          if (err instanceof APIError) throw err
          req.payload.logger.error(`[Pages beforeChange] Unexpected error: ${err}`)
          throw err
        }

        return data
      },
    ],
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
