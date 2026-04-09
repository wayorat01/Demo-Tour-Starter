import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { config } from 'dotenv'

config({ path: '.env', override: true })

async function run() {
  try {
    const payload = await getPayload({ config: configPromise })
    const res = await payload.find({
      collection: 'pages',
      limit: 100,
      depth: 0,
      draft: true // explicitly bypass published-only filter
    })
    console.warn(`Payload API returned ${res.totalDocs} pages.`)
    res.docs.forEach(d => console.warn(`- ${d.title} (slug: ${d.slug})`))
  } catch (e) {
    console.error(e)
  }
  process.exit(0)
}
run()
