// storage-adapter-import-placeholder
// import { postgresAdapter } from '@payloadcms/db-postgres'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { s3Storage } from '@payloadcms/storage-s3'
import { th } from '@payloadcms/translations/languages/th'
import { en } from '@payloadcms/translations/languages/en'

import { OAuth2Plugin } from 'payload-oauth2'

import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { resendAdapter } from '@payloadcms/email-resend'
import {
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  ItalicFeature,
  LinkFeature,
  lexicalEditor,
  UnderlineFeature,
  ParagraphFeature,
  TextStateFeature,
  defaultColors,
} from '@payloadcms/richtext-lexical'
import sharp from 'sharp' // editor-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import Categories from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import Users from './collections/Users'
import Roles from './collections/Roles'
import { TourCategories } from './collections/TourCategories'
import { InterTours } from './collections/InterTours'
import { InboundTours } from './collections/InboundTours'
import { ProgramTours } from './collections/ProgramTours'
import { GalleryAlbums } from './collections/GalleryAlbums'
import { Testimonials } from './collections/Testimonials'
import { Tags } from './collections/Tags'
import { Bookings } from './collections/Bookings'
import { Festivals } from './collections/Festivals'
import { Airlines } from './collections/Airlines'
import { TourGroups } from './collections/TourGroups'
import { CustomLandingPages } from './collections/CustomLandingPages'
import { ActivityLogs } from './collections/ActivityLogs'
import { withActivityHooks } from './utilities/withActivityHooks'
import { createGlobalActivityAfterChange } from './hooks/activityLog'

import { Footer } from './globals/Footer/config'
import { Header } from './globals/Header/config'
import { ThemeConfig } from './globals/ThemeConfig/config'
import { revalidateRedirects } from './hooks/revalidateRedirects'
import {
  GenerateTitle,
  GenerateURL,
  GenerateDescription,
  GenerateImage,
} from '@payloadcms/plugin-seo/types'
import { Page, Post } from 'src/payload-types'

import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { serverUrl as NEXT_PUBLIC_SERVER_URL } from '@/config/server'
import localization from './localization.config'
import { initializeRoles } from './utilities/initRoles'
import { isAdminHidden } from './access/isAdmin'
import { hasPermission } from './utilities/checkPermission'
import { PageConfig } from './globals/PageConfig/config'

import { CompanyInfo } from './globals/CompanyInfo/config'
import { ApiSetting } from './globals/ApiSetting/config'
import { Telephone } from './fields/formBuilder/telephone'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

function extractLexicalText(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.children)) {
    return node.children.map(extractLexicalText).join(' ')
  }
  return ''
}

function getLocalizedValue(val: any, locale: string = 'th'): string {
  if (!val) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object') {
    return val[locale] || val.th || Object.values(val).find((v) => typeof v === 'string') || ''
  }
  return String(val)
}

const generateTitle: GenerateTitle<any> = async ({ doc, collectionSlug, req }) => {
  const locale = req?.locale || 'th'

  // For program-tours: "TourCode - TourName" (SEO green: 50-60 chars)
  if (collectionSlug === 'program-tours') {
    const code = getLocalizedValue(doc?.productCode, locale)
    const name = getLocalizedValue(doc?.productName, locale)
    const raw = code ? `${code} - ${name}` : name
    if (raw.length > 60) return raw.substring(0, 57) + '...'
    return raw
  }

  // For tour collections, use just the tour title (no company suffix)
  if (collectionSlug === 'inbound-tours' || collectionSlug === 'intertours') {
    return getLocalizedValue(doc?.title, locale)
  }

  // For other collections, append company name
  let companyName = 'WOW Tour'
  if (req?.payload) {
    try {
      const companyInfo = await req.payload.findGlobal({
        slug: 'company-info',
        depth: 0,
        locale: locale as any,
      })
      if (companyInfo?.companyName) {
        companyName = getLocalizedValue(companyInfo.companyName, locale)
      }
    } catch (err) {
      // Ignored
    }
  }

  const title = getLocalizedValue(doc?.title, locale)
  return title ? `${title} | ${companyName}` : companyName
}

const generateDescription: GenerateDescription<any> = ({ doc, collectionSlug, req }) => {
  const locale = req?.locale || 'th'

  // For program-tours: use highlight field (SEO green: 100-150 chars)
  if (collectionSlug === 'program-tours') {
    const highlight = getLocalizedValue(doc?.highlight, locale)
    if (!highlight) return ''
    const clean = highlight.replace(/\s+/g, ' ').trim()
    if (clean.length > 150) return clean.substring(0, 147) + '...'
    return clean
  }

  if (collectionSlug === 'intertours' || collectionSlug === 'inbound-tours') {
    if (doc?.description?.root || doc?.description?.th?.root) {
      const root = doc.description.root || doc.description[locale]?.root || doc.description.th?.root
      const text = extractLexicalText(root)
      return text.replace(/\s+/g, ' ').trim().substring(0, 150)
    }
    const desc = getLocalizedValue(doc?.description, locale)
    if (typeof desc === 'string') return desc.substring(0, 150)
  }
  return getLocalizedValue(doc?.meta?.description, locale)
}

const generateImage: GenerateImage<any> = ({ doc, collectionSlug }) => {
  if (collectionSlug === 'program-tours') {
    // ProgramTours uses urlPic (external URL)
    return doc?.urlPic || doc?.meta?.image
  }
  if (collectionSlug === 'intertours') {
    // InterTours uses thumbnail
    const thumb = doc?.thumbnail?.url ? doc.thumbnail.url : doc?.thumbnail
    return thumb || doc?.meta?.image
  }
  if (collectionSlug === 'inbound-tours') {
    // InboundTours uses featuredImage
    const feat = doc?.featuredImage?.url ? doc.featuredImage.url : doc?.featuredImage
    return feat || doc?.meta?.image
  }
  return doc?.meta?.image
}

const generateURL: GenerateURL<any> = ({ doc, collectionSlug }) => {
  return doc?.slug ? `${NEXT_PUBLIC_SERVER_URL!}/${doc.slug}` : NEXT_PUBLIC_SERVER_URL!
}

/**
 * Only show the google login button if the client id and secret are set
 */
const googleAuthActive = !!(
  process.env.GOOGLE_LOGIN_CLIENT_ID && process.env.GOOGLE_LOGIN_CLIENT_SECRET
)

export default buildConfig({
  admin: {
    components: {
      beforeLogin: ['@/components/AdminDashboard/BeforeLogin'],
      afterLogin: googleAuthActive ? ['@/components/AdminDashboard/LoginButton'] : [],
      beforeDashboard: ['@/components/AdminDashboard/BeforeDashboard'],
      afterDashboard: [
        '@/components/AdminDashboard/SeedDB',
        '@/components/AdminDashboard/BackupDashboard',
      ],
      graphics: {
        Icon: '@/components/AdminDashboard/PayblocksIcon',
        Logo: '@/components/AdminDashboard/PayblocksLogo',
      },
      actions: ['@/components/AdminDashboard/HomeButton'],
      afterNavLinks: ['@/components/AdminCSS/AgentStarterCSS'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: lexicalEditor({
    features: () => {
      return [
        HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
        FixedToolbarFeature(),
        UnderlineFeature(),
        BoldFeature(),
        ItalicFeature(),
        ParagraphFeature(),
        LinkFeature({
          enabledCollections: ['pages', 'posts'],
          fields: ({ defaultFields }) => {
            const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
              if ('name' in field && field.name === 'url') return false
              return true
            })

            return [
              ...defaultFieldsWithoutUrl,
              {
                name: 'url',
                type: 'text',
                admin: {
                  condition: (_, siblingData) => siblingData.linkType !== 'internal',
                },
                label: ({ t }) => t('fields:enterURL'),
                required: true,
              },
            ]
          },
        }),

        TextStateFeature({
          state: {
            color: {
              'text-grey': {
                label: 'Grey',

                css: {
                  color: 'hsl(0, 0%, 41%)',
                },
              },
              ...defaultColors.text,
            },
          },
        }),
      ]
    },
  }),
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || '',
  }),
  collections: [
    withActivityHooks(Pages),
    withActivityHooks(Posts),
    withActivityHooks(Media),
    withActivityHooks(Categories),
    withActivityHooks(Users),
    withActivityHooks(Roles),
    withActivityHooks(TourCategories),
    withActivityHooks(InterTours),
    withActivityHooks(InboundTours),
    withActivityHooks(ProgramTours),
    withActivityHooks(GalleryAlbums),
    withActivityHooks(Tags),
    withActivityHooks(Testimonials),
    withActivityHooks(Bookings),
    withActivityHooks(Festivals),
    withActivityHooks(Airlines),
    withActivityHooks(TourGroups),
    withActivityHooks(CustomLandingPages),
    ActivityLogs, // ไม่ wrap — ป้องกัน infinite loop
  ],
  cors: [process.env.PAYLOAD_PUBLIC_SERVER_URL || ''].filter(Boolean),
  csrf: [process.env.PAYLOAD_PUBLIC_SERVER_URL || ''].filter(Boolean),
  globals: [
    {
      ...ThemeConfig,
      hooks: {
        ...ThemeConfig.hooks,
        afterChange: [...(ThemeConfig.hooks?.afterChange || []), createGlobalActivityAfterChange],
      },
    },
    {
      ...Header,
      hooks: {
        ...Header.hooks,
        afterChange: [...(Header.hooks?.afterChange || []), createGlobalActivityAfterChange],
      },
    },
    {
      ...Footer,
      hooks: {
        ...Footer.hooks,
        afterChange: [...(Footer.hooks?.afterChange || []), createGlobalActivityAfterChange],
      },
    },
    {
      ...PageConfig,
      hooks: {
        ...PageConfig.hooks,
        afterChange: [...(PageConfig.hooks?.afterChange || []), createGlobalActivityAfterChange],
      },
    },
    {
      ...CompanyInfo,
      hooks: {
        ...CompanyInfo.hooks,
        afterChange: [...(CompanyInfo.hooks?.afterChange || []), createGlobalActivityAfterChange],
      },
    },
    {
      ...ApiSetting,
      hooks: {
        ...ApiSetting.hooks,
        afterChange: [...(ApiSetting.hooks?.afterChange || []), createGlobalActivityAfterChange],
      },
    },
  ],
  plugins: [
    redirectsPlugin({
      collections: ['pages', 'posts'],
      overrides: {
        labels: {
          singular: { en: 'Redirect', th: 'การเปลี่ยนเส้นทาง' },
          plural: { en: 'Redirects', th: 'การเปลี่ยนเส้นทาง' },
        },
        // @ts-expect-error Type mismatch between redirects plugin field types and our runtime shape
        fields: ({ defaultFields }) => {
          return defaultFields.map((field) => {
            if ('name' in field && field.name === 'from') {
              return {
                ...field,
                admin: {
                  description:
                    'Add new redirects here. The redirect will work immediately after saving. For example: /about or https://example.com/about',
                },
              }
            }
            return field
          })
        },
        hooks: {
          afterChange: [revalidateRedirects],
        },
        access: {
          create: hasPermission('canManageRedirects'),
          read: () => true,
          update: hasPermission('canManageRedirects'),
          delete: hasPermission('canManageRedirects'),
        },
      },
    }),
    nestedDocsPlugin({
      collections: ['categories', 'pages'],
      // This function is executed on save of the page. If you change this function make
      // sure to re-save all pages to update there URLs
      generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc?.slug || ''}`, ''),
      generateLabel: (_, doc) => (typeof doc?.title === 'string' ? doc.title : 'Untitled'),
    }),
    seoPlugin({
      // ไม่ inject SEO fields เข้า collection ใดๆ (ทุก collection กำหนด Tab "การทำ SEO" เอง)
      // แต่ยังคง register global endpoints สำหรับปุ่ม Auto Generate
      collections: [],
      generateTitle,
      generateDescription,
      generateImage,
      generateURL,
    }),
    formBuilderPlugin({
      fields: {
        payment: false,
        telephone: Telephone,
      },
      formOverrides: {
        labels: {
          singular: { en: 'Form', th: 'แบบฟอร์ม' },
          plural: { en: 'Forms', th: 'แบบฟอร์ม' },
        },
        fields: ({ defaultFields }) => {
          return defaultFields.map((field) => {
            if ('name' in field && field.name === 'confirmationMessage') {
              return {
                ...field,
                editor: lexicalEditor({
                  features: ({ rootFeatures }) => {
                    return [
                      ...rootFeatures,
                      FixedToolbarFeature(),
                      HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    ]
                  },
                }),
              }
            }
            return field
          })
        },
      },
      formSubmissionOverrides: {
        labels: {
          singular: { en: 'Form Submission', th: 'ข้อมูลแบบฟอร์ม' },
          plural: { en: 'Form Submissions', th: 'ข้อมูลแบบฟอร์ม' },
        },
        admin: {
          description: {
            th: 'ข้อมูลที่ส่งมาจากแบบฟอร์มในหน้าเว็บไซต์',
            en: 'Form submissions that got collected by forms in the frontend',
          },
        },
      },
    }),
    searchPlugin({
      collections: ['pages', 'posts'],
      beforeSync: beforeSyncWithSearch,
      searchOverrides: {
        admin: {
          hidden: isAdminHidden,
        },
        fields: ({ defaultFields }) => {
          return [...defaultFields, ...searchFields]
        },
      },
    }),
    s3Storage({
      collections: {
        media: {
          prefix: '',
          generateFileURL: ({ filename, prefix }) => {
            const baseUrl = process.env.NEXT_PUBLIC_S3_CDN_URL || process.env.S3_ENDPOINT
            const safePrefix = prefix && prefix !== '.' ? `${prefix}/` : ''
            return filename ? `${baseUrl}/${safePrefix}${encodeURI(filename)}` : `${baseUrl}`
          },
        },
      },
      bucket: process.env.S3_BUCKET!,
      config: {
        forcePathStyle: true, // Use path-style to prevent DNS ENOTFOUND issues on macOS/Node
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
        region: process.env.S3_REGION!,
        endpoint: process.env.S3_ENDPOINT!,
      },
    }),
    OAuth2Plugin({
      enabled: googleAuthActive,
      strategyName: 'google',
      useEmailAsIdentity: true,
      serverURL: NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
      authCollection: 'users',
      clientId: process.env.GOOGLE_LOGIN_CLIENT_ID || '',
      subFieldName: 'sub',
      clientSecret: process.env.GOOGLE_LOGIN_CLIENT_SECRET || '',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'openid',
      ],
      providerAuthorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      getUserInfo: async (accessToken: string) => {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const user = await response.json()
        if (!user.email_verified) {
          throw new Error('Email not verified')
        }
        /**
         * Set your own allowed email domains here if needed to limit access
         * to payload for specific email domains
         */
        const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS?.split(',')
        if (allowedDomains && !allowedDomains.includes(user.email.split('@')?.[1])) {
          throw new Error('Email domain not allowed')
        }

        return {
          email: user.email,
          sub: user.sub,
          name: user.name,
        }
      },
      successRedirect: (req: PayloadRequest) => {
        // redirect to state
        if (req.query.state && (req.query.state as string).startsWith('/')) {
          return `${req.query.state}`
        }
        return '/admin'
      },
      failureRedirect: (_, error) => {
        console.error(error)
        return '/login'
      },
    }),
  ],
  /**
   * Use the Resend adapter or switch to your own email service here: https://payloadcms.com/docs/email/overview
   */
  email: resendAdapter({
    defaultFromAddress: process.env.EMAIL_FROM_ADDRESS!,
    defaultFromName: 'Payblocks Website',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  secret: process.env.PAYLOAD_SECRET!,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  onInit: async (payload) => {
    /**
     * Add the default roles if needed on system startup
     */
    await initializeRoles(payload)
  },
  // Enable localization for the website
  localization,
  // Enable localization for admin panel
  i18n: {
    supportedLanguages: { th, en },
  },
})
