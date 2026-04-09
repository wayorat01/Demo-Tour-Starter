/**
 * Migration Script: Remove company name from SEO meta.title
 * for inbound-tours and intertours collections.
 *
 * Uses Payload Local API to bypass access control.
 *
 * Usage: PAYLOAD_SECRET=xxx MONGODB_URI=xxx npx tsx src/scripts/fix-seo-titles.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'

async function main() {
  console.log('🔧 SEO Title Migration: Remove company name suffix')
  console.log('='.repeat(50))

  const payload = await getPayload({ config })

  for (const collection of ['inbound-tours', 'intertours'] as const) {
    console.log(`\n📦 Processing collection: ${collection}`)
    console.log('─'.repeat(50))

    // Fetch all docs
    const result = await payload.find({
      collection,
      limit: 1000,
      depth: 0,
      overrideAccess: true,
    })

    console.log(`  Found ${result.docs.length} documents`)

    let updated = 0
    let skipped = 0
    let failed = 0

    for (const doc of result.docs) {
      const currentTitle = (doc as any).meta?.title as string | undefined
      if (!currentTitle) {
        skipped++
        continue
      }

      // Check if title contains " | " separator
      const pipeIndex = currentTitle.lastIndexOf(' | ')
      if (pipeIndex === -1) {
        skipped++
        continue
      }

      // Extract just the tour title (before " | ")
      const newTitle = currentTitle.substring(0, pipeIndex).trim()

      if (!newTitle) {
        console.log(`  ⚠️  Skipping ${doc.id} - empty title after stripping`)
        skipped++
        continue
      }

      try {
        await payload.update({
          collection,
          id: doc.id,
          data: {
            meta: { title: newTitle },
          } as any,
          overrideAccess: true,
        })
        updated++
        if (updated <= 5) {
          console.log(`  ✅ "${currentTitle}" → "${newTitle}"`)
        }
      } catch (err: any) {
        console.error(`  ❌ Failed to update ${doc.id}: ${err.message}`)
        failed++
      }
    }

    if (updated > 5) {
      console.log(`  ... and ${updated - 5} more`)
    }

    console.log(`\n  📊 Results: ${updated} updated, ${skipped} skipped, ${failed} failed`)
  }

  console.log('\n✅ Migration complete!')
  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
