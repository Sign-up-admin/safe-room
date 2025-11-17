import { computed, ref, readonly } from 'vue'
import type { Jianshenjiaolian } from '@/types/modules'

interface PackageOption {
  label: string
  sessions: number
  duration: string
  desc: string
}

interface PricingContext {
  coach: Jianshenjiaolian | null
  package: PackageOption | null
  goals: string[]
  location?: 'store' | 'home' // 门店/上门
  userLevel?: 'normal' | 'vip' | 'premium' // 用户等级
  couponCode?: string
}

interface PriceBreakdown {
  basePrice: number // 基础价格（教练单价 × 次数）
  packageDiscount: number // 套餐折扣
  goalSurcharge: number // 目标附加费
  locationSurcharge: number // 地点附加费
  membershipDiscount: number // 会员折扣
  couponDiscount: number // 优惠券折扣
  finalPrice: number // 最终价格
  savings: number // 节省金额
  savingsPercentage: number // 节省百分比
}

interface Coupon {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minOrder: number
  validUntil: Date
  description: string
}

// 模拟优惠券数据（实际应该从后端获取）
const availableCoupons: Coupon[] = [
  {
    code: 'FIRST_BOOKING',
    type: 'percentage',
    value: 15,
    minOrder: 1000,
    validUntil: new Date('2025-12-31'),
    description: '首次预约优惠'
  },
  {
    code: 'VIP_DISCOUNT',
    type: 'percentage',
    value: 20,
    minOrder: 1500,
    validUntil: new Date('2025-12-31'),
    description: 'VIP会员专享'
  },
  {
    code: 'NEW_USER',
    type: 'fixed',
    value: 200,
    minOrder: 800,
    validUntil: new Date('2025-11-30'),
    description: '新用户立减'
  }
]

export function usePricingEngine() {
  const context = ref<PricingContext>({
    coach: null,
    package: null,
    goals: [],
    location: 'store',
    userLevel: 'normal'
  })

  // 计算套餐折扣系数
  const getPackageDiscountFactor = (sessions: number): number => {
    if (sessions >= 20) return 0.85 // 20次及以上85折
    if (sessions >= 12) return 0.9 // 12次及以上9折
    if (sessions >= 8) return 0.95 // 8次及以上95折
    return 1.0 // 少于8次无折扣
  }

  // 计算目标附加费系数
  const getGoalSurchargeFactor = (goals: string[]): number => {
    let factor = 1.0

    if (goals.includes('功能康复')) {
      factor *= 1.1 // 康复训练加10%
    }
    if (goals.includes('体态修复')) {
      factor *= 1.05 // 体态修复加5%
    }
    if (goals.includes('青少年训练')) {
      factor *= 1.08 // 青少年训练加8%
    }

    return factor
  }

  // 计算地点附加费
  const getLocationSurcharge = (location: string, basePrice: number): number => {
    if (location === 'home') {
      return basePrice * 0.15 // 上门服务加15%
    }
    return 0
  }

  // 计算会员折扣
  const getMembershipDiscount = (userLevel: string, basePrice: number): number => {
    switch (userLevel) {
      case 'premium':
        return basePrice * 0.25 // 高级会员75折
      case 'vip':
        return basePrice * 0.15 // VIP会员85折
      default:
        return 0
    }
  }

  // 应用优惠券
  const applyCoupon = (couponCode: string | undefined, subtotal: number): { discount: number; coupon: Coupon | null } => {
    if (!couponCode) return { discount: 0, coupon: null }

    const coupon = availableCoupons.find(c =>
      c.code === couponCode &&
      c.validUntil > new Date() &&
      subtotal >= c.minOrder
    )

    if (!coupon) return { discount: 0, coupon: null }

    let discount = 0
    if (coupon.type === 'percentage') {
      discount = subtotal * (coupon.value / 100)
    } else {
      discount = Math.min(coupon.value, subtotal)
    }

    return { discount, coupon }
  }

  // 计算详细价格分解
  const priceBreakdown = computed((): PriceBreakdown => {
    const { coach, package: pkg, goals, location, userLevel, couponCode } = context.value

    if (!coach || !pkg) {
      return {
        basePrice: 0,
        packageDiscount: 0,
        goalSurcharge: 0,
        locationSurcharge: 0,
        membershipDiscount: 0,
        couponDiscount: 0,
        finalPrice: 0,
        savings: 0,
        savingsPercentage: 0
      }
    }

    const basePricePerSession = coach.sijiaojiage || 499
    const basePrice = basePricePerSession * pkg.sessions

    const packageDiscountFactor = getPackageDiscountFactor(pkg.sessions)
    const packageDiscount = basePrice * (1 - packageDiscountFactor)

    const discountedPriceAfterPackage = basePrice * packageDiscountFactor

    const goalFactor = getGoalSurchargeFactor(goals)
    const goalSurcharge = discountedPriceAfterPackage * (goalFactor - 1)

    const priceAfterGoals = discountedPriceAfterPackage * goalFactor

    const locationSurcharge = getLocationSurcharge(location || 'store', priceAfterGoals)

    const priceAfterLocation = priceAfterGoals + locationSurcharge

    const membershipDiscount = getMembershipDiscount(userLevel || 'normal', priceAfterLocation)

    const priceAfterMembership = priceAfterLocation - membershipDiscount

    const { discount: couponDiscount } = applyCoupon(couponCode, priceAfterMembership)

    const finalPrice = Math.max(0, priceAfterMembership - couponDiscount)
    const totalDiscounts = packageDiscount + goalSurcharge + locationSurcharge - membershipDiscount - couponDiscount
    const savings = Math.max(0, totalDiscounts)
    const savingsPercentage = basePrice > 0 ? (savings / basePrice) * 100 : 0

    return {
      basePrice,
      packageDiscount,
      goalSurcharge,
      locationSurcharge,
      membershipDiscount,
      couponDiscount,
      finalPrice,
      savings,
      savingsPercentage
    }
  })

  // 格式化价格显示
  const formatPrice = (price: number): string => {
    return `¥${price.toFixed(2)}`
  }

  // 验证优惠券
  const validateCoupon = (code: string, subtotal: number): { valid: boolean; coupon: Coupon | null; message: string } => {
    const coupon = availableCoupons.find(c => c.code === code)

    if (!coupon) {
      return { valid: false, coupon: null, message: '优惠券不存在' }
    }

    if (coupon.validUntil <= new Date()) {
      return { valid: false, coupon: null, message: '优惠券已过期' }
    }

    if (subtotal < coupon.minOrder) {
      return { valid: false, coupon: null, message: `订单金额需满¥${coupon.minOrder}` }
    }

    return { valid: true, coupon, message: '优惠券可用' }
  }

  // 获取可用优惠券
  const getAvailableCoupons = (subtotal: number): Coupon[] => {
    return availableCoupons.filter(coupon =>
      coupon.validUntil > new Date() && subtotal >= coupon.minOrder
    )
  }

  // 更新定价上下文
  const updateContext = (updates: Partial<PricingContext>) => {
    context.value = { ...context.value, ...updates }
  }

  // 重置上下文
  const resetContext = () => {
    context.value = {
      coach: null,
      package: null,
      goals: [],
      location: 'store',
      userLevel: 'normal'
    }
  }

  return {
    context: readonly(context),
    priceBreakdown,
    formatPrice,
    validateCoupon,
    getAvailableCoupons,
    updateContext,
    resetContext
  }
}
