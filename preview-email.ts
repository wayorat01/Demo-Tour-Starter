import { generateBookingEmailHTML } from './src/lib/bookingEmailTemplate'

const html = generateBookingEmailHTML({
    pnrCode: 'WOW-20260331-4YWJZ',
    tourTitle: 'ทัวร์ญี่ปุ่น โตเกียว ฟูจิ โอซาก้า 6 วัน 4 คืน',
    tourCode: 'JP-TKOS-6D4N',
    countryName: 'Japan',
    airlineName: 'Japan Airlines (JL)',
    travelDate: '10 เม.ย. 2026 - 15 เม.ย. 2026',
    duration: '6 วัน 4 คืน',
    coverImageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2670&auto=format&fit=crop',
    travelers: [
        { type: 'adultTwin', label: 'ผู้ใหญ่ (พักคู่)', qty: 2, pricePerPerson: 49900, total: 99800 },
        { type: 'childWithBed', label: 'เด็ก (มีเตียง)', qty: 0, pricePerPerson: 45900, total: 0 }
    ],
    depositPerPerson: '10,000',
    paymentDeadline: '05 เม.ย. 2026',
    totalAmount: 99800,
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    email: 'somchai@example.com',
    phone: '0812345678',
    specialRequests: 'ขอเตียงคู่ และแพ้อาหารทะเล',
    companyName: 'บริษัท ซอฟต์ เอสคิว จำกัด',
    companyLogoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=64&fit=crop', // placeholder logo
    companyPhone: '02-123-4567',
    companyEmail: 'contact@softsq.com',
    companyAddress: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
    companyWebsite: 'https://softsq.com',
    companyLineOA: '@softsq',
    tatLicense: '11/123456',
    primaryColor: '#1e40af', // Blue
    isForCompany: true,
})

import fs from 'fs'
fs.writeFileSync('preview-company.html', html)
console.log('Preview generated as preview-company.html')
