# Puppeteer CSS 爬虫工具

这是一个用于爬取网页 CSS 样式的 Puppeteer 脚本工具集，特别适用于需要登录的页面。

## 功能特性

- ✅ 爬取页面所有 CSS 文件
- ✅ 下载 CSS 文件完整内容
- ✅ 获取元素的最终渲染样式（computed styles）
- ✅ 支持手动登录并保存 Cookie
- ✅ 使用 Cookie 重新加载页面（已登录状态）
- ✅ 支持动态注入的 CSS（React/Vue 等框架）

## 安装依赖

首先确保已安装 Node.js，然后在项目根目录运行：

```bash
npm install
```

这会自动安装 `puppeteer` 依赖。

## 使用方法

### 1. 基础示例（不需要登录）

运行基础示例脚本，打开浏览器访问百度：

```bash
npm run css-crawler:basic
```

或者直接运行：

```bash
node scripts/css-crawler/basic-example.js
```

### 2. 完整功能（支持登录）

#### 步骤 1：配置目标网站

编辑 `scripts/css-crawler/config.js` 文件，修改以下配置：

```javascript
module.exports = {
  // 登录页面 URL
  loginUrl: "https://example.com/login",
  
  // 登录后要访问的目标页面 URL
  targetUrl: "https://example.com",
  
  // 需要获取样式的元素选择器
  // 设置为 "all" 表示获取页面所有可见元素样式
  // 或者指定具体元素选择器数组
  elementsToInspect: "all", // 或 ["body", ".login-container"]
  
  // ... 其他配置
};
```

#### 步骤 2：运行脚本

```bash
npm run css-crawler
```

或者直接运行：

```bash
node scripts/css-crawler/full-crawler.js
```

#### 步骤 3：手动登录

1. 脚本会自动打开浏览器并访问登录页面
2. 在浏览器中手动完成登录操作
3. 登录完成后，在命令行按 **Enter** 键继续

#### 步骤 4：查看结果

脚本会自动：
- 保存 Cookie 到 `scripts/css-crawler/cookies.json`
- 下载所有 CSS 文件内容到 `scripts/css-crawler/styles.json`
- 获取指定元素的最终渲染样式到 `scripts/css-crawler/computed-styles.json`

## 配置文件说明

`scripts/css-crawler/config.js` 包含以下配置项：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `loginUrl` | 登录页面 URL | `"https://example.com/login"` |
| `targetUrl` | 登录后访问的目标页面 URL | `"https://example.com"` |
| `browser.headless` | 是否使用无头模式 | `false` |
| `browser.defaultViewport` | 浏览器窗口大小 | `{ width: 1920, height: 1080 }` |
| `elementsToInspect` | 需要获取样式的元素选择器数组 | `["body"]` |
| `output.cookiesFile` | Cookie 保存路径 | `"scripts/css-crawler/cookies.json"` |
| `output.stylesFile` | CSS 文件保存路径 | `"scripts/css-crawler/styles.json"` |
| `output.computedStylesFile` | 最终样式保存路径 | `"scripts/css-crawler/computed-styles.json"` |
| `waitForLoginTimeout` | 等待登录的超时时间（毫秒），0 表示等待用户按 Enter | `0` |

## 输出文件格式

### cookies.json

保存的 Cookie 信息：

```json
[
  {
    "name": "session_id",
    "value": "abc123...",
    "domain": ".example.com",
    "path": "/",
    "expires": 1234567890,
    "httpOnly": true,
    "secure": true
  }
]
```

### styles.json

所有 CSS 文件的内容：

```json
{
  "https://example.com/styles/main.css": "body { margin: 0; } ...",
  "https://example.com/styles/theme.css": ".dark { background: #000; } ..."
}
```

### computed-styles.json

元素的最终渲染样式：

```json
{
  "body": {
    "margin": "0px",
    "padding": "0px",
    "font-family": "Arial, sans-serif",
    "background-color": "rgb(255, 255, 255)",
    ...
  },
  ".login-container": {
    "width": "400px",
    "height": "500px",
    ...
  }
}
```

## 常见问题

### Q: 如何爬取本地开发服务器的页面？

A: 修改 `config.js` 中的 URL 为本地地址，例如：
```javascript
loginUrl: "http://localhost:3000/login",
targetUrl: "http://localhost:3000",
```

### Q: 某些 CSS 文件下载失败怎么办？

A: 可能是跨域问题。脚本会记录错误信息到 `styles.json` 中，你可以手动访问这些 URL 下载。

### Q: 如何获取页面所有元素的样式？

A: 在 `config.js` 中设置 `elementsToInspect` 为 `"all"`：
```javascript
elementsToInspect: "all"
```

脚本会自动扫描页面所有可见元素（排除隐藏元素），并获取它们的完整样式信息。注意：这可能会产生大量数据，默认限制为前500个元素。

### Q: 如何只爬取 CSS 文件，不需要最终渲染样式？

A: 在 `config.js` 中设置 `elementsToInspect` 为空数组：
```javascript
elementsToInspect: []
```

### Q: 如何自动登录而不需要手动操作？

A: 可以在脚本中添加自动填写表单的代码，例如：
```javascript
await page.type('#username', 'your-username');
await page.type('#password', 'your-password');
await page.click('#login-button');
```

### Q: 浏览器无法启动怎么办？

A: Puppeteer 会自动下载 Chromium。如果下载失败，可以：
1. 检查网络连接
2. 设置代理：`npm config set proxy http://proxy-server:port`
3. 使用系统 Chrome：在 `puppeteer.launch()` 中添加 `executablePath: '/path/to/chrome'`

## 技术说明

- **Puppeteer**: 用于控制 Chrome/Chromium 浏览器
- **Cookie 持久化**: 保存登录状态，避免重复登录
- **CSS 文件下载**: 通过 Puppeteer 的 `page.goto()` 下载 CSS 文件
- **最终样式获取**: 使用 `window.getComputedStyle()` API 获取元素的实际渲染样式

## 注意事项

1. ⚠️ 请遵守目标网站的 robots.txt 和使用条款
2. ⚠️ 不要频繁请求，避免对服务器造成压力
3. ⚠️ Cookie 文件包含敏感信息，请妥善保管，不要提交到版本控制
4. ⚠️ 某些网站可能有反爬虫机制，需要额外处理

## 许可证

本项目遵循项目主许可证。

