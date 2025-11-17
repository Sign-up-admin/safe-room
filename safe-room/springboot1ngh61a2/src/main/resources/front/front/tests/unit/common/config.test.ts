import { describe, expect, it } from 'vitest'
import config from '@/config/config'

describe('app config', () => {
  it('exposes base URLs and navigation entries', () => {
    expect(config.baseUrl).toMatch(/springboot1ngh61a2/)
    expect(config.name).toBe('/springboot1ngh61a2')
    expect(config.indexNav).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: '健身教练', url: '/index/jianshenjiaolian' }),
        expect.objectContaining({ name: '公告信息', url: '/index/news' }),
      ]),
    )
  })
})


