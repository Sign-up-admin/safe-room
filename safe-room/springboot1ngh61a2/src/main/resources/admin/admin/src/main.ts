import { createApp } from 'vue'
import App from '@/App.vue'
import pinia from './stores'
import router from './router'
// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 导入需要手动注册的Element Plus组件（kebab-case版本）
import {
  ElMenu,
  ElMenuItem,
  ElMenuItemGroup,
  ElSubMenu
} from 'element-plus'
// Admin 样式系统（统一入口）
import '@/styles/index.scss'
// Import echart
import * as echarts from 'echarts'
import 'echarts-wordcloud'
// import 'echarts/theme/macarons.js' // 暂时注释掉，可能不存在
// Breadcrumb navigation, register as global component
import BreadCrumbs from '@/components/common/BreadCrumbs.vue'
// Upload component
import FileUpload from '@/components/common/FileUpload.vue'
import ExcelFileUpload from '@/components/common/ExcelFileUpload.vue'
// Rich text editor component
import Editor from '@/components/common/Editor.vue'
// Icons
import { setupIcons } from '@/icons'
import 'virtual:svg-icons-register'
// Error handler
import { vueErrorHandler, setupErrorHandlers } from '@/utils/errorHandler'
// Global properties (使用 provide/inject)
import { provideGlobalProperties } from '@/composables/useGlobalProperties'

const app = createApp(App)

// 配置 Vue 全局错误处理器
app.config.errorHandler = vueErrorHandler

// 初始化全局错误处理器（包括 Promise 错误和全局 JavaScript 错误）
setupErrorHandlers()

// Use plugins
app.use(pinia)
app.use(router)
// Element Plus with explicit configuration to ensure all components are registered
app.use(ElementPlus, {
  size: 'default',
  zIndex: 3000,
  // 确保所有组件都被注册
})

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// Element Plus 已经全局注册了所有组件，这些组件应该已经被包含在内
// 如果仍然有问题，可能是构建时的tree-shaking导致的

// Element Plus 已经通过 app.use(ElementPlus) 全局注册了所有组件
// 但是为了确保kebab-case版本也能正常工作，手动注册常用的组件
app.component('el-menu', ElMenu)
app.component('el-menu-item', ElMenuItem)
app.component('el-menu-item-group', ElMenuItemGroup)
app.component('el-submenu', ElSubMenu)

setupIcons(app)

// Register global components
app.component('BreadCrumbs', BreadCrumbs)
app.component('FileUpload', FileUpload)
app.component('ExcelFileUpload', ExcelFileUpload)
app.component('Editor', Editor)

// 提供全局属性（使用 provide/inject，同时保持向后兼容）
provideGlobalProperties(app)

// Mount app
app.mount('#app')
