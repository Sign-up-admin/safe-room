import type { ModuleKey } from '@/types/modules'

export type FieldInputType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'date'
  | 'datetime'
  | 'image'
  | 'richtext'
  | 'switch'

export interface FieldOption {
  label: string
  value: string | number
}

export interface FieldConfig {
  prop: string
  label: string
  type?: FieldInputType
  required?: boolean
  options?: FieldOption[]
  placeholder?: string
  showInTable?: boolean
  showInSearch?: boolean
}

export interface ModuleConfig {
  key: ModuleKey
  name: string
  api: string
  primaryKey: string
  fields: FieldConfig[]
  defaultSort?: { prop: string; order: 'asc' | 'desc' }
}

const auditOptions: FieldOption[] = [
  { label: '待审核', value: '待审核' },
  { label: '已通过', value: '已通过' },
  { label: '已拒绝', value: '已拒绝' },
]

const payStatusOptions: FieldOption[] = [
  { label: '未支付', value: '未支付' },
  { label: '已支付', value: '已支付' },
]

const genderOptions: FieldOption[] = [
  { label: '男', value: '男' },
  { label: '女', value: '女' },
]

export const moduleConfigs: Record<ModuleKey, ModuleConfig> = {
  yonghu: {
    key: 'yonghu',
    name: '用户',
    api: '/yonghu',
    primaryKey: 'id',
    fields: [
      { prop: 'yonghuzhanghao', label: '账号', required: true, showInTable: true, showInSearch: true },
      { prop: 'mima', label: '密码', type: 'text', required: true },
      { prop: 'yonghuxingming', label: '姓名', required: true, showInTable: true },
      { prop: 'touxiang', label: '头像', type: 'image', showInTable: true },
      { prop: 'xingbie', label: '性别', type: 'select', options: genderOptions, showInTable: true },
      { prop: 'shengao', label: '身高', type: 'text' },
      { prop: 'tizhong', label: '体重', type: 'text' },
      { prop: 'shoujihaoma', label: '手机号', type: 'text', showInTable: true },
      { prop: 'huiyuankahao', label: '会员卡号', type: 'text', showInTable: true, showInSearch: true },
      { prop: 'youxiaoqizhi', label: '有效期至', type: 'date', showInTable: true },
      { prop: 'status', label: '状态', type: 'select', options: [
        { label: '正常', value: 0 },
        { label: '锁定', value: 1 },
      ] },
    ],
  },
  jianshenjiaolian: {
    key: 'jianshenjiaolian',
    name: '健身教练',
    api: '/jianshenjiaolian',
    primaryKey: 'id',
    fields: [
      { prop: 'jiaoliangonghao', label: '教练工号', required: true, showInTable: true, showInSearch: true },
      { prop: 'mima', label: '密码', required: true },
      { prop: 'jiaolianxingming', label: '教练姓名', required: true, showInTable: true },
      { prop: 'zhaopian', label: '照片', type: 'image', showInTable: true },
      { prop: 'xingbie', label: '性别', type: 'select', options: genderOptions, showInTable: true },
      { prop: 'nianling', label: '年龄', type: 'text', showInTable: true },
      { prop: 'shengao', label: '身高', type: 'text' },
      { prop: 'tizhong', label: '体重', type: 'text' },
      { prop: 'lianxidianhua', label: '联系电话', type: 'text', showInTable: true },
      { prop: 'sijiaojiage', label: '私教价格', type: 'number', showInTable: true },
      { prop: 'gerenjianjie', label: '个人简介', type: 'textarea' },
    ],
  },
  sijiaoyuyue: {
    key: 'sijiaoyuyue',
    name: '私教预约',
    api: '/sijiaoyuyue',
    primaryKey: 'id',
    fields: [
      { prop: 'yuyuebianhao', label: '预约编号', showInTable: true, showInSearch: true },
      { prop: 'jiaoliangonghao', label: '教练工号', showInSearch: true },
      { prop: 'jiaolianxingming', label: '教练姓名', showInTable: true },
      { prop: 'zhaopian', label: '教练照片', type: 'image' },
      { prop: 'sijiaojiage', label: '私教价格', type: 'number', showInTable: true },
      { prop: 'yuyueshijian', label: '预约时间', type: 'datetime', showInTable: true },
      { prop: 'yonghuzhanghao', label: '用户账号' },
      { prop: 'yonghuxingming', label: '用户姓名', showInTable: true },
      { prop: 'shoujihaoma', label: '手机号' },
      { prop: 'huiyuankahao', label: '会员卡号', required: true, showInTable: true },
      { prop: 'beizhu', label: '备注', type: 'textarea' },
      { prop: 'sfsh', label: '审核状态', type: 'select', options: auditOptions, showInTable: true },
      { prop: 'shhf', label: '审核回复', type: 'textarea' },
      { prop: 'ispay', label: '支付状态', type: 'select', options: payStatusOptions, showInTable: true },
    ],
  },
  kechengleixing: {
    key: 'kechengleixing',
    name: '课程类型',
    api: '/kechengleixing',
    primaryKey: 'id',
    fields: [
      { prop: 'kechengleixing', label: '课程类型', required: true, showInTable: true },
    ],
  },
  jianshenkecheng: {
    key: 'jianshenkecheng',
    name: '健身课程',
    api: '/jianshenkecheng',
    primaryKey: 'id',
    defaultSort: { prop: 'clicknum', order: 'desc' },
    fields: [
      { prop: 'kechengmingcheng', label: '课程名称', required: true, showInTable: true, showInSearch: true },
      { prop: 'kechengleixing', label: '课程类型', required: true, showInTable: true },
      { prop: 'tupian', label: '图片', type: 'image', showInTable: true },
      { prop: 'shangkeshijian', label: '上课时间', type: 'datetime', required: true, showInTable: true },
      { prop: 'shangkedidian', label: '上课地点', required: true, showInTable: true },
      { prop: 'kechengjiage', label: '课程价格', type: 'number', showInTable: true },
      { prop: 'kechengjianjie', label: '课程简介', type: 'richtext' },
      { prop: 'kechengshipin', label: '课程视频', type: 'text' },
      { prop: 'jiaoliangonghao', label: '教练工号', required: true, showInTable: true },
      { prop: 'jiaolianxingming', label: '教练姓名', showInTable: true },
    ],
  },
  kechengyuyue: {
    key: 'kechengyuyue',
    name: '课程预约',
    api: '/kechengyuyue',
    primaryKey: 'id',
    fields: [
      { prop: 'yuyuebianhao', label: '预约编号', showInTable: true, showInSearch: true },
      { prop: 'kechengmingcheng', label: '课程名称', showInTable: true },
      { prop: 'tupian', label: '课程图片', type: 'image' },
      { prop: 'kechengleixing', label: '课程类型', showInTable: true },
      { prop: 'shangkeshijian', label: '上课时间', type: 'text' },
      { prop: 'shangkedidian', label: '上课地点' },
      { prop: 'kechengjiage', label: '课程价格', type: 'number', showInTable: true },
      { prop: 'jiaoliangonghao', label: '教练工号' },
      { prop: 'jiaolianxingming', label: '教练姓名', showInTable: true },
      { prop: 'yuyueshijian', label: '预约时间', type: 'datetime', showInTable: true },
      { prop: 'huiyuankahao', label: '会员卡号', required: true, showInTable: true },
      { prop: 'yonghuzhanghao', label: '用户账号' },
      { prop: 'yonghuxingming', label: '用户姓名', showInTable: true },
      { prop: 'shoujihaoma', label: '手机号' },
      { prop: 'sfsh', label: '审核状态', type: 'select', options: auditOptions, showInTable: true },
      { prop: 'shhf', label: '审核回复', type: 'textarea' },
      { prop: 'ispay', label: '支付状态', type: 'select', options: payStatusOptions, showInTable: true },
    ],
  },
  kechengtuike: {
    key: 'kechengtuike',
    name: '课程退课',
    api: '/kechengtuike',
    primaryKey: 'id',
    fields: [
      { prop: 'yuyuebianhao', label: '预约编号', showInTable: true, showInSearch: true },
      { prop: 'kechengmingcheng', label: '课程名称', showInTable: true },
      { prop: 'tupian', label: '课程图片', type: 'image' },
      { prop: 'kechengleixing', label: '课程类型', showInTable: true },
      { prop: 'shangkeshijian', label: '上课时间', type: 'text' },
      { prop: 'shangkedidian', label: '上课地点' },
      { prop: 'kechengjiage', label: '课程价格', type: 'number', showInTable: true },
      { prop: 'jiaoliangonghao', label: '教练工号' },
      { prop: 'jiaolianxingming', label: '教练姓名', showInTable: true },
      { prop: 'shenqingshijian', label: '申请时间', type: 'datetime', showInTable: true },
      { prop: 'huiyuankahao', label: '会员卡号', required: true, showInTable: true },
      { prop: 'yonghuzhanghao', label: '用户账号' },
      { prop: 'yonghuxingming', label: '用户姓名', showInTable: true },
      { prop: 'shoujihaoma', label: '手机号' },
      { prop: 'tuikeyuanyin', label: '退课原因', type: 'textarea', required: true },
      { prop: 'sfsh', label: '审核状态', type: 'select', options: auditOptions, showInTable: true },
      { prop: 'shhf', label: '审核回复', type: 'textarea' },
      { prop: 'ispay', label: '支付状态', type: 'select', options: payStatusOptions, showInTable: true },
    ],
  },
  huiyuanka: {
    key: 'huiyuanka',
    name: '会员卡',
    api: '/huiyuanka',
    primaryKey: 'id',
    fields: [
      { prop: 'huiyuankamingcheng', label: '会员卡名称', required: true, showInTable: true, showInSearch: true },
      { prop: 'tupian', label: '图片', type: 'image', showInTable: true },
      { prop: 'youxiaoqi', label: '有效期', required: true, showInTable: true },
      { prop: 'jiage', label: '价格', type: 'number', showInTable: true },
      { prop: 'shiyongshuoming', label: '使用说明', type: 'textarea' },
      { prop: 'huiyuankaxiangqing', label: '会员卡详情', type: 'richtext' },
    ],
  },
  huiyuankagoumai: {
    key: 'huiyuankagoumai',
    name: '会员卡购买',
    api: '/huiyuankagoumai',
    primaryKey: 'id',
    fields: [
      { prop: 'huiyuankahao', label: '会员卡号', showInTable: true, showInSearch: true },
      { prop: 'huiyuankamingcheng', label: '会员卡名称', showInTable: true },
      { prop: 'tupian', label: '图片', type: 'image' },
      { prop: 'youxiaoqi', label: '有效期' },
      { prop: 'jiage', label: '价格', type: 'number', showInTable: true },
      { prop: 'goumairiqi', label: '购买日期', type: 'date', showInTable: true },
      { prop: 'yonghuzhanghao', label: '用户账号' },
      { prop: 'yonghuxingming', label: '用户姓名', showInTable: true },
      { prop: 'shoujihaoma', label: '手机号' },
      { prop: 'ispay', label: '支付状态', type: 'select', options: payStatusOptions, showInTable: true },
    ],
  },
  daoqitixing: {
    key: 'daoqitixing',
    name: '到期提醒',
    api: '/daoqitixing',
    primaryKey: 'id',
    fields: [
      { prop: 'yonghuzhanghao', label: '用户账号', showInSearch: true },
      { prop: 'yonghuxingming', label: '用户姓名', showInTable: true },
      { prop: 'touxiang', label: '头像', type: 'image' },
      { prop: 'huiyuankahao', label: '会员卡号', showInTable: true },
      { prop: 'youxiaoqizhi', label: '有效期至', type: 'date', showInTable: true },
      { prop: 'tixingshijian', label: '提醒时间', type: 'datetime', showInTable: true },
      { prop: 'beizhu', label: '备注', type: 'textarea' },
    ],
  },
  huiyuanxufei: {
    key: 'huiyuanxufei',
    name: '会员续费',
    api: '/huiyuanxufei',
    primaryKey: 'id',
    fields: [
      { prop: 'yonghuzhanghao', label: '用户账号', showInSearch: true },
      { prop: 'yonghuxingming', label: '用户姓名', showInTable: true },
      { prop: 'touxiang', label: '头像', type: 'image' },
      { prop: 'jiaofeibianhao', label: '缴费编号', showInTable: true, showInSearch: true },
      { prop: 'huiyuankamingcheng', label: '会员卡名称', required: true, showInTable: true },
      { prop: 'youxiaoqi', label: '有效期', showInTable: true },
      { prop: 'jiage', label: '价格', type: 'number', showInTable: true },
      { prop: 'xufeishijian', label: '续费时间', type: 'datetime', showInTable: true },
      { prop: 'ispay', label: '支付状态', type: 'select', options: payStatusOptions, showInTable: true },
    ],
  },
  jianshenqicai: {
    key: 'jianshenqicai',
    name: '健身器材',
    api: '/jianshenqicai',
    primaryKey: 'id',
    fields: [
      { prop: 'qicaimingcheng', label: '器材名称', required: true, showInTable: true, showInSearch: true },
      { prop: 'tupian', label: '图片', type: 'image', showInTable: true },
      { prop: 'pinpai', label: '品牌', showInTable: true },
      { prop: 'shiyongfangfa', label: '使用方法', type: 'textarea' },
      { prop: 'shoushenxiaoguo', label: '瘦身效果', type: 'textarea' },
      { prop: 'qicaijieshao', label: '器材介绍', type: 'richtext' },
      { prop: 'jiaoxueshipin', label: '教学视频', type: 'text' },
    ],
  },
  newstype: {
    key: 'newstype',
    name: '公告类型',
    api: '/newstype',
    primaryKey: 'id',
    fields: [
      { prop: 'typename', label: '类型名称', required: true, showInTable: true },
    ],
  },
  discussjianshenkecheng: {
    key: 'discussjianshenkecheng',
    name: '课程讨论',
    api: '/discussjianshenkecheng',
    primaryKey: 'id',
    fields: [
      { prop: 'refid', label: '课程ID', type: 'number', required: true, showInTable: true },
      { prop: 'userid', label: '用户ID', type: 'number', required: true },
      { prop: 'avatarurl', label: '头像', type: 'image' },
      { prop: 'nickname', label: '昵称', showInTable: true },
      { prop: 'content', label: '内容', type: 'textarea', required: true, showInTable: true },
      { prop: 'reply', label: '回复', type: 'textarea' },
    ],
  },
  chat: {
    key: 'chat',
    name: '留言反馈',
    api: '/chat',
    primaryKey: 'id',
    fields: [
      { prop: 'ask', label: '留言内容', type: 'textarea', required: true, showInTable: true },
      { prop: 'reply', label: '回复', type: 'textarea', showInTable: true },
      {
        prop: 'isreply',
        label: '回复状态',
        type: 'select',
        options: [
          { label: '待回复', value: 0 },
          { label: '已回复', value: 1 },
        ],
        showInTable: true,
      },
    ],
  },
  news: {
    key: 'news',
    name: '公告信息',
    api: '/news',
    primaryKey: 'id',
    fields: [
      { prop: 'title', label: '标题', required: true, showInTable: true, showInSearch: true },
      { prop: 'introduction', label: '简介', type: 'textarea' },
      { prop: 'typename', label: '分类', showInTable: true },
      { prop: 'name', label: '发布人', showInTable: true },
      { prop: 'picture', label: '封面', type: 'image', showInTable: true },
      { prop: 'content', label: '内容', type: 'richtext' },
    ],
  },
  messages: {
    key: 'messages',
    name: '消息',
    api: '/messages',
    primaryKey: 'id',
    fields: [
      { prop: 'title', label: '标题', required: true, showInTable: true, showInSearch: true },
      { prop: 'content', label: '内容', type: 'textarea', required: true },
      { prop: 'type', label: '类型', showInTable: true },
      { prop: 'isread', label: '已读', type: 'switch', showInTable: true },
    ],
  },
  storeup: {
    key: 'storeup',
    name: '收藏',
    api: '/storeup',
    primaryKey: 'id',
    fields: [
      { prop: 'tablename', label: '模块', showInTable: true, showInSearch: true },
      { prop: 'name', label: '名称', showInTable: true },
      { prop: 'picture', label: '图片', type: 'image', showInTable: true },
      { prop: 'type', label: '类型', showInTable: true },
      { prop: 'remark', label: '备注', type: 'textarea' },
    ],
  },
}

export function getModuleConfig(key: ModuleKey): ModuleConfig {
  return moduleConfigs[key]
}


