import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function run() {
  const payload = await getPayload({ config: configPromise })
  const pageConfig = await payload.findGlobal({
    slug: 'page-config',
    depth: 0
  })
  
  await payload.updateGlobal({
    slug: 'page-config',
    data: pageConfig
  })
  
  console.log("Triggered PageConfig revalidation!")
  process.exit(0)
}

run()
