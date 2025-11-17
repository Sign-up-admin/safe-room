/**
 * 字段配置组合式函数
 * 提供字段类型、标签等配置管理
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'image'
  | 'file'
  | 'richtext'
  | 'password'
  | 'select'

export interface FieldConfig {
  label: string
  type: FieldType
  options?: Array<{ label: string; value: any }>
}

/**
 * 字段标签映射
 */
const columnLabelMap: Record<string, string> = {
  id: 'ID',
  name: '名称',
  title: '标题',
  content: '内容',
  price: '价格',
  status: '状态',
  addtime: '添加时间',
  updatetime: '更新时间',
  username: '用户名',
  password: '密码',
  phone: '手机号',
  email: '邮箱',
  address: '地址',
  description: '描述',
  image: '图片',
  url: '链接',
  type: '类型',
  sort: '排序',
  remark: '备注',
  // 扩展字段映射
  zhaopian: '照片',
  touxiang: '头像',
  jiaolianxingming: '教练姓名',
  yonghuxingming: '用户姓名',
  kechengmingcheng: '课程名称',
  huiyuankamingcheng: '会员卡名称',
  jianshenqicaimingcheng: '器材名称',
  xingbie: '性别',
  nianling: '年龄',
  shouji: '手机',
  dizhi: '地址',
  jianjie: '简介',
  xiangqing: '详情',
  jiage: '价格',
  shijian: '时间',
  riqi: '日期',
  zhuangtai: '状态',
  leixing: '类型',
  fenlei: '分类',
}

/**
 * 字段类型映射
 */
const fieldTypeMap: Record<string, FieldType> = {
  id: 'number',
  price: 'number',
  jiage: 'number',
  sort: 'number',
  nianling: 'number',
  addtime: 'datetime',
  updatetime: 'datetime',
  shijian: 'datetime',
  riqi: 'date',
  content: 'richtext',
  description: 'textarea',
  remark: 'textarea',
  jianjie: 'textarea',
  xiangqing: 'richtext',
  status: 'boolean',
  zhuangtai: 'boolean',
  // 图片字段
  image: 'image',
  url: 'image',
  zhaopian: 'image',
  touxiang: 'image',
  picture: 'image',
  photo: 'image',
  // 选择字段
  type: 'select',
  leixing: 'select',
  xingbie: 'select',
  fenlei: 'select',
  // 文件字段
  file: 'file',
  attachment: 'file',
}

/**
 * 字段配置组合式函数
 */
export function useFieldConfig() {
  /**
   * 获取字段标签
   */
  function getColumnLabel(column: string): string {
    return columnLabelMap[column] || column
  }

  /**
   * 获取字段类型
   */
  function getFieldType(column: string): FieldType {
    return fieldTypeMap[column] || 'text'
  }

  /**
   * 获取图片URL
   */
  function getImageUrl(url: string): string {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    // 从base工具获取基础URL
    const base = (window as any).$base || {}
    const baseUrl = base.url || 'http://localhost:8080/springboot1ngh61a2/'
    if (url.startsWith('upload/')) {
      return baseUrl + url
    }
    return baseUrl + 'upload/' + url
  }

  /**
   * 格式化单元格值
   */
  function formatCellValue(value: any, column: string): string {
    if (value === null || value === undefined) return '-'
    const fieldType = getFieldType(column)

    if (fieldType === 'datetime' || fieldType === 'date') {
      return value || '-'
    }
    if (typeof value === 'boolean') {
      return value ? '是' : '否'
    }
    if (typeof value === 'number' && column === 'status') {
      return value === 1 ? '启用' : '禁用'
    }
    // 图片字段显示预览
    if (fieldType === 'image' && value) {
      return '[图片]'
    }
    // 富文本字段显示摘要
    if (fieldType === 'richtext' && value) {
      const text = value.replace(/<[^>]*>/g, '').trim()
      return text.length > 50 ? text.substring(0, 50) + '...' : text || '-'
    }
    return String(value)
  }

  /**
   * 注册自定义字段配置
   */
  function registerFieldConfig(column: string, config: Partial<FieldConfig>) {
    if (config.label) {
      columnLabelMap[column] = config.label
    }
    if (config.type) {
      fieldTypeMap[column] = config.type
    }
  }

  return {
    getColumnLabel,
    getFieldType,
    getImageUrl,
    formatCellValue,
    registerFieldConfig,
  }
}

