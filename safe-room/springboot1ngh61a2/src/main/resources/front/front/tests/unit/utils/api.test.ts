import { describe, expect, it } from 'vitest'
import api from '../../../src/utils/api'

describe('API utilities', () => {
  describe('api endpoints object', () => {
    it('should export api object with expected structure', () => {
      expect(api).toBeDefined()
      expect(typeof api).toBe('object')
    })

    it('should contain file upload endpoints', () => {
      expect(api.fileupload).toBe('file/upload')
    })

    it('should contain menu endpoints', () => {
      expect(api.menulist).toBe('menu/list')
    })

    it('should contain session endpoints', () => {
      expect(api.session).toBe('/session')
    })

    it('should contain count endpoints', () => {
      expect(api.usercount).toBe('yonghu/count')
      expect(api.fitnesscoursecount).toBe('jianshenkecheng/count')
      expect(api.coursereservationcount).toBe('kechengyuyue/count')
      expect(api.courserefundcount).toBe('kechengtuike/count')
      expect(api.membershippurchasecount).toBe('huiyuankagoumai/count')
    })

    it('should contain chart data endpoints', () => {
      expect(api.reservationdaily).toBe('kechengyuyue/value/yuyueshijian/kechengjiage/day')
      expect(api.refunddaily).toBe('kechengtuike/value/shenqingshijian/kechengjiage/day')
      expect(api.membershippurchasegroup).toBe('huiyuankagoumai/group/huiyuankamingcheng')
      expect(api.membershiprenewaldaily).toBe('huiyuanxufei/value/xufeishijian/jiage/day')
    })

    it('should contain legacy compatibility properties', () => {
      expect(api.orderInfo).toBe('orders/info')
      expect(api.configUpdate).toBe('config/update')
      expect(api.userCount).toBe('yonghu/count')
    })

    it('should have all expected properties', () => {
      const expectedProperties = [
        'fileupload',
        'menulist',
        'session',
        'usercount',
        'fitnesscoursecount',
        'coursereservationcount',
        'courserefundcount',
        'membershippurchasecount',
        'reservationdaily',
        'refunddaily',
        'membershippurchasegroup',
        'membershiprenewaldaily',
        'orderInfo',
        'configUpdate',
        'userCount'
      ]

      expectedProperties.forEach(prop => {
        expect(api).toHaveProperty(prop)
      })
    })
  })
})
