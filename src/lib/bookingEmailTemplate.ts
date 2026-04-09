/**
 * HTML Email Template สำหรับยืนยันการจองทัวร์
 */

type TravelerItem = {
    type: string
    label: string
    qty: number
    pricePerPerson: number
    total: number
}

type BookingEmailData = {
    pnrCode: string
    tourTitle: string
    tourCode: string
    countryName: string
    airlineName: string
    travelDate: string
    duration: string
    coverImageUrl: string
    travelers: TravelerItem[]
    depositPerPerson: string
    paymentDeadline: string
    totalAmount: number
    firstName: string
    lastName: string
    email: string
    phone: string
    specialRequests?: string
    supplierName?: string
    // Company Info
    companyName: string
    companyLogoUrl?: string
    companyPhone?: string
    companyEmail?: string
    companyAddress?: string
    companyWebsite?: string
    companyLineOA?: string
    tatLicense?: string
    primaryColor?: string
    isForCompany?: boolean
}

const formatNumber = (n: number) => n.toLocaleString('th-TH')

export function generateBookingEmailHTML(data: BookingEmailData): string {
    const travelerRows = data.travelers
        .filter((t) => t.qty > 0)
        .map(
            (t) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#334155;">${t.label}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:14px;color:#334155;">${formatNumber(t.pricePerPerson)}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:14px;color:#334155;">${t.qty}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:14px;font-weight:600;color:#1e40af;">${formatNumber(t.total)} บาท</td>
      </tr>
    `,
        )
        .join('')

    const depositAmount = data.depositPerPerson
        ? parseInt(data.depositPerPerson.replace(/,/g, ''), 10) *
        data.travelers.reduce((sum, t) => sum + t.qty, 0)
        : 0

    return `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <title>${data.isForCompany ? 'แจ้งเตือนการจองทัวร์ใหม่' : 'ยืนยันการจองทัวร์'} - ${data.pnrCode}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Kanit','Segoe UI','Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header with Primary Color -->
          <tr>
            <td style="background:${data.primaryColor || 'linear-gradient(135deg,#1e40af 0%,#3b82f6 50%,#06b6d4 100%)'};padding:32px 40px;text-align:center;">
              <h1 style="color:#ffffff;font-size:24px;margin:0 0 8px;font-family:'Kanit',sans-serif;">${data.companyName}</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;font-family:'Kanit',sans-serif;">${data.isForCompany ? 'แจ้งเตือนมีรายการสั่งจองทัวร์ใหม่' : 'ยืนยันการจองทัวร์'}</p>
            </td>
          </tr>

          <!-- Logo -->
          ${data.companyLogoUrl ? `
          <tr>
            <td style="padding:24px 40px 0;text-align:center;">
              <img src="${data.companyLogoUrl}" alt="${data.companyName}" style="max-height:64px;" />
            </td>
          </tr>
          ` : ''}

          <!-- PNR Code -->
          <tr>
            <td style="padding:32px 40px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#eff6ff,#f0f9ff);border-radius:12px;border:1px solid #bfdbfe;">
                <tr>
                  <td style="padding:20px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-family:'Kanit',sans-serif;">รหัสจอง (PNR)</p>
                    <p style="margin:0;font-size:28px;font-weight:800;color:#1e40af;letter-spacing:3px;font-family:'Kanit',sans-serif;">${data.pnrCode}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tour Info -->
          <tr>
            <td style="padding:16px 40px;">
              <h2 style="font-size:16px;color:#1e293b;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #e2e8f0;font-family:'Kanit',sans-serif;">รายละเอียดทัวร์</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  ${data.coverImageUrl ? `
                  <td valign="top" style="width:160px;padding-right:20px;">
                    <img src="${data.coverImageUrl}" alt="${data.tourTitle}" width="160" height="160" style="display:block;width:160px;height:160px;object-fit:cover;border-radius:12px;background:#e2e8f0;" />
                  </td>
                  ` : ''}
                  <td valign="top">
                    <h3 style="font-size:18px;color:#1e293b;margin:0 0 12px;line-height:1.4;font-family:'Kanit',sans-serif;">${data.tourTitle}</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#64748b;width:90px;font-family:'Kanit',sans-serif;">รหัสทัวร์</td>
                        <td style="padding:4px 0;font-size:14px;color:#1e293b;font-weight:600;font-family:'Kanit',sans-serif;">${data.tourCode}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#64748b;font-family:'Kanit',sans-serif;">ประเทศ</td>
                        <td style="padding:4px 0;font-size:14px;color:#1e293b;font-weight:600;font-family:'Kanit',sans-serif;">${data.countryName}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#64748b;font-family:'Kanit',sans-serif;">สายการบิน</td>
                        <td style="padding:4px 0;font-size:14px;color:#1e293b;font-weight:600;font-family:'Kanit',sans-serif;">${data.airlineName || '-'}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#64748b;font-family:'Kanit',sans-serif;">วันเดินทาง</td>
                        <td style="padding:4px 0;font-size:14px;color:#1e293b;font-weight:600;font-family:'Kanit',sans-serif;">${data.travelDate}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#64748b;font-family:'Kanit',sans-serif;">ระยะเวลา</td>
                        <td style="padding:4px 0;font-size:14px;color:#1e293b;font-weight:600;font-family:'Kanit',sans-serif;">${data.duration}</td>
                      </tr>
                      ${data.isForCompany && data.supplierName ? `
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#64748b;font-family:'Kanit',sans-serif;">Supplier</td>
                        <td style="padding:4px 0;font-size:14px;color:#1e293b;font-weight:600;font-family:'Kanit',sans-serif;">${data.supplierName}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Price Table -->
          <tr>
            <td style="padding:16px 40px;">
              <h2 style="font-size:16px;color:#1e293b;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #e2e8f0;font-family:'Kanit',sans-serif;">รายละเอียดราคา</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
                <thead>
                  <tr style="background:#f8fafc;">
                    <th style="padding:12px 16px;text-align:left;font-size:13px;color:#64748b;font-weight:600;">ประเภท</th>
                    <th style="padding:12px 16px;text-align:center;font-size:13px;color:#64748b;font-weight:600;">ราคา/ท่าน</th>
                    <th style="padding:12px 16px;text-align:center;font-size:13px;color:#64748b;font-weight:600;">จำนวน</th>
                    <th style="padding:12px 16px;text-align:right;font-size:13px;color:#64748b;font-weight:600;">รวม</th>
                  </tr>
                </thead>
                <tbody>
                  ${travelerRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Summary -->
          <tr>
            <td style="padding:16px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:20px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:8px 20px;font-size:14px;color:#64748b;">ค่าธรรมเนียมการจอง</td>
                  <td style="padding:8px 20px;text-align:right;font-size:14px;color:#16a34a;font-weight:600;">ฟรี</td>
                </tr>
                ${data.depositPerPerson
            ? `<tr>
                  <td style="padding:8px 20px;font-size:14px;color:#64748b;">เงินมัดจำ (${data.depositPerPerson} บ./คน)</td>
                  <td style="padding:8px 20px;text-align:right;font-size:14px;color:#334155;font-weight:600;">${formatNumber(depositAmount)} บาท</td>
                </tr>`
            : ''
        }
                ${data.paymentDeadline
            ? `<tr>
                  <td style="padding:8px 20px;font-size:14px;color:#64748b;">ชำระเงินก่อนวันที่</td>
                  <td style="padding:8px 20px;text-align:right;font-size:14px;color:#dc2626;font-weight:600;">${data.paymentDeadline}</td>
                </tr>`
            : ''
        }
                <tr>
                  <td colspan="2" style="padding:4px 20px;"><hr style="border:none;border-top:1px solid #e2e8f0;" /></td>
                </tr>
                <tr>
                  <td style="padding:12px 20px;font-size:18px;color:#1e293b;font-weight:700;font-family:'Kanit',sans-serif;">รวมสุทธิ</td>
                  <td style="padding:12px 20px;text-align:right;font-size:22px;color:#1e40af;font-weight:800;font-family:'Kanit',sans-serif;">${formatNumber(data.totalAmount)} บาท</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Customer Info -->
          <tr>
            <td style="padding:16px 40px;">
              <h2 style="font-size:16px;color:#1e293b;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #e2e8f0;font-family:'Kanit',sans-serif;">ข้อมูลผู้จอง</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#64748b;width:120px;">ชื่อ-นามสกุล</td>
                  <td style="padding:6px 0;font-size:14px;color:#1e293b;font-weight:600;">${data.firstName} ${data.lastName}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#64748b;">อีเมล</td>
                  <td style="padding:6px 0;font-size:14px;color:#1e293b;">${data.email}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#64748b;">เบอร์โทร</td>
                  <td style="padding:6px 0;font-size:14px;color:#1e293b;">${data.phone}</td>
                </tr>
                ${data.specialRequests
            ? `<tr>
                  <td style="padding:6px 0;font-size:14px;color:#64748b;">หมายเหตุ</td>
                  <td style="padding:6px 0;font-size:14px;color:#1e293b;">${data.specialRequests}</td>
                </tr>`
            : ''
        }
              </table>
            </td>
          </tr>

          <!-- Terms and Conditions -->
          ${!data.isForCompany ? `
          <tr>
            <td style="padding:16px 40px; text-align:left;">
              <div style="background:#fff7ed;border-left:4px solid #f97316;padding:16px;border-radius:0 8px 8px 0;margin-bottom:16px;">
                <h3 style="font-size:15px;color:#9a3412;margin:0 0 8px;font-family:'Kanit',sans-serif;">
                  เงื่อนไขการสำรองที่นั่งกับ ${data.companyName}
                </h3>
                <ul style="margin:0;padding-left:20px;font-size:13px;line-height:1.6;color:#431407;font-family:'Kanit',sans-serif;">
                  <li style="margin-bottom:4px">กรุณารอการตอบกลับจากทางบริษัท เพื่อยืนยันที่นั่งและการชำระเงิน โดยบริษัทจะทำการส่งใบแจ้งการชำระเงินให้ท่าน ทางอีเมล (<strong style="color:#c2410c;">${data.email}</strong>) ของท่านอีกครั้ง</li>
                  <li style="margin-bottom:4px">การสำรองที่นั่งจะสมบูรณ์เมื่อบริษัทฯ ได้รับการชำระเงินตามเงื่อนไขข้อตกลงเรียบร้อยแล้ว</li>
                  <li style="margin-bottom:4px">กรุณาชำระเงินโดยโอนเข้าบัญชีตามรายละเอียดในเอกสารแจ้งการชำระเงินเท่านั้น บริษัทขอตัดสิทธิ์ หากไม่มีการชำระเงินตามข้อตกลง</li>
                  <li>หากท่านไม่ได้รับอีเมลกรุณาติดต่อสายด่วนของบริษัท เพื่ออำนวยความสะดวกให้ท่าน</li>
                </ul>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="background:#1e293b;padding:32px 40px;text-align:center;">
              <p style="color:#94a3b8;font-size:13px;margin:0 0 8px;">${data.companyName}</p>
              ${data.tatLicense ? `<p style="color:#64748b;font-size:12px;margin:0 0 8px;">ใบอนุญาต ททท. เลขที่ ${data.tatLicense}</p>` : ''}
              ${data.companyAddress ? `<p style="color:#64748b;font-size:12px;margin:0 0 8px;">${data.companyAddress}</p>` : ''}
              <p style="color:#64748b;font-size:12px;margin:0;">
                ${data.companyPhone ? `📞 ${data.companyPhone}` : ''}
                ${data.companyPhone && data.companyEmail ? ' | ' : ''}
                ${data.companyEmail ? `✉️ ${data.companyEmail}` : ''}
              </p>
              ${data.companyWebsite ? `<p style="color:#64748b;font-size:12px;margin:8px 0 0;"><a href="${data.companyWebsite}" style="color:#60a5fa;">${data.companyWebsite}</a></p>` : ''}
              ${data.companyLineOA ? `<p style="color:#64748b;font-size:12px;margin:4px 0 0;">LINE: ${data.companyLineOA}</p>` : ''}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}
