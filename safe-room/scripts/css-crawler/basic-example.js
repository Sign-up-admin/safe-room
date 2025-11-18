/**
 * 基础示例：最简单的 Puppeteer 使用示例
 * 打开浏览器并访问目标页面
 */
(async () => {
  // Puppeteer v21+ 是 ESM only，需要动态导入
  const puppeteer = (await import("puppeteer")).default;
  console.log("🚀 启动浏览器...");
  
  // 启动浏览器（headless: false 表示显示浏览器窗口）
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  // 访问目标页面
  await page.goto("https://www.baidu.com");

  console.log("✅ 页面加载完成！");
  console.log("📄 页面标题:", await page.title());

  // 获取页面所有 CSS 文件链接
  const cssFiles = await page.evaluate(() =>
    Array.from(document.styleSheets)
      .map(s => s.href)
      .filter(Boolean)
  );

  console.log("📦 找到的 CSS 文件:");
  cssFiles.forEach((url, index) => {
    console.log(`  ${index + 1}. ${url}`);
  });

  // 等待 5 秒后关闭浏览器
  console.log("\n⏳ 5 秒后自动关闭浏览器...");
  await new Promise(resolve => setTimeout(resolve, 5000));

  await browser.close();
  console.log("✅ 浏览器已关闭");
})();

