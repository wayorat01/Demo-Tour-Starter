import { config } from 'dotenv'
config({ path: '.env', override: true })
import { applySeed } from './src/components/AdminDashboard/SeedDB/actions'

async function run() {
  console.warn('Forcing replace for "pages" collection...')
  const result = await applySeed({
    mode: 'replace',
    selectedCollections: ['pages']
  })
  console.warn(JSON.stringify(result, null, 2))
}
run().catch(console.error)
