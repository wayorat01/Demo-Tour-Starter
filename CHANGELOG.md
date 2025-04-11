# payblocks

## 1.8.0

### Minor Changes

- 74d3634: Adding hero112 and the new design version preview for all existing heros

### Patch Changes

- fbb2aeb: Fixing the language switcher sizing by allowing it to be set similar to the button sizes
- 70dc4c6: version bump to payload 3.32

## 1.7.0

### Minor Changes

- 2fb41fc: A new custom component to select the block design version in a visual way in a modal
- 3ef049b: Adding Gallery5
- d55d305: Moving design version preview to a drawer + using more official payload CSS classes to better support dark mode

## 1.6.0

### Minor Changes

- 31f7132: Adding functionality to the permissions system. This allows fine-granular access to certain payload functionality on group level.

### Patch Changes

- 1df4fcb: Hide the roles field in the create user screen
- 59c5706: Version bump of all packages
- 1fdbf1e: upgrading all packages, next, payload and deps to the most recent version

## 1.5.0

### Minor Changes

- df51984: Move dump file to public folder and adapt to new backup version. Also add media seeding.
- 4f859d5: update seed description and remove NEXT_PUBLIC_DEMO_DASHBOARD_CREDENTIALS from .env.example
- 9db5bfa: Add functionality to backup media files

### Patch Changes

- 1040aef: patching static params for more efficient fetching and fixing split view item positioning to be centered

## 1.4.0

### Minor Changes

- b5f7bb4: Minor cleanup for users collection / access functions and making sure, that editor users can't edit other users.
- 8509792: Adding changelog1 including functionality to fetch changelog items from github.
- c305e1e: Adding FAQ5 and fixing the selection of faqs in the admin ui
- 0be7bd1: Remove not implemented blocks from dropdown
- df2be8a: Add language switcher to mobile navi 1 and 5
- d301083: Add demo login user credentials

### Patch Changes

- a221118: Fix backups: move from json to bson. Sorting backups by uploadedAt.
- d4b3feb: make the initial user / role creation more solid, printing the error logs better and giving payload more time to initialise the database before role creation and retry one time on failure
- 26918cb: improve docs and move them to the shadcndocs project
- 7d51afd: Fix icon usage and making it more safe to use for the future

## 1.3.0

### Minor Changes

- f8617b1: Adding contact2 with real contact form data adding the support for newlines in lexical editor, fixing font issue for faq1
- 0e0bb7f: Move Seeding from Backups into own custom header
- b2e98c5: upgrading pacakges and adding resend email adapter

### Patch Changes

- de04d5f: Updating nextjs and packages
- 3187c97: Fix the redirect loop on 404 page by moving the not-found page to the root of the app.
- d5c644d: The redirects where not used as we did throw a notFound before that. Redirects got some more explanation to improve the user UX as well

## 1.2.0

### Minor Changes

- b2edb25: Adding support for the form builder to be added to a splitview (changing withoutWrapper to existing property disableContainer).
  Adding asterisks to required fields in form fields.
- c3f3770: Adding multi-slug routing like /a/b/c with nested doc support.

  In detail this adds the following features & fixes:
  Feat: multi-slug app routing
  Feat: multi-slug support in CMSLink
  Feat: multi-slug support in Breadcrumb Link
  Feat: multi-slug support in revalidatePage
  Fix: locales in revalidatePage
  Fix: breadcrumb locale
  Fix: breadcrumb next/link usage
  Feat: multi-slug support in lang switcher
  Feat: multi-slug support in generate static props
  Feat: multi-slug support in preview mode

### Patch Changes

- 0555e7a: moving the NEXT_PUBLIC_SERVER_URL generation out of next conf as this is not working reliably on vercel and is not so clean.
  Making sure, that the URL works both client and server side. Moving form submission to relative path.

## 1.1.0

### Minor Changes

- acd1f7e: Adding the nested docs plugin to pages collection + breadcrumb component + automatic breadcrumb generation + enable or disable breadcrumb on page level
