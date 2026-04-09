import { config } from 'dotenv'
import { resolve } from 'path'
// Ensure env is loaded first
config({ path: resolve(import.meta.dirname, '../.env'), override: true })

import { getPayload } from 'payload'

async function migrate() {
  console.log('🔒 Starting PDPA Migration (Encrypting Bookings)...')
  
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error('PAYLOAD_SECRET is not set in environment variables (check .env)')
  }

  // Dynamically import config so it evaluates AFTER dotenv is loaded
  const { default: configPromise } = await import('../src/payload.config')
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'bookings',
    limit: 1000,
    depth: 0,
  })

  console.log(`Found ${result.docs.length} total bookings to process.`)

  let successCount = 0

  for (const doc of result.docs) {
    // If it doesn't have name/phone, skip
    if (!doc.firstName && !doc.lastName && !doc.phone) {
      console.log(`⚠️ Skipping booking ${doc.pnrCode || doc.id} (Missing name & phone)`)
      continue
    }

    try {
      await payload.update({
        collection: 'bookings',
        id: doc.id as string,
        data: {
          firstName: doc.firstName,
          lastName: doc.lastName,
          phone: doc.phone,
        },
      })
      console.log(`✅ Encrypted: ${doc.pnrCode}`)
      successCount++
    } catch (err) {
      console.error(`❌ Failed to encrypt booking ${doc.pnrCode}:`, err)
    }
  }

  console.log(`\n🎉 Migration Complete! Successfully encrypted ${successCount}/${result.docs.length} bookings.`)
  process.exit(0)
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
