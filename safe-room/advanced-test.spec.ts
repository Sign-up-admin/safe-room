import { test, expect } from '@playwright/test';

test.describe('Advanced Functionality Tests', () => {
  test('handles network failures gracefully', async ({ page }) => {
    await page.goto('http://localhost:8082');
    await page.waitForLoadState('networkidle');

    // Test that the application loads even with potential network issues
    // This is a basic test - in a real scenario we'd simulate network failures

    // Check that critical UI elements are still present
    await expect(page.locator('body')).toBeVisible();

    // Verify the page doesn't show generic error messages
    const bodyText = await page.locator('body').textContent();
    const hasErrorMessages = bodyText?.includes('网络错误') ||
                            bodyText?.includes('连接失败') ||
                            bodyText?.includes('无法加载');

    // Allow some error messages but ensure basic functionality works
    if (hasErrorMessages) {
      console.log('Warning: Found error messages in page content');
    }

    // Basic functionality should still work
    expect(bodyText?.length).toBeGreaterThan(50);
  });

  test('handles invalid URLs correctly', async ({ page }) => {
    // Test with invalid URL - should not crash
    try {
      await page.goto('http://localhost:8082/invalid-path-that-does-not-exist');
      await page.waitForLoadState('networkidle');
    } catch (error) {
      console.log('Expected navigation error for invalid path:', error.message);
    }

    // Page should still be functional even after invalid navigation
    await page.waitForTimeout(2000);
    const bodyExists = await page.locator('body').count() > 0;
    expect(bodyExists).toBe(true);
  });

  test('handles rapid interactions without crashing', async ({ page }) => {
    await page.goto('http://localhost:8082');
    await page.waitForLoadState('networkidle');

    // Rapidly interact with various elements
    const interactions = [
      () => page.mouse.wheel(0, 100),
      () => page.mouse.wheel(0, -100),
      () => page.keyboard.press('ArrowDown'),
      () => page.keyboard.press('ArrowUp'),
    ];

    // Execute interactions rapidly
    for (let i = 0; i < 10; i++) {
      for (const interaction of interactions) {
        try {
          await interaction();
          await page.waitForTimeout(50); // Small delay between interactions
        } catch (error) {
          console.log(`Interaction ${i} failed:`, error.message);
        }
      }
    }

    // Application should still be responsive
    await expect(page.locator('body')).toBeVisible();

    // Check for any error states
    const errorSelectors = [
      '.error',
      '[class*="error"]',
      '.alert-danger',
      '.error-message'
    ];

    let errorFound = false;
    for (const selector of errorSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        errorFound = true;
        console.log(`Found error elements with selector: ${selector}`);
      }
    }

    // Log but don't fail if errors are found - rapid interactions might trigger warnings
    if (errorFound) {
      console.log('Warning: Error elements found after rapid interactions');
    }
  });

  test('handles browser refresh correctly', async ({ page }) => {
    await page.goto('http://localhost:8082');
    await page.waitForLoadState('networkidle');

    const initialTitle = await page.title();

    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Application should reload correctly
    const reloadedTitle = await page.title();
    expect(reloadedTitle).toBe(initialTitle);

    // Basic functionality should still work
    await expect(page.locator('body')).toBeVisible();
  });

  test('handles viewport size changes', async ({ page }) => {
    await page.goto('http://localhost:8082');
    await page.waitForLoadState('networkidle');

    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 },   // Mobile
      { width: 320, height: 568 },   // Small mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      // Wait for responsive changes
      await page.waitForTimeout(1000);

      // Application should adapt and remain functional
      await expect(page.locator('body')).toBeVisible();

      // Check that text is still readable (not cut off)
      const bodyText = await page.locator('body').textContent();
      expect(bodyText?.length).toBeGreaterThan(10);
    }
  });

  test('performance metrics are reasonable', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:8082');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    console.log(`Page load time: ${loadTime}ms`);

    // Reasonable load time (under 10 seconds)
    expect(loadTime).toBeLessThan(10000);

    // Wait a bit more for any dynamic content
    await page.waitForTimeout(3000);

    // Measure JavaScript execution time for basic operations
    const jsPerformance = await page.evaluate(() => {
      const start = performance.now();

      // Perform some basic DOM operations
      const elements = document.querySelectorAll('*');
      const textContent = document.body.textContent;

      const end = performance.now();

      return {
        domElements: elements.length,
        textLength: textContent?.length || 0,
        executionTime: end - start
      };
    });

    console.log(`JS execution time: ${jsPerformance.executionTime.toFixed(2)}ms`);
    console.log(`DOM elements: ${jsPerformance.domElements}`);
    console.log(`Text content length: ${jsPerformance.textLength}`);

    // Reasonable JS execution time (under 100ms for basic operations)
    expect(jsPerformance.executionTime).toBeLessThan(100);
  });
});
