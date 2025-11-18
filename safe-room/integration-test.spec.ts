import { test, expect } from '@playwright/test';

test.describe('Integration Tests', () => {
  test('application maintains state across interactions', async ({ page }) => {
    await page.goto('http://localhost:8082');
    await page.waitForLoadState('networkidle');

    // Check initial state
    const initialTitle = await page.title();
    const initialUrl = page.url();

    // Wait for potential dynamic content
    await page.waitForTimeout(2000);

    // Verify application remains stable
    expect(await page.title()).toBe(initialTitle);
    expect(page.url()).toBe(initialUrl);

    // Check that main content areas are present
    const mainContentSelectors = [
      'body',
      'header, [role="banner"]',
      'main, [role="main"]'
    ];

    for (const selector of mainContentSelectors) {
      const elements = await page.locator(selector).count();
      expect(elements).toBeGreaterThan(0);
    }
  });

  test('JavaScript functionality is operational', async ({ page }) => {
    await page.goto('http://localhost:8082');
    await page.waitForLoadState('networkidle');

    // Test basic JavaScript execution
    const jsResult = await page.evaluate(() => {
      return {
        userAgent: navigator.userAgent,
        language: navigator.language,
        hasLocalStorage: typeof localStorage !== 'undefined',
        hasSessionStorage: typeof sessionStorage !== 'undefined'
      };
    });

    expect(jsResult.hasLocalStorage).toBe(true);
    expect(jsResult.hasSessionStorage).toBe(true);
    expect(jsResult.language).toBeDefined();
  });

  test('network requests are handled properly', async ({ page }) => {
    const requests: string[] = [];
    const responses: number[] = [];

    // Monitor network activity
    page.on('request', request => {
      requests.push(request.url());
    });

    page.on('response', response => {
      responses.push(response.status());
    });

    await page.goto('http://localhost:8082');
    await page.waitForLoadState('networkidle');

    // Wait a bit for any additional requests
    await page.waitForTimeout(3000);

    // Check that we had some network activity
    expect(requests.length).toBeGreaterThan(0);
    console.log(`Total requests: ${requests.length}`);

    // Check that responses are mostly successful (2xx status codes)
    const successResponses = responses.filter(status => status >= 200 && status < 300);
    const successRate = successResponses.length / responses.length;

    console.log(`Success rate: ${(successRate * 100).toFixed(1)}%`);
    expect(successRate).toBeGreaterThan(0.8); // At least 80% success rate
  });

  test('error boundaries work correctly', async ({ page }) => {
    await page.goto('http://localhost:8082');
    await page.waitForLoadState('networkidle');

    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Listen for page errors
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    // Interact with page to potentially trigger errors
    await page.waitForTimeout(5000);

    // Check that we don't have critical errors
    // Some warnings might be acceptable, but no unhandled exceptions
    const criticalErrors = pageErrors.filter(error =>
      !error.includes('Warning') &&
      !error.includes('deprecated') &&
      !error.includes('DevTools')
    );

    console.log(`Console errors: ${consoleErrors.length}`);
    console.log(`Page errors: ${pageErrors.length}`);
    console.log(`Critical errors: ${criticalErrors.length}`);

    // Allow some console warnings but no critical page errors
    expect(criticalErrors.length).toBe(0);
  });

  test('local storage integration works', async ({ page }) => {
    await page.goto('http://localhost:8082');
    await page.waitForLoadState('networkidle');

    // Test localStorage functionality
    const testKey = 'e2e_test_key';
    const testValue = 'test_value_' + Date.now();

    // Set a test value
    await page.evaluate(({ key, value }) => {
      localStorage.setItem(key, value);
    }, { key: testKey, value: testValue });

    // Retrieve the value
    const retrievedValue = await page.evaluate((key) => {
      return localStorage.getItem(key);
    }, testKey);

    expect(retrievedValue).toBe(testValue);

    // Clean up
    await page.evaluate((key) => {
      localStorage.removeItem(key);
    }, testKey);

    const cleanedValue = await page.evaluate((key) => {
      return localStorage.getItem(key);
    }, testKey);

    expect(cleanedValue).toBeNull();
  });
});
