import { config } from 'dotenv'
config({ path: '.env', override: true })

async function main() {
    const { getPayload } = await import('payload')
    const configPromise = (await import('../src/payload.config')).default
    const payload = await getPayload({ config: configPromise })

    // 1. Fetch current tours
    const [interRes, inboundRes, catsRes] = await Promise.all([
        payload.find({ collection: 'intertours', limit: 300, depth: 0, where: { parentCountry: { exists: false }, isActive: { not_equals: false } } }),
        payload.find({ collection: 'inbound-tours', limit: 300, depth: 0, where: { isActive: { not_equals: false } } }),
        payload.find({ collection: 'tour-categories', limit: 100 })
    ])

    const allTours = [
        ...interRes.docs.map(doc => ({ relationTo: 'intertours', value: doc })),
        ...inboundRes.docs.map(doc => ({ relationTo: 'inbound-tours', value: doc }))
    ]

    console.log(`Found ${allTours.length} active tours to categorize.`)

    // 2. Identify Asia/Europe categories
    const asiaCat = catsRes.docs.find(c => (c.title as any)?.th === 'ทัวร์เอเชีย' || c.title === 'ทัวร์เอเชีย' || c.slug === 'asia')
    const europeCat = catsRes.docs.find(c => (c.title as any)?.th === 'ทัวร์ยุโรป' || c.title === 'ทัวร์ยุโรป' || c.slug === 'europe')

    const asiaId = asiaCat?.id
    const europeId = europeCat?.id

    console.log(`Asia Category ID: ${asiaId || 'Not Found'}`)
    console.log(`Europe Category ID: ${europeId || 'Not Found'}`)

    const asiaTours = allTours.filter(t => t.value.category === asiaId)
    const europeTours = allTours.filter(t => t.value.category === europeId)
    const otherTours = allTours.filter(t => t.value.category !== asiaId && t.value.category !== europeId)

    console.log(`Asia: ${asiaTours.length}, Europe: ${europeTours.length}, Others: ${otherTours.length}`)

    // 3. Update Header
    const header = await payload.findGlobal({ slug: 'header', depth: 0 })
    
    // Find the submenu for "ทัวร์ต่างประเทศ"
    const richItems = (header.richItems || []) as any[]
    let updated = false

    for (const item of richItems) {
        if (item.blockType === 'submenu' && (item.label === 'ทัวร์ต่างประเทศ' || item.label === 'International Tours')) {
            // Found it! Overwrite blocks with categorized tours
            item.blocks = [
                {
                    blockType: 'tourCategoryMenu',
                    title: 'เอเชีย',
                    underlineColor: '#f97316',
                    category: asiaId ? [asiaId] : [],
                    tours: asiaTours.map(t => ({ relationTo: t.relationTo, value: t.value.id })),
                    columns: '2',
                    showCityHover: true
                },
                {
                    blockType: 'tourCategoryMenu',
                    title: 'ยุโรป',
                    underlineColor: '#3b82f6',
                    category: europeId ? [europeId] : [],
                    tours: europeTours.map(t => ({ relationTo: t.relationTo, value: t.value.id })),
                    columns: '2',
                    showCityHover: true
                },
                {
                    blockType: 'tourCategoryMenu',
                    title: 'อื่นๆ',
                    underlineColor: '#10b981',
                    category: [],
                    tours: otherTours.map(t => ({ relationTo: t.relationTo, value: t.value.id })),
                    columns: '4',
                    showCityHover: true
                }
            ]
            updated = true
            console.log('Updated "ทัวร์ต่างประเทศ" mega menu blocks.')
        }
    }

    if (updated) {
        await payload.updateGlobal({
            slug: 'header',
            data: {
                richItems
            }
        })
        console.log('Header Global successfully updated.')
    } else {
        console.log('Could not find "ทัวร์ต่างประเทศ" menu item in Header.')
    }

    process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
