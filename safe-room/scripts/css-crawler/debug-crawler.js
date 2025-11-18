/**
 * 调试爬虫脚本
 * 检查页面元素是否存在
 */
(async () => {
  try {
    const puppeteer = (await import("puppeteer")).default;

    console.log("🔍 启动调试爬虫...\n");

    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: undefined
    });

    const page = await browser.newPage();

    const testPagePath = `file://${process.cwd()}/scripts/css-crawler/test-page.html`;
    await page.goto(testPagePath, { waitUntil: "load", timeout: 10000 });

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("📄 页面标题:", await page.title());

    // 检查页面基本结构
    const pageStructure = await page.evaluate(() => {
      const result = {
        bodyExists: !!document.body,
        allElements: document.querySelectorAll('*').length,
        testHeader: !!document.querySelector('.test-header'),
        testCard: !!document.querySelector('.test-card'),
        testButton: !!document.querySelector('.test-button'),
        cssLinks: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).length,
        styleTags: document.querySelectorAll('style').length
      };

      // 获取前几个元素的标签名
      const firstElements = Array.from(document.querySelectorAll('*')).slice(0, 10).map(el => ({
        tag: el.tagName.toLowerCase(),
        class: el.className || '',
        id: el.id || ''
      }));

      result.firstElements = firstElements;
      return result;
    });

    console.log("\n📊 页面结构分析:");
    console.log(`   - Body 存在: ${pageStructure.bodyExists}`);
    console.log(`   - 总元素数: ${pageStructure.allElements}`);
    console.log(`   - .test-header 存在: ${pageStructure.testHeader}`);
    console.log(`   - .test-card 存在: ${pageStructure.testCard}`);
    console.log(`   - .test-button 存在: ${pageStructure.testButton}`);
    console.log(`   - CSS 链接数: ${pageStructure.cssLinks}`);
    console.log(`   - Style 标签数: ${pageStructure.styleTags}`);

    console.log("\n🏷️  前10个元素:");
    pageStructure.firstElements.forEach((el, index) => {
      console.log(`   ${index + 1}. <${el.tag}> class="${el.class}" id="${el.id}"`);
    });

    await new Promise(resolve => setTimeout(resolve, 5000));
    await browser.close();

  } catch (error) {
    console.error("❌ 调试错误:", error);
  }
})();
