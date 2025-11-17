import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// 全局测试设置
async function globalSetup(config: FullConfig) {
  console.log('🚀 开始 Admin E2E 测试全局设置...');

  // 创建测试结果目录
  const testResultsDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }

  // 创建覆盖率目录
  const coverageDir = path.join(process.cwd(), 'coverage-e2e');
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }

  // Admin应用的特殊预热步骤
  if (process.env.CI) {
    console.log('🔥 CI环境：预热Admin应用...');
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // 访问Admin应用首页进行预热
      await page.goto(config.projects[0].use.baseURL || 'http://localhost:8081', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // 等待Admin应用完全加载（可能需要额外的等待时间）
      await page.waitForTimeout(5000);

      console.log('✅ Admin应用预热完成');
    } catch (error) {
      console.warn('⚠️ Admin应用预热失败，但不影响测试继续:', error.message);
    } finally {
      await context.close();
      await browser.close();
    }
  }

  // 记录测试开始时间
  const startTime = new Date().toISOString();
  fs.writeFileSync(
    path.join(testResultsDir, 'admin-test-start-time.txt'),
    startTime
  );

  console.log('✅ Admin全局设置完成，开始时间:', startTime);
}

export default globalSetup;
