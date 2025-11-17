/**
 * E2E测试选择器常量和工具函数
 *
 * 集中管理所有data-testid属性，提供类型安全的选择器访问
 * 遵循 docs/development/E2E_TEST_ID_GUIDELINES.md 中的命名规范
 */

export const TEST_IDS = {
  // 登录页面
  LOGIN: {
    PAGE_TITLE: 'login-page-title',
    FORM: 'login-form',
    USERNAME_INPUT: 'login-username-input',
    PASSWORD_INPUT: 'login-password-input',
    SUBMIT_BUTTON: 'login-submit-button',
    CANCEL_BUTTON: 'login-cancel-button',
    ERROR_MESSAGE: 'login-error-message',
    REGISTER_LINK: 'login-register-link',
    REMEMBER_CHECKBOX: 'login-remember-checkbox',
    ROLE_RADIO_GROUP: 'login-role-radio-group'
  },

  // 首页
  HOME: {
    PAGE_CONTAINER: 'home-page-container',
    HERO_SECTION: 'home-hero-section',
    COURSES_SECTION: 'home-courses-section',
    NEWS_SECTION: 'home-news-section',
    NAVIGATION_BAR: 'home-navigation-bar'
  },

  // 预约流程页面
  BOOKING: {
    COURSE_SELECTION: 'booking-course-selection',
    TIME_SELECTION: 'booking-time-selection',
    INFO_FORM: 'booking-info-form',
    CONFIRMATION: 'booking-confirmation',

    // 课程选择
    COURSE_LIST: 'booking-course-list',
    COURSE_CARD: (id: string | number) => `course-card-${id}`,
    COURSE_TITLE: (id: string | number) => `course-title-${id}`,
    COURSE_DESCRIPTION: (id: string | number) => `course-description-${id}`,
    COURSE_SELECT_BUTTON: (id: string | number) => `course-select-button-${id}`,

    // 时间选择
    TIME_CALENDAR: 'booking-time-calendar',
    TIME_SLOT: (time: string) => `time-slot-${time.replace(':', '-')}`,
    TIME_SLOT_AVAILABLE: (time: string) => `time-slot-available-${time.replace(':', '-')}`,
    TIME_SLOT_CONFLICT: (time: string) => `time-slot-conflict-${time.replace(':', '-')}`,
    TIME_SLOT_SELECTED: (time: string) => `time-slot-selected-${time.replace(':', '-')}`,

    // 信息表单
    NAME_INPUT: 'booking-name-input',
    PHONE_INPUT: 'booking-phone-input',
    EMAIL_INPUT: 'booking-email-input',
    AGREEMENT_CHECKBOX: 'booking-agreement-checkbox',

    // 按钮
    NEXT_BUTTON: 'booking-next-button',
    PREV_BUTTON: 'booking-prev-button',
    SUBMIT_BUTTON: 'booking-submit-button',
    CANCEL_BUTTON: 'booking-cancel-button',

    // 状态和消息
    SUCCESS_MESSAGE: 'booking-success-message',
    ERROR_MESSAGE: 'booking-error-message',
    LOADING_INDICATOR: 'booking-loading-indicator'
  },

  // 课程管理页面
  COURSES: {
    LIST_CONTAINER: 'courses-list-container',
    SEARCH_INPUT: 'courses-search-input',
    FILTER_SELECT: 'courses-filter-select',
    COURSE_ITEM: (id: string | number) => `course-item-${id}`,
    COURSE_BOOK_BUTTON: (id: string | number) => `course-book-button-${id}`,
    PAGINATION: 'courses-pagination'
  },

  // 课程卡片组件
  COURSE_CARD: {
    CONTAINER: 'course-card',
    MEDIA: 'course-card-media',
    TAG: 'course-card-tag',
    BADGE: 'course-card-badge',
    BODY: 'course-card-body',
    HEADER: 'course-card-header',
    TITLE: 'course-card-title',
    DESCRIPTION: 'course-card-description',
    ACTIONS: 'course-card-actions',
    VIEW_BUTTON: 'course-card-view-button',
    BOOK_BUTTON: 'course-card-book-button'
  },

  // 个人资料页面
  PROFILE: {
    FORM: 'profile-form',
    NAME_INPUT: 'profile-name-input',
    PHONE_INPUT: 'profile-phone-input',
    EMAIL_INPUT: 'profile-email-input',
    SAVE_BUTTON: 'profile-save-button',
    CANCEL_BUTTON: 'profile-cancel-button',
    AVATAR_UPLOAD: 'profile-avatar-upload',
    CHANGE_PASSWORD_BUTTON: 'profile-change-password-button'
  },

  // 会员卡页面
  MEMBERSHIP: {
    CURRENT_PLAN: 'membership-current-plan',
    UPGRADE_BUTTON: 'membership-upgrade-button',
    RENEW_BUTTON: 'membership-renew-button',
    HISTORY_LIST: 'membership-history-list'
  },

  // 会员卡组件
  MEMBERSHIP_CARD: {
    CONTAINER: 'membership-card',
    HEADER: 'membership-card-header',
    TITLE_SECTION: 'membership-card-title-section',
    TITLE: 'membership-card-title',
    DURATION: 'membership-card-duration',
    PRICE: 'membership-card-price',
    PRICE_MAIN: 'membership-card-price-main',
    PRICE_AMOUNT: 'membership-card-price-amount',
    PRICE_UNIT: 'membership-card-price-unit',
    BENEFITS_COUNT: 'membership-card-benefits-count',
    VIEW_DETAILS_BUTTON: 'membership-card-view-details-button'
  },

  // 支付页面
  PAYMENT: {
    FORM: 'payment-form',
    AMOUNT_DISPLAY: 'payment-amount-display',
    METHOD_SELECT: 'payment-method-select',
    PAY_BUTTON: 'payment-pay-button',
    CANCEL_BUTTON: 'payment-cancel-button',
    STATUS_MESSAGE: 'payment-status-message'
  },

  // 聊天页面
  CHAT: {
    MESSAGE_LIST: 'chat-message-list',
    MESSAGE_INPUT: 'chat-message-input',
    SEND_BUTTON: 'chat-send-button',
    ONLINE_STATUS: 'chat-online-status'
  },

  // 新闻页面
  NEWS: {
    LIST_CONTAINER: 'news-list-container',
    ARTICLE_ITEM: (id: string | number) => `news-article-${id}`,
    ARTICLE_TITLE: (id: string | number) => `news-article-title-${id}`,
    ARTICLE_CONTENT: (id: string | number) => `news-article-content-${id}`,
    READ_MORE_BUTTON: (id: string | number) => `news-read-more-${id}`
  },

  // 收藏页面
  FAVORITES: {
    LIST_CONTAINER: 'favorites-list-container',
    REMOVE_BUTTON: (id: string | number) => `favorite-remove-${id}`,
    CLEAR_ALL_BUTTON: 'favorites-clear-all-button'
  },

  // 设备管理页面
  EQUIPMENT: {
    LIST_CONTAINER: 'equipment-list-container',
    BOOK_BUTTON: (id: string | number) => `equipment-book-${id}`,
    STATUS_BADGE: (id: string | number) => `equipment-status-${id}`
  },

  // 通用组件
  COMMON: {
    LOADING_SPINNER: 'common-loading-spinner',
    ERROR_MESSAGE: 'common-error-message',
    SUCCESS_MESSAGE: 'common-success-message',
    CONFIRM_DIALOG: 'common-confirm-dialog',
    CONFIRM_BUTTON: 'common-confirm-button',
    CANCEL_BUTTON: 'common-cancel-button',
    CLOSE_BUTTON: 'common-close-button',
    SEARCH_INPUT: 'common-search-input',
    PAGINATION: 'common-pagination',
    EMPTY_STATE: 'common-empty-state'
  },

  // 导航和菜单
  NAVIGATION: {
    MAIN_MENU: 'nav-main-menu',
    USER_MENU: 'nav-user-menu',
    LOGOUT_BUTTON: 'nav-logout-button',
    PROFILE_LINK: 'nav-profile-link',
    HOME_LINK: 'nav-home-link',
    COURSES_LINK: 'nav-courses-link',
    BOOKING_LINK: 'nav-booking-link'
  },

  // 用户资料管理
  PROFILE: {
    AVATAR: 'profile-avatar',
    USER_NAME: 'profile-user-name',
    USER_INFO: 'profile-user-info',
    EDIT_BUTTON: 'profile-edit-button',
    SAVE_BUTTON: 'profile-save-button',
    CANCEL_BUTTON: 'profile-cancel-button',
    UPLOAD_AVATAR: 'profile-upload-avatar',
    CHANGE_AVATAR: 'profile-change-avatar',
    BIO_INPUT: 'profile-bio-input',
    PHONE_INPUT: 'profile-phone-input',
    EMAIL_INPUT: 'profile-email-input',
    LOCATION_INPUT: 'profile-location-input'
  },

  // 课程相关
  COURSES: {
    LIST_CONTAINER: 'courses-list-container',
    COURSE_CARD: (id: string | number) => `course-card-${id}`,
    COACH_CARD: (id: string | number) => `coach-card-${id}`,
    COURSE_NAME: 'course-name',
    COURSE_DESCRIPTION: 'course-description',
    COURSE_PRICE: 'course-price',
    COURSE_INSTRUCTOR: 'course-instructor',
    COURSE_DURATION: 'course-duration',
    COURSE_RATING: 'course-rating',
    BOOK_BUTTON: (id: string | number) => `course-book-button-${id}`,
    DETAILS_BUTTON: (id: string | number) => `course-details-button-${id}`
  },

  // 预约相关（扩展）
  BOOKING: {
    LIST_CONTAINER: 'booking-list-container',
    BOOKING_ITEM: (id: string | number) => `booking-item-${id}`,
    BOOKING_TITLE: 'booking-title',
    BOOKING_TIME: 'booking-time',
    BOOKING_STATUS: 'booking-status',
    CANCEL_BUTTON: (id: string | number) => `booking-cancel-button-${id}`,
    RESCHEDULE_BUTTON: (id: string | number) => `booking-reschedule-button-${id}`,
    TIME_CALENDAR: 'booking-time-calendar',
    TIME_SLOT: (courseId: string | number, time: string) => `time-slot-${courseId}-${time.replace(':', '-')}`,
    AVAILABLE_SLOTS: 'booking-available-slots',
    CONFLICT_SLOTS: 'booking-conflict-slots',
    SUMMARY_CONTAINER: 'booking-summary',
    SUMMARY_COURSE_NAME: 'summary-course-name',
    SUMMARY_TIME: 'summary-time',
    CONFIRM_BUTTON: 'booking-confirm-button'
  },

  // 收藏相关
  FAVORITES: {
    LIST_CONTAINER: 'favorites-list-container',
    FAVORITE_ITEM: (id: string | number) => `favorite-item-${id}`,
    REMOVE_BUTTON: (id: string | number) => `favorite-remove-button-${id}`,
    ADD_BUTTON: (id: string | number) => `favorite-add-button-${id}`
  },

  // 消息中心
  MESSAGES: {
    LIST_CONTAINER: 'messages-list-container',
    MESSAGE_ITEM: (id: string | number) => `message-item-${id}`,
    UNREAD_BADGE: 'messages-unread-badge',
    MARK_READ_BUTTON: (id: string | number) => `message-mark-read-${id}`,
    SENDER_NAME: 'message-sender-name',
    MESSAGE_CONTENT: 'message-content',
    MESSAGE_TIME: 'message-time'
  },

  // 聊天功能
  CHAT: {
    CONTAINER: 'chat-container',
    INTERFACE: 'chat-interface',
    MESSAGE_LIST: 'chat-message-list',
    MESSAGE_INPUT: 'chat-message-input',
    SEND_BUTTON: 'chat-send-button',
    CONTACT_LIST: 'chat-contact-list',
    CONTACT_ITEM: (id: string | number) => `chat-contact-${id}`,
    ONLINE_STATUS: 'chat-online-status'
  },

  // 支付相关
  PAYMENT: {
    METHODS_CONTAINER: 'payment-methods-container',
    METHOD_CARD: (type: string) => `payment-method-${type}`,
    AMOUNT_DISPLAY: 'payment-amount',
    CONFIRM_BUTTON: 'payment-confirm-button',
    CANCEL_BUTTON: 'payment-cancel-button',
    SUCCESS_MESSAGE: 'payment-success-message',
    ERROR_MESSAGE: 'payment-error-message'
  },

  // 表单验证相关
  VALIDATION: {
    ERROR_MESSAGE: 'validation-error-message',
    REQUIRED_FIELD: 'validation-required-field',
    INVALID_FORMAT: 'validation-invalid-format',
    CAPTCHA_CONTAINER: 'validation-captcha-container',
    VERIFY_CODE_INPUT: 'validation-verify-code-input'
  },

  // 模态框和弹窗
  MODAL: {
    CONTAINER: 'modal-container',
    OVERLAY: 'modal-overlay',
    CLOSE_BUTTON: 'modal-close-button',
    CONFIRM_BUTTON: 'modal-confirm-button',
    CANCEL_BUTTON: 'modal-cancel-button'
  }
} as const

export type TestIds = typeof TEST_IDS

/**
 * 获取测试ID选择器
 * @param testId 测试ID常量
 * @returns Playwright选择器字符串
 */
export function getTestId(testId: string): string {
  return `[data-testid="${testId}"]`
}

/**
 * 获取多个测试ID选择器
 * @param testIds 测试ID常量数组
 * @returns Playwright选择器字符串
 */
export function getTestIds(testIds: string[]): string {
  return testIds.map(id => `[data-testid="${id}"]`).join(', ')
}

/**
 * 类型安全的测试ID获取函数
 * 提供编译时检查和自动补全
 */
export const selectors = {
  // 登录页面选择器
  login: {
    usernameInput: () => getTestId(TEST_IDS.LOGIN.USERNAME_INPUT),
    passwordInput: () => getTestId(TEST_IDS.LOGIN.PASSWORD_INPUT),
    submitButton: () => getTestId(TEST_IDS.LOGIN.SUBMIT_BUTTON),
    cancelButton: () => getTestId(TEST_IDS.LOGIN.CANCEL_BUTTON),
    errorMessage: () => getTestId(TEST_IDS.LOGIN.ERROR_MESSAGE),
    registerLink: () => getTestId(TEST_IDS.LOGIN.REGISTER_LINK),
    rememberCheckbox: () => getTestId(TEST_IDS.LOGIN.REMEMBER_CHECKBOX),
    roleRadioGroup: () => getTestId(TEST_IDS.LOGIN.ROLE_RADIO_GROUP),
  },

  // 预约流程选择器
  booking: {
    courseCard: (id: string | number) => getTestId(TEST_IDS.BOOKING.COURSE_CARD(id)),
    courseSelectButton: (id: string | number) => getTestId(TEST_IDS.BOOKING.COURSE_SELECT_BUTTON(id)),
    timeSlot: (time: string) => getTestId(TEST_IDS.BOOKING.TIME_SLOT(time)),
    timeSlotAvailable: (time: string) => getTestId(TEST_IDS.BOOKING.TIME_SLOT_AVAILABLE(time)),
    nextButton: () => getTestId(TEST_IDS.BOOKING.NEXT_BUTTON),
    prevButton: () => getTestId(TEST_IDS.BOOKING.PREV_BUTTON),
    submitButton: () => getTestId(TEST_IDS.BOOKING.SUBMIT_BUTTON),
    nameInput: () => getTestId(TEST_IDS.BOOKING.NAME_INPUT),
    phoneInput: () => getTestId(TEST_IDS.BOOKING.PHONE_INPUT),
    agreementCheckbox: () => getTestId(TEST_IDS.BOOKING.AGREEMENT_CHECKBOX),
    successMessage: () => getTestId(TEST_IDS.BOOKING.SUCCESS_MESSAGE),
    errorMessage: () => getTestId(TEST_IDS.BOOKING.ERROR_MESSAGE),
  },

  // 通用选择器
  common: {
    loadingSpinner: () => getTestId(TEST_IDS.COMMON.LOADING_SPINNER),
    errorMessage: () => getTestId(TEST_IDS.COMMON.ERROR_MESSAGE),
    successMessage: () => getTestId(TEST_IDS.COMMON.SUCCESS_MESSAGE),
    confirmButton: () => getTestId(TEST_IDS.COMMON.CONFIRM_BUTTON),
    cancelButton: () => getTestId(TEST_IDS.COMMON.CANCEL_BUTTON),
  },

  // 导航选择器
  navigation: {
    logoutButton: () => getTestId(TEST_IDS.NAVIGATION.LOGOUT_BUTTON),
    profileLink: () => getTestId(TEST_IDS.NAVIGATION.PROFILE_LINK),
    homeLink: () => getTestId(TEST_IDS.NAVIGATION.HOME_LINK),
    coursesLink: () => getTestId(TEST_IDS.NAVIGATION.COURSES_LINK),
    bookingLink: () => getTestId(TEST_IDS.NAVIGATION.BOOKING_LINK),
  },

  // 用户资料选择器
  profile: {
    avatar: () => getTestId(TEST_IDS.PROFILE.AVATAR),
    userName: () => getTestId(TEST_IDS.PROFILE.USER_NAME),
    userInfo: () => getTestId(TEST_IDS.PROFILE.USER_INFO),
    editButton: () => getTestId(TEST_IDS.PROFILE.EDIT_BUTTON),
    saveButton: () => getTestId(TEST_IDS.PROFILE.SAVE_BUTTON),
    cancelButton: () => getTestId(TEST_IDS.PROFILE.CANCEL_BUTTON),
    uploadAvatar: () => getTestId(TEST_IDS.PROFILE.UPLOAD_AVATAR),
    changeAvatar: () => getTestId(TEST_IDS.PROFILE.CHANGE_AVATAR),
  },

  // 课程选择器
  courses: {
    listContainer: () => getTestId(TEST_IDS.COURSES.LIST_CONTAINER),
    courseCard: (id: string | number) => getTestId(TEST_IDS.COURSES.COURSE_CARD(id)),
    coachCard: (id: string | number) => getTestId(TEST_IDS.COURSES.COACH_CARD(id)),
    bookButton: (id: string | number) => getTestId(TEST_IDS.COURSES.BOOK_BUTTON(id)),
    detailsButton: (id: string | number) => getTestId(TEST_IDS.COURSES.DETAILS_BUTTON(id)),
  },

  // 预约选择器（扩展）
  booking: {
    listContainer: () => getTestId(TEST_IDS.BOOKING.LIST_CONTAINER),
    bookingItem: (id: string | number) => getTestId(TEST_IDS.BOOKING.BOOKING_ITEM(id)),
    bookingTitle: () => getTestId(TEST_IDS.BOOKING.BOOKING_TITLE),
    bookingTime: () => getTestId(TEST_IDS.BOOKING.BOOKING_TIME),
    bookingStatus: () => getTestId(TEST_IDS.BOOKING.BOOKING_STATUS),
    cancelButton: (id: string | number) => getTestId(TEST_IDS.BOOKING.CANCEL_BUTTON(id)),
    rescheduleButton: (id: string | number) => getTestId(TEST_IDS.BOOKING.RESCHEDULE_BUTTON(id)),
    timeCalendar: () => getTestId(TEST_IDS.BOOKING.TIME_CALENDAR),
    timeSlot: (courseId: string | number, time: string) => getTestId(TEST_IDS.BOOKING.TIME_SLOT(courseId, time)),
    availableSlots: () => getTestId(TEST_IDS.BOOKING.AVAILABLE_SLOTS),
    conflictSlots: () => getTestId(TEST_IDS.BOOKING.CONFLICT_SLOTS),
    summaryContainer: () => getTestId(TEST_IDS.BOOKING.SUMMARY_CONTAINER),
    summaryCourseName: () => getTestId(TEST_IDS.BOOKING.SUMMARY_COURSE_NAME),
    summaryTime: () => getTestId(TEST_IDS.BOOKING.SUMMARY_TIME),
    confirmButton: () => getTestId(TEST_IDS.BOOKING.CONFIRM_BUTTON),
  },

  // 收藏选择器
  favorites: {
    listContainer: () => getTestId(TEST_IDS.FAVORITES.LIST_CONTAINER),
    favoriteItem: (id: string | number) => getTestId(TEST_IDS.FAVORITES.FAVORITE_ITEM(id)),
    removeButton: (id: string | number) => getTestId(TEST_IDS.FAVORITES.REMOVE_BUTTON(id)),
    addButton: (id: string | number) => getTestId(TEST_IDS.FAVORITES.ADD_BUTTON(id)),
  },

  // 消息选择器
  messages: {
    listContainer: () => getTestId(TEST_IDS.MESSAGES.LIST_CONTAINER),
    messageItem: (id: string | number) => getTestId(TEST_IDS.MESSAGES.MESSAGE_ITEM(id)),
    unreadBadge: () => getTestId(TEST_IDS.MESSAGES.UNREAD_BADGE),
    markReadButton: (id: string | number) => getTestId(TEST_IDS.MESSAGES.MARK_READ_BUTTON(id)),
    senderName: () => getTestId(TEST_IDS.MESSAGES.SENDER_NAME),
    messageContent: () => getTestId(TEST_IDS.MESSAGES.MESSAGE_CONTENT),
    messageTime: () => getTestId(TEST_IDS.MESSAGES.MESSAGE_TIME),
  },

  // 聊天选择器
  chat: {
    container: () => getTestId(TEST_IDS.CHAT.CONTAINER),
    interface: () => getTestId(TEST_IDS.CHAT.INTERFACE),
    messageList: () => getTestId(TEST_IDS.CHAT.MESSAGE_LIST),
    messageInput: () => getTestId(TEST_IDS.CHAT.MESSAGE_INPUT),
    sendButton: () => getTestId(TEST_IDS.CHAT.SEND_BUTTON),
    contactList: () => getTestId(TEST_IDS.CHAT.CONTACT_LIST),
    contactItem: (id: string | number) => getTestId(TEST_IDS.CHAT.CONTACT_ITEM(id)),
    onlineStatus: () => getTestId(TEST_IDS.CHAT.ONLINE_STATUS),
  },

  // 支付选择器
  payment: {
    methodsContainer: () => getTestId(TEST_IDS.PAYMENT.METHODS_CONTAINER),
    methodCard: (type: string) => getTestId(TEST_IDS.PAYMENT.METHOD_CARD(type)),
    amountDisplay: () => getTestId(TEST_IDS.PAYMENT.AMOUNT_DISPLAY),
    confirmButton: () => getTestId(TEST_IDS.PAYMENT.CONFIRM_BUTTON),
    cancelButton: () => getTestId(TEST_IDS.PAYMENT.CANCEL_BUTTON),
    successMessage: () => getTestId(TEST_IDS.PAYMENT.SUCCESS_MESSAGE),
    errorMessage: () => getTestId(TEST_IDS.PAYMENT.ERROR_MESSAGE),
  },

  // 验证选择器
  validation: {
    errorMessage: () => getTestId(TEST_IDS.VALIDATION.ERROR_MESSAGE),
    requiredField: () => getTestId(TEST_IDS.VALIDATION.REQUIRED_FIELD),
    invalidFormat: () => getTestId(TEST_IDS.VALIDATION.INVALID_FORMAT),
    captchaContainer: () => getTestId(TEST_IDS.VALIDATION.CAPTCHA_CONTAINER),
    verifyCodeInput: () => getTestId(TEST_IDS.VALIDATION.VERIFY_CODE_INPUT),
  },

  // 模态框选择器
  modal: {
    container: () => getTestId(TEST_IDS.MODAL.CONTAINER),
    overlay: () => getTestId(TEST_IDS.MODAL.OVERLAY),
    closeButton: () => getTestId(TEST_IDS.MODAL.CLOSE_BUTTON),
    confirmButton: () => getTestId(TEST_IDS.MODAL.CONFIRM_BUTTON),
    cancelButton: () => getTestId(TEST_IDS.MODAL.CANCEL_BUTTON),
  },

  // 课程卡片选择器
  courseCard: {
    container: () => getTestId(TEST_IDS.COURSE_CARD.CONTAINER),
    media: () => getTestId(TEST_IDS.COURSE_CARD.MEDIA),
    tag: () => getTestId(TEST_IDS.COURSE_CARD.TAG),
    badge: () => getTestId(TEST_IDS.COURSE_CARD.BADGE),
    body: () => getTestId(TEST_IDS.COURSE_CARD.BODY),
    header: () => getTestId(TEST_IDS.COURSE_CARD.HEADER),
    title: () => getTestId(TEST_IDS.COURSE_CARD.TITLE),
    description: () => getTestId(TEST_IDS.COURSE_CARD.DESCRIPTION),
    actions: () => getTestId(TEST_IDS.COURSE_CARD.ACTIONS),
    viewButton: () => getTestId(TEST_IDS.COURSE_CARD.VIEW_BUTTON),
    bookButton: () => getTestId(TEST_IDS.COURSE_CARD.BOOK_BUTTON),
  },

  // 会员卡选择器
  membershipCard: {
    container: () => getTestId(TEST_IDS.MEMBERSHIP_CARD.CONTAINER),
    header: () => getTestId(TEST_IDS.MEMBERSHIP_CARD.HEADER),
    titleSection: () => getTestId(TEST_IDS.MEMBERSHIP_CARD.TITLE_SECTION),
    title: () => getTestId(TEST_IDS.MEMBERSHIP_CARD.TITLE),
    duration: () => getTestId(TEST_IDS.MEMBERSHIP_CARD.DURATION),
    price: () => getTestId(TEST_IDS.MEMBERSHIP_CARD.PRICE),
    priceMain: () => getTestId(TEST_IDS.MEMBERSHIP_CARD.PRICE_MAIN),
    priceAmount: () => getTestId(TEST_IDS.MEMBERSHIP_CARD.PRICE_AMOUNT),
    priceUnit: () => getTestId(TEST_IDS.MEMBERSHIP_CARD.PRICE_UNIT),
    benefitsCount: () => getTestId(TEST_IDS.MEMBERSHIP_CARD.BENEFITS_COUNT),
    viewDetailsButton: () => getTestId(TEST_IDS.MEMBERSHIP_CARD.VIEW_DETAILS_BUTTON),
  },
} as const

export type Selectors = typeof selectors

/**
 * ===========================================
 * 选择器使用优先级指南
 * ===========================================
 *
 * 1. 优先使用 data-testid 属性（最高优先级）
 *    ✅ 推荐：page.getByTestId('login-submit-button')
 *    ✅ 推荐：selectors.login.submitButton()
 *
 * 2. 使用语义化选择器（中等优先级）
 *    ✅ 推荐：page.getByRole('button', { name: '登录' })
 *    ✅ 推荐：page.getByLabel('用户名')
 *
 * 3. 使用稳定的CSS属性选择器（低优先级）
 *    ⚠️ 谨慎：page.locator('[class*="login-btn"]')
 *    ⚠️ 谨慎：page.locator('.login-form input[type="password"]')
 *
 * 4. 避免使用不稳定的选择器（最低优先级）
 *    ❌ 避免：page.locator('.btn-primary')
 *    ❌ 避免：page.locator('text=登录')
 *    ❌ 避免：page.locator('nth=0')
 *
 * ===========================================
 * 迁移指南
 * ===========================================
 *
 * 将现有CSS选择器逐步迁移到data-testid：
 *
 * 旧代码：
 * page.locator('.course-card').click()
 *
 * 新代码：
 * page.getByTestId(selectors.courses.courseCard(id)).click()
 * 或
 * selectors.courses.courseCard(id) // 返回 '[data-testid="course-card-{id}"]'
 */
