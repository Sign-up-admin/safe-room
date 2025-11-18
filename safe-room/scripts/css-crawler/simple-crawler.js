/**
 * 简化版 CSS 爬虫脚本
 * 避免复杂的代理设置，直接进行网页爬取
 */
(async () => {
  try {
    // Puppeteer v21+ 是 ESM only，需要动态导入
    const puppeteer = (await import("puppeteer")).default;

    console.log("🚀 启动简化 CSS 爬虫...\n");

    // 启动浏览器（简化配置）
    console.log("📱 启动浏览器...");
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: undefined // 让Puppeteer自动选择或下载浏览器
    });

    const page = await browser.newPage();

    // 访问本地测试页面
    console.log("📍 正在访问本地测试页面...");
    const testPagePath = `file://${process.cwd()}/scripts/css-crawler/test-page.html`;
    await page.goto(testPagePath, { waitUntil: "load", timeout: 10000 });
    console.log("✅ 页面加载完成");
    console.log("📄 页面标题:", await page.title());

    // 获取页面所有 CSS 文件链接
    console.log("\n📦 正在获取 CSS 文件列表...");
    const cssFiles = await page.evaluate(() =>
      Array.from(document.styleSheets)
        .map(s => s.href)
        .filter(Boolean)
    );

    console.log(`✅ 找到 ${cssFiles.length} 个 CSS 文件:`);
    cssFiles.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });

    // 下载 CSS 文件内容
    console.log("\n📥 正在下载 CSS 文件内容...");
    const cssContent = {};

    for (const url of cssFiles.slice(0, 5)) { // 只下载前5个文件作为示例
      try {
        console.log(`  📥 正在下载: ${url}`);
        const response = await page.goto(url, { waitUntil: "networkidle0", timeout: 10000 });
        if (response && response.ok()) {
          cssContent[url] = await response.text();
          console.log(`  ✅ 下载成功: ${url}`);
        } else {
          cssContent[url] = `无法访问 (状态码: ${response ? response.status() : "未知"})`;
          console.log(`  ❌ 下载失败: ${url}`);
        }
      } catch (error) {
        cssContent[url] = `下载错误: ${error.message}`;
        console.log(`  ❌ 下载错误: ${url} - ${error.message}`);
      }
    }

    // 保存结果
    const fs = require("fs");
    const path = require("path");

    fs.writeFileSync(
      "scripts/css-crawler/simple-styles.json",
      JSON.stringify(cssContent, null, 2),
      "utf-8"
    );

    console.log("\n✅ CSS 内容已保存到: scripts/css-crawler/simple-styles.json");

    // 获取页面基本信息
    const pageInfo = await page.evaluate(() => ({
      title: document.title,
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }));

    fs.writeFileSync(
      "scripts/css-crawler/simple-page-info.json",
      JSON.stringify(pageInfo, null, 2),
      "utf-8"
    );

    console.log("✅ 页面信息已保存到: scripts/css-crawler/simple-page-info.json");

    // 等待 10 秒后关闭浏览器
    console.log("\n⏳ 10 秒后自动关闭浏览器...");
    await new Promise(resolve => setTimeout(resolve, 10000));

    await browser.close();
    console.log("✅ 浏览器已关闭");

    console.log("\n" + "=".repeat(60));
    console.log("✅ 简化爬取完成！");
    console.log("=".repeat(60));
    console.log(`📁 输出文件:`);
    console.log(`   - CSS 文件: scripts/css-crawler/simple-styles.json`);
    console.log(`   - 页面信息: scripts/css-crawler/simple-page-info.json`);
    console.log("=".repeat(60) + "\n");

  } catch (error) {
    console.error("\n❌ 发生错误:", error);
    process.exit(1);
  }
})();
