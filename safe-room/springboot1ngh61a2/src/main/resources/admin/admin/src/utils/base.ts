interface BaseConfig {
  url: string
  name: string
  indexUrl: string
}

interface ProjectName {
  projectName: string
}

// 判断是否为开发环境
const isDev = import.meta.env.DEV

const base = {
  get(): BaseConfig {
    // 开发环境使用相对路径，通过 Vite 代理访问后端
    // 生产环境使用完整 URL
    const baseUrl = isDev
      ? '/springboot1ngh61a2/' // 开发环境：使用相对路径，通过 Vite 代理
      : 'http://localhost:8080/springboot1ngh61a2/' // 生产环境：使用完整 URL

    return {
      url: baseUrl,
      name: 'springboot1ngh61a2',
      // Link to redirect to home page
      indexUrl: isDev
        ? '/springboot1ngh61a2/front/dist/index.html'
        : 'http://localhost:8080/springboot1ngh61a2/front/dist/index.html',
    }
  },
  getProjectName(): ProjectName {
    return {
      projectName: 'Gym Management System',
    }
  },
}

export default base
