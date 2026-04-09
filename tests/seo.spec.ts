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

test.describe('SEO', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { timeout: 60_000 })
  })

  test('should have a title tag', async ({ page }) => {
    const title = await page.title()
    expect(title).toBeTruthy()
    expect(title.length).toBeGreaterThan(0)
    expect(title.length).toBeLessThanOrEqual(70)
  })

  test('should have a meta description', async ({ page }) => {
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description).toBeTruthy()
    expect(description!.length).toBeGreaterThan(0)
    expect(description!.length).toBeLessThanOrEqual(160)
  })

  test('should have exactly one h1', async ({ page }) => {
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)
  })

  test('should have lang attribute on html', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang')
    expect(lang).toBeTruthy()
  })

  test('should have alt text on all images', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    const imagesWithoutAlt = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'))
      return imgs.filter((img) => !img.getAttribute('alt')).map((img) => img.src)
    })

    expect(imagesWithoutAlt).toHaveLength(0)
  })

  test('should have canonical URL', async ({ page }) => {
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toBeTruthy()
  })

  test('should have Open Graph tags', async ({ page }) => {
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    const ogDescription = await page
      .locator('meta[property="og:description"]')
      .getAttribute('content')

    expect(ogTitle).toBeTruthy()
    expect(ogDescription).toBeTruthy()
  })

  test('should have viewport meta tag', async ({ page }) => {
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(viewport).toBeTruthy()
    expect(viewport).toContain('width=device-width')
  })
})
