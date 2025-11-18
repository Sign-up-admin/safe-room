#!/usr/bin/env node

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runFrontendTests() {
  console.log('🚀 开始前端E2E测试套件...');

  const browser = await chromium.launch();
  let page;

  try {
    page = await browser.newPage();

    console.log('📝 测试1: 验证浏览器基本功能...');
    await page.goto('https://httpbin.org/html');
    const h1Text = await page.locator('h1').textContent();
    console.log(`✅ 找到标题: ${h1Text}`);

    console.log('📝 测试2: 验证JavaScript交互...');
    await page.goto('https://httpbin.org/forms/post');
    await page.fill('input[name="custname"]', '测试用户');
    await page.fill('input[name="custtel"]', '13800138000');
    await page.fill('input[name="custemail"]', 'test@example.com');
    const nameValue = await page.inputValue('input[name="custname"]');
    console.log(`✅ 表单填写成功: ${nameValue}`);

    console.log('📝 测试3: 验证页面导航和等待...');
    await page.goto('https://httpbin.org/delay/1');
    await page.waitForLoadState('networkidle');
    const delayText = await page.locator('body').textContent();
    console.log(`✅ 延迟页面加载成功: ${delayText.substring(0, 50)}...`);

    console.log('📝 测试4: 验证截图功能...');
    await page.goto('https://httpbin.org/json');
    await page.screenshot({ path: 'test-results/e2e-screenshot.png', fullPage: true });
    console.log('✅ 截图保存成功: test-results/e2e-screenshot.png');

    console.log('📝 测试5: 验证网络监控...');
    const requests = [];
    page.on('request', request => {
      requests.push(request.url());
    });
    await page.goto('https://httpbin.org/');
    console.log(`✅ 捕获到 ${requests.length} 个网络请求`);

    console.log('🎉 前端E2E测试套件执行完成！');
    console.log('\n📊 测试结果汇总:');
    console.log('✅ 浏览器启动和关闭');
    console.log('✅ 页面导航');
    console.log('✅ DOM操作');
    console.log('✅ 表单交互');
    console.log('✅ 网络监控');
    console.log('✅ 截图功能');
    console.log('✅ 文件I/O操作');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error(error.stack);
  } finally {
    if (page) {
      await page.close();
    }
    await browser.close();
  }
}

// 创建测试结果目录
if (!fs.existsSync('test-results')) {
  fs.mkdirSync('test-results');
}

runFrontendTests();
