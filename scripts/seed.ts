#!/usr/bin/env node
/**
 * SeedDB CLI Script
 *
 * Usage:
 *   pnpm seed:generate                           - Export current DB to public/seed/seed-data.tar.gz
 *   pnpm seed:apply                              - Import seed + merge (keep newer) [default]
 *   pnpm seed:apply --mode replace               - Full replace (destructive)
 *   pnpm seed:apply --mode merge-keep            - Only add new docs, never overwrite
 *   pnpm seed:apply --mode merge-newer           - Compare timestamps, keep newer [default]
 *   pnpm seed:apply --mode merge-prefer          - Upsert all from seed, don't delete local-only
 *   pnpm seed:apply --exclude header,footer      - Exclude specific global types from import
 */

// Load environment variables from .env (for CLI usage outside of Next.js)
import { config } from 'dotenv'
config({ path: '.env', override: true })

const command = process.argv[2]

// Parse CLI flags
function parseFlags(): { mode?: string; exclude?: string[] } {
  const args = process.argv.slice(3)
  const flags: { mode?: string; exclude?: string[] } = {}

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--mode' && args[i + 1]) {
      flags.mode = args[i + 1]
      i++
    } else if (args[i] === '--exclude' && args[i + 1]) {
      flags.exclude = args[i + 1].split(',').map((s) => s.trim())
      i++
    }
  }

  return flags
}

async function main() {
  const { generateSeed, applySeed, previewSeed } =
    await import('../src/components/AdminDashboard/SeedDB/actions')

  if (command === 'generate') {
    console.log('🌱 Generating seed file...')
    const result = await generateSeed()
    if (result.success) {
      console.log('✅', result.message)
      if (result.size) {
        const sizeMB = (result.size / (1024 * 1024)).toFixed(2)
        console.log(`📦 File size: ${sizeMB} MB`)
      }
    } else {
      console.error('❌', result.message)
      process.exit(1)
    }
  } else if (command === 'apply') {
    const flags = parseFlags()
    const mode = (flags.mode || 'merge-newer') as
      | 'replace'
      | 'merge-keep'
      | 'merge-newer'
      | 'merge-prefer'

    const validModes = ['replace', 'merge-keep', 'merge-newer', 'merge-prefer']
    if (!validModes.includes(mode)) {
      console.error(`❌ Invalid mode: ${mode}`)
      console.error(`   Valid modes: ${validModes.join(', ')}`)
      process.exit(1)
    }

    // Show preview first
    console.log('📋 Previewing seed contents...')
    const preview = await previewSeed()
    if (preview.success && preview.collections) {
      for (const col of preview.collections) {
        console.log(
          `   ${col.name}: ${col.docCount} docs${col.isGlobal ? ` (globals: ${col.globalTypes?.join(', ')})` : ''}`,
        )
      }
      if (preview.mediaCount) {
        console.log(`   Media files: ${preview.mediaCount}`)
      }
    }

    const modeLabels: Record<string, string> = {
      replace: '🔄 Replace All (destructive!)',
      'merge-keep': '➕ Merge: Keep Local',
      'merge-newer': '⏱️ Merge: Keep Newer',
      'merge-prefer': '🔀 Merge: Prefer Seed',
    }

    console.log(`\n📥 Applying seed (${modeLabels[mode]})...`)

    const result = await applySeed({
      mode: mode as any,
      excludeGlobalTypes: flags.exclude,
    })

    if (result.success) {
      console.log('✅', result.message)
      if (result.details) {
        console.log('\n📊 Details:')
        console.log(`   ➕ Inserted: ${result.details.inserted}`)
        console.log(`   🔄 Updated: ${result.details.updated}`)
        console.log(`   ✅ Kept local: ${result.details.skippedLocal}`)
        console.log(`   🛡️ Globals skipped: ${result.details.skippedGlobal}`)
        console.log(`   🖼️ Media files: ${result.details.mediaRestored}`)
      }
    } else {
      console.error('❌', result.message)
      process.exit(1)
    }
  } else if (command === 'preview') {
    console.log('📋 Seed file contents (from S3):')
    const preview = await previewSeed()
    if (preview.success && preview.collections) {
      for (const col of preview.collections) {
        console.log(
          `   ${col.name}: ${col.docCount} docs${col.isGlobal ? ` (globals: ${col.globalTypes?.join(', ')})` : ''}`,
        )
      }
      console.log(`   Media files: ${preview.mediaCount || 0}`)
    } else {
      console.error('❌', preview.message)
    }
  } else {
    console.log('Usage:')
    console.log('  pnpm seed:generate                         - Export DB to seed file')
    console.log('  pnpm seed:apply                            - Import seed (merge-newer mode)')
    console.log('  pnpm seed:apply --mode replace             - Full replace (destructive)')
    console.log('  pnpm seed:apply --mode merge-keep          - Only add new, never overwrite')
    console.log('  pnpm seed:apply --mode merge-newer         - Keep whichever is newer')
    console.log("  pnpm seed:apply --mode merge-prefer        - Prefer seed, don't delete local")
    console.log('  pnpm seed:apply --exclude header,footer    - Exclude specific globals')
    process.exit(1)
  }
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
