/**
 * API utility module
 * Provides API endpoint access with backward compatibility
 * @deprecated Use constants/apiEndpoints.ts for new code
 */
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

const api = {
  // Customer service
  chatpage: API_ENDPOINTS.CHAT.PAGE,
  chatbyuseridpage: API_ENDPOINTS.CHAT.PAGE_BY_USER_ID,
  chatsave: API_ENDPOINTS.CHAT.SAVE,
  // Points order
  orderpage: API_ENDPOINTS.ORDER.PAGE,
  orderdelete: API_ENDPOINTS.ORDER.DELETE,
  orderinfo: API_ENDPOINTS.ORDER.INFO,
  ordersave: API_ENDPOINTS.ORDER.SAVE,
  orderupdate: API_ENDPOINTS.ORDER.UPDATE,
  // Configuration
  configpage: API_ENDPOINTS.CONFIG.PAGE,
  configdelete: API_ENDPOINTS.CONFIG.DELETE,
  configinfo: API_ENDPOINTS.CONFIG.INFO,
  configsave: API_ENDPOINTS.CONFIG.SAVE,
  configupdate: API_ENDPOINTS.CONFIG.UPDATE,

  // File upload endpoints
  fileupload: API_ENDPOINTS.FILE.UPLOAD,

  // Menu endpoints
  menulist: API_ENDPOINTS.MENU.LIST,

  // Session endpoints
  session: API_ENDPOINTS.SESSION.GET,

  // Count endpoints
  usercount: API_ENDPOINTS.COUNT.USER,
  fitnesscoursecount: API_ENDPOINTS.COUNT.FITNESS_COURSE,
  coursereservationcount: API_ENDPOINTS.COUNT.COURSE_RESERVATION,
  courserefundcount: API_ENDPOINTS.COUNT.COURSE_REFUND,
  membershippurchasecount: API_ENDPOINTS.COUNT.MEMBERSHIP_PURCHASE,

  // Chart data endpoints
  reservationdaily: API_ENDPOINTS.CHART.COURSE_RESERVATION_DAILY,
  refunddaily: API_ENDPOINTS.CHART.COURSE_REFUND_DAILY,
  membershippurchasegroup: API_ENDPOINTS.CHART.MEMBERSHIP_PURCHASE_GROUP,
  membershiprenewaldaily: API_ENDPOINTS.CHART.MEMBERSHIP_RENEWAL_DAILY,

  // Legacy compatibility properties - 这些属性与上面的小写版本指向相同的端点值
  // 为了向后兼容保留，但会导致端点值重复
  orderInfo: API_ENDPOINTS.ORDER.INFO,
  configUpdate: API_ENDPOINTS.CONFIG.UPDATE,
  userCount: API_ENDPOINTS.COUNT.USER,
}

export default api
