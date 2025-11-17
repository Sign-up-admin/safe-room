/**
 * 字段映射组合式函数
 * 提供字段标签和类型映射功能
 */
import { computed } from 'vue'
import base from '@/utils/base'

// 字段名映射表
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

// 字段类型映射
const fieldTypeMap: Record<string, string> = {
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

// 选择字段选项映射
const selectOptionsMap: Record<string, Array<{ label: string; value: string | number }>> = {
  xingbie: [
    { label: '男', value: '男' },
    { label: '女', value: '女' },
  ],
  leixing: [
    { label: '健身课程', value: '健身课程' },
    { label: '私教课程', value: '私教课程' },
    { label: '团体课', value: '团体课' },
  ],
  type: [
    { label: '普通', value: '普通' },
    { label: 'VIP', value: 'VIP' },
    { label: '高级', value: '高级' },
  ],
  fenlei: [
    { label: '有氧运动', value: '有氧运动' },
    { label: '力量训练', value: '力量训练' },
    { label: '瑜伽', value: '瑜伽' },
    { label: '其他', value: '其他' },
  ],
}

/**
 * 字段映射组合式函数
 */
export function useFieldMapping() {
  // 获取字段标签
  const getColumnLabel = (column: string): string => columnLabelMap[column] || column

  // 获取字段类型
  const getFieldType = (column: string): string => fieldTypeMap[column] || 'text'

  // 获取图片URL
  const getImageUrl = (url: string): string => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    const baseConfig = base.get()
    const baseUrl = baseConfig.url || 'http://localhost:8080/springboot1ngh61a2/'
    if (url.startsWith('upload/')) {
      return baseUrl + url
    }
    return baseUrl + 'upload/' + url
  }

  // 格式化单元格值
  const formatCellValue = (value: unknown, column: string): string => {
    if (value === null || value === undefined) return '-'
    const fieldType = getFieldType(column)

    if (fieldType === 'datetime' || fieldType === 'date') {
      return String(value || '-')
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
      const text = String(value).replace(/<[^>]*>/g, '').trim()
      return text.length > 50 ? text.substring(0, 50) + '...' : text || '-'
    }
    return String(value)
  }

  // 获取选择字段选项
  const getSelectOptions = (column: string): Array<{ label: string; value: string | number }> => selectOptionsMap[column] || []

  // 生成表单验证规则
  const generateFormRules = (columns: string[]) => {
    const rules: Record<string, unknown[]> = {}
    columns.forEach(column => {
      if (column !== 'id') {
        const fieldType = getFieldType(column)
        const isRequired = !['addtime', 'updatetime', 'password'].includes(column)
        if (isRequired) {
          rules[column] = [{ required: true, message: `请输入${getColumnLabel(column)}`, trigger: fieldType === 'select' ? 'change' : 'blur' }]
        }
      }
    })
    return rules
  }

  return {
    columnLabelMap,
    fieldTypeMap,
    selectOptionsMap,
    getColumnLabel,
    getFieldType,
    getImageUrl,
    getSelectOptions,
    formatCellValue,
    generateFormRules,
  }
}

