/**
 * CSS 爬虫配置文件
 * 修改这里的配置来适配不同的目标网站
 */

module.exports = {
  // 登录页面 URL
  loginUrl: "https://accounts.google.com/v3/signin/identifier?opparams=%253F&dsh=S688001887%3A1763437465219930&client_id=293702255113-5edfm31r2gdeamh7uhlkf6ol4s8vrj1b.apps.googleusercontent.com&o2v=1&prompt=select_account&redirect_uri=https%3A%2F%2Fauth.copilot.microsoft.com%2Flogin%2Fcallback&response_type=code&scope=email+profile&service=lso&state=N0ZBW7Tdc85I-wmzxhAYrcBndv2oqcHj&flowName=GeneralOAuthFlow&continue=https%3A%2F%2Faccounts.google.com%2Fsignin%2Foauth%2Fconsent%3Fauthuser%3Dunknown%26part%3DAJi8hANmC4aTx_cHiRAaWFhOLWw2Y27oku1QRVKIwUuVpSCd1kBS530yeFEyCs-lQx1fijFIlcglenZGUWMS4SIs1kShBK47hODhTv66igm0BPKEhOulRa-zhiPS0kIiR5cHIvLXvRnG76OJWCaseaezbj0yRjj8qPeF8UHJ6Fl7kYJZHRO1jTNKHMfVLMYEmqTL3zzcFsNNQ4BFlkQIvQrV9A2XwzF1qt_pRpqpucjbo2F3O_umGpOWLOz4YeNogQ-G9THcW9aWvGjVcLcZbk3NPMGJtLGNF-OzCkwudBvJU1J1dzwhE6_pNHDeohxPcSshxVAOt8VpZ_xge570D-FkE5jwPx0ZUlfiY1YqLAOMdypATIZMht239GxEByBGxCaPpISzrc8TP1cMvlyX9sTSro8C50-GiiQhicfjWpTusdiLmwYPsYU9wT6JpEl_5QpRIYx3WXaQtjIL2-MraquklmgLNWEcCfPo0xOVgY0N-kwEy2uvmW8%26flowName%3DGeneralOAuthFlow%26as%3DS688001887%253A1763437465219930%26client_id%3D293702255113-5edfm31r2gdeamh7uhlkf6ol4s8vrj1b.apps.googleusercontent.com%23&app_domain=https%3A%2F%2Fauth.copilot.microsoft.com&rart=ANgoxcf4xFotpbz2a1mG3fFN9fpQioDYXIGrsaB58w2BoUidJMbQlWJAHYPZxI4BsF1YjJ9yodx21oImV3nbT0OU-PzMtYIchAbnDUoJNvfQJ7ZvysH0zqI",

  // 登录后要访问的目标页面 URL
  targetUrl: "https://copilot.microsoft.com",
  
  // 浏览器配置
  browser: {
    headless: false, // false = 显示浏览器窗口，true = 无头模式
    defaultViewport: {
      width: 1920,
      height: 1080
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  },
  
  // 需要获取最终渲染样式的元素选择器
  // 设置为 "all" 表示获取页面所有可见元素的样式
  // 或者指定特定元素选择器数组
  elementsToInspect: "all", // 改为 "all" 来获取所有元素样式
  
  // 输出文件路径
  output: {
    cookiesFile: "scripts/css-crawler/cookies.json",
    stylesFile: "scripts/css-crawler/styles.json",
    computedStylesFile: "scripts/css-crawler/computed-styles.json"
  },
  
  // 等待用户登录的时间（毫秒）
  // 设置为 0 表示等待用户按 Enter 键继续
  waitForLoginTimeout: 0
};

