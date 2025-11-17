import { App } from 'vue'
import SvgIcon from '@/components/SvgIcon/index.vue' // svg component

// register globally
export function setupIcons(app: App) {
  app.component('SvgIcon', SvgIcon)
}

// Import all SVG files - vite-plugin-svg-icons will handle this
// The plugin is configured in vite.config.ts
