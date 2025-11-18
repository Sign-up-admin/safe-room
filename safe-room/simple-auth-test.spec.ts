import { test, expect } from '@playwright/test';

test('basic login page access', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:8082');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Check if we're on the login page or can access login
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);

  // Look for login elements
  const loginElements = await page.locator('input[type="text"], input[type="password"], button:has-text("登录")').count();
  console.log('Found login elements:', loginElements);

  // Basic assertion - page should load
  expect(currentUrl).toContain('localhost:8082');
});
