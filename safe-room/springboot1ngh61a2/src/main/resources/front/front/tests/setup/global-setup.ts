import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// 全局测试设置
async function globalSetup(config: FullConfig) {
  console.log('🚀 开始 E2E 测试全局设置...');

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

  // 预热浏览器（可选，用于CI环境）
  if (process.env.CI) {
    console.log('🔥 CI环境：预热浏览器...');
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
      // 访问应用首页进行预热
      await page.goto(config.projects[0].use.baseURL || 'http://localhost:8082', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      console.log('✅ 浏览器预热完成');
    } catch (error) {
      console.warn('⚠️ 浏览器预热失败，但不影响测试继续:', error.message);
    } finally {
      await page.close();
      await browser.close();
    }
  }

  // 记录测试开始时间
  const startTime = new Date().toISOString();
  fs.writeFileSync(
    path.join(testResultsDir, 'test-start-time.txt'),
    startTime
  );

  console.log('✅ 全局设置完成，开始时间:', startTime);
}

export default globalSetup;
