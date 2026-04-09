import { config } from 'dotenv'
config({ path: '.env', override: true })

async function main() {
    const { getPayload } = await import('payload')
    const configPromise = (await import('../src/payload.config')).default

    const payload = await getPayload({ config: configPromise })

    const total = await payload.count({ collection: 'program-tours' })
    console.log(`\nTotal program-tours: ${total.totalDocs}`)

    // Find programs with non-empty productTags
    const withTags = await payload.find({
        collection: 'program-tours',
        where: {
            productTags: { not_equals: null },
        },
        limit: 50,
        depth: 0,
    })

    const tagResults = withTags.docs.filter((doc: any) => {
        const tags = doc.productTags
        return tags && Array.isArray(tags) && tags.length > 0
    })

    console.log('\n=== โปรแกรมทัวร์ที่มี Tags ===')
    if (tagResults.length === 0) {
        console.log('ไม่พบ')
    } else {
        tagResults.forEach((doc: any) => {
            console.log(`  ${doc.productCode} — ${doc.productName}`)
            console.log(`    Tags: ${JSON.stringify(doc.productTags)}`)
        })
    }

    // Find programs with non-empty festivals
    const withFestivals = await payload.find({
        collection: 'program-tours',
        where: {
            festivals: { not_equals: null },
        },
        limit: 50,
        depth: 0,
    })

    const festivalResults = withFestivals.docs.filter((doc: any) => {
        const f = doc.festivals
        return f && Array.isArray(f) && f.length > 0
    })

    console.log('\n=== โปรแกรมทัวร์ที่มี Festivals ===')
    if (festivalResults.length === 0) {
        console.log('ไม่พบ')
    } else {
        festivalResults.forEach((doc: any) => {
            console.log(`  ${doc.productCode} — ${doc.productName}`)
            console.log(`    Festivals: ${JSON.stringify(doc.festivals)}`)
        })
    }

    console.log(`\nสรุป: Tags ${tagResults.length} รายการ, Festivals ${festivalResults.length} รายการ จากทั้งหมด ${total.totalDocs} รายการ`)
    process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
