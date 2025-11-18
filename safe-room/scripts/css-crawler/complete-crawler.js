/**
 * 完整功能的 CSS 爬虫脚本
 * 包含 CSS 文件下载和元素样式提取
 */
(async () => {
  try {
    // Puppeteer v21+ 是 ESM only，需要动态导入
    const puppeteer = (await import("puppeteer")).default;

    console.log("🚀 启动完整 CSS 爬虫...\n");

    // 启动浏览器
    console.log("📱 启动浏览器...");
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: undefined
    });

    const page = await browser.newPage();

    // 访问本地测试页面
    console.log("📍 正在访问本地测试页面...");
    const testPagePath = `file://${process.cwd()}/scripts/css-crawler/test-page.html`;
    await page.goto(testPagePath, { waitUntil: "load", timeout: 10000 });

    // 等待CSS和元素加载完成
    await new Promise(resolve => setTimeout(resolve, 2000));

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
    const fs = require("fs");

    for (const url of cssFiles) {
      try {
        console.log(`  📥 正在下载: ${url}`);
        const response = await page.goto(url, { waitUntil: "load", timeout: 10000 });
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

    // 保存 CSS 内容
    fs.writeFileSync(
      "scripts/css-crawler/complete-styles.json",
      JSON.stringify(cssContent, null, 2),
      "utf-8"
    );
    console.log(`\n✅ CSS 内容已保存到: scripts/css-crawler/complete-styles.json`);

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
      "scripts/css-crawler/complete-page-info.json",
      JSON.stringify(pageInfo, null, 2),
      "utf-8"
    );
    console.log("✅ 页面信息已保存到: scripts/css-crawler/complete-page-info.json");

    // 获取指定元素的最终渲染样式
    console.log("\n🎨 正在获取元素最终渲染样式...");
    const elementsToInspect = ['.test-header', '.test-card', '.test-button', 'body'];

    const computedStyles = {};

    // 首先验证元素是否存在
    const elementCheck = await page.evaluate((selectors) => {
      const results = {};
      selectors.forEach(selector => {
        results[selector] = !!document.querySelector(selector);
      });
      return results;
    }, elementsToInspect);

    console.log("🔍 元素存在性检查:");
    Object.entries(elementCheck).forEach(([selector, exists]) => {
      console.log(`   ${selector}: ${exists ? '✅ 存在' : '❌ 不存在'}`);
    });

    for (const selector of elementsToInspect) {
      try {
        const element = await page.$(selector);
        if (element) {
          const styles = await page.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            const styleObj = {};

            // 获取主要样式属性
            const importantProps = [
              'background-color', 'color', 'font-family', 'font-size',
              'padding', 'margin', 'border', 'border-radius',
              'width', 'height', 'display', 'position',
              'box-shadow', 'text-align', 'line-height'
            ];

            importantProps.forEach(prop => {
              const value = computed.getPropertyValue(prop);
              if (value && value !== 'none' && value !== 'normal' && value !== 'auto') {
                styleObj[prop] = value;
              }
            });

            return styleObj;
          }, element);

          computedStyles[selector] = styles;
          console.log(`  ✅ 获取样式: ${selector} (${Object.keys(styles).length} 个属性)`);
        } else {
          computedStyles[selector] = `元素未找到: ${selector}`;
          console.log(`  ⚠️  元素未找到: ${selector}`);
        }
      } catch (error) {
        computedStyles[selector] = `获取样式错误: ${error.message}`;
        console.log(`  ❌ 获取样式错误: ${selector} - ${error.message}`);
      }
    }

    // 保存最终渲染样式
    fs.writeFileSync(
      "scripts/css-crawler/complete-computed-styles.json",
      JSON.stringify(computedStyles, null, 2),
      "utf-8"
    );
    console.log(`✅ 最终渲染样式已保存到: scripts/css-crawler/complete-computed-styles.json`);

    // 等待 10 秒后关闭浏览器
    console.log("\n⏳ 10 秒后自动关闭浏览器...");
    await new Promise(resolve => setTimeout(resolve, 10000));

    await browser.close();
    console.log("✅ 浏览器已关闭");

    console.log("\n" + "=".repeat(60));
    console.log("✅ 完整爬取完成！");
    console.log("=".repeat(60));
    console.log(`📁 输出文件:`);
    console.log(`   - CSS 文件: scripts/css-crawler/complete-styles.json`);
    console.log(`   - 页面信息: scripts/css-crawler/complete-page-info.json`);
    console.log(`   - 最终样式: scripts/css-crawler/complete-computed-styles.json`);
    console.log("=".repeat(60) + "\n");

  } catch (error) {
    console.error("\n❌ 发生错误:", error);
    process.exit(1);
  }
})();
