import { test, expect } from '@playwright/test';

test.describe('App Loading', () => {
  test('should load the application without errors', async ({ page }) => {
    // Track console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Track page errors
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error);
    });

    // Navigate to the app
    await page.goto('/');

    // Wait for the app to initialize
    await page.waitForLoadState('networkidle');

    // Check that the page loaded
    expect(page.url()).toContain('localhost');

    // Verify no critical console errors (allow warnings)
    const criticalErrors = consoleErrors.filter(error =>
      !error.includes('Warning') &&
      !error.includes('DevTools')
    );

    if (criticalErrors.length > 0) {
      console.log('Console errors found:', criticalErrors);
    }
    expect(criticalErrors).toHaveLength(0);

    // Verify no page errors
    if (pageErrors.length > 0) {
      console.log('Page errors found:', pageErrors);
    }
    expect(pageErrors).toHaveLength(0);
  });

  test('should have correct page title', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check that title is set
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).toContain('WebMCP');
  });

  test('should render the root element', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check that the root div exists and has content
    const rootElement = page.locator('#root');
    await expect(rootElement).toBeVisible();

    // Verify the root has rendered content
    const rootContent = await rootElement.innerHTML();
    expect(rootContent.length).toBeGreaterThan(0);
  });
});
