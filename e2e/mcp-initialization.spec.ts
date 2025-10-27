import { test, expect } from '@playwright/test';

test.describe('MCP Initialization', () => {
  test('should initialize MCP server successfully', async ({ page }) => {
    const mcpLogs: string[] = [];

    // Capture MCP-related console logs
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('[main.tsx]') || text.includes('MCP')) {
        mcpLogs.push(text);
      }
    });

    await page.goto('/');

    // Wait for initialization to complete
    await page.waitForTimeout(3000);

    // Check that MCP initialization logs exist
    const hasInitLog = mcpLogs.some(log =>
      log.includes('Starting application initialization') ||
      log.includes('MCP server connected')
    );

    if (!hasInitLog) {
      console.log('MCP logs:', mcpLogs);
    }

    // Verify MCP server is available
    const mcpAvailable = await page.evaluate(() => {
      return typeof (window as any).navigator.mcp !== 'undefined';
    });

    expect(mcpAvailable).toBe(true);
  });

  test('should complete database initialization', async ({ page }) => {
    const dbLogs: string[] = [];

    // Capture database-related logs
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('database') || text.includes('Database')) {
        dbLogs.push(text);
      }
    });

    await page.goto('/');

    // Wait for database operations
    await page.waitForTimeout(3000);

    // Check that database initialization completed
    const hasDbReady = dbLogs.some(log =>
      log.includes('Database ready') ||
      log.includes('Database seeded')
    );

    if (!hasDbReady) {
      console.log('Database logs:', dbLogs);
    }

    expect(hasDbReady).toBe(true);
  });

  test('should not have initialization errors', async ({ page }) => {
    const initErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('Failed to initialize')) {
          initErrors.push(text);
        }
      }
    });

    await page.goto('/');
    await page.waitForTimeout(3000);

    if (initErrors.length > 0) {
      console.log('Initialization errors:', initErrors);
    }

    expect(initErrors).toHaveLength(0);
  });
});
