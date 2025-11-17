/**
 * API Endpoints Constants - Frontend
 * 前台API端点常量定义
 * 根据 docs/API.md 接口文档定义
 *
 * 前台路径约定：
 * - 列表：/{module}/list
 * - 详情：/{module}/detail/{id}
 * - 新增：/{module}/add
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
    DETAIL: (id: number | string) => `yonghu/detail/${id}`,
    ADD: 'yonghu/add',
    UPDATE: 'yonghu/update',
    DELETE: 'yonghu/delete',
    PAGE: 'yonghu/page',
    REMIND: (column: string, type: string) => `yonghu/remind/${column}/${type}`,
  },

  // ========== 教练相关 ==========
  JIANSHENJIAOLIAN: {
    LIST: 'jianshenjiaolian/list',
    DETAIL: (id: number | string) => `jianshenjiaolian/detail/${id}`,
    ADD: 'jianshenjiaolian/add',
    UPDATE: 'jianshenjiaolian/update',
    DELETE: 'jianshenjiaolian/delete',
    PAGE: 'jianshenjiaolian/page',
  },

  // ========== 课程相关 ==========
  JIANSHENKECHENG: {
    LIST: 'jianshenkecheng/list',
    DETAIL: (id: number | string) => `jianshenkecheng/detail/${id}`,
    ADD: 'jianshenkecheng/add',
    UPDATE: 'jianshenkecheng/update',
    DELETE: 'jianshenkecheng/delete',
    PAGE: 'jianshenkecheng/page',
    LISTS: 'jianshenkecheng/lists',
    QUERY: 'jianshenkecheng/query',
    AUTO_SORT: 'jianshenkecheng/autoSort',
    AUTO_SORT2: 'jianshenkecheng/autoSort2',
  },

  KECHENGLEIXING: {
    LIST: 'kechengleixing/list',
    DETAIL: (id: number | string) => `kechengleixing/detail/${id}`,
    ADD: 'kechengleixing/add',
    UPDATE: 'kechengleixing/update',
    DELETE: 'kechengleixing/delete',
  },

  // ========== 预约相关 ==========
  KECHENGYUYUE: {
    LIST: 'kechengyuyue/list',
    DETAIL: (id: number | string) => `kechengyuyue/detail/${id}`,
    ADD: 'kechengyuyue/add',
    UPDATE: 'kechengyuyue/update',
    DELETE: 'kechengyuyue/delete',
    PAGE: 'kechengyuyue/page',
    SH_BATCH: 'kechengyuyue/shBatch',
  },

  SIJIAOYUYUE: {
    LIST: 'sijiaoyuyue/list',
    DETAIL: (id: number | string) => `sijiaoyuyue/detail/${id}`,
    ADD: 'sijiaoyuyue/add',
    UPDATE: 'sijiaoyuyue/update',
    DELETE: 'sijiaoyuyue/delete',
    PAGE: 'sijiaoyuyue/page',
    SH_BATCH: 'sijiaoyuyue/shBatch',
  },

  KECHENGTUIKE: {
    LIST: 'kechengtuike/list',
    DETAIL: (id: number | string) => `kechengtuike/detail/${id}`,
    ADD: 'kechengtuike/add',
    UPDATE: 'kechengtuike/update',
    DELETE: 'kechengtuike/delete',
    PAGE: 'kechengtuike/page',
    SH_BATCH: 'kechengtuike/shBatch',
  },

  // ========== 会员卡相关 ==========
  HUIYUANKA: {
    LIST: 'huiyuanka/list',
    DETAIL: (id: number | string) => `huiyuanka/detail/${id}`,
    ADD: 'huiyuanka/add',
    UPDATE: 'huiyuanka/update',
    DELETE: 'huiyuanka/delete',
  },

  HUIYUANKAGOUMAI: {
    LIST: 'huiyuankagoumai/list',
    DETAIL: (id: number | string) => `huiyuankagoumai/detail/${id}`,
    ADD: 'huiyuankagoumai/add',
    UPDATE: 'huiyuankagoumai/update',
    DELETE: 'huiyuankagoumai/delete',
    PAGE: 'huiyuankagoumai/page',
  },

  HUIYUANXUFEI: {
    LIST: 'huiyuanxufei/list',
    DETAIL: (id: number | string) => `huiyuanxufei/detail/${id}`,
    ADD: 'huiyuanxufei/add',
    UPDATE: 'huiyuanxufei/update',
    DELETE: 'huiyuanxufei/delete',
    PAGE: 'huiyuanxufei/page',
  },

  // ========== 内容相关 ==========
  NEWS: {
    LIST: 'news/list',
    DETAIL: (id: number | string) => `news/detail/${id}`,
    ADD: 'news/add',
    UPDATE: 'news/update',
    DELETE: 'news/delete',
    PAGE: 'news/page',
    THUMBSUP: (id: number | string) => `news/thumbsup/${id}`,
  },

  NEWSTYPE: {
    LIST: 'newstype/list',
    DETAIL: (id: number | string) => `newstype/detail/${id}`,
    ADD: 'newstype/add',
    UPDATE: 'newstype/update',
    DELETE: 'newstype/delete',
  },

  DISCUSSJIANSHENKECHENG: {
    LIST: 'discussjianshenkecheng/list',
    DETAIL: (id: number | string) => `discussjianshenkecheng/detail/${id}`,
    ADD: 'discussjianshenkecheng/add',
    UPDATE: 'discussjianshenkecheng/update',
    DELETE: 'discussjianshenkecheng/delete',
    PAGE: 'discussjianshenkecheng/page',
    AUTO_SORT: 'discussjianshenkecheng/autoSort',
  },

  STOREUP: {
    LIST: 'storeup/list',
    DETAIL: (id: number | string) => `storeup/detail/${id}`,
    ADD: 'storeup/add',
    UPDATE: 'storeup/update',
    DELETE: 'storeup/delete',
    PAGE: 'storeup/page',
    AUTO_SORT: 'storeup/autoSort',
  },

  // ========== 其他模块 ==========
  CHAT: {
    LIST: 'chat/list',
    DETAIL: (id: number | string) => `chat/detail/${id}`,
    ADD: 'chat/add',
    UPDATE: 'chat/update',
    DELETE: 'chat/delete',
    PAGE: 'chat/page',
    AUTO_SORT: 'chat/autoSort',
  },

  CONFIG: {
    LIST: 'config/list',
    DETAIL: (id: number | string) => `config/detail/${id}`,
    ADD: 'config/add',
    UPDATE: 'config/update',
    DELETE: 'config/delete',
    PAGE: 'config/page',
  },

  DAOQITIXING: {
    LIST: 'daoqitixing/list',
    DETAIL: (id: number | string) => `daoqitixing/detail/${id}`,
    ADD: 'daoqitixing/add',
    UPDATE: 'daoqitixing/update',
    DELETE: 'daoqitixing/delete',
    PAGE: 'daoqitixing/page',
  },

  JIANSHENQICAI: {
    LIST: 'jianshenqicai/list',
    DETAIL: (id: number | string) => `jianshenqicai/detail/${id}`,
    ADD: 'jianshenqicai/add',
    UPDATE: 'jianshenqicai/update',
    DELETE: 'jianshenqicai/delete',
  },

  ASSETS: {
    LIST: 'assets/list',
  },

  ERROR_REPORT: {
    ADD: 'errorReport/add',
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
} as const

/**
 * 获取API端点
 * @param path - 点分隔的路径（如 'JIANSHENKECHENG.LIST'）
 * @returns API端点字符串或函数
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
 * 获取API端点字符串（如果是函数则调用）
 * @param path - 点分隔的路径
 * @param args - 函数参数
 * @returns API端点字符串
 */
export function getEndpointString(path: string, ...args: any[]): string {
  const endpoint = getEndpoint(path)
  if (typeof endpoint === 'function') {
    return endpoint(...args)
  }
  return endpoint
}
