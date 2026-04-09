import { NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * Auto-match media files to intertours thumbnail field
 * Only processes parent countries (no parentCountry)
 * GET /api/fix-intertour-thumbnails
 */
export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })

    // Get ALL intertours (paginate properly)
    let allIntertours: any[] = []
    let page = 1
    while (true) {
      const result = await payload.find({
        collection: 'intertours',
        limit: 100,
        page,
        depth: 0,
      })
      allIntertours = allIntertours.concat(result.docs)
      if (!result.hasNextPage) break
      page++
    }

    // Get all media files
    let allMedia: any[] = []
    page = 1
    while (true) {
      const result = await payload.find({
        collection: 'media',
        limit: 100,
        page,
        depth: 0,
      })
      allMedia = allMedia.concat(result.docs)
      if (!result.hasNextPage) break
      page++
    }

    const results: string[] = []
    let updated = 0

    // Build a reverse lookup: normalized keyword → media doc
    // Files like "Japan-ญี่ปุ่น.webp", "Korea-เกาหลี.webp"
    const mediaByKeyword = new Map<string, any>()
    for (const media of allMedia) {
      const fn = media.filename || ''
      // Only consider image files (not logos, banners etc.)
      if (!/\.(webp|jpg|jpeg|png)$/i.test(fn)) continue
      if (/logo|banner|footer|dashboard|qr|svg/i.test(fn)) continue

      // Extract keywords from filename
      const baseName = fn.replace(/\.\w+$/, '') // remove extension
      const parts = baseName.split(/[-_\s]+/)
      for (const part of parts) {
        if (part.length >= 2) {
          mediaByKeyword.set(part.toLowerCase(), media)
          mediaByKeyword.set(part, media) // keep original case for Thai
        }
      }
    }

    for (const tour of allIntertours) {
      // Skip if already has thumbnail
      if (tour.thumbnail) {
        continue
      }

      const title = typeof tour.title === 'string' ? tour.title : ''
      const slug = tour.slug || ''

      // Clean title: remove "ทัวร์" prefix
      const cleanTitle = title.replace(/^ทัวร์/, '').trim()

      // Try matching strategies in order:
      let matchedMedia: any = null

      // 1. Try slug (e.g., "japan", "korea")
      if (slug) {
        matchedMedia = mediaByKeyword.get(slug.toLowerCase())
      }

      // 2. Try clean Thai title (e.g., "ญี่ปุ่น", "เกาหลี")
      if (!matchedMedia && cleanTitle) {
        matchedMedia = mediaByKeyword.get(cleanTitle)
      }

      // 3. Try explicit mapping
      if (!matchedMedia) {
        const titleSlugMap: Record<string, string[]> = {
          ญี่ปุ่น: ['japan', 'Japan'],
          เกาหลี: ['korea', 'Korea'],
          อเมริกา: ['America', 'america'],
          สหรัฐอเมริกา: ['America', 'america'],
          เวียดนาม: ['Vietnam', 'vietnam'],
          นิวซีแลนด์: ['Zeland', 'zealand', 'New'],
          จีน: ['China', 'china'],
          ออสเตรเลีย: ['Australia', 'australia'],
          อิตาลี: ['Italy', 'italy'],
          ฝรั่งเศส: ['France', 'france'],
          อังกฤษ: ['England', 'england'],
          เยอรมนี: ['Germany', 'germany'],
          กรีซ: ['Greece', 'greece'],
          ตุรกี: ['Turkey', 'turkey'],
          รัสเซีย: ['Russia', 'russia'],
          นอร์เวย์: ['Norway', 'norway'],
          ฮ่องกง: ['Hong'],
          พม่า: ['Myanmar', 'myanmar'],
          ลาว: ['Laos', 'laos'],
          ภูฏาน: ['Bhutan', 'bhutan'],
          แคนาดา: ['Canada', 'canada'],
          จอร์เจีย: ['Georgia', 'georgia'],
          สวิตเซอร์แลนด์: ['Switzerland', 'switzerland'],
          สเปน: ['Spain', 'spain'],
          สวีเดน: ['Sweden', 'sweden'],
          จอร์แดน: ['Jordan', 'jordan'],
          อิหร่าน: ['Iran', 'iran'],
          ดูไบ: ['Dubai', 'dubai'],
          นิวยอร์ก: ['Newyork', 'newyork'],
        }

        for (const [thaiName, keywords] of Object.entries(titleSlugMap)) {
          if (cleanTitle.includes(thaiName) || cleanTitle === thaiName) {
            for (const kw of keywords) {
              const found = mediaByKeyword.get(kw) || mediaByKeyword.get(kw.toLowerCase())
              if (found) {
                matchedMedia = found
                break
              }
            }
            if (matchedMedia) break
          }
        }
      }

      if (matchedMedia) {
        await payload.update({
          collection: 'intertours',
          id: tour.id,
          data: { thumbnail: matchedMedia.id } as any,
        })
        results.push(`${title} → matched: ${matchedMedia.filename} ✅`)
        updated++
      } else {
        // Only report unmatched for parent countries (no parentCountry)
        if (!tour.parentCountry) {
          results.push(`${title} [COUNTRY] → no matching media ❌`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      total: allIntertours.length,
      totalWithoutThumb: allIntertours.filter((t: any) => !t.thumbnail).length,
      results,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
