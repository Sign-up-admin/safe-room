/**
 * API Endpoints Constants - Admin
 * 后台API端点常量定义
 * 根据 docs/API.md 接口文档定义
 *
 * 后台路径约定：
 * - 列表：/{module}/list
 * - 详情：/{module}/info/{id}
 * - 新增：/{module}/save
 * - 更新：/{module}/update
 * - 删除：/{module}/delete
 */

export const API_ENDPOINTS = {
  // ========== 鉴权与账号体系 ==========
  AUTH: {
    // 登录（支持多种角色）
    LOGIN: (tableName: string) => `/${tableName}/login`,
    // 注册
    REGISTER: (tableName: string) => `/${tableName}/register`,
    // 重置密码
    RESET_PASS: (tableName: string) => `/${tableName}/resetPass`,
    // 退出登录
    LOGOUT: (tableName: string) => `/${tableName}/logout`,
    // 获取Session信息
    SESSION: (tableName: string) => `/${tableName}/session`,
  },

  // ========== 会员相关 ==========
  YONGHU: {
    LIST: 'yonghu/list',
    INFO: (id: number | string) => `yonghu/info/${id}`,
    SAVE: 'yonghu/save',
    UPDATE: 'yonghu/update',
    DELETE: 'yonghu/delete',
    PAGE: 'yonghu/page',
    REMIND: (column: string, type: string) => `yonghu/remind/${column}/${type}`,
  },

  // ========== 教练相关 ==========
  JIANSHENJIAOLIAN: {
    LIST: 'jianshenjiaolian/list',
    INFO: (id: number | string) => `jianshenjiaolian/info/${id}`,
    SAVE: 'jianshenjiaolian/save',
    UPDATE: 'jianshenjiaolian/update',
    DELETE: 'jianshenjiaolian/delete',
    PAGE: 'jianshenjiaolian/page',
  },

  // ========== 课程相关 ==========
  JIANSHENKECHENG: {
    LIST: 'jianshenkecheng/list',
    INFO: (id: number | string) => `jianshenkecheng/info/${id}`,
    SAVE: 'jianshenkecheng/save',
    UPDATE: 'jianshenkecheng/update',
    DELETE: 'jianshenkecheng/delete',
    PAGE: 'jianshenkecheng/page',
    AUTO_SORT: 'jianshenkecheng/autoSort',
    AUTO_SORT2: 'jianshenkecheng/autoSort2',
  },

  KECHENGLEIXING: {
    LIST: 'kechengleixing/list',
    INFO: (id: number | string) => `kechengleixing/info/${id}`,
    SAVE: 'kechengleixing/save',
    UPDATE: 'kechengleixing/update',
    DELETE: 'kechengleixing/delete',
  },

  // ========== 预约相关 ==========
  KECHENGYUYUE: {
    LIST: 'kechengyuyue/list',
    INFO: (id: number | string) => `kechengyuyue/info/${id}`,
    SAVE: 'kechengyuyue/save',
    UPDATE: 'kechengyuyue/update',
    DELETE: 'kechengyuyue/delete',
    PAGE: 'kechengyuyue/page',
    SH_BATCH: 'kechengyuyue/shBatch',
  },

  SIJIAOYUYUE: {
    LIST: 'sijiaoyuyue/list',
    INFO: (id: number | string) => `sijiaoyuyue/info/${id}`,
    SAVE: 'sijiaoyuyue/save',
    UPDATE: 'sijiaoyuyue/update',
    DELETE: 'sijiaoyuyue/delete',
    PAGE: 'sijiaoyuyue/page',
    SH_BATCH: 'sijiaoyuyue/shBatch',
  },

  KECHENGTUIKE: {
    LIST: 'kechengtuike/list',
    INFO: (id: number | string) => `kechengtuike/info/${id}`,
    SAVE: 'kechengtuike/save',
    UPDATE: 'kechengtuike/update',
    DELETE: 'kechengtuike/delete',
    PAGE: 'kechengtuike/page',
    SH_BATCH: 'kechengtuike/shBatch',
  },

  // ========== 会员卡相关 ==========
  HUIYUANKA: {
    LIST: 'huiyuanka/list',
    INFO: (id: number | string) => `huiyuanka/info/${id}`,
    SAVE: 'huiyuanka/save',
    UPDATE: 'huiyuanka/update',
    DELETE: 'huiyuanka/delete',
  },

  HUIYUANKAGOUMAI: {
    LIST: 'huiyuankagoumai/list',
    INFO: (id: number | string) => `huiyuankagoumai/info/${id}`,
    SAVE: 'huiyuankagoumai/save',
    UPDATE: 'huiyuankagoumai/update',
    DELETE: 'huiyuankagoumai/delete',
    PAGE: 'huiyuankagoumai/page',
  },

  HUIYUANXUFEI: {
    LIST: 'huiyuanxufei/list',
    INFO: (id: number | string) => `huiyuanxufei/info/${id}`,
    SAVE: 'huiyuanxufei/save',
    UPDATE: 'huiyuanxufei/update',
    DELETE: 'huiyuanxufei/delete',
    PAGE: 'huiyuanxufei/page',
  },

  // ========== 内容相关 ==========
  NEWS: {
    LIST: 'news/list',
    INFO: (id: number | string) => `news/info/${id}`,
    SAVE: 'news/save',
    UPDATE: 'news/update',
    DELETE: 'news/delete',
    PAGE: 'news/page',
    THUMBSUP: (id: number | string) => `news/thumbsup/${id}`,
  },

  NEWSTYPE: {
    LIST: 'newstype/list',
    INFO: (id: number | string) => `newstype/info/${id}`,
    SAVE: 'newstype/save',
    UPDATE: 'newstype/update',
    DELETE: 'newstype/delete',
  },

  DISCUSSJIANSHENKECHENG: {
    LIST: 'discussjianshenkecheng/list',
    INFO: (id: number | string) => `discussjianshenkecheng/info/${id}`,
    SAVE: 'discussjianshenkecheng/save',
    UPDATE: 'discussjianshenkecheng/update',
    DELETE: 'discussjianshenkecheng/delete',
    PAGE: 'discussjianshenkecheng/page',
    AUTO_SORT: 'discussjianshenkecheng/autoSort',
  },

  STOREUP: {
    LIST: 'storeup/list',
    INFO: (id: number | string) => `storeup/info/${id}`,
    SAVE: 'storeup/save',
    UPDATE: 'storeup/update',
    DELETE: 'storeup/delete',
    PAGE: 'storeup/page',
    AUTO_SORT: 'storeup/autoSort',
  },

  // ========== 其他模块 ==========
  CHAT: {
    LIST: 'chat/list',
    INFO: (id: number | string) => `chat/info/${id}`,
    SAVE: 'chat/save',
    UPDATE: 'chat/update',
    DELETE: 'chat/delete',
    PAGE: 'chat/page?sort=addtime&order=desc&isreply=1',
    PAGE_BY_USER_ID: 'chat/page?sort=addtime&order=asc&userid=',
    AUTO_SORT: 'chat/autoSort',
  },

  CONFIG: {
    LIST: 'config/list',
    INFO: (id: number | string) => `config/info/${id}`,
    SAVE: 'config/save',
    UPDATE: 'config/update',
    DELETE: 'config/delete',
    PAGE: 'config/page',
  },

  DAOQITIXING: {
    LIST: 'daoqitixing/list',
    INFO: (id: number | string) => `daoqitixing/info/${id}`,
    SAVE: 'daoqitixing/save',
    UPDATE: 'daoqitixing/update',
    DELETE: 'daoqitixing/delete',
    PAGE: 'daoqitixing/page',
  },

  JIANSHENQICAI: {
    LIST: 'jianshenqicai/list',
    INFO: (id: number | string) => `jianshenqicai/info/${id}`,
    SAVE: 'jianshenqicai/save',
    UPDATE: 'jianshenqicai/update',
    DELETE: 'jianshenqicai/delete',
  },

  ASSETS: {
    LIST: 'assets/list',
    INFO: (id: number | string) => `assets/info/${id}`,
    SAVE: 'assets/save',
    UPDATE: 'assets/update',
    DELETE: 'assets/delete',
    PAGE: 'assets/page',
    BATCH_STATUS: 'assets/batchStatus',
  },

  USERS: {
    LIST: 'users/list',
    INFO: (id: number | string) => `users/info/${id}`,
    SAVE: 'users/save',
    UPDATE: 'users/update',
    DELETE: 'users/delete',
    LOGIN: 'users/login',
    REGISTER: 'users/register',
    RESET_PASS: 'users/resetPass',
    PAGE: 'users/page',
  },

  // ========== 系统管理 ==========
  OPERATION_LOG: {
    LIST: 'operationLog/list',
    INFO: (id: number | string) => `operationLog/info/${id}`,
    PAGE: 'operationLog/page',
    EXPORT: 'operationLog/export',
  },

  ERROR_REPORT: {
    LIST: 'errorReport/list',
    INFO: (id: number | string) => `errorReport/info/${id}`,
    SAVE: 'errorReport/save',
    UPDATE: 'errorReport/update',
    DELETE: 'errorReport/delete',
  },

  SERVICE_STATUS: {
    LIST: 'common/service-status',
  },

  LEGAL_TERMS: {
    LIST: 'legalterms/list',
    INFO: (id: number | string) => `legalterms/info/${id}`,
    SAVE: 'legalterms/save',
    UPDATE: 'legalterms/update',
    DELETE: 'legalterms/delete',
    PAGE: 'legalterms/page',
  },

  // ========== 文件相关 ==========
  FILE: {
    UPLOAD: 'file/upload',
    UPLOAD_ASSET: 'file/uploadAsset',
    DOWNLOAD: 'file/download',
    DELETE: 'file/delete',
    VIDEO: (fileName: string) => `file/video/${fileName}`,
    VIDEO_INFO: (fileName: string) => `file/video/info/${fileName}`,
    LIST: 'file/list',
    PREVIEW: (fileName: string) => `file/preview/${fileName}`,
    PRESIGNED: (fileName: string) => `file/presigned/${fileName}`,
  },

  // ========== 通用接口 ==========
  COMMON: {
    OPTION: (table: string, column: string) => `common/option/${table}/${column}`,
    FOLLOW: (table: string, column: string) => `common/follow/${table}/${column}`,
    SH: (table: string) => `common/sh/${table}`,
    REMIND: (table: string, column: string, type: string) => `common/remind/${table}/${column}/${type}`,
    CAL: (table: string, column: string) => `common/cal/${table}/${column}`,
    GROUP: (table: string, column: string) => `common/group/${table}/${column}`,
    VALUE: (table: string, x: string, y: string) => `common/value/${table}/${x}/${y}`,
    VALUE_TIME: (table: string, x: string, y: string, timeStatType: string) =>
      `common/value/${table}/${x}/${y}/${timeStatType}`,
  },

  // ========== 统计接口 ==========
  // 统计接口格式：/{module}/value/*、/{module}/group/*、/{module}/count
  STATS: {
    // 按模块生成统计端点
    VALUE: (module: string, x: string, y: string) => `${module}/value/${x}/${y}`,
    VALUE_TIME: (module: string, x: string, y: string, timeStatType: string) =>
      `${module}/value/${x}/${y}/${timeStatType}`,
    GROUP: (module: string, column: string) => `${module}/group/${column}`,
    COUNT: (module: string) => `${module}/count`,
  },

  // ========== 兼容旧版本（保留） ==========
  // Orders (如果存在)
  ORDER: {
    PAGE: 'orders/page',
    DELETE: 'orders/delete',
    INFO: (id: number | string) => `orders/info/${id}`,
    SAVE: 'orders/save',
    UPDATE: 'orders/update',
  },

  // Menu
  MENU: {
    LIST: 'menu/list',
  },

  // Session
  SESSION: {
    GET: '/session',
  },

  // Count endpoints (保留旧版本兼容)
  COUNT: {
    USER: 'yonghu/count',
    FITNESS_COURSE: 'jianshenkecheng/count',
    COURSE_RESERVATION: 'kechengyuyue/count',
    COURSE_REFUND: 'kechengtuike/count',
    MEMBERSHIP_PURCHASE: 'huiyuankagoumai/count',
  },

  // Chart data endpoints (保留旧版本兼容)
  CHART: {
    COURSE_RESERVATION_DAILY: 'kechengyuyue/value/yuyueshijian/kechengjiage/day',
    COURSE_REFUND_DAILY: 'kechengtuike/value/shenqingshijian/kechengjiage/day',
    MEMBERSHIP_PURCHASE_GROUP: 'huiyuankagoumai/group/huiyuankamingcheng',
    MEMBERSHIP_RENEWAL_DAILY: 'huiyuanxufei/value/xufeishijian/jiage/day',
  },
} as const

/**
 * Get API endpoint by key path
 * @param {string} path - Dot-separated path (e.g., 'CHAT.PAGE')
 * @returns {string} API endpoint or function
 */
export function getEndpoint(path: string): string | ((...args: any[]) => string) {
  const keys = path.split('.')
  let result: any = API_ENDPOINTS
  for (const key of keys) {
    if (result[key] === undefined) {
      throw new Error(`API endpoint not found: ${path}`)
    }
    result = result[key]
  }
  return result
}

/**
 * Get API endpoint string (if function then call it)
 * @param {string} path - Dot-separated path
 * @param {...any} args - Function arguments
 * @returns {string} API endpoint string
 */
export function getEndpointString(path: string, ...args: any[]): string {
  const endpoint = getEndpoint(path)
  if (typeof endpoint === 'function') {
    return endpoint(...args)
  }
  return endpoint
}
