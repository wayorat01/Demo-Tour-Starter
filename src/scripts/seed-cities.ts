import configPromise from '@payload-config'
import { getPayload } from 'payload'

// Mock city data per country slug
const MOCK_CITIES: Record<string, string[]> = {
  // Asia
  japan: ['โตเกียว', 'โอซาก้า', 'ฟุกุโอกะ', 'ซัปโปโร', 'เกียวโต', 'นาโกย่า'],
  korea: ['โซล', 'ปูซาน', 'เชจู', 'อินชอน'],
  china: ['ปักกิ่ง', 'เซี่ยงไฮ้', 'กว่างโจว', 'เฉิงตู', 'คุนหมิง'],
  taiwan: ['ไทเป', 'เกาสง', 'ไถจง', 'ฮัวเหลียน'],
  hongkong: ['ฮ่องกง', 'มาเก๊า'],
  vietnam: ['ฮานอย', 'โฮจิมินห์', 'ดานัง', 'ซาปา'],
  singapore: ['สิงคโปร์'],
  malaysia: ['กัวลาลัมเปอร์', 'ปีนัง', 'ลังกาวี'],
  indonesia: ['บาหลี', 'จาการ์ตา', 'ยอกยาการ์ตา'],
  india: ['เดลี', 'มุมไบ', 'ชัยปุระ', 'อักรา'],
  myanmar: ['ย่างกุ้ง', 'มัณฑะเลย์', 'พุกาม'],
  laos: ['เวียงจันทน์', 'หลวงพระบาง', 'วังเวียง'],
  cambodia: ['พนมเปญ', 'เสียมเรียบ'],
  bhutan: ['ทิมพู', 'พาโร'],
  nepal: ['กาฐมาณฑุ', 'โปขรา'],
  srilanka: ['โคลัมโบ', 'แคนดี้', 'กอลล์'],
  maldives: ['มาเล่'],

  // Europe
  france: ['ปารีส', 'นีซ', 'มาร์แซย์', 'ลียง'],
  italy: ['โรม', 'มิลาน', 'เวนิส', 'ฟลอเรนซ์'],
  germany: ['เบอร์ลิน', 'มิวนิก', 'แฟรงก์เฟิร์ต'],
  switzerland: ['ซูริค', 'เจนีวา', 'ลูเซิร์น', 'อินเทอร์ลาเค่น'],
  uk: ['ลอนดอน', 'แมนเชสเตอร์', 'เอดินบะระ'],
  england: ['ลอนดอน', 'แมนเชสเตอร์', 'เอดินบะระ'],
  spain: ['มาดริด', 'บาร์เซโลนา', 'เซบีย่า'],
  turkey: ['อิสตันบูล', 'คัปปาโดเกีย', 'อังการา'],
  iceland: ['เรคยาวิก'],
  russia: ['มอสโก', 'เซนต์ปีเตอร์สเบิร์ก'],
  czech: ['ปราก', 'เชสกี้ ครุมลอฟ'],
  austria: ['เวียนนา', 'ซาลซ์บูร์ก'],
  netherlands: ['อัมสเตอร์ดัม', 'รอตเตอร์ดัม'],
  scandinavia: ['โคเปนเฮเกน', 'สตอกโฮล์ม', 'ออสโล', 'เฮลซิงกิ'],
  greece: ['เอเธนส์', 'ซานโตรินี่', 'มิโคนอส'],
  portugal: ['ลิสบอน', 'ปอร์โต้'],
  croatia: ['ซาเกร็บ', 'ดูบรอฟนิก', 'สปลิต'],

  // Americas
  usa: ['นิวยอร์ก', 'ลอสแอนเจลิส', 'ซานฟรานซิสโก', 'ลาสเวกัส'],
  canada: ['แวนคูเวอร์', 'โตรอนโต', 'มอนทรีออล'],
  brazil: ['ริโอเดจาเนโร', 'เซาเปาโล'],
  argentina: ['บัวโนสไอเรส'],
  peru: ['ลิมา', 'คุสโก', 'มาชูปิกชู'],

  // Africa & Middle East
  egypt: ['ไคโร', 'ลักซอร์', 'อเล็กซานเดรีย'],
  southafrica: ['เคปทาวน์', 'โจฮันเนสเบิร์ก'],
  dubai: ['ดูไบ', 'อาบูดาบี'],
  uae: ['ดูไบ', 'อาบูดาบี'],
  jordan: ['อัมมาน', 'เพตรา'],
  israel: ['เยรูซาเล็ม', 'เทลอาวีฟ'],

  // Oceania
  australia: ['ซิดนีย์', 'เมลเบิร์น', 'บริสเบน'],
  newzealand: ['โอ๊คแลนด์', 'ควีนส์ทาวน์', 'ไคร์สต์เชิร์ช'],
}

async function seedCities() {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'intertours',
    limit: 0,
  })

  let updated = 0
  let skipped = 0

  for (const tour of result.docs) {
    const slug = (tour as any).slug || ''
    const slugLower = slug.toLowerCase().replace(/-/g, '')

    // Find matching cities
    let cityNames: string[] | undefined
    for (const [key, value] of Object.entries(MOCK_CITIES)) {
      if (slugLower.includes(key) || key.includes(slugLower)) {
        cityNames = value
        break
      }
    }

    if (!cityNames || cityNames.length === 0) {
      console.log(`⏭️  ${(tour as any).title} (${slug}) — no mock cities found`)
      skipped++
      continue
    }

    // Check if cities already exist
    const existingCities = (tour as any).cities || []
    if (existingCities.length > 0) {
      console.log(
        `✅ ${(tour as any).title} (${slug}) — already has ${existingCities.length} cities`,
      )
      skipped++
      continue
    }

    await payload.update({
      collection: 'intertours',
      id: tour.id,
      data: {
        cities: cityNames.map((c) => ({ cityName: c })),
      } as any,
      context: { skipAutoTagHook: true },
    })

    console.log(`🏙️  ${(tour as any).title} (${slug}) → ${cityNames.join(', ')}`)
    updated++
  }

  console.log(`\n✅ Done! Updated: ${updated}, Skipped: ${skipped}`)
  process.exit(0)
}

seedCities().catch((err) => {
  console.error('❌ Error seeding cities:', err)
  process.exit(1)
})
