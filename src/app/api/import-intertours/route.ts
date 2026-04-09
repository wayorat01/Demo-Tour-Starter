import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import Papa from 'papaparse'

import { requireAdmin } from '@/utilities/apiAuthGuard'

export async function POST(request: Request) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const mappingStr = formData.get('mapping') as string | null
    const mode = (formData.get('mode') as string) || 'import'
    const skipSlugsStr = formData.get('skipSlugs') as string | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No CSV file provided' }, { status: 400 })
    }

    const mapping: Record<string, string> = mappingStr ? JSON.parse(mappingStr) : {}
    const skipSlugsList: string[] = skipSlugsStr ? JSON.parse(skipSlugsStr) : []

    const csvText = await file.text()
    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    })

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'CSV parse errors',
          details: parsed.errors.slice(0, 5),
        },
        { status: 400 },
      )
    }

    const rows = parsed.data
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'CSV file is empty' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // ============================================
    // Step 1: Collect Categories (whether from 'category' field or defaults)
    // ============================================
    const categoryMap: Record<string, string> = {}
    const uniqueCategories = new Map<string, { title: string; slug: string }>()

    for (const row of rows) {
      let catNameTH = ''
      let catSlugFromCsv = ''

      // Check if user mapped columns to 'category' and 'category_slug'
      for (const csvCol of Object.keys(row)) {
        if (mapping[csvCol] === 'category') {
          catNameTH = row[csvCol]?.trim() || ''
        }
        if (mapping[csvCol] === 'category_slug') {
          catSlugFromCsv = (row[csvCol]?.trim() || '').toLowerCase()
        }
      }

      if (catNameTH) {
        // Ensure it has "ทัวร์" prefix
        if (!catNameTH.startsWith('ทัวร์')) {
          catNameTH = 'ทัวร์' + catNameTH
        }
        // ใช้ slug จาก CSV ถ้ามี, ไม่งั้น generate จากชื่อไทย
        const catSlug = (
          catSlugFromCsv || catNameTH.toLowerCase().replace(/\s+/g, '-')
        ).toLowerCase()
        uniqueCategories.set(catSlug, { title: catNameTH, slug: catSlug })
      }
    }

    let categoriesCreated = 0
    let categoriesExisting = 0

    // We only create categories if mode === 'import'.
    // For preview, we just fetch them or assume they'll be created.
    if (mode === 'import') {
      let categoryOrder = 1
      for (const [catSlug, catInfo] of uniqueCategories) {
        const existing = await payload.find({
          collection: 'tour-categories',
          where: { slug: { equals: catSlug } },
          limit: 1,
        })

        if (existing.docs.length > 0) {
          // ชื่อ Category ซ้ำ → อัปเดตทับ
          await payload.update({
            collection: 'tour-categories',
            id: existing.docs[0].id,
            data: {
              title: catInfo.title,
              slug: catInfo.slug,
              order: categoryOrder,
            },
          })
          categoryMap[catSlug] = existing.docs[0].id as string
          categoriesExisting++
        } else {
          const created = await payload.create({
            collection: 'tour-categories',
            data: {
              title: catInfo.title,
              slug: catInfo.slug,
              order: categoryOrder,
            },
          })
          categoryMap[catSlug] = created.id as string
          categoriesCreated++
        }
        categoryOrder++
      }

      // Fallback category if none was parsed from CSV or successfully mapped
      if (Object.keys(categoryMap).length === 0) {
        const defaultCats = await payload.find({
          collection: 'tour-categories',
          limit: 1,
        })
        if (defaultCats.docs.length > 0) {
          categoryMap['default_fallback'] = defaultCats.docs[0].id as string
        } else {
          const created = await payload.create({
            collection: 'tour-categories',
            data: {
              title: 'ทัวร์อื่นๆ',
              slug: 'others',
              order: 99,
            },
          })
          categoryMap['default_fallback'] = created.id as string
          categoriesCreated++
        }
      }
    }

    // ============================================
    // Step 2: Create / Update InterTour posts
    // ============================================
    let postsProcessed = 0
    let postsSkipped = 0
    const skippedSlugs: string[] = []
    const processedPosts: string[] = []

    const duplicates: any[] = []
    const newItems: any[] = []

    for (const row of rows) {
      const payloadData: Record<string, any> = {}
      let docSlug = ''

      for (const csvCol of Object.keys(row)) {
        const payloadField = mapping[csvCol]
        if (!payloadField) continue

        let val: any = row[csvCol]?.trim()

        if (payloadField === 'isActive') {
          val = val.toLowerCase() === 'true' || val === '1'
        }

        if (payloadField === 'slug') {
          // Try to generate slug if missing
          docSlug = val
        }

        if (payloadField === 'title') {
          if (val && !val.startsWith('ทัวร์')) val = 'ทัวร์' + val
        }

        if (payloadField === 'category') {
          if (val && !val.startsWith('ทัวร์')) val = 'ทัวร์' + val
        }

        if (payloadField === 'description' || payloadField === 'description_en') {
          val = {
            root: {
              type: 'root',
              format: '',
              indent: 0,
              version: 1,
              children: [
                {
                  type: 'paragraph',
                  format: '',
                  indent: 0,
                  version: 1,
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: 'normal',
                      style: '',
                      text: val,
                      type: 'text',
                      version: 1,
                    },
                  ],
                },
              ],
              direction: 'ltr',
            },
          }
        }

        payloadData[payloadField] = val
      }

      // Fallback Slug Generation
      if (!docSlug) {
        // If slug is missing but we mapped title, generate one
        if (payloadData.title_en) {
          docSlug = payloadData.title_en.toLowerCase().replace(/\s+/g, '-')
        } else if (payloadData.title) {
          // generate random slug hash or text
          docSlug = `import-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        }
      }
      payloadData.slug = docSlug

      if (!payloadData.title) {
        postsSkipped++
        skippedSlugs.push(`Missing Title (row data: ${JSON.stringify(row)})`)
        continue
      }

      // Category assignment for import mode
      if (mode === 'import') {
        if (payloadData.category) {
          // ใช้ category_slug จาก CSV ถ้ามี, ไม่งั้น generate จากชื่อไทย
          const catSlug = (
            payloadData.category_slug || payloadData.category.toLowerCase().replace(/\s+/g, '-')
          ).toLowerCase()
          if (categoryMap[catSlug]) {
            payloadData.category = categoryMap[catSlug]
          } else if (categoryMap['default_fallback']) {
            payloadData.category = categoryMap['default_fallback']
          } else {
            // ไม่เจอใน categoryMap → ลบออกเพื่อป้องกัน MongoDB ObjectId error
            delete payloadData.category
          }
        } else {
          const fb = Object.keys(categoryMap)[0]
          if (fb) payloadData.category = categoryMap[fb]
        }
        // ลบ category_slug ออกจาก payloadData (ไม่ใช่ฟิลด์จริงใน collection)
        delete payloadData.category_slug

        // parentCountry lookup: หาประเทศหลักจาก InterTours
        if (payloadData.parentCountry) {
          let parentNameTH = payloadData.parentCountry.trim()
          if (!parentNameTH.startsWith('ทัวร์')) {
            parentNameTH = 'ทัวร์' + parentNameTH
          }
          const parentNameEN = (payloadData.parentCountry_en || '').trim().toLowerCase()

          const parentDoc = await payload.find({
            collection: 'intertours',
            where: { title: { equals: parentNameTH } },
            limit: 1,
          })
          if (parentDoc.docs.length > 0) {
            payloadData.parentCountry = parentDoc.docs[0].id
            // ใช้ category ของประเทศหลักเสมอ (เมืองต้องอยู่ทวีปเดียวกับประเทศ)
            const parentCategory = (parentDoc.docs[0] as any).category
            if (parentCategory) {
              payloadData.category = parentCategory
            }
          } else if (parentNameEN) {
            // ไม่เจอ → สร้างประเทศหลักใหม่อัตโนมัติ
            const parentSlug = parentNameEN.replace(/\s+/g, '-')
            const createData: any = {
              title: parentNameTH,
              title_en: parentNameEN,
              slug: parentSlug,
              isActive: true,
              tourCount: 0,
            }
            // ใส่ category ถ้ามี
            if (payloadData.category) {
              createData.category = payloadData.category
            } else {
              const fb = Object.keys(categoryMap)[0]
              if (fb) createData.category = categoryMap[fb]
            }
            try {
              const newParent = await payload.create({
                collection: 'intertours',
                data: createData,
              })
              payloadData.parentCountry = newParent.id
              // ใช้ category ของประเทศที่สร้างใหม่
              const newParentCategory = (newParent as any).category
              if (newParentCategory) {
                payloadData.category = newParentCategory
              }
            } catch (e: any) {
              console.warn(`[import] Could not create parent "${parentNameTH}":`, e.message)
              delete payloadData.parentCountry
            }
          } else {
            // ไม่เจอและไม่มี EN → ลบออก
            delete payloadData.parentCountry
          }
        }
        // ลบ parentCountry_en ออกจาก payloadData (ไม่ใช่ฟิลด์จริงใน collection)
        delete payloadData.parentCountry_en

        const order = parseInt((row['RowIDCountry'] || '').trim())
        if (!isNaN(order)) {
          payloadData.order = order
        }
      }

      // Check if slug already exists
      const existingPost = await payload.find({
        collection: 'intertours',
        where: { slug: { equals: payloadData.slug } },
        limit: 1,
      })

      const hasExisting = existingPost.docs.length > 0

      if (mode === 'preview') {
        if (hasExisting) {
          duplicates.push({
            slug: payloadData.slug,
            title: payloadData.title,
            newData: payloadData,
            oldData: existingPost.docs[0],
          })
        } else {
          newItems.push({
            slug: payloadData.slug,
            title: payloadData.title,
            newData: payloadData,
          })
        }
        continue
      }

      // ======= IMPORT MODE =======
      if (skipSlugsList.includes(payloadData.slug)) {
        postsSkipped++
        skippedSlugs.push(`Skipped strictly by user: ${payloadData.slug}`)
        continue
      }

      if (hasExisting) {
        // UPDATE
        await payload.update({
          collection: 'intertours',
          id: existingPost.docs[0].id,
          data: payloadData,
        })
        postsProcessed++
        processedPosts.push(`Updated: ${payloadData.title} (${payloadData.slug})`)
      } else {
        // CREATE
        try {
          await payload.create({
            collection: 'intertours',
            data: {
              ...payloadData,
              tourCount: 0,
            } as any,
          })
          postsProcessed++
          processedPosts.push(`Created: ${payloadData.title} (${payloadData.slug})`)
        } catch (e: any) {
          postsSkipped++
          skippedSlugs.push(`Error creating ${payloadData.slug}: ${e.message}`)
        }
      }
    }

    if (mode === 'preview') {
      return NextResponse.json({
        success: true,
        duplicates,
        newItems,
        summary: { totalRows: rows.length },
      })
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalRows: rows.length,
        categoriesCreated,
        categoriesExisting,
        postsProcessed,
        postsSkipped,
      },
      processedPosts,
      skippedSlugs,
    })
  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
