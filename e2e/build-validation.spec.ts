import { test, expect } from '@playwright/test';

test.describe('Build Validation', () => {
  test('should load all critical assets', async ({ page }) => {
    const failedResources: string[] = [];

    // Track failed resource loads
    page.on('response', (response) => {
      if (response.status() >= 400) {
        failedResources.push(`${response.status()} - ${response.url()}`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Allow some time for all resources to load
    await page.waitForTimeout(2000);

    if (failedResources.length > 0) {
      console.log('Failed resources:', failedResources);
    }

    // Check that no critical resources failed
    const criticalFailures = failedResources.filter(resource =>
      resource.includes('.js') ||
      resource.includes('.css') ||
      resource.includes('index.html')
    );

    expect(criticalFailures).toHaveLength(0);
  });

  test('should have no JavaScript errors on load', async ({ page }) => {
    const jsErrors: string[] = [];

    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        // Filter out non-critical errors
        const text = msg.text();
        if (!text.includes('DevTools') && !text.includes('Warning')) {
          jsErrors.push(text);
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    if (jsErrors.length > 0) {
      console.log('JavaScript errors:', jsErrors);
    }

    expect(jsErrors).toHaveLength(0);
  });

  test('should render React components successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for React error boundaries or crash indicators
    const errorBoundary = page.locator('text=/something went wrong/i');
    await expect(errorBoundary).not.toBeVisible();

    // Check that the app didn't crash (root should have content)
    const root = page.locator('#root');
    const isEmpty = await root.evaluate((el) => el.innerHTML.trim() === '');
    expect(isEmpty).toBe(false);

    // Check for common error indicators
    const errorIndicators = page.locator('text=/error|failed|crash/i').first();
    const hasError = await errorIndicators.count();

    // It's okay to have the word "error" in UI, but not prominent error messages
    if (hasError > 0) {
      const errorText = await errorIndicators.textContent();
      console.log('Potential error indicator found:', errorText);
    }
  });
});
