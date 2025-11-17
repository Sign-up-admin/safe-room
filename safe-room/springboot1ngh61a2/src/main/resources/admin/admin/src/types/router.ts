/**
 * 路由相关类型定义
 */
import { RouteMeta } from 'vue-router'

/**
 * 路由元信息扩展
 */
export interface RouteMetaExtended extends RouteMeta {
  icon?: string
  title?: string
  affix?: boolean
  hidden?: boolean
  roles?: string[]
  permissions?: string[]
}

/**
 * 路由配置类型
 */
export interface RouteConfig {
  path: string
  name: string
  component?: () => Promise<unknown>
  meta?: RouteMetaExtended
  children?: RouteConfig[]
}

