import { test, expect } from '@playwright/test'

// Turbopack dev server needs a warm-up on first page load (cold compilation).
test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage()
  try {
    await page.goto('/', { timeout: 120_000, waitUntil: 'domcontentloaded' })
  } catch {
    // Even if it fails, the server will have started compiling
  }
  await page.close()
})

test.describe('Homepage', () => {
  test('should load without server errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))

    const response = await page.goto('/', { timeout: 60_000 })
    const status = response?.status() ?? 500

    // 200 = OK, 404 = page not found (acceptable if DB has no content yet)
    // 500+ = server error (always fail)
    expect(status).toBeLessThan(500)
    expect(errors).toHaveLength(0)
  })

  test('should load within 1 second (warm)', async ({ page }) => {
    // First visit to warm the route (Turbopack caches after first compile)
    await page.goto('/', {
      timeout: 60_000,
      waitUntil: 'domcontentloaded',
    })

    // Second visit — measures actual performance (route is warm)
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const loadTime = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return nav.domContentLoadedEventEnd - nav.startTime
    })

    expect(loadTime).toBeLessThan(1000)
  })

  test('should have visible main content', async ({ page }) => {
    await page.goto('/', { timeout: 60_000 })
    const body = page.locator('body')
    await expect(body).toBeVisible()

    // Check that there's at least one heading
    const headings = page.locator('h1, h2, h3')
    const count = await headings.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should have no broken images', async ({ page }) => {
    await page.goto('/', { timeout: 60_000 })
    await page.waitForLoadState('networkidle')

    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'))
      return imgs
        .filter((img) => {
          // Skip lazy-loaded images that haven't loaded yet
          if (img.loading === 'lazy' && !img.complete) return false
          // Skip SVGs loaded from API (they may require auth)
          if (img.src.includes('/api/')) return false
          // Only flag images that completed loading but have 0 natural width
          return img.complete && img.naturalWidth === 0
        })
        .map((img) => img.src)
    })

    expect(brokenImages).toHaveLength(0)
  })
})
