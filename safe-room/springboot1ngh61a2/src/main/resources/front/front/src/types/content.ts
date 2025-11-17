export interface CarouselItem {
  id: number
  name?: string
  value?: string
  url?: string
}

export interface NewsItem {
  id: number
  title: string
  introduction?: string
  typename?: string
  picture?: string
  content?: string
  addtime?: string
  name?: string
  headportrait?: string
  clicknum?: number
}

export interface StoreupItem {
  id: number
  userid?: number
  refid?: number
  tablename?: string
  name?: string
  picture?: string
  type?: string
  inteltype?: string
  remark?: string
  addtime?: string
}
