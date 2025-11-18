#!/usr/bin/env node

const { chromium } = require('playwright');

async function runTest() {
  console.log('🚀 开始E2E测试...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('📝 运行简单的功能测试...');

    // 访问一个简单的页面来验证浏览器功能
    await page.goto('https://httpbin.org/get');
    const title = await page.title();
    console.log(`✅ 页面标题: ${title}`);

    // 检查基本功能
    const url = page.url();
    console.log(`✅ 当前URL: ${url}`);

    // 测试JavaScript执行
    const userAgent = await page.evaluate(() => navigator.userAgent);
    console.log(`✅ User Agent: ${userAgent.substring(0, 50)}...`);

    console.log('🎉 E2E测试环境验证成功！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await browser.close();
  }
}

runTest();
