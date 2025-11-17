/**
 * 字段标签和类型映射常量
 */

import type { ColumnLabelMap, FieldTypeMap } from '@/types/crud'

/**
 * 字段名到中文标签的映射
 */
export const COLUMN_LABEL_MAP: ColumnLabelMap = {
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
 * 字段名到字段类型的映射
 */
export const FIELD_TYPE_MAP: FieldTypeMap = {
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
 * 默认隐藏的列
 */
export const DEFAULT_HIDDEN_COLUMNS = ['addtime', 'password']

