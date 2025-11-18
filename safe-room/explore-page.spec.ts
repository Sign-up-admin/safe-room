import { test, expect } from '@playwright/test';

test('explore application structure', async ({ page }) => {
  await page.goto('http://localhost:8082');
  await page.waitForLoadState('networkidle');

  console.log('Page title:', await page.title());
  console.log('Current URL:', page.url());

  // Get all visible text content
  const bodyText = await page.locator('body').textContent();
  console.log('Page contains text about:', bodyText?.substring(0, 200) + '...');

  // Look for navigation elements
  const navLinks = page.locator('a, button, [role="button"]');
  const navCount = await navLinks.count();
  console.log('Found navigation elements:', navCount);

  // List some navigation elements
  for (let i = 0; i < Math.min(navCount, 10); i++) {
    const text = await navLinks.nth(i).textContent();
    if (text && text.trim()) {
      console.log(`  Nav ${i}: "${text.trim()}"`);
    }
  }

  // Check for login/register forms
  const inputs = page.locator('input');
  const inputCount = await inputs.count();
  console.log('Found input fields:', inputCount);

  for (let i = 0; i < Math.min(inputCount, 5); i++) {
    const type = await inputs.nth(i).getAttribute('type');
    const placeholder = await inputs.nth(i).getAttribute('placeholder');
    console.log(`  Input ${i}: type="${type}" placeholder="${placeholder}"`);
  }
});
