import { NextResponse, after } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { generateBookingEmailHTML } from '@/lib/bookingEmailTemplate'
import type { Media as MediaType } from '@/payload-types'
import nodemailer from 'nodemailer'

const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5 // max 5 bookings per IP per minute

// Generate booking code with running number: {prefix}{sep}{YYYYMMDD}{sep}{running}
// e.g. BK-20260404-0001
function generateBookingCode(
  prefix: string,
  separator: string,
  digits: number,
  running: number,
): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const runStr = String(running).padStart(digits, '0')
  return `${prefix}${separator}${dateStr}${separator}${runStr}`
}

// Fallback: random code like WOW-20260221-A1B2C (for backward compatibility)
function generateRandomCode(): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let random = ''
  for (let i = 0; i < 5; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `WOW-${dateStr}-${random}`
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin')
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_SERVER_URL,
      'http://localhost:3000',
      'http://localhost:3001',
    ]

    if (process.env.NODE_ENV === 'production') {
      if (!origin || !allowedOrigins.includes(origin)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
    const now = Date.now()
    const record = rateLimit.get(ip) || { count: 0, resetAt: now }

    if (now - record.resetAt > 60000) {
      record.count = 1
      record.resetAt = now
    } else {
      record.count++
    }
    rateLimit.set(ip, record)

    if (record.count > RATE_LIMIT) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429 },
      )
    }

    const body = await request.json()
    const {
      tourTitle,
      tourCode,
      countryName,
      airlineName,
      travelDate,
      duration,
      coverImageUrl,
      periodId,
      interTourSlug,
      travelers,
      depositPerPerson,
      paymentDeadline,
      totalAmount,
      firstName,
      lastName,
      email,
      phone,
      specialRequests,
      supplierName,
      captchaToken,
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกข้อมูลผู้จองให้ครบถ้วน' },
        { status: 400 },
      )
    }

    if (
      String(firstName).length > 100 ||
      String(lastName).length > 100 ||
      String(email).length > 254
    ) {
      return NextResponse.json({ success: false, error: 'ข้อมูลยาวเกินไป' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกอีเมลให้ถูกต้อง' },
        { status: 400 },
      )
    }

    const phoneClean = String(phone).replace(/[\s\-\(\)]/g, '')
    if (!/^\+?\d{9,15}$/.test(phoneClean)) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง' },
        { status: 400 },
      )
    }

    const sanitizedRequests = specialRequests
      ? String(specialRequests)
          .replace(/<[^>]*>/g, '')
          .trim()
          .slice(0, 1000)
      : ''

    // Cloudflare Turnstile CAPTCHA validation
    if (process.env.TURNSTILE_SECRET_KEY) {
      if (!captchaToken) {
        return NextResponse.json(
          { success: false, error: 'กรุณายืนยันตัวตน (CAPTCHA)' },
          { status: 400 },
        )
      }
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${encodeURIComponent(process.env.TURNSTILE_SECRET_KEY)}&response=${encodeURIComponent(captchaToken)}`,
      })
      const verifyData = await verifyRes.json()
      if (!verifyData.success) {
        return NextResponse.json(
          { success: false, error: 'การตรวจสอบ CAPTCHA ล้มเหลว กรุณาลองใหม่อีกครั้ง' },
          { status: 400 },
        )
      }
    }

    interface TravelerInput {
      type: string
      qty: number
      price?: number
    }
    if (
      !travelers ||
      !Array.isArray(travelers) ||
      !travelers.some((t: TravelerInput) => t.qty > 0)
    ) {
      return NextResponse.json(
        { success: false, error: 'กรุณาเลือกจำนวนผู้เดินทางอย่างน้อย 1 ท่าน' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config: configPromise })

    // --- TourProx API Integration ---
    let externalPnr: string | null = null
    try {
      // 1. Fetch API settings from Global
      const apiSettings = await payload.findGlobal({ slug: 'api-setting' })
      const { apiKey, apiEndPoint } = apiSettings as any

      if (apiKey && apiEndPoint) {
        // 1.1 Clean the apiEndPoint (remove trailing '?')
        const sanitizedEndPoint = apiEndPoint.replace(/\?$/, '')

        // 2. Map traveler counts
        const getQty = (type: string) => travelers.find((t: any) => t.type === type)?.qty || 0

        const tourProxParams = new URLSearchParams({
          apikey: apiKey,
          mode: 'bookingdetails',
          period_id: String(periodId),
          adults_double: String(getQty('adultTwin')),
          adults_single: String(getQty('adultSingle')),
          adults_triple: String(getQty('adultTriple')),
          child_withbed: String(getQty('childWithBed')),
          child_nobed: String(getQty('childNoBed')),
          first_name: String(firstName),
          last_name: String(lastName),
          email: String(email),
          phone_number: String(phone),
        })

        console.log('[Booking] Sending to TourProx (Form):', sanitizedEndPoint)
        console.log('[Booking] Params:', tourProxParams.toString())

        // 3. Call external API (Mode: Form UrlEncoded)
        const tourProxRes = await fetch(sanitizedEndPoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: tourProxParams,
          signal: AbortSignal.timeout(30000), // 30s timeout (matches WordPress)
        })

        const rawResText = await tourProxRes.text()
        console.log('[Booking] TourProx Raw Response:', rawResText)

        if (tourProxRes.ok) {
          try {
            const tourProxData = JSON.parse(rawResText)
            if (tourProxData.success === 'True' && tourProxData.data?.pnrcode) {
              externalPnr = tourProxData.data.pnrcode
              console.log('[Booking] SUCCESS! Using External PNR:', externalPnr)
            } else {
              console.warn(
                '[Booking] TourProx response was not successful or missing PNR:',
                tourProxData,
              )
            }
          } catch (parseErr) {
            console.error('[Booking] Failed to parse TourProx response as JSON:', rawResText)
          }
        } else {
          console.error(
            '[Booking] TourProx API Error Status:',
            tourProxRes.status,
            tourProxRes.statusText,
          )
        }
      } else {
        console.warn('[Booking] API Key or EndPoint missing in ApiSetting global')
      }
    } catch (apiErr: any) {
      console.error('[Booking] TourProx Integration Error:', apiErr.message)
      // We continue with local PNR if external fails
    }
    // --------------------------------

    // Get company info (needed for booking code format + email)
    let companyInfo: any = {}
    try {
      companyInfo = await payload.findGlobal({ slug: 'company-info', depth: 1 })
    } catch (e) {
      // Company info not set yet, use defaults
    }

    // --- Generate Booking Code ---
    let pnrCode = ''
    let booking: any = null
    const MAX_RETRIES = 3

    const bookingPrefix = companyInfo?.bookingPrefix || ''
    const bookingSeparator = companyInfo?.bookingSeparator || '-'
    const bookingDigits = Number(companyInfo?.bookingDigits) || 4

    if (externalPnr) {
      // Use external PNR from TourProx (for Core/Plus packages)
      for (let attempts = 0; attempts < MAX_RETRIES; attempts++) {
        pnrCode = externalPnr
        try {
          booking = await payload.create({
            collection: 'bookings',
            data: {
              pnrCode,
              tourTitle, tourCode, countryName, airlineName,
              supplierName: supplierName || '',
              travelDate, duration, coverImageUrl, periodId, interTourSlug,
              travelers, depositPerPerson, paymentDeadline, totalAmount,
              firstName, lastName, email, phone,
              specialRequests: sanitizedRequests,
              status: 'pending',
              bookingSource: 'website',
            },
          })
          break
        } catch (err: any) {
          if (attempts === MAX_RETRIES - 1) throw err
        }
      }
    } else if (bookingPrefix) {
      // Use configurable running number (for Starter packages)
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)
      const dateStr = todayStart.toISOString().slice(0, 10).replace(/-/g, '')

      for (let attempts = 0; attempts < MAX_RETRIES; attempts++) {
        // Count today's bookings with same prefix to determine next running number
        const todayBookings = await payload.find({
          collection: 'bookings',
          where: {
            pnrCode: { like: `${bookingPrefix}${bookingSeparator}${dateStr}${bookingSeparator}` },
            createdAt: { greater_than_equal: todayStart.toISOString(), less_than_equal: todayEnd.toISOString() },
          },
          limit: 0, // We only need totalDocs count
        })
        const nextRunning = todayBookings.totalDocs + 1 + attempts

        pnrCode = generateBookingCode(bookingPrefix, bookingSeparator, bookingDigits, nextRunning)

        try {
          booking = await payload.create({
            collection: 'bookings',
            data: {
              pnrCode,
              tourTitle, tourCode, countryName, airlineName,
              supplierName: supplierName || '',
              travelDate, duration, coverImageUrl, periodId, interTourSlug,
              travelers, depositPerPerson, paymentDeadline, totalAmount,
              firstName, lastName, email, phone,
              specialRequests: sanitizedRequests,
              status: 'pending',
              bookingSource: 'website',
            },
          })
          break
        } catch (err: any) {
          if (attempts === MAX_RETRIES - 1) throw err
        }
      }
    } else {
      // Fallback: random code (backward compatibility, no config set)
      for (let attempts = 0; attempts < MAX_RETRIES; attempts++) {
        pnrCode = generateRandomCode()
        try {
          booking = await payload.create({
            collection: 'bookings',
            data: {
              pnrCode,
              tourTitle, tourCode, countryName, airlineName,
              supplierName: supplierName || '',
              travelDate, duration, coverImageUrl, periodId, interTourSlug,
              travelers, depositPerPerson, paymentDeadline, totalAmount,
              firstName, lastName, email, phone,
              specialRequests: sanitizedRequests,
              status: 'pending',
              bookingSource: 'website',
            },
          })
          break
        } catch (err: any) {
          if (attempts === MAX_RETRIES - 1) throw err
        }
      }
    }

    if (!booking) {
      throw new Error('ไม่สามารถบันทึกการจองได้ (Booking code collision)')
    }

    // Get theme config for email styling
    let themeConfig: any = {}
    try {
      themeConfig = await payload.findGlobal({ slug: 'themeConfig', depth: 1 })
    } catch (e) {
      // Theme config not set yet
    }

    const companyLogoUrl = companyInfo?.companyLogo
      ? (companyInfo.companyLogo as MediaType)?.url || ''
      : ''

    // Make image URLs absolute for email clients
    const serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.PAYLOAD_PUBLIC_SERVER_URL ||
      'http://localhost:3000'
    const absoluteLogoUrl =
      companyLogoUrl && !companyLogoUrl.startsWith('http')
        ? `${serverUrl}${companyLogoUrl}`
        : companyLogoUrl
    const absoluteCoverUrl =
      coverImageUrl && !coverImageUrl.startsWith('http')
        ? `${serverUrl}${coverImageUrl}`
        : coverImageUrl

    // Generate email data
    const emailData = {
      pnrCode,
      tourTitle,
      tourCode,
      countryName,
      airlineName,
      travelDate,
      duration,
      coverImageUrl: absoluteCoverUrl,
      travelers,
      depositPerPerson: depositPerPerson || '',
      paymentDeadline: paymentDeadline || '',
      totalAmount,
      firstName,
      lastName,
      email,
      phone,
      specialRequests: sanitizedRequests,
      supplierName: supplierName || '',
      companyName: companyInfo?.companyName || 'WOW Tour',
      companyLogoUrl: absoluteLogoUrl,
      companyPhone: companyInfo?.callCenter || '',
      companyEmail: companyInfo?.email || '',
      companyAddress: companyInfo?.address || '',
      companyWebsite: companyInfo?.website || '',
      companyLineOA: companyInfo?.lineOA || '',
      tatLicense: companyInfo?.tatLicense || '',
      primaryColor: themeConfig?.regularColors?.primary || '',
    }

    // Generate HTML for customer
    const emailHTML = generateBookingEmailHTML({ ...emailData, isForCompany: false })

    // Send email using Nodemailer (SMTP) synchronously to guarantee delivery
    try {
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        console.log('[Booking] SMTP Config:', {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: process.env.SMTP_SECURE,
          user: process.env.SMTP_USER,
          passLength: process.env.SMTP_PASS?.length || 0,
        })

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        })

        const info = await transporter.sendMail({
          from: `"${companyInfo?.companyName || 'WOW Tour'}" <${process.env.SMTP_USER}>`,
          to: email,
          subject: `ยืนยันการจองทัวร์ - ${pnrCode} | ${tourTitle}`,
          html: emailHTML,
        })
        console.log('[Booking] Email sent successfully:', info.messageId, 'to:', email)

        // Send notification to company if configured
        const bookingEmail = companyInfo?.bookingEmail
        if (bookingEmail && bookingEmail !== '#' && bookingEmail !== '') {
          const companyEmailHTML = generateBookingEmailHTML({ ...emailData, isForCompany: true })
          const companyInfoSend = await transporter.sendMail({
            from: `"${companyInfo?.companyName || 'WOW Tour'} (System)" <${process.env.SMTP_USER}>`,
            to: bookingEmail,
            subject: `[New Booking] รหัสจอง ${pnrCode} | ${tourTitle}`,
            html: companyEmailHTML,
          })
          console.log(
            '[Booking] Notification email sent successfully:',
            companyInfoSend.messageId,
            'to company:',
            bookingEmail,
          )
        }
      } else {
        console.log('[Booking] SMTP not configured, skipping email send.')
      }
    } catch (emailError: any) {
      console.error('[Booking] Email send failed:', emailError.message)
      console.error('[Booking] Full error:', emailError)
      // Don't fail the booking if email fails (it's already saved in Payload)
    }

    return NextResponse.json({
      success: true,
      pnrCode,
      bookingId: booking.id,
    })
  } catch (error: any) {
    console.error('[Booking] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'เกิดข้อผิดพลาดในการจองทัวร์' },
      { status: 500 },
    )
  }
}
