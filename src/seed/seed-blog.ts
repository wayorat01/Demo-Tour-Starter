'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import path from 'path'
import fs from 'fs'

// ─── Image URLs (Unsplash - free to use) ───
const BLOG_IMAGES = [
  {
    name: 'blog-beach.jpg',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
  },
  {
    name: 'blog-mountain.jpg',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
  },
  {
    name: 'blog-food.jpg',
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80',
  },
  {
    name: 'blog-cafe.jpg',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80',
  },
  {
    name: 'blog-temple.jpg',
    url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200&q=80',
  },
  {
    name: 'blog-city.jpg',
    url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=80',
  },
  {
    name: 'blog-nature.jpg',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
  },
  {
    name: 'blog-market.jpg',
    url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200&q=80',
  },
]

// ─── Tags ───
const TAGS_DATA = [
  'ท่องเที่ยว',
  'เที่ยวทะเล',
  'เที่ยวภูเขา',
  'เที่ยวเมือง',
  'อาหาร',
  'คาเฟ่',
  'ไลฟ์สไตล์',
  'ธรรมชาติ',
  'วัฒนธรรม',
  'เคล็ดลับ',
  'รีวิว',
  'ที่พัก',
]

// ─── Categories ───
const CATEGORIES_DATA = [
  'ท่องเที่ยวในประเทศ',
  'ท่องเที่ยวต่างประเทศ',
  'อาหารและเครื่องดื่ม',
  'ไลฟ์สไตล์',
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9ก-๏\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// ─── Rich Content Builder ───
function buildRichContent(sections: { heading?: string; paragraphs: string[] }[]) {
  const children: any[] = []
  for (const section of sections) {
    if (section.heading) {
      children.push({
        type: 'heading',
        tag: 'h2',
        version: 1,
        children: [{ type: 'text', text: section.heading, version: 1 }],
      })
    }
    for (const p of section.paragraphs) {
      children.push({
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', text: p, version: 1 }],
      })
    }
  }
  return { root: { type: 'root', children, direction: 'ltr', format: '', indent: 0, version: 1 } }
}

// ─── Posts Data ───
const POSTS_DATA = [
  {
    title: '10 จุดถ่ายรูปสุดปังที่เกาะสมุย ต้องไปให้ครบ!',
    slug: '10-photo-spots-koh-samui',
    excerpt: 'รวม 10 จุดถ่ายรูปสุดสวยที่เกาะสมุย ตั้งแต่หาดทรายขาว วัดบนเขา ไปจนถึงวิวพระอาทิตย์ตก',
    tags: ['ท่องเที่ยว', 'เที่ยวทะเล', 'รีวิว'],
    categories: ['ท่องเที่ยวในประเทศ'],
    imageIndex: 0,
    daysAgo: 2,
    content: [
      {
        heading: 'เกาะสมุย สวรรค์แห่งท้องทะเลอ่าวไทย',
        paragraphs: [
          'เกาะสมุยเป็นหนึ่งในจุดหมายปลายทางยอดนิยมของนักท่องเที่ยวทั้งชาวไทยและต่างชาติ ด้วยหาดทรายขาวละเอียด น้ำทะเลใสเทอร์ควอยซ์ และบรรยากาศเกาะที่ผ่อนคลาย ทำให้ที่นี่เป็นสถานที่ที่เหมาะสำหรับการพักผ่อนอย่างแท้จริง',
          'วันนี้เราจะพาไปสำรวจ 10 จุดถ่ายรูปที่สวยที่สุดบนเกาะ ที่การันตีว่าต้องได้รูปสวยกลับบ้านแน่นอน ไม่ว่าจะถ่ายด้วยกล้องมืออาชีพหรือแค่มือถือก็ออกมาปังทุกช็อต!',
        ],
      },
      {
        heading: '1. หาดเฉวง — หาดที่ยาวที่สุด',
        paragraphs: [
          'หาดเฉวงถือเป็นหาดที่มีชื่อเสียงมากที่สุดของเกาะสมุย ด้วยความยาวกว่า 7 กิโลเมตร ทอดยาวตามแนวชายฝั่งด้านตะวันออก หาดทรายขาวละเอียด น้ำทะเลใส เหมาะสำหรับการเล่นน้ำและถ่ายรูปในทุกช่วงเวลาของวัน โดยเฉพาะช่วงเช้าตรู่ที่แสงแดดยังอ่อนๆ สาดส่องผ่านผืนน้ำ สวยงามมาก',
        ],
      },
      {
        heading: '2. วัดพระใหญ่ — ไอคอนของสมุย',
        paragraphs: [
          'วัดพระใหญ่ หรือวัดพระยาย ตั้งอยู่บนเกาะเล็กๆ ที่เชื่อมต่อกับเกาะสมุยด้วยสะพาน พระพุทธรูปปางมารวิชัยสีทองอร่ามสูง 12 เมตร เป็นแลนด์มาร์คที่นักท่องเที่ยวต้องมาเช็กอิน ถ่ายรูปมุมไหนก็สวย โดยเฉพาะช่วงพระอาทิตย์ตกที่แสงสีทองฉาบลงบนองค์พระ',
        ],
      },
      {
        heading: '3. หินตา-หินยาย — มหัศจรรย์ธรรมชาติ',
        paragraphs: [
          'หินตา-หินยายเป็นกลุ่มหินธรรมชาติรูปร่างแปลกตาที่ตั้งอยู่ริมหาดละไม ถือเป็นสถานที่ท่องเที่ยวทางธรรมชาติที่น่าสนใจ นอกจากจะได้ชมความมหัศจรรย์ของธรรมชาติแล้ว เวลาที่อาทิตเก็อัมลับไป วิวทะเลรอบๆ ก็สวยงามไม่แพ้กัน',
        ],
      },
      {
        heading: 'Tips สำหรับการถ่ายรูป',
        paragraphs: [
          'แนะนำให้ไปถ่ายรูปช่วงเช้า 06:00-08:00 น. หรือช่วงเย็น 16:00-18:00 น. เพราะแสงจะสวยที่สุด หลีกเลี่ยงช่วงเที่ยงเพราะแสงจะแรงเกินไป และอย่าลืมพกครีมกันแดดไปด้วยนะ!',
        ],
      },
    ],
  },
  {
    title: 'เที่ยวเชียงใหม่หน้าหนาว: อัปเดตสถานที่เด็ดประจำปี',
    slug: 'chiang-mai-winter-guide',
    excerpt: 'เชียงใหม่หน้าหนาวมีอะไรน่าเที่ยวบ้าง? รวมสถานที่ท่องเที่ยวยอดฮิต ร้านอาหาร และที่พัก',
    tags: ['ท่องเที่ยว', 'เที่ยวภูเขา', 'เคล็ดลับ'],
    categories: ['ท่องเที่ยวในประเทศ'],
    imageIndex: 1,
    daysAgo: 5,
    content: [
      {
        heading: 'เชียงใหม่หน้าหนาว ความสุขที่ต้องสัมผัส',
        paragraphs: [
          'เชียงใหม่ในช่วงเดือนพฤศจิกายนถึงกุมภาพันธ์ ถือเป็นช่วงที่อากาศดีที่สุดของปี อุณหภูมิเฉลี่ยอยู่ที่ 15-25 องศาเชลเชียส เย็นสบายไม่ร้อนจนเกินไป ท้องฟ้าแจ่มใส เหมาะสำหรับการท่องเที่ยวอย่างยิ่ง',
          'ไม่ว่าจะเป็นการเดินเล่นในเมืองเก่า ปีนดอยสุเทพ หรือนั่งจิบกาแฟในคาเฟ่บรรยากาศดี ทุกกิจกรรมล้วนมีเสน่ห์เป็นพิเศษในหน้าหนาว',
        ],
      },
      {
        heading: 'ดอยอินทนนท์ — จุดสูงสุดของประเทศ',
        paragraphs: [
          'ดอยอินทนนท์เป็นจุดที่สูงที่สุดในประเทศไทย อยู่สูงจากระดับน้ำทะเล 2,565 เมตร ช่วงหน้าหนาวอุณหภูมิอาจลดต่ำถึง 0 องศา มีโอกาสเห็นแม่คะนิ้ง (น้ำค้างแข็ง) ได้ นอกจากนี้ยังมีน้ำตกสวยๆ เส้นทางเดินศึกษาธรรมชาติ และพระมหาธาตุนภเมทนีดลและพระมหาธาตุนภพลภูมิสิริที่สวยงาม',
        ],
      },
      {
        heading: 'ถนนคนเดิน — ช้อปปิ้งสุดมันส์',
        paragraphs: [
          'ถนนคนเดินเชียงใหม่มีทั้งวันเสาร์ (ถนนวัวลาย) และวันอาทิตย์ (ถนนท่าแพ) เต็มไปด้วยของกินอร่อยๆ ของฝาก งานแฮนด์เมด และการแสดงดนตรีพื้นเมือง บรรยากาศหน้าหนาวเดินเล่นชิลๆ ได้ทั้งคืน',
        ],
      },
    ],
  },
  {
    title: 'คาเฟ่ลับกรุงเทพ: 8 ร้านนั่งชิลที่คนยังไม่ค่อยรู้',
    slug: 'hidden-cafes-bangkok',
    excerpt: 'ค้นพบ 8 คาเฟ่ลับในกรุงเทพ ที่มีทั้งบรรยากาศดี กาแฟอร่อย และมุมถ่ายรูปสวย',
    tags: ['คาเฟ่', 'เที่ยวเมือง', 'รีวิว'],
    categories: ['อาหารและเครื่องดื่ม'],
    imageIndex: 3,
    daysAgo: 7,
    content: [
      {
        heading: 'ตามหาคาเฟ่ลับในเมืองกรุง',
        paragraphs: [
          'ในยุคที่คาเฟ่เปิดใหม่ทุกวัน การหาร้านที่ทั้งบรรยากาศดี กาแฟอร่อย และไม่แน่นจนเกินไป กลายเป็นเรื่องท้าทาย วันนี้เราคัดสรร 8 คาเฟ่ลับที่ซ่อนตัวอยู่ในซอกซอยต่างๆ ของกรุงเทพ',
        ],
      },
      {
        heading: '1. Roots Coffee — ย่านอารีย์',
        paragraphs: [
          'คาเฟ่สไตล์มินิมอลที่ซ่อนตัวอยู่ในซอยอารีย์ บรรยากาศอบอุ่นเหมือนนั่งอยู่บ้าน กาแฟคั่วเอง รสชาติเข้มข้น มีเมนูเครื่องดื่มพิเศษที่เปลี่ยนตามฤดูกาล ราคาเริ่มต้นที่ 80 บาท',
        ],
      },
      {
        heading: '2. Gallery Drip Coffee — ย่านพระนคร',
        paragraphs: [
          'คาเฟ่ในตึกเก่าย่านพระนคร ตกแต่งสไตล์อาร์ตแกลเลอรี่ ผนังจัดแสดงงานศิลปะหมุนเวียน กาแฟดริปเป็นไฮไลท์ ใช้เมล็ดจากภาคเหนือของไทย วิวมองออกไปเห็นวัดและตึกเก่า บรรยากาศดีมากๆ',
        ],
      },
    ],
  },
  {
    title: 'อาหารริมทางที่ดีที่สุดในย่านเยาวราช: ต้องลองสักครั้ง',
    slug: 'yaowarat-street-food-guide',
    excerpt: 'พาไปชิมอาหารริมทางในย่านเยาวราช ตั้งแต่ก๋วยเตี๋ยว ข้าวมันไก่ ไปจนถึงของหวานสุดอร่อย',
    tags: ['อาหาร', 'เที่ยวเมือง', 'รีวิว', 'วัฒนธรรม'],
    categories: ['อาหารและเครื่องดื่ม'],
    imageIndex: 2,
    daysAgo: 14,
    content: [
      {
        heading: 'เยาวราช ถนนสายอาหารที่ไม่เคยหลับ',
        paragraphs: [
          'ถนนเยาวราช หรือไชน่าทาวน์ของกรุงเทพ เป็นแหล่งอาหารริมทางที่มีชื่อเสียงระดับโลก ทุกค่ำคืนถนนสายนี้จะเต็มไปด้วยร้านอาหาร รถเข็น และกลิ่นหอมของอาหารที่ทำสดใหม่ ดึงดูดนักท่องเที่ยวจากทั่วทุกมุมโลก',
        ],
      },
      {
        heading: 'ก๋วยเตี๋ยวเนื้อตุ๋น — เจ้าเก่าแก่ 50 ปี',
        paragraphs: [
          'เริ่มต้นด้วยก๋วยเตี๋ยวเนื้อตุ๋นเจ้าเก่าแก่ที่เปิดมานานกว่า 50 ปี น้ำซุปเข้มข้น เนื้อนุ่มละลายในปาก เส้นเหนียวนุ่ม ราคาเริ่มต้นเพียง 60 บาท แต่รสชาติเทียบเท่าร้านหรูหลายร้อยบาท',
        ],
      },
      {
        heading: 'หอยทอดผู้ใหญ่ลี — ของดีที่ต้องลอง',
        paragraphs: [
          'หอยทอดเยาวราชขึ้นชื่อเรื่องความกรอบนอกนุ่มใน ใส่หอยตัวใหญ่เต็มคำ ราดด้วยน้ำจิ้มรสเด็ด เป็นเมนูที่ใครมาเยาวราชก็ต้องลอง รอคิวสักหน่อยแต่คุ้มค่าแน่นอน',
        ],
      },
    ],
  },
  {
    title: 'วัดสวยทั่วไทย: 6 วัดที่ต้องไปให้ได้สักครั้งในชีวิต',
    slug: 'beautiful-temples-thailand',
    excerpt: 'พาเที่ยว 6 วัดที่สวยที่สุดในประเทศไทย ตั้งแต่วัดร่องขุ่น ไปจนถึงวัดที่ซ่อนอยู่ในถ้ำ',
    tags: ['ท่องเที่ยว', 'วัฒนธรรม', 'ธรรมชาติ'],
    categories: ['ท่องเที่ยวในประเทศ'],
    imageIndex: 4,
    daysAgo: 30,
    content: [
      {
        heading: 'วัดไทย: มรดกทางวัฒนธรรมที่มีชีวิต',
        paragraphs: [
          'ประเทศไทยมีวัดมากกว่า 40,000 แห่งทั่วประเทศ แต่ละแห่งมีเอกลักษณ์และความสวยงามเฉพาะตัว ตั้งแต่วัดโบราณอายุหลายร้อยปี ไปจนถึงวัดสมัยใหม่ที่ออกแบบอย่างสร้างสรรค์ วันนี้เราคัดมา 6 วัดที่เชื่อว่าควรไปเยือนให้ได้สักครั้ง',
        ],
      },
      {
        heading: '1. วัดร่องขุ่น — เชียงราย',
        paragraphs: [
          'วัดร่องขุ่น หรือ White Temple เป็นผลงานการออกแบบของ อาจารย์เฉลิมชัย โฆษิตพิพัฒน์ โดดเด่นด้วยสถาปัตยกรรมสีขาวบริสุทธิ์ประดับด้วยกระจกสะท้อนแสงระยิบระยับ ภายในอุโบสถมีจิตรกรรมฝาผนังที่ผสมผสานระหว่างศิลปะดั้งเดิมกับป๊อปอาร์ต สวยงามจนเป็นที่กล่าวขวัญไปทั่วโลก',
        ],
      },
      {
        heading: '2. วัดพระแก้ว — กรุงเทพฯ',
        paragraphs: [
          'วัดพระศรีรัตนศาสดาราม หรือวัดพระแก้ว เป็นวัดที่สำคัญที่สุดของประเทศไทย ตั้งอยู่ในเขตพระบรมมหาราชวัง ความงดงามของสถาปัตยกรรมไทยประยุกต์ ยอดปรางค์สีทองเปล่งประกาย และจิตรกรรมฝาผนังเรื่องรามเกียรติ์ ทำให้ที่นี่เป็นสถานที่ที่ต้องมาเยือนให้ได้',
        ],
      },
    ],
  },
  {
    title: 'เดินป่าหน้าฝน: 5 เส้นทางที่ปลอดภัยและสวยงาม',
    slug: 'rainy-season-hiking-trails',
    excerpt: 'อย่าให้หน้าฝนมาหยุดการผจญภัย! รวม 5 เส้นทางเดินป่าที่เหมาะกับหน้าฝน ปลอดภัย',
    tags: ['ท่องเที่ยว', 'ธรรมชาติ', 'เที่ยวภูเขา'],
    categories: ['ท่องเที่ยวในประเทศ'],
    imageIndex: 6,
    daysAgo: 28,
    content: [
      {
        heading: 'หน้าฝนก็เดินป่าได้!',
        paragraphs: [
          'หลายคนคิดว่าหน้าฝนไม่เหมาะกับการเดินป่า แต่จริงๆ แล้วหน้าฝนคือช่วงที่ธรรมชาติสวยที่สุด! น้ำตกมีน้ำเต็มที่ ป่าเขียวชอุ่ม อากาศเย็นสบาย แค่เตรียมตัวให้พร้อมก็สามารถเดินป่าได้อย่างปลอดภัย',
        ],
      },
      {
        heading: '1. น้ำตกแม่ยา — ลำพูน',
        paragraphs: [
          'น้ำตกแม่ยาเป็นน้ำตกที่สวยที่สุดแห่งหนึ่งในภาคเหนือ ช่วงหน้าฝนน้ำตกจะมีน้ำเต็มที่ ไหลลงมาเป็นม่านน้ำขาวสวยงาม เส้นทางเดินมีระยะทางประมาณ 2 กิโลเมตร ไม่ชันมาก เหมาะสำหรับมือใหม่',
        ],
      },
    ],
  },
  {
    title: 'เที่ยวตลาดน้ำ 4 แห่งที่ไม่ควรพลาดรอบกรุงเทพ',
    slug: 'floating-markets-bangkok',
    excerpt: 'สำรวจ 4 ตลาดน้ำยอดนิยมรอบกรุงเทพ ที่ยังคงเสน่ห์ของวิถีชีวิตริมคลอง',
    tags: ['ท่องเที่ยว', 'วัฒนธรรม', 'อาหาร'],
    categories: ['ท่องเที่ยวในประเทศ'],
    imageIndex: 7,
    daysAgo: 18,
    content: [
      {
        heading: 'ตลาดน้ำ วิถีชีวิตดั้งเดิมของคนไทย',
        paragraphs: [
          'ตลาดน้ำเป็นหนึ่งในสัญลักษณ์ทางวัฒนธรรมของประเทศไทย สะท้อนวิถีชีวิตดั้งเดิมของชุมชนริมคลอง ปัจจุบันตลาดน้ำหลายแห่งยังคงเสน่ห์ดั้งเดิม พร้อมเพิ่มความสะดวกสบายสำหรับนักท่องเที่ยว',
        ],
      },
      {
        heading: '1. ตลาดน้ำดำเนินสะดวก',
        paragraphs: [
          'ตลาดน้ำดำเนินสะดวก จังหวัดราชบุรี เป็นตลาดน้ำที่มีชื่อเสียงที่สุดของไทย เปิดทุกวันตั้งแต่เช้าตรู่ มีของกินมากมายบนเรือ ทั้งก๋วยเตี๋ยวเรือ ผัดไทย และผลไม้สด บรรยากาศคลาสสิกมาก',
        ],
      },
    ],
  },
  {
    title: 'Digital Nomad ในไทย: ทำงานที่ไหนดี? รวม Co-working Space',
    slug: 'digital-nomad-coworking-thailand',
    excerpt: 'รวม Co-working Space ที่ดีที่สุดในไทย สำหรับชาว Digital Nomad',
    tags: ['ไลฟ์สไตล์', 'เคล็ดลับ', 'เที่ยวทะเล', 'เที่ยวภูเขา'],
    categories: ['ไลฟ์สไตล์'],
    imageIndex: 5,
    daysAgo: 20,
    content: [
      {
        heading: 'ไทย: สวรรค์ของ Digital Nomad',
        paragraphs: [
          'ประเทศไทยติดอันดับต้นๆ ของจุดหมายปลายทางสำหรับ Digital Nomad ทั่วโลก ด้วยค่าครองชีพที่ถูก อินเตอร์เน็ตเร็ว อาหารอร่อย และสถานที่ท่องเที่ยวมากมาย ไม่แปลกที่นักทำงานอิสระจากทั่วโลกจะเลือกมาใช้ชีวิตที่นี่',
        ],
      },
      {
        heading: 'เชียงใหม่ — เมืองหลวง Digital Nomad',
        paragraphs: [
          'เชียงใหม่เป็นเมืองที่ Digital Nomad ทั่วโลกยกให้เป็นเมืองอันดับ 1 ในเอเชีย Co-working space มีให้เลือกมากมาย ทั้ง Punspace, CAMP, Yellow Co-working ค่าสมาชิกเริ่มต้นวันละ 200 บาท มีอินเตอร์เน็ตแรงเร็วสูง แอร์เย็นฉ่ำ และกาแฟฟรี',
        ],
      },
    ],
  },
]

// ─── Download image from URL ───
async function downloadImage(url: string, filename: string): Promise<string> {
  const tmpDir = path.join(process.cwd(), 'public', 'seed', 'images')
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
  const filePath = path.join(tmpDir, filename)
  if (fs.existsSync(filePath)) return filePath

  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to download ${url}`)
  const arrayBuffer = await response.arrayBuffer()
  fs.writeFileSync(filePath, new Uint8Array(arrayBuffer))
  return filePath
}

// ─── Upload image to Payload Media ───
async function uploadImageToMedia(
  payload: any,
  filePath: string,
  altText: string,
): Promise<string> {
  const filename = path.basename(filePath)
  // Check if already uploaded
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })
  if (existing.docs.length > 0) return existing.docs[0].id

  const fileBuffer = fs.readFileSync(filePath)
  const media = await payload.create({
    collection: 'media',
    data: { alt: altText },
    file: {
      data: fileBuffer,
      name: filename,
      mimetype: 'image/jpeg',
      size: fileBuffer.length,
    },
  })
  return media.id
}

// ─── Main Seed Function ───
export async function seedBlogData(): Promise<{ success: boolean; message: string }> {
  try {
    const payload = await getPayload({ config: configPromise })

    // 1. Download & upload images
    console.log('📸 Downloading blog images...')
    const mediaIds: string[] = []
    for (const img of BLOG_IMAGES) {
      try {
        const filePath = await downloadImage(img.url, img.name)
        const mediaId = await uploadImageToMedia(payload, filePath, img.name.replace('.jpg', ''))
        mediaIds.push(mediaId)
        console.log(`  ✅ ${img.name}`)
      } catch (e: any) {
        console.error(`  ❌ ${img.name}: ${e.message}`)
        mediaIds.push('')
      }
    }

    // 2. Create categories
    const catMap: Record<string, string> = {}
    for (const catName of CATEGORIES_DATA) {
      const existing = await payload.find({
        collection: 'categories',
        where: { title: { equals: catName } },
        limit: 1,
      })
      if (existing.docs.length > 0) {
        catMap[catName] = existing.docs[0].id
      } else {
        const created = await payload.create({ collection: 'categories', data: { title: catName } })
        catMap[catName] = created.id
      }
    }
    console.log(`✅ Categories: ${Object.keys(catMap).length}`)

    // 3. Create tags
    const tagMap: Record<string, string> = {}
    for (const tagName of TAGS_DATA) {
      const existing = await payload.find({
        collection: 'tags',
        where: { name: { equals: tagName } },
        limit: 1,
      })
      if (existing.docs.length > 0) {
        tagMap[tagName] = existing.docs[0].id
      } else {
        const created = await payload.create({
          collection: 'tags',
          data: { name: tagName, slug: slugify(tagName) },
        })
        tagMap[tagName] = created.id
      }
    }
    console.log(`✅ Tags: ${Object.keys(tagMap).length}`)

    // 4. Create posts
    let createdCount = 0
    let skippedCount = 0

    for (const postData of POSTS_DATA) {
      const existing = await payload.find({
        collection: 'posts',
        where: { slug: { equals: postData.slug } },
        limit: 1,
      })
      if (existing.docs.length > 0) {
        skippedCount++
        continue
      }

      const tagIds = postData.tags.map((t) => tagMap[t]).filter(Boolean)
      const catIds = postData.categories.map((c) => catMap[c]).filter(Boolean)
      const coverImageId = mediaIds[postData.imageIndex] || mediaIds[0]

      const publishedAt = new Date()
      publishedAt.setDate(publishedAt.getDate() - postData.daysAgo)

      await payload.create({
        collection: 'posts',
        data: {
          title: postData.title,
          slug: postData.slug,
          excerpt: postData.excerpt,
          coverImage: coverImageId || undefined,
          bannerImage: coverImageId || undefined,
          tags: tagIds,
          categories: catIds,
          status: 'published',
          publishedAt: publishedAt.toISOString(),
          _status: 'published',
          content: buildRichContent(postData.content),
        } as any,
      })
      createdCount++
    }

    const message = `สร้างข้อมูลบล็อกสำเร็จ: รูปภาพ ${mediaIds.filter(Boolean).length} รูป, Categories ${Object.keys(catMap).length}, Tags ${Object.keys(tagMap).length}, Posts สร้างใหม่ ${createdCount} (ข้าม ${skippedCount})`
    console.log(`✅ ${message}`)
    return { success: true, message }
  } catch (error: any) {
    console.error('❌ Blog seed error:', error)
    return { success: false, message: `เกิดข้อผิดพลาด: ${error.message}` }
  }
}
