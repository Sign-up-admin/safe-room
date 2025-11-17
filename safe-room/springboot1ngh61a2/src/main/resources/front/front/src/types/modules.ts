/**
 * Module entity type definitions that mirror backend database tables.
 * Keep fields optional when they are generated on the server or not required on create.
 */

export interface BaseEntity {
  id?: number
  addtime?: string
}

export interface Yonghu extends BaseEntity {
  yonghuzhanghao: string
  mima: string
  yonghuxingming: string
  touxiang?: string
  xingbie?: string
  shengao?: string
  tizhong?: string
  shoujihaoma?: string
  huiyuankahao?: string
  youxiaoqizhi?: string
  status?: number
}

export interface Jianshenjiaolian extends BaseEntity {
  jiaoliangonghao: string
  mima: string
  jiaolianxingming: string
  zhaopian?: string
  xingbie: string
  nianling?: string
  shengao?: string
  tizhong?: string
  lianxidianhua?: string
  sijiaojiage?: number
  gerenjianjie?: string
  kechengjianjie?: string
  jiaolianjieshao?: string
  touxiang?: string
  // Extended properties for frontend use
  recommendReason?: string
  rating?: number
}

export interface Sijiaoyuyue extends BaseEntity {
  yuyuebianhao?: string
  jiaoliangonghao?: string
  jiaolianxingming?: string
  zhaopian?: string
  sijiaojiage?: number
  yuyueshijian: string
  yonghuzhanghao?: string
  yonghuxingming?: string
  shoujihaoma?: string
  huiyuankahao: string
  beizhu?: string
  sfsh?: string
  shhf?: string
  ispay?: string
}

export interface Kechengleixing extends BaseEntity {
  kechengleixing?: string
}

export interface Jianshenkecheng extends BaseEntity {
  kechengmingcheng: string
  kechengleixing: string
  tupian?: string
  shangkeshijian: string
  shangkedidian: string
  kechengjiage?: number
  kechengjianjie?: string
  kechengjieshao?: string
  kechengshipin?: string
  jiaoliangonghao: string
  jiaolianxingming?: string
  clicktime?: string
  clicknum?: number
  discussnum?: number
  storeupnum?: number
}

export interface Kechengyuyue extends BaseEntity {
  yuyuebianhao?: string
  kechengmingcheng?: string
  tupian?: string
  kechengleixing?: string
  shangkeshijian?: string
  shangkedidian?: string
  kechengjiage?: number
  jiaoliangonghao?: string
  jiaolianxingming?: string
  yuyueshijian?: string
  huiyuankahao: string
  yonghuzhanghao?: string
  yonghuxingming?: string
  shoujihaoma?: string
  sfsh?: string
  shhf?: string
  ispay?: string
  // Extended properties for frontend use
  zhuangtai?: string
}

export interface Kechengtuike extends BaseEntity {
  yuyuebianhao?: string
  kechengmingcheng?: string
  tupian?: string
  kechengleixing?: string
  shangkeshijian?: string
  shangkedidian?: string
  kechengjiage?: number
  jiaoliangonghao?: string
  jiaolianxingming?: string
  shenqingshijian?: string
  huiyuankahao: string
  yonghuzhanghao?: string
  yonghuxingming?: string
  shoujihaoma?: string
  tuikeyuanyin: string
  sfsh?: string
  shhf?: string
  ispay?: string
}

export interface Huiyuanka extends BaseEntity {
  huiyuankamingcheng: string
  tupian?: string
  youxiaoqi: string
  jiage?: number
  shiyongshuoming?: string
  huiyuankaxiangqing?: string
}

export interface Huiyuankagoumai extends BaseEntity {
  huiyuankahao?: string
  huiyuankamingcheng?: string
  tupian?: string
  youxiaoqi?: string
  jiage?: number
  goumairiqi?: string
  yonghuzhanghao?: string
  yonghuxingming?: string
  shoujihaoma?: string
  ispay?: string
  // Extended properties for frontend use
  beizhu?: string
}

export interface Daoqitixing extends BaseEntity {
  yonghuzhanghao?: string
  yonghuxingming?: string
  touxiang?: string
  huiyuankahao?: string
  youxiaoqizhi?: string
  tixingshijian?: string
  beizhu?: string
}

export interface Huiyuanxufei extends BaseEntity {
  yonghuzhanghao?: string
  yonghuxingming?: string
  touxiang?: string
  jiaofeibianhao?: string
  huiyuankamingcheng: string
  youxiaoqi?: string
  jiage?: number
  xufeishijian?: string
  xufeijine?: string
  ispay?: string
}

export interface Jianshenqicai extends BaseEntity {
  qicaimingcheng: string
  tupian?: string
  pinpai?: string
  shiyongfangfa?: string
  shoushenxiaoguo?: string
  qicaijieshao?: string
  jiaoxueshipin?: string
  // Extended properties for frontend use
  zhongliang?: string
  chicun?: string
  detail?: string
  qicaileixing?: string
  nandu?: string
  shiyongrenqun?: string
}

export interface Newstype extends BaseEntity {
  typename: string
}

export interface Discussjianshenkecheng extends BaseEntity {
  refid: number
  userid: number
  avatarurl?: string
  nickname?: string
  content: string
  reply?: string
  // Extended properties for frontend use
  tags?: string[]
  replies?: any[]
  replyCount?: number
  likes?: number
  viewCount?: number
  isPinned?: boolean
  isFeatured?: boolean
  isHot?: boolean
  userLevel?: number
  showMenu?: boolean
  replyContent?: string
  attachments?: any[]
}

export interface Chat extends BaseEntity {
  userid?: number
  adminid?: number
  ask?: string
  reply?: string
  isreply?: number
}

export interface News extends BaseEntity {
  title: string
  introduction?: string
  typename?: string
  name?: string
  headportrait?: string
  clicknum?: number
  clicktime?: string
  thumbsupnum?: number
  crazilynum?: number
  storeupnum?: number
  picture?: string
  content?: string
}

export interface MessageEntity extends BaseEntity {
  userid: number
  title: string
  content: string
  type: 'system' | 'reminder' | 'promotion'
  isread: number
  relatedType?: string
  relatedId?: number
}

export interface StoreupItem extends BaseEntity {
  userid: number
  refid: number
  tablename: string
  name?: string
  picture?: string
  type?: string
  remark?: string
}

export interface ModuleEntityMap {
  yonghu: Yonghu
  jianshenjiaolian: Jianshenjiaolian
  sijiaoyuyue: Sijiaoyuyue
  kechengleixing: Kechengleixing
  jianshenkecheng: Jianshenkecheng
  kechengyuyue: Kechengyuyue
  kechengtuike: Kechengtuike
  huiyuanka: Huiyuanka
  huiyuankagoumai: Huiyuankagoumai
  daoqitixing: Daoqitixing
  huiyuanxufei: Huiyuanxufei
  jianshenqicai: Jianshenqicai
  newstype: Newstype
  discussjianshenkecheng: Discussjianshenkecheng
  chat: Chat
  news: News
  messages: MessageEntity
  storeup: StoreupItem
}

export type ModuleKey = keyof ModuleEntityMap

export type ModuleEntity<K extends ModuleKey = ModuleKey> = ModuleEntityMap[K]


