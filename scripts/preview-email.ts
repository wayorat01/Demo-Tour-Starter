/**
 * Script สร้าง Preview Email HTML ตัวอย่าง
 * สำหรับดู email ลูกค้า + email บริษัท
 */
import { generateBookingEmailHTML } from '../src/lib/bookingEmailTemplate'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

const sampleData = {
  pnrCode: 'BK-20260404-0001',
  tourTitle: 'ทัวร์ยุโรป อิตาลี สวิตเซอร์แลนด์ ฝรั่งเศส',
  tourCode: 'EU-ITALY-001',
  countryName: 'อิตาลี',
  airlineName: 'Thai Airways (TG)',
  travelDate: '15 เม.ย. 2569 - 22 เม.ย. 2569',
  duration: '8 วัน 5 คืน',
  coverImageUrl: 'https://placehold.co/320x320/1e40af/ffffff?text=TOUR+COVER',
  travelers: [
    { type: 'adultTwin', label: 'ผู้ใหญ่ (พักห้องคู่)', qty: 2, pricePerPerson: 59900, total: 119800 },
    { type: 'childWithBed', label: 'เด็ก (2-20 ปี)', qty: 1, pricePerPerson: 49900, total: 49900 },
  ],
  depositPerPerson: '10000',
  paymentDeadline: '5 เม.ย. 2569',
  totalAmount: 169700,
  firstName: 'สมชาย',
  lastName: 'ใจดี',
  email: 'somchai@example.com',
  phone: '081-234-5678',
  specialRequests: 'ขออาหารฮาลาล',
  supplierName: 'World Flight Travel (WFT)',
  // Company Info
  companyName: 'WOW. WE on WEB',
  companyLogoUrl: 'https://placehold.co/200x64/00bcd4/ffffff?text=LOGO',
  companyPhone: '02-123-4567',
  companyEmail: 'info@wowtour.com',
  companyAddress: '589/98 อาคารชุดทาวเวอร์ 1 ออฟฟิศ ชั้นที่ 18 ถนน เทพรัตน แขวงบางนาเหนือ เขตบางนา กทม. 10260',
  companyWebsite: 'https://www.weon.website/',
  companyLineOA: '@weonweb',
  tatLicense: '11/12345',
  primaryColor: '#1e40af',
}

// Generate Both Versions
const customerHTML = generateBookingEmailHTML({ ...sampleData, isForCompany: false })
const companyHTML = generateBookingEmailHTML({ ...sampleData, isForCompany: true })

// Combined preview page
const previewHTML = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>Email Preview — Customer + Company</title>
  <style>
    body { margin:0; background:#e2e8f0; font-family:system-ui,sans-serif; }
    .tabs { display:flex; gap:0; position:sticky; top:0; z-index:10; background:#1e293b; padding:8px 24px 0; }
    .tab { padding:12px 32px; cursor:pointer; color:#94a3b8; font-weight:600; border-radius:8px 8px 0 0; transition:all 0.2s; font-size:15px; }
    .tab:hover { color:#fff; background:rgba(255,255,255,0.05); }
    .tab.active { background:#e2e8f0; color:#1e293b; }
    .panel { display:none; padding:24px; }
    .panel.active { display:block; }
    .badge { display:inline-block; padding:2px 10px; border-radius:999px; font-size:12px; font-weight:700; margin-left:8px; }
    .badge-user { background:#dbeafe; color:#1e40af; }
    .badge-co { background:#fef3c7; color:#92400e; }
  </style>
</head>
<body>
  <div class="tabs">
    <div class="tab active" onclick="show('customer',this)">📧 Email ลูกค้า (End-user) <span class="badge badge-user">Customer</span></div>
    <div class="tab" onclick="show('company',this)">📧 Email บริษัท (Agent) <span class="badge badge-co">Company</span></div>
  </div>
  <div id="customer" class="panel active">
    ${customerHTML}
  </div>
  <div id="company" class="panel">
    ${companyHTML}
  </div>
  <script>
    function show(id, el) {
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      el.classList.add('active');
    }
  </script>
</body>
</html>`

const outPath = resolve(import.meta.dirname, '../preview-email.html')
writeFileSync(outPath, previewHTML, 'utf-8')
console.log(`✅ Preview saved to: ${outPath}`)
console.log('Open this file in your browser to view both email templates.')
