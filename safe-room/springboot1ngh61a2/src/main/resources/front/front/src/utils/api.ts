/**
 * API utility module for Front application
 * Provides API endpoint access with backward compatibility
 * @deprecated Use constants/apiEndpoints.ts for new code
 */

// Note: Front application shares the same API endpoints structure as Admin
// but may have different access patterns

const api = {
  // File upload endpoints
  fileupload: 'file/upload',

  // Menu endpoints
  menulist: 'menu/list',

  // Session endpoints
  session: '/session',

  // Count endpoints
  usercount: 'yonghu/count',
  fitnesscoursecount: 'jianshenkecheng/count',
  coursereservationcount: 'kechengyuyue/count',
  courserefundcount: 'kechengtuike/count',
  membershippurchasecount: 'huiyuankagoumai/count',

  // Chart data endpoints
  reservationdaily: 'kechengyuyue/value/yuyueshijian/kechengjiage/day',
  refunddaily: 'kechengtuike/value/shenqingshijian/kechengjiage/day',
  membershippurchasegroup: 'huiyuankagoumai/group/huiyuankamingcheng',
  membershiprenewaldaily: 'huiyuanxufei/value/xufeishijian/jiage/day',

  // Legacy compatibility properties
  orderInfo: 'orders/info',
  configUpdate: 'config/update',
  userCount: 'yonghu/count',
}

export default api
