import { config } from 'dotenv'
config({ path: '.env', override: true })

async function main() {
    const { getPayload } = await import('payload')
    const configPromise = (await import('../src/payload.config')).default

    const payload = await getPayload({ config: configPromise })
    const interRes = await payload.find({ collection: 'intertours', limit: 1000, depth: 0 })
    console.log(JSON.stringify(interRes.docs.map(d => ({ title: d.title, isActive: d.isActive, slug: d.slug })), null, 2))
    process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
