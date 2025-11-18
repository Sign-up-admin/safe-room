import { test, expect } from '@playwright/test';

test.describe('Business Logic Tests', () => {
  test('homepage contains expected business sections', async ({ page }) => {
    await page.goto('http://localhost:8082');
    await page.waitForLoadState('networkidle');

    // Check for main business sections
    const businessSections = [
      '健身教练',
      '健身课程',
      '会员卡',
      '健身器材',
      '公告信息'
    ];

    for (const section of businessSections) {
      await expect(page.locator(`text=${section}`)).toBeVisible();
    }
  });

  test('page structure supports business workflows', async ({ page }) => {
    await page.goto('http://localhost:8082');
    await page.waitForLoadState('networkidle');

    // Check for call-to-action buttons that indicate business workflows
    const ctaButtons = [
      '立即登录',
      '立即预约体验',
      '查看课程项目',
      '查看详情'
    ];

    for (const button of ctaButtons) {
      const locator = page.locator(`text=${button}`);
      await expect(locator).toHaveCount(await locator.count()); // Just check it exists (count >= 1)
      expect(await locator.count()).toBeGreaterThan(0);
    }
  });

  test('application loads business content correctly', async ({ page }) => {
    await page.goto('http://localhost:8082');
    await page.waitForLoadState('networkidle');

    // Wait a bit for dynamic content to load
    await page.waitForTimeout(2000);

    // Check that we have substantial content (not just a loading page)
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(100);

    // Check for business-specific keywords
    const businessKeywords = ['健身', '课程', '教练', '会员', '预约'];
    const foundKeywords = businessKeywords.filter(keyword =>
      bodyText?.includes(keyword)
    );

    expect(foundKeywords.length).toBeGreaterThan(2);
  });

  test('responsive design works for business content', async ({ page }) => {
    await page.goto('http://localhost:8082');
    await page.waitForLoadState('networkidle');

    // Test viewport changes don't break basic functionality
    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
    await page.waitForTimeout(1000);
    await expect(page.locator('text=健身课程')).toBeVisible();

    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.waitForTimeout(1000);
    await expect(page.locator('text=立即登录')).toBeVisible();
  });
});
