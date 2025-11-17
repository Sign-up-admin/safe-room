import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/css/iconfont.css'
import '@/styles/theme.scss'
import config from './config/config'
import validate from './common/validate'
import { isAuth, getCurDateTime, getCurDate, isBackAuth } from './common/system'
import { TechButton, TechCard, Stepper } from '@/components/common'
// @ts-ignore - Vue component type declarations
import Breadcrumb from '@/components/Breadcrumb.vue'
// @ts-ignore - Vue component type declarations
import FileUpload from '@/components/FileUpload.vue'
// @ts-ignore - Vue component type declarations
import Editor from '@/components/Editor.vue'
import { encryptDes, decryptDes, encryptAes, decryptAes } from '@/common/des'
// import VueLuckyCanvas from '@lucky-canvas/vue' // 暂时注释，vue-demi 兼容性问题
import http from '@/common/http'
import { vueErrorHandler, setupErrorHandlers } from '@/common/errorHandler'

const app = createApp(App)

// 配置 Vue 全局错误处理器
app.config.errorHandler = vueErrorHandler

// 初始化全局错误处理器（包括 Promise 错误和全局 JavaScript 错误）
setupErrorHandlers()

// Use plugins
app.use(pinia)
app.use(router)
app.use(ElementPlus)
// app.use(VueLuckyCanvas) // 暂时注释，vue-demi 兼容性问题

// Register global components
app.component('Breadcrumb', Breadcrumb)
app.component('FileUpload', FileUpload)
app.component('Editor', Editor)
app.component('TechCard', TechCard)
app.component('TechButton', TechButton)
app.component('Stepper', Stepper)

// Global properties
app.config.globalProperties['$config'] = config
app.config.globalProperties['$validate'] = validate
app.config.globalProperties['isAuth'] = isAuth
app.config.globalProperties['isBackAuth'] = isBackAuth
app.config.globalProperties['getCurDateTime'] = getCurDateTime
app.config.globalProperties['getCurDate'] = getCurDate
app.config.globalProperties['encryptDes'] = encryptDes
app.config.globalProperties['decryptDes'] = decryptDes
app.config.globalProperties['encryptAes'] = encryptAes
app.config.globalProperties['decryptAes'] = decryptAes
app.config.globalProperties['$http'] = http

// Router afterEach hook for token update
router.afterEach((_to, from) => {
  if (from.path === '/login') {
    // Token is handled by http interceptor
  }
})

// Mount app
app.mount('#app')
