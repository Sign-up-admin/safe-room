interface NavItem {
  name: string
  url: string
}

interface Config {
  baseUrl: string
  name: string
  indexNav: NavItem[]
}

// 在开发环境中使用相对路径（通过 Vite 代理），在生产环境中使用完整 URL
const isDev = import.meta.env.DEV
const baseUrl = isDev 
  ? '/springboot1ngh61a2/'  // 开发环境：使用相对路径，通过 Vite 代理
  : 'http://localhost:8080/springboot1ngh61a2/'  // 生产环境：使用完整 URL

const config: Config = {
  baseUrl,
  name: '/springboot1ngh61a2',
  indexNav: [
    {
      name: '健身教练',
      url: '/index/jianshenjiaolian',
    },
    {
      name: '健身课程',
      url: '/index/jianshenkecheng',
    },
    {
      name: '会员卡',
      url: '/index/huiyuanka',
    },
    {
      name: '健身器材',
      url: '/index/jianshenqicai',
    },
    {
      name: '公告信息',
      url: '/index/news',
    },
  ],
}

export default config

