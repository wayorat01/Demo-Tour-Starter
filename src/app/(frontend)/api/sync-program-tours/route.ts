import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * POST /api/sync-program-tours
 *
 * ดึงข้อมูล products ทั้งหมดจาก API (mode=searchresultsproduct)
 * แล้ว save ลงคอลเลกชั่น programtour ใน Payload CMS
 * 
 * - ดึงทุกหน้า (pagination) จนครบทุก products
 * - ถ้า product_code ซ้ำ → ทับข้อมูลเดิมทั้งหมด
 */
export async function POST(req: NextRequest) {
    try {
        const payload = await getPayload({ config: configPromise })

        // 1. ดึง API Setting จาก global
        const apiSetting = await payload.findGlobal({ slug: 'api-setting' })

        if (!apiSetting?.apiEndPoint || !apiSetting?.apiKey) {
            return NextResponse.json(
                { success: false, error: 'API Setting ไม่ครบ (ตรวจสอบ API Endpoint และ API Key)' },
                { status: 500 },
            )
        }

        // 2. ดึง products ทุกหน้า (pagination)
        const PAGE_SIZE = 50
        let allProducts: any[] = []
        let apiFilters: any = null
        let currentPage = 1
        let hasMore = true

        while (hasMore) {
            const url = new URL(apiSetting.apiEndPoint)
            url.searchParams.set('apikey', apiSetting.apiKey)
            url.searchParams.set('mode', 'searchresultsproduct')
            url.searchParams.set('lang', 'th')
            url.searchParams.set('pagesize', String(PAGE_SIZE))
            url.searchParams.set('pagenumber', String(currentPage))
            url.searchParams.set('sortby', 'pricehightolow')

            console.log(`[sync-program-tours] Fetching page ${currentPage}...`)

            const res = await fetch(url.toString())
            if (!res.ok) {
                return NextResponse.json(
                    { success: false, error: `API ตอบกลับ status ${res.status} ที่ page ${currentPage}` },
                    { status: 500 },
                )
            }

            const json = await res.json()

            if (json.success !== 'True') {
                return NextResponse.json(
                    { success: false, error: 'API ตอบกลับ success !== True' },
                    { status: 500 },
                )
            }

            let products: any[] = []
            if (json.data?.products) {
                products = json.data.products
            } else if (Array.isArray(json.data)) {
                products = json.data
            }

            // เก็บ filters จากหน้าแรก (มีแค่หน้าแรกเท่านั้น)
            if (currentPage === 1 && json.data?.filters) {
                apiFilters = json.data.filters
            }

            allProducts = allProducts.concat(products)

            // ถ้าได้ products น้อยกว่า PAGE_SIZE แสดงว่าเป็นหน้าสุดท้าย
            if (products.length < PAGE_SIZE) {
                hasMore = false
            } else {
                currentPage++
            }
        }

        console.log(`[sync-program-tours] Total products fetched: ${allProducts.length} (${currentPage} pages)`)

        if (allProducts.length === 0) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบ products จาก API' },
                { status: 404 },
            )
        }

        // 3. Save แต่ละ product ลง programtour collection
        const results: any[] = []
        const errors: any[] = []

        for (const product of allProducts) {
            try {
                // ตรวจสอบว่ามี productCode ซ้ำหรือยัง
                const existing = await payload.find({
                    collection: 'program-tours',
                    where: {
                        productCode: { equals: product.product_code },
                    },
                    limit: 1,
                })

                // หาทวีปจาก InterTours หรือ Inbound Tours โดยจับคู่ country_slug กับ slug
                let continentName = ''
                if (product.country_slug) {
                    // 1. หาใน InterTours ก่อน
                    try {
                        const matchedTour = await payload.find({
                            collection: 'intertours',
                            where: { slug: { equals: product.country_slug } },
                            depth: 1,
                            limit: 1,
                        })
                        if (matchedTour.docs.length > 0) {
                            const category = (matchedTour.docs[0] as any).category
                            if (typeof category === 'object' && category?.title) {
                                continentName = typeof category.title === 'object'
                                    ? category.title.th || ''
                                    : category.title
                            }
                        }
                    } catch (e) {
                        // ไม่เจอ InterTour → ข้าม
                    }

                    // 2. ถ้าไม่เจอใน InterTours → หาใน Inbound Tours
                    if (!continentName) {
                        try {
                            const matchedInbound = await payload.find({
                                collection: 'inbound-tours',
                                where: { slug: { equals: product.country_slug } },
                                depth: 1,
                                limit: 1,
                            })
                            if (matchedInbound.docs.length > 0) {
                                const category = (matchedInbound.docs[0] as any).category
                                if (typeof category === 'object' && category?.title) {
                                    continentName = typeof category.title === 'object'
                                        ? category.title.th || ''
                                        : category.title
                                }
                            }
                        } catch (e) {
                            // ไม่เจอ Inbound Tour → ข้าม
                        }
                    }
                }

                const productData = mapApiProductToPayload(product, continentName)

                // ดึงรายละเอียดการเดินทาง (itinerary) + ข้อมูลเพิ่มเติม (productdetails) จาก API
                if (product.product_code) {
                    // 1. ดึง itinerary
                    try {
                        const itineraryUrl = new URL(apiSetting.apiEndPoint as string)
                        itineraryUrl.searchParams.set('apikey', apiSetting.apiKey as string)
                        itineraryUrl.searchParams.set('mode', 'itinerarybasic')
                        itineraryUrl.searchParams.set('lang', 'th')
                        itineraryUrl.searchParams.set('product_code', product.product_code)

                        const itRes = await fetch(itineraryUrl.toString())
                        if (itRes.ok) {
                            const itJson = await itRes.json()
                            if (itJson.success === 'True' && Array.isArray(itJson.data)) {
                                productData.itinerary = itJson.data.map((item: any) => ({
                                    dayTitle: (item.type || '').trim(),
                                    dayContent: (item.content || '').trim(),
                                }))
                            }
                        }
                    } catch (e) {
                        // ดึง itinerary ไม่ได้ → ข้าม
                    }

                    // 2. ดึง productdetails → suppliername, tags, deposit ต่อ period
                    try {
                        const detailUrl = new URL(apiSetting.apiEndPoint as string)
                        detailUrl.searchParams.set('apikey', apiSetting.apiKey as string)
                        detailUrl.searchParams.set('mode', 'productdetails')
                        detailUrl.searchParams.set('lang', 'th')
                        detailUrl.searchParams.set('product_code', product.product_code)

                        const detailRes = await fetch(detailUrl.toString())
                        if (detailRes.ok) {
                            const detailJson = await detailRes.json()
                            const detail = Array.isArray(detailJson.data) ? detailJson.data[0] : detailJson.data
                            if (detail) {
                                productData.supplierName = (detail.suppliername || '').trim()
                                productData.productTags = Array.isArray(detail.tags) ? detail.tags : []

                                // Update URLs from detail if available (often more accurate than search results)
                                if (detail.url_pdf || detail.url_brochure) {
                                    productData.urlPdf = detail.url_brochure || detail.url_pdf || ''
                                }
                                if (detail.url_word) {
                                    productData.urlWord = detail.url_word || ''
                                }
                                if (detail.url_banner) {
                                    productData.urlBanner = detail.url_banner || ''
                                }

                                // Save itinerary_summary จาก productdetails
                                if (detail.itinerary_summary) {
                                    productData.itinerarySummary = (typeof detail.itinerary_summary === 'string'
                                        ? detail.itinerary_summary
                                        : '').trim()
                                }

                                // Merge deposit/deposit_date จาก productdetails.period เข้า periods
                                if (Array.isArray(detail.period) && Array.isArray(productData.periods)) {
                                    const depositMap = new Map<number, { deposit: number; depositDate: string }>()
                                    for (const dp of detail.period) {
                                        if (dp.period_id) {
                                            depositMap.set(dp.period_id, {
                                                deposit: dp.deposit || 0,
                                                depositDate: dp.deposit_date || '',
                                            })
                                        }
                                    }
                                    for (const period of productData.periods) {
                                        const match = depositMap.get(period.periodId)
                                        if (match) {
                                            period.deposit = match.deposit
                                            period.depositDate = match.depositDate
                                        }
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        // ดึง productdetails ไม่ได้ → ข้าม
                    }
                }

                if (existing.docs.length > 0) {
                    // product_code ซ้ำ → ทับข้อมูลเดิมทั้งหมด
                    const updated = await payload.update({
                        collection: 'program-tours',
                        id: existing.docs[0].id,
                        data: productData,
                    })
                    results.push({
                        action: 'updated',
                        id: updated.id,
                        productCode: product.product_code,
                        productName: product.product_name,
                    })
                } else {
                    // สร้างใหม่
                    const created = await payload.create({
                        collection: 'program-tours',
                        data: productData,
                    })
                    results.push({
                        action: 'created',
                        id: created.id,
                        productCode: product.product_code,
                        productName: product.product_name,
                    })
                }
            } catch (err: any) {
                console.error(`[sync-program-tours] Error saving ${product.product_code}:`, err.message)
                errors.push({
                    productCode: product.product_code,
                    productName: product.product_name,
                    error: err.message,
                })
            }
        }

        const created = results.filter(r => r.action === 'created').length
        const updated = results.filter(r => r.action === 'updated').length

        // 4. Sync Airlines จาก filters
        let airlinesCreated = 0
        let airlinesUpdated = 0
        if (apiFilters?.airlines && Array.isArray(apiFilters.airlines)) {
            for (const airline of apiFilters.airlines) {
                const code = (airline.airlinecode || '').trim()
                if (!code) continue

                try {
                    const existing = await payload.find({
                        collection: 'airlines',
                        where: { airlineCode: { equals: code } },
                        limit: 1,
                    })
                    if (existing.docs.length > 0) {
                        // มีอยู่แล้ว → update ทับ
                        await payload.update({
                            collection: 'airlines',
                            id: existing.docs[0].id,
                            data: {
                                airlineName: (airline.airline_name || '').trim(),
                                urlAirlinePicIcon: (airline.url_airline_pic_icon || '').trim(),
                            },
                        })
                        airlinesUpdated++
                    } else {
                        // ไม่มี → สร้างใหม่
                        await payload.create({
                            collection: 'airlines',
                            data: {
                                airlineCode: code,
                                airlineName: (airline.airline_name || '').trim(),
                                urlAirlinePicIcon: (airline.url_airline_pic_icon || '').trim(),
                                isActive: true,
                            },
                        })
                        airlinesCreated++
                    }
                } catch (e: any) {
                    console.warn(`[sync] Airline "${code}" error:`, e.message)
                }
            }
        }

        // 5. Sync Festivals จาก filters.agentholiday
        let festivalsCreated = 0
        let festivalsUpdated = 0
        if (apiFilters?.agentholiday && Array.isArray(apiFilters.agentholiday)) {
            for (const holiday of apiFilters.agentholiday) {
                const slug = (holiday.slugholiday || '').trim()
                if (!slug) continue

                try {
                    const existing = await payload.find({
                        collection: 'festivals',
                        where: { slugHoliday: { equals: slug } },
                        limit: 1,
                    })
                    if (existing.docs.length > 0) {
                        // มีอยู่แล้ว → update ทับ
                        await payload.update({
                            collection: 'festivals',
                            id: existing.docs[0].id,
                            data: {
                                nameHoliday: (holiday.nameholiday || '').trim(),
                                startDate: holiday.startDate || null,
                                link: `/search-tour?festivals=${slug}`,
                            },
                        })
                        festivalsUpdated++
                    } else {
                        // ไม่มี → สร้างใหม่
                        await payload.create({
                            collection: 'festivals',
                            data: {
                                slugHoliday: slug,
                                nameHoliday: (holiday.nameholiday || '').trim(),
                                startDate: holiday.startDate || null,
                                link: `/search-tour?festivals=${slug}`,
                            },
                        })
                        festivalsCreated++
                    }
                } catch (e: any) {
                    console.warn(`[sync] Festival "${slug}" error:`, e.message)
                }
            }
        }

        // 6. Sync Festival → Product mapping
        // เรียก API ด้วย filter_holiday=<slug> เพื่อดึง product_code ที่ตรงกับแต่ละเทศกาล
        // แล้วบันทึก festivals array ลง ProgramTour แต่ละตัว
        let festivalMappingCount = 0
        const productFestivalMap = new Map<string, string[]>() // productCode → [slugHoliday...]

        if (apiFilters?.agentholiday && Array.isArray(apiFilters.agentholiday)) {
            for (const holiday of apiFilters.agentholiday) {
                const slug = (holiday.slugholiday || '').trim()
                if (!slug) continue

                try {
                    // ดึง product ทั้งหมดที่ตรงกับเทศกาลนี้ (อาจหลายหน้า)
                    let festivalProducts: string[] = []
                    let festPage = 1
                    let festHasMore = true

                    while (festHasMore) {
                        const festUrl = new URL(apiSetting.apiEndPoint)
                        festUrl.searchParams.set('apikey', apiSetting.apiKey)
                        festUrl.searchParams.set('mode', 'searchresultsproduct')
                        festUrl.searchParams.set('lang', 'th')
                        festUrl.searchParams.set('pagesize', '200')
                        festUrl.searchParams.set('pagenumber', String(festPage))
                        festUrl.searchParams.set('filter_holiday', slug)

                        const festRes = await fetch(festUrl.toString())
                        if (!festRes.ok) break

                        const festJson = await festRes.json()
                        const products = festJson.data?.products || []

                        for (const p of products) {
                            if (p.product_code) {
                                festivalProducts.push(p.product_code)
                            }
                        }

                        const totalResults = festJson.data?.results || 0
                        if (festPage * 200 >= totalResults || products.length === 0) {
                            festHasMore = false
                        } else {
                            festPage++
                        }
                    }

                    console.log(`[sync] Festival "${slug}" → ${festivalProducts.length} products`)

                    // สร้าง map: productCode → festivals[]
                    for (const code of festivalProducts) {
                        if (!productFestivalMap.has(code)) {
                            productFestivalMap.set(code, [])
                        }
                        productFestivalMap.get(code)!.push(slug)
                    }
                } catch (e: any) {
                    console.warn(`[sync] Festival mapping "${slug}" error:`, e.message)
                }
            }

            // อัปเดต ProgramTour.festivals
            for (const [productCode, festivalSlugs] of productFestivalMap) {
                try {
                    const existing = await payload.find({
                        collection: 'program-tours',
                        where: { productCode: { equals: productCode } },
                        limit: 1,
                        depth: 0,
                    })
                    if (existing.docs.length > 0) {
                        await payload.update({
                            collection: 'program-tours',
                            id: existing.docs[0].id,
                            data: { festivals: festivalSlugs } as any,
                        })
                        festivalMappingCount++
                    }
                } catch (e: any) {
                    console.warn(`[sync] Festival update "${productCode}" error:`, e.message)
                }
            }
        }
        // 8. Tally intertours & inbound-tours count directly
        console.log('[sync] Updating intertours tour counts...')
        let countsUpdated = 0
        try {
            const inters = await payload.find({ collection: 'intertours', limit: 3000, depth: 0, context: { skipCount: true } })
            for (const t of inters.docs) {
                if (!t.slug) continue
                const isCity = !!t.parentCountry
                const countCond: any = isCity ? { citySlug: { equals: t.slug } } : { countrySlug: { equals: t.slug } }
                const countRes = await payload.count({ collection: 'program-tours', where: countCond })
                if (t.tourCount !== countRes.totalDocs) {
                    await payload.update({
                        collection: 'intertours',
                        id: t.id,
                        data: { tourCount: countRes.totalDocs },
                        context: { skipAutoTagHook: true, skipCount: true },
                    })
                    countsUpdated++
                }
            }
            console.log(`[sync] Updated ${countsUpdated} intertour counts`)

            console.log('[sync] Updating inbound-tours tour counts...')
            let inboundCountsUpdated = 0
            const inbounds = await payload.find({ collection: 'inbound-tours', limit: 3000, depth: 0, context: { skipCount: true } })
            for (const t of inbounds.docs) {
                if (!t.slug) continue
                const isCity = !!t.parentCountry
                const countCond: any = isCity ? { citySlug: { equals: t.slug } } : { countrySlug: { equals: t.slug } }
                const countRes = await payload.count({ collection: 'program-tours', where: countCond })
                if (t.tourCount !== countRes.totalDocs) {
                    await payload.update({
                        collection: 'inbound-tours',
                        id: t.id,
                        data: { tourCount: countRes.totalDocs },
                        context: { skipAutoTagHook: true, skipCount: true },
                    })
                    inboundCountsUpdated++
                }
            }
            console.log(`[sync] Updated ${inboundCountsUpdated} inbound-tour counts`)

            console.log('[sync] Updating airlines tour counts...')
            let airlinesCountsUpdated = 0
            const allAirlines = await payload.find({ collection: 'airlines', limit: 3000, depth: 0, context: { skipCount: true } })
            for (const a of allAirlines.docs) {
                if (!a.airlineCode) continue
                const countRes = await payload.count({ collection: 'program-tours', where: { airlineCode: { equals: a.airlineCode } } })
                if (a.countProduct !== countRes.totalDocs) {
                    await payload.update({
                        collection: 'airlines',
                        id: a.id,
                        data: { countProduct: countRes.totalDocs },
                        context: { skipAutoTagHook: true, skipCount: true },
                    })
                    airlinesCountsUpdated++
                }
            }
            console.log(`[sync] Updated ${airlinesCountsUpdated} airline counts`)

            console.log('[sync] Updating festivals tour counts...')
            let festivalsCountsUpdated = 0
            const allFestivals = await payload.find({ collection: 'festivals', limit: 3000, depth: 0, context: { skipCount: true } })
            for (const f of allFestivals.docs) {
                if (!f.slugHoliday) continue
                const countRes = await payload.count({ collection: 'program-tours', where: { festivals: { contains: f.slugHoliday } } })
                if (f.countProduct !== countRes.totalDocs) {
                    await payload.update({
                        collection: 'festivals',
                        id: f.id,
                        data: { countProduct: countRes.totalDocs },
                        context: { skipAutoTagHook: true, skipCount: true },
                    })
                    festivalsCountsUpdated++
                }
            }
            console.log(`[sync] Updated ${festivalsCountsUpdated} festival counts`)
        } catch (e: any) {
            console.warn('[sync] Updating tour counts failed:', e.message)
        }

        return NextResponse.json({
            success: true,
            message: `Sync สำเร็จ! สร้างใหม่ ${created} | อัปเดต ${updated} | ข้อผิดพลาด ${errors.length} (รวม ${allProducts.length} products) | สายการบิน: สร้าง ${airlinesCreated} อัปเดต ${airlinesUpdated} | เทศกาล: สร้าง ${festivalsCreated} อัปเดต ${festivalsUpdated} | Festival mapping: ${festivalMappingCount} products`,
            totalFromApi: allProducts.length,
            totalPages: currentPage,
            summary: { created, updated, errors: errors.length, airlinesCreated, airlinesUpdated, festivalsCreated, festivalsUpdated, festivalMappingCount },
            results,
            errors,
        })
    } catch (error: any) {
        console.error('[sync-program-tours] Error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 },
        )
    }
}

/**
 * แปลงข้อมูล product จาก API → Payload field format
 */
function mapApiProductToPayload(product: any, continentName: string = ''): Record<string, any> {
    // Parse extended_properties2
    let ext2: any = {}
    if (typeof product.extended_properties2 === 'string') {
        try {
            ext2 = JSON.parse(product.extended_properties2)
        } catch {
            ext2 = {}
        }
    } else if (product.extended_properties2 && typeof product.extended_properties2 === 'object') {
        ext2 = product.extended_properties2
    }

    return {
        productId: product.product_id,
        productCode: product.product_code || '',
        productName: product.product_name || '',
        productSlug: product.product_slug || '',
        isCanConfirm: product.is_can_confirm || false,
        titlePackage: product.title_package || '',
        starRating: product.star_rating || 0,
        starHotel: product.star_hotel || 0,
        urlPic: product.url_pic || '',
        urlPicMultisize: {
            tourdetail: product.url_pic_multisize?.tourdetail || '',
            itemslide: product.url_pic_multisize?.itemslide || '',
            tourlist: product.url_pic_multisize?.tourlist || '',
        },
        highlight: product.highlight || '',
        destination: product.destination || '',
        food: product.food || '',
        stayDay: product.stay_day || 0,
        stayNight: product.stay_night || 0,
        airlineCode: product.airlinecode || '',
        airlineName: product.airline_name || '',
        urlAirlinePic: product.url_airline_pic || '',
        priceProduct: product.price_product || 0,
        priceAmountCallDiscount: product.price_amount_call_discount || 0,
        productDiscountDisplay: product.product_discount_display || 0,
        productPriceBeforeDiscount: product.product_price_before_discount || 0,
        discountPercent: product.discountpercent || '',
        continent: continentName,
        countryName: `ทัวร์${product.country_name || ''}`,
        countrySlug: product.country_slug || '',
        cityName: product.city_name ? `ทัวร์${product.city_name}` : '',
        citySlug: product.city_slug || '',
        urlPdf: product.url_brochure || product.url_pdf || '',
        urlWord: product.url_word || '',
        urlBanner: product.url_banner || '',
        soldout: product.soldout || 'false',
        periodStart: product.period_start || '',
        extendedProperties2: {
            visa: ext2.visa || '',
            visaText: ext2.visaText || '',
            urlVdo: ext2.url_vdo || '',
            freeText: ext2.free_text || '',
            freeDay: ext2.free_day || '',
        },
        lastSyncedAt: new Date().toISOString(),
        // Periods array
        periods: (product.periods || []).map((p: any) => ({
            periodId: p.period_id || 0,
            periodStart: p.period_start || '',
            periodEnd: p.period_end || '',
            periodStartValue: p.period_start_value || '',
            periodEndValue: p.period_end_value || '',
            price: p.price || 0,
            priceAdultsDouble: p.price_adults_double || 0,
            priceAdultsSingle: p.price_adults_single || 0,
            priceAdultsTriple: p.price_adults_triple || 0,
            priceChildWithbed: p.price_child_withbed || 0,
            priceChildNobed: p.price_child_nobed || 0,
            priceJoinland: p.price_joinland || 0,
            numberSeats: p.number_seats || 0,
            groupsize: p.groupsize || 0,
            seatremain: p.seatremain || 0,
            periodSoldout: p.period_soldout || 'false',
            discountDisplay: p.discount_display || 0,
            priceBeforeDiscount: p.price_before_discount || 0,
            periodAirlineCode: p.airlinecode || '',
            urlAirlinePicIcon: p.url_airline_pic_icon || '',
            deposit: p.deposit || 0,
            depositDate: p.deposit_date || '',
            numberDeposit: p.number_deposit || 0,
        })),
    }
}
