# Payblocks

Payblocks is a powerful website builder that combines the best of two worlds: PayloadCMS's robust content management capabilities and shadcnblocks' extensive UI component library. The name "Payblocks" reflects this fusion - "Pay" from PayloadCMS and "Blocks" from shadcnblocks.

This project transforms the traditional PayloadCMS starter into a feature-rich website builder with a beautiful, modern UI and an extensive collection of pre-built components. Whether you're building a corporate website, a portfolio, or a complex web application, Payblocks provides all the building blocks you need.


The official docs are located here: [Payblocks Docs](https://docs.shadcnblocks.com/payload/getting-started/)



## ✨ Key Features

- 🎨 **Rich Component Library**
  - Extensive collection of pre-built blocks from shadcnblocks
  - Multiple variants for each component type:
    - 5+ FAQ layouts
    - 15+ CTA designs
    - 6+ Gallery layouts
    - Various form components
  - All components are fully customizable and responsive

- 🔒 **Enhanced Security**
  - Cloudflare Turnstile integration for form protection
  - Secure authentication system
  - Login with Google
  - Role-based access control

- 🚀 **Advanced Features**
  - Layout Builder with drag-and-drop functionality
  - Live Preview for real-time content editing
  - Draft Preview system
  - SEO optimization tools
  - Redirects management
  - Advanced form builder with various field types

- 💻 **Developer Experience**
  - Built with Next.js and TypeScript
  - Shadcn/ui integration for consistent UI components
  - MongoDB/PostgreSQL database support
  - Email integration with Nodemailer
  - Cloud storage with Vercel Blob

## Quick Start

To spin up this project locally, follow these steps:

### Development

1. First clone the repo or download the zip file if you have not done so already
1. `cd payload-starter && cp .env.example .env` to copy the example environment variables
1. Create a local or [cloud mongodb database/cluster](https://www.mongodb.com/de-de/cloud/atlas/register) and fill in the `MONGODB_URI` in the `.env` file. Make sure to also include the database name in the connection URL (For example `payload-template-website` as in .env.example)
1. `pnpm install && pnpm dev` to install dependencies and start the dev server
1. Visit `http://localhost:3000` to open the app in your browser. If your DB was empty you should see a not found page.
1. Visit `http://localhost:3000/admin` to open the admin panel in your browser. On first login, you will be asked to create an admin user.
1. Optional: Seed the database with a few pages by clicking on the "Seed DB" button in the Admin panel home page.

That's it! Changes made in `./src` will be reflected in your app. Check out [Production](#production) once you're ready to build and serve your app, and [Deployment](#deployment) when you're ready to go live.

## How it works

The Payload config is tailored specifically to the needs of most websites. It is pre-configured in the following ways:

### Collections

See the [Collections](https://payloadcms.com/docs/beta/configuration/collections) docs for details on how to extend this functionality.

- #### Users (Authentication)

  Users are auth-enabled collections that have access to the admin panel and unpublished content. See [Access Control](#access-control) for more details.

  For additional help, see the official [Auth Example](https://github.com/payloadcms/payload/tree/beta/examples/auth) or the [Authentication](https://payloadcms.com/docs/beta/authentication/overview#authentication-overview) docs.

- #### Posts

  Posts are used to generated blog posts, news articles, or any other type of content that is published over time. All posts are layout builder enabled so you can generate unique layouts for each post using layout-building blocks, see [Layout Builder](#layout-builder) for more details. Posts are also draft-enabled so you can preview them before publishing them to your website, see [Draft Preview](#draft-preview) for more details.

- #### Pages

  All pages are layout builder enabled so you can generate unique layouts for each page using layout-building blocks, see [Layout Builder](#layout-builder) for more details. Pages are also draft-enabled so you can preview them before publishing them to your website, see [Draft Preview](#draft-preview) for more details.

- #### Media

  This is the uploads enabled collection used by pages, posts, and projects to contain media like images, videos, downloads, and other assets.

- #### Categories

  A taxonomy used to group posts together. Categories can be nested inside of one another, for example "News > Technology". See the official [Payload Nested Docs Plugin](https://payloadcms.com/docs/beta/plugins/nested-docs) for more details.

### Globals

See the [Globals](https://payloadcms.com/docs/configuration/globals) docs for details on how to extend this functionality.

- `Header`

  The data required by the header on your front-end like nav links.

- `Footer`

  Same as above but for the footer of your site.

## Live preview

In addition to draft previews you can also enable live preview to view your end resulting page as you're editing content with full support for SSR rendering. See [Live preview docs](https://payloadcms.com/docs/beta/live-preview/overview) for more details.

## SEO

This template comes pre-configured with the official [Payload SEO Plugin](https://payloadcms.com/docs/beta/plugins/seo) for complete SEO control from the admin panel. All SEO data is fully integrated into the front-end website that comes with this template. See [Website](#website) for more details.

## Redirects

If you are migrating an existing site or moving content to a new URL, you can use the `redirects` collection to create a proper redirect from old URLs to new ones. This will ensure that proper request status codes are returned to search engines and that your users are not left with a broken link. This template comes pre-configured with the official [Payload Redirects Plugin](https://payloadcms.com/docs/beta/plugins/redirects) for complete redirect control from the admin panel. All redirects are fully integrated into the front-end website that comes with this template. See [Website](#website) for more details.


### Customizing Fonts

Payblocks uses the Geist font family by default, but you can easily customize the fonts to match your brand. The fonts are configured in two places:

1. **Frontend Layout (`src/app/(frontend)/layout.tsx`):**
   - Import your desired fonts from `next/font/google` or any other font source
   - Replace the font assignments for `mono` and `sans`:
   ```typescript
   const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })
   const sans = Geist({ subsets: ['latin'], variable: '--font-sans' })
   ```
   - The `variable` names (`--font-mono` and `--font-sans`) should remain unchanged as they are used by Tailwind

2. **Tailwind Config (`tailwind.config.mjs`):**
   - The font variables are already configured in the Tailwind theme
   - No changes are needed in the Tailwind config as long as you keep the variable names consistent

Example of changing to a different font:
```typescript
import { Inter, Roboto_Mono } from 'next/font/google'

const mono = Roboto_Mono({ subsets: ['latin'], variable: '--font-mono' })
const sans = Inter({ subsets: ['latin'], variable: '--font-sans' })
```

### Docker

Alternatively, you can use [Docker](https://www.docker.com) to spin up this template locally. To do so, follow these steps:

1. Follow [steps 1 and 2 from above](#development), the docker-compose file will automatically use the `.env` file in your project root
1. Next run `docker-compose up`
1. Follow [steps 4 and 5 from above](#development) to login and create your first admin user

That's it! The Docker instance will help you get up and running quickly while also standardizing the development environment across your teams.

### Seed

To seed the database with a few pages, posts, and projects you can click on the "Seed DB" button in the Admin panel home page.

> NOTICE: The Backup section and Seed DB button is only available if you are logged in as an admin and if you have the `MONGODB_URI` environment variable set and configured.

> WARNING: seeding the database is destructive because it drops your current database to populate a fresh one from the seed template. Only run this command if you are starting a new project or can afford to lose your current data.
