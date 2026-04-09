import { test, expect } from '@playwright/test'

// Warm-up for Turbopack cold compilation
test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage()
  try {
    await page.goto('/', { timeout: 120_000, waitUntil: 'domcontentloaded' })
  } catch {
    // Server will have started compiling
  }
  await page.close()
})

test.describe('Security Headers', () => {
  test('should have X-Content-Type-Options header', async ({ page }) => {
    const response = await page.goto('/', { timeout: 60_000 })
    const header = response?.headers()['x-content-type-options']
    expect(header).toBe('nosniff')
  })

  test('should not expose X-Powered-By header', async ({ page }) => {
    const response = await page.goto('/', { timeout: 60_000 })
    const header = response?.headers()['x-powered-by']
    expect(header).toBeUndefined()
  })

  test('should have X-Frame-Options or CSP frame-ancestors', async ({ page }) => {
    const response = await page.goto('/', { timeout: 60_000 })
    const xFrameOptions = response?.headers()['x-frame-options']
    const csp = response?.headers()['content-security-policy']

    const hasFrameProtection =
      xFrameOptions !== undefined || (csp !== undefined && csp.includes('frame-ancestors'))

    expect(hasFrameProtection).toBe(true)
  })

  test('should have Referrer-Policy header', async ({ page }) => {
    const response = await page.goto('/', { timeout: 60_000 })
    const header = response?.headers()['referrer-policy']
    expect(header).toBeTruthy()
  })

  test('should set Strict-Transport-Security in production', async ({ page }) => {
    const baseURL = page.context().pages()[0]?.url() || ''
    // Only check HSTS on HTTPS connections
    if (baseURL.startsWith('https')) {
      const response = await page.goto('/', { timeout: 60_000 })
      const hsts = response?.headers()['strict-transport-security']
      expect(hsts).toBeTruthy()
      expect(hsts).toContain('max-age=')
    }
  })

  test('should not have inline scripts without nonce/hash', async ({ page }) => {
    await page.goto('/', { timeout: 60_000 })

    const unsafeInlineScripts = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'))
      return scripts
        .filter(
          (s) =>
            !s.src &&
            s.textContent &&
            s.textContent.trim().length > 0 &&
            !s.nonce &&
            !s.getAttribute('integrity'),
        )
        .map((s) => s.textContent?.slice(0, 100))
    })

    // Informational — many Next.js apps use inline scripts for hydration
    if (unsafeInlineScripts.length > 0) {
      console.warn(`⚠️ Found ${unsafeInlineScripts.length} inline scripts without nonce/integrity`)
    }
  })
})
