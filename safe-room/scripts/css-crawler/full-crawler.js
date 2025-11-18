const fs = require("fs");
const path = require("path");
const readline = require("readline");
const config = require("./config");

/**
 * 完整功能的 CSS 爬虫脚本
 * 支持：
 * 1. 手动登录并保存 Cookie
 * 2. 使用 Cookie 重新加载页面
 * 3. 获取所有 CSS 文件内容
 * 4. 获取指定元素的最终渲染样式
 */

// 创建 readline 接口用于等待用户输入
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 等待用户按 Enter 的 Promise
const waitForEnter = () => {
  return new Promise((resolve) => {
    try {
      if (rl && !rl.destroyed) {
        rl.question("", (answer) => {
          rl.close();
          resolve();
        });
      } else {
        console.log("⚠️  readline 接口已关闭，跳过等待用户输入");
        resolve();
      }
    } catch (error) {
      console.log("⚠️  readline 错误，跳过等待用户输入:", error.message);
      resolve();
    }
  });
};

/**
 * 确保输出目录存在
 */
function ensureOutputDir() {
  const outputDir = path.dirname(config.output.cookiesFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
}

/**
 * 获取页面所有 CSS 文件链接
 */
async function getCssFiles(page) {
  return await page.evaluate(() =>
    Array.from(document.styleSheets)
      .map(s => s.href)
      .filter(Boolean)
  );
}

/**
 * 下载 CSS 文件内容
 */
async function downloadCssContent(page, cssUrls) {
  const cssContent = {};
  
  for (const url of cssUrls) {
    try {
      console.log(`  📥 正在下载: ${url}`);
      const response = await page.goto(url, { waitUntil: "networkidle0" });
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
  
  return cssContent;
}

/**
 * 获取元素的最终渲染样式（computed styles）
 */
async function getComputedStyles(page, selectors) {
  const computedStyles = {};

  if (selectors === "all") {
    // 获取页面所有可见元素的样式
    console.log("  🔍 正在扫描页面所有可见元素...");

    const allElements = await page.evaluate(() => {
      const elements = [];
      const all = document.querySelectorAll('*');

      for (let i = 0; i < all.length; i++) {
        const el = all[i];
        // 只获取可见元素
        const style = window.getComputedStyle(el);
        if (style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0' &&
            el.offsetWidth > 0 &&
            el.offsetHeight > 0) {

          // 生成唯一的元素标识符
          let identifier = el.tagName.toLowerCase();
          if (el.id) identifier += `#${el.id}`;
          if (el.className && typeof el.className === 'string') {
            identifier += `.${el.className.trim().replace(/\s+/g, '.')}`;
          }

          // 如果标识符重复，添加索引
          let counter = 1;
          let uniqueId = identifier;
          while (elements.some(item => item.selector === uniqueId)) {
            uniqueId = `${identifier}:nth-of-type(${counter})`;
            counter++;
          }

          elements.push({
            selector: uniqueId,
            element: el
          });
        }
      }

      return elements.map(item => item.selector);
    });

    console.log(`  📊 找到 ${allElements.length} 个可见元素`);

    // 限制元素数量以避免内存溢出
    const maxElements = 500;
    const elementsToProcess = allElements.slice(0, maxElements);

    if (allElements.length > maxElements) {
      console.log(`  ⚠️  元素数量过多，只处理前 ${maxElements} 个元素`);
    }

    selectors = elementsToProcess;
  }

  console.log(`  🎨 正在获取 ${selectors.length} 个元素的样式...`);

  for (let i = 0; i < selectors.length; i++) {
    const selector = selectors[i];

    try {
      const element = await page.$(selector);
      if (element) {
        const styles = await page.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          const styleObj = {};
          // 获取所有 CSS 属性
          for (let j = 0; j < computed.length; j++) {
            const prop = computed[j];
            styleObj[prop] = computed.getPropertyValue(prop);
          }
          return styleObj;
        }, element);

        computedStyles[selector] = styles;

        // 每处理50个元素显示一次进度
        if ((i + 1) % 50 === 0) {
          console.log(`  📈 已处理 ${i + 1}/${selectors.length} 个元素`);
        }
      } else {
        computedStyles[selector] = `元素未找到: ${selector}`;
        console.log(`  ⚠️  元素未找到: ${selector}`);
      }
    } catch (error) {
      computedStyles[selector] = `获取样式错误: ${error.message}`;
      console.log(`  ❌ 获取样式错误: ${selector} - ${error.message}`);
    }
  }

  console.log(`  ✅ 完成样式获取，共 ${Object.keys(computedStyles).length} 个元素`);
  return computedStyles;
}

/**
 * 主函数
 */
(async () => {
  try {
    // Puppeteer v21+ 是 ESM only，需要动态导入
    const puppeteer = (await import("puppeteer")).default;

    console.log("🚀 启动 CSS 爬虫...\n");

    // 确保输出目录存在
    ensureOutputDir();
    
    // 启动浏览器
    console.log("📱 启动浏览器...");
    const browserConfig = {
      headless: config.browser.headless,
      defaultViewport: config.browser.defaultViewport,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-features=VizDisplayCompositor']
    };
    const browser = await puppeteer.launch(browserConfig);
    const page = await browser.newPage();

    // 第一步：打开登录页面
    console.log(`\n📍 正在访问登录页面: ${config.loginUrl}`);
    await page.goto(config.loginUrl, { waitUntil: "networkidle0", timeout: 60000 });
    console.log("✅ 登录页面加载完成");
    console.log("📄 页面标题:", await page.title());

    // 第二步：等待用户手动登录
    console.log("\n" + "=".repeat(60));
    console.log("👤 请手动完成登录操作...");
    console.log("=".repeat(60));
    
    if (config.waitForLoginTimeout > 0) {
      console.log(`⏳ 等待 ${config.waitForLoginTimeout / 1000} 秒...`);
      await new Promise(resolve => setTimeout(resolve, config.waitForLoginTimeout));
    } else {
      console.log("💡 登录完成后，请按 Enter 键继续...");
      await waitForEnter();
    }

    // 第三步：保存 Cookie
    console.log("\n🍪 正在保存 Cookie...");
    const cookies = await page.cookies();
    fs.writeFileSync(
      config.output.cookiesFile,
      JSON.stringify(cookies, null, 2),
      "utf-8"
    );
    console.log(`✅ Cookie 已保存到: ${config.output.cookiesFile}`);

    // 第四步：使用 Cookie 重新加载目标页面
    console.log(`\n📍 正在访问目标页面: ${config.targetUrl}`);
    await page.setCookie(...cookies);

    try {
      await page.goto(config.targetUrl, { waitUntil: "networkidle0", timeout: 120000 });
      console.log("✅ 目标页面加载完成");
      console.log("📄 页面标题:", await page.title());
    } catch (error) {
      console.log(`⚠️  目标页面访问失败: ${error.message}`);
      console.log("🔄 尝试继续处理当前页面...");
      // 即使访问失败，也继续处理当前页面
    }

    // 第五步：获取 CSS 文件
    console.log("\n📦 正在获取 CSS 文件列表...");
    const cssFiles = await getCssFiles(page);
    console.log(`✅ 找到 ${cssFiles.length} 个 CSS 文件:`);
    cssFiles.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });

    // 第六步：下载 CSS 文件内容
    console.log("\n📥 正在下载 CSS 文件内容...");
    const cssContent = await downloadCssContent(page, cssFiles);
    
    // 保存 CSS 内容
    fs.writeFileSync(
      config.output.stylesFile,
      JSON.stringify(cssContent, null, 2),
      "utf-8"
    );
    console.log(`\n✅ CSS 内容已保存到: ${config.output.stylesFile}`);

    // 第七步：获取最终渲染样式
    if (config.elementsToInspect && (config.elementsToInspect === "all" || config.elementsToInspect.length > 0)) {
      console.log("\n🎨 正在获取元素的最终渲染样式...");
      const computedStyles = await getComputedStyles(page, config.elementsToInspect);
      
      // 保存最终渲染样式
      fs.writeFileSync(
        config.output.computedStylesFile,
        JSON.stringify(computedStyles, null, 2),
        "utf-8"
      );
      console.log(`✅ 最终渲染样式已保存到: ${config.output.computedStylesFile}`);
    }

    // 关闭浏览器
    console.log("\n🔚 关闭浏览器...");
    await browser.close();
    rl.close();

    console.log("\n" + "=".repeat(60));
    console.log("✅ 爬取完成！");
    console.log("=".repeat(60));
    console.log(`📁 输出文件:`);
    console.log(`   - Cookie: ${config.output.cookiesFile}`);
    console.log(`   - CSS 文件: ${config.output.stylesFile}`);
    if (config.elementsToInspect && (config.elementsToInspect === "all" || config.elementsToInspect.length > 0)) {
      console.log(`   - 最终样式: ${config.output.computedStylesFile}`);
    }
    console.log("=".repeat(60) + "\n");

  } catch (error) {
    console.error("\n❌ 发生错误:", error);
    process.exit(1);
  }
})();

