import { Page } from '@playwright/test'
import { BasePage } from './base-page'

/**
 * 管理员登录页面
 */
export class AdminLoginPage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl)
  }

  async goto(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/#/login`)
    await this.waitForPageLoad()
  }

  async login(username: string, password: string): Promise<void> {
    await this.fillInput('input[name="username"]', username)
    await this.fillInput('input[name="password"]', password)
    await this.clickButton('登录')
    await this.page.waitForURL('**/#/index/home**')
  }

  async getErrorMessage(): Promise<string> {
    return await this.getElementText('.error-message, .el-message--error')
  }
}

/**
 * 管理员仪表板页面
 */
export class AdminDashboardPage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl)
  }

  async goto(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/#/index/home`)
    await this.waitForPageLoad()
  }

  async getUserCount(): Promise<string> {
    return await this.getElementText('.user-count, [data-testid="user-count"]')
  }

  async getCourseCount(): Promise<string> {
    return await this.getElementText('.course-count, [data-testid="course-count"]')
  }

  async getBookingCount(): Promise<string> {
    return await this.getElementText('.booking-count, [data-testid="booking-count"]')
  }

  async getRevenue(): Promise<string> {
    return await this.getElementText('.revenue, [data-testid="revenue"]')
  }
}

/**
 * 用户管理页面
 */
export class AdminUserListPage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl)
  }

  async goto(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/#/index/yonghu`)
    await this.waitForPageLoad()
  }

  async clickAddUser(): Promise<void> {
    await this.clickButton('添加')
  }

  async searchUser(username: string): Promise<void> {
    await this.search(username)
  }

  async editUser(index = 0): Promise<void> {
    const editButtons = this.page.locator('button:has-text("编辑"), .edit-btn')
    if (await editButtons.count() > index) {
      await editButtons.nth(index).click()
    }
  }

  async deleteUser(index = 0): Promise<void> {
    await this.deleteRow(index)
  }

  async getUserCount(): Promise<number> {
    return await this.getTableRowCount()
  }

  async getUserData(): Promise<string[][]> {
    return await this.getTableData()
  }
}

/**
 * 用户详情/编辑页面
 */
export class AdminUserDetailPage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl)
  }

  async fillUserForm(userData: {
    yonghuming?: string
    shouji?: string
    shenfenzheng?: string
    xingbie?: string
    nianling?: string
  }): Promise<void> {
    if (userData.yonghuming) {
      await this.fillInput('input[name="yonghuming"]', userData.yonghuming)
    }
    if (userData.shouji) {
      await this.fillInput('input[name="shouji"]', userData.shouji)
    }
    if (userData.shenfenzheng) {
      await this.fillInput('input[name="shenfenzheng"]', userData.shenfenzheng)
    }
    if (userData.xingbie) {
      await this.selectOption('select[name="xingbie"]', userData.xingbie)
    }
    if (userData.nianling) {
      await this.fillInput('input[name="nianling"]', userData.nianling)
    }
  }

  async saveUser(): Promise<void> {
    await this.submitForm()
  }

  async cancel(): Promise<void> {
    await this.clickButton('取消')
  }
}

/**
 * 教练管理页面
 */
export class AdminCoachListPage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl)
  }

  async goto(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/#/index/jianshenjiaolian`)
    await this.waitForPageLoad()
  }

  async clickAddCoach(): Promise<void> {
    await this.clickButton('添加')
  }

  async searchCoach(name: string): Promise<void> {
    await this.search(name)
  }

  async editCoach(index = 0): Promise<void> {
    const editButtons = this.page.locator('button:has-text("编辑"), .edit-btn')
    if (await editButtons.count() > index) {
      await editButtons.nth(index).click()
    }
  }

  async deleteCoach(index = 0): Promise<void> {
    await this.deleteRow(index)
  }

  async getCoachCount(): Promise<number> {
    return await this.getTableRowCount()
  }
}

/**
 * 教练详情/编辑页面
 */
export class AdminCoachDetailPage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl)
  }

  async fillCoachForm(coachData: {
    jiaolianxingming?: string
    nianling?: string
    zhuanye?: string
    jingyan?: string
    jieshao?: string
  }): Promise<void> {
    if (coachData.jiaolianxingming) {
      await this.fillInput('input[name="jiaolianxingming"]', coachData.jiaolianxingming)
    }
    if (coachData.nianling) {
      await this.fillInput('input[name="nianling"]', coachData.nianling)
    }
    if (coachData.zhuanye) {
      await this.selectOption('select[name="zhuanye"]', coachData.zhuanye)
    }
    if (coachData.jingyan) {
      await this.fillInput('input[name="jingyan"]', coachData.jingyan)
    }
    if (coachData.jieshao) {
      await this.fillInput('textarea[name="jieshao"]', coachData.jieshao)
    }
  }

  async saveCoach(): Promise<void> {
    await this.submitForm()
  }
}

/**
 * 课程管理页面
 */
export class AdminCourseListPage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl)
  }

  async goto(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/#/index/jianshenkecheng`)
    await this.waitForPageLoad()
  }

  async clickAddCourse(): Promise<void> {
    await this.clickButton('添加')
  }

  async searchCourse(name: string): Promise<void> {
    await this.search(name)
  }

  async editCourse(index = 0): Promise<void> {
    const editButtons = this.page.locator('button:has-text("编辑"), .edit-btn')
    if (await editButtons.count() > index) {
      await editButtons.nth(index).click()
    }
  }

  async deleteCourse(index = 0): Promise<void> {
    await this.deleteRow(index)
  }

  async toggleCourseStatus(index = 0): Promise<void> {
    const statusButtons = this.page.locator('button:has-text("上架"), button:has-text("下架")')
    if (await statusButtons.count() > index) {
      await statusButtons.nth(index).click()
    }
  }
}

/**
 * 课程详情/编辑页面
 */
export class AdminCourseDetailPage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl)
  }

  async fillCourseForm(courseData: {
    kechengmingcheng?: string
    kechengleixing?: string
    shichang?: string
    jiage?: string
    jieshao?: string
  }): Promise<void> {
    if (courseData.kechengmingcheng) {
      await this.fillInput('input[name="kechengmingcheng"]', courseData.kechengmingcheng)
    }
    if (courseData.kechengleixing) {
      await this.selectOption('select[name="kechengleixing"]', courseData.kechengleixing)
    }
    if (courseData.shichang) {
      await this.fillInput('input[name="shichang"]', courseData.shichang)
    }
    if (courseData.jiage) {
      await this.fillInput('input[name="jiage"]', courseData.jiage)
    }
    if (courseData.jieshao) {
      await this.fillInput('textarea[name="jieshao"]', courseData.jieshao)
    }
  }

  async saveCourse(): Promise<void> {
    await this.submitForm()
  }
}

/**
 * 预约管理页面
 */
export class AdminBookingListPage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl)
  }

  async goto(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/#/index/kechengyuyue`)
    await this.waitForPageLoad()
  }

  async searchBooking(searchTerm: string): Promise<void> {
    await this.search(searchTerm)
  }

  async confirmBooking(index = 0): Promise<void> {
    const confirmButtons = this.page.locator('button:has-text("确认")')
    if (await confirmButtons.count() > index) {
      await confirmButtons.nth(index).click()
    }
  }

  async cancelBooking(index = 0): Promise<void> {
    const cancelButtons = this.page.locator('button:has-text("取消")')
    if (await cancelButtons.count() > index) {
      await cancelButtons.nth(index).click()
    }
  }

  async filterByStatus(status: string): Promise<void> {
    const statusFilter = this.page.locator('select[name="status"], .status-filter')
    await this.selectOption('select[name="status"], .status-filter', status)
  }

  async getBookingCount(): Promise<number> {
    return await this.getTableRowCount()
  }
}

/**
 * 会员卡管理页面
 */
export class AdminMembershipListPage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl)
  }

  async goto(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/#/index/huiyuanka`)
    await this.waitForPageLoad()
  }

  async clickAddMembership(): Promise<void> {
    await this.clickButton('添加')
  }

  async searchMembership(name: string): Promise<void> {
    await this.search(name)
  }

  async editMembership(index = 0): Promise<void> {
    const editButtons = this.page.locator('button:has-text("编辑"), .edit-btn')
    if (await editButtons.count() > index) {
      await editButtons.nth(index).click()
    }
  }

  async deleteMembership(index = 0): Promise<void> {
    await this.deleteRow(index)
  }

  async viewPurchases(index = 0): Promise<void> {
    const viewButtons = this.page.locator('button:has-text("查看购买记录")')
    if (await viewButtons.count() > index) {
      await viewButtons.nth(index).click()
    }
  }
}

/**
 * 会员卡详情/编辑页面
 */
export class AdminMembershipDetailPage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl)
  }

  async fillMembershipForm(membershipData: {
    huiyuankamingcheng?: string
    youxiaoqi?: string
    jiage?: string
    fuwuneirong?: string
  }): Promise<void> {
    if (membershipData.huiyuankamingcheng) {
      await this.fillInput('input[name="huiyuankamingcheng"]', membershipData.huiyuankamingcheng)
    }
    if (membershipData.youxiaoqi) {
      await this.fillInput('input[name="youxiaoqi"]', membershipData.youxiaoqi)
    }
    if (membershipData.jiage) {
      await this.fillInput('input[name="jiage"]', membershipData.jiage)
    }
    if (membershipData.fuwuneirong) {
      await this.fillInput('textarea[name="fuwuneirong"]', membershipData.fuwuneirong)
    }
  }

  async saveMembership(): Promise<void> {
    await this.submitForm()
  }
}

/**
 * 器材管理列表页面
 */
export class AdminEquipmentListPage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl)
  }

  async goto(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/#/index/jianshenqicai`)
    await this.waitForPageLoad()
  }

  async clickAddEquipment(): Promise<void> {
    await this.clickButton('添加')
  }

  async searchEquipment(name: string): Promise<void> {
    await this.search(name)
  }

  async editEquipment(index = 0): Promise<void> {
    const editButtons = this.page.locator('button:has-text("编辑"), .edit-btn')
    if (await editButtons.count() > index) {
      await editButtons.nth(index).click()
    }
  }

  async deleteEquipment(index = 0): Promise<void> {
    await this.deleteRow(index)
  }

  async toggleEquipmentStatus(index = 0): Promise<void> {
    const statusButtons = this.page.locator('button:has-text("上架"), button:has-text("下架")')
    if (await statusButtons.count() > index) {
      await statusButtons.nth(index).click()
    }
  }
}

/**
 * 器材管理详情/编辑页面
 */
export class AdminEquipmentDetailPage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl)
  }

  async fillEquipmentForm(equipmentData: {
    qicaimingcheng?: string
    qicaileixing?: string
    shuliang?: string
    jiage?: string
    jieshao?: string
  }): Promise<void> {
    if (equipmentData.qicaimingcheng) {
      await this.fillInput('input[name="qicaimingcheng"]', equipmentData.qicaimingcheng)
    }
    if (equipmentData.qicaileixing) {
      await this.fillInput('input[name="qicaileixing"]', equipmentData.qicaileixing)
    }
    if (equipmentData.shuliang) {
      await this.fillInput('input[name="shuliang"]', equipmentData.shuliang)
    }
    if (equipmentData.jiage) {
      await this.fillInput('input[name="jiage"]', equipmentData.jiage)
    }
    if (equipmentData.jieshao) {
      await this.fillInput('textarea[name="jieshao"]', equipmentData.jieshao)
    }
  }

  async saveEquipment(): Promise<void> {
    await this.submitForm()
  }
}

/**
 * 公告管理列表页面
 */
export class AdminNewsListPage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl)
  }

  async goto(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/#/index/news`)
    await this.waitForPageLoad()
  }

  async clickAddNews(): Promise<void> {
    await this.clickButton('添加')
  }

  async searchNews(title: string): Promise<void> {
    await this.search(title)
  }

  async editNews(index = 0): Promise<void> {
    const editButtons = this.page.locator('button:has-text("编辑"), .edit-btn')
    if (await editButtons.count() > index) {
      await editButtons.nth(index).click()
    }
  }

  async deleteNews(index = 0): Promise<void> {
    await this.deleteRow(index)
  }

  async publishNews(index = 0): Promise<void> {
    const publishButtons = this.page.locator('button:has-text("发布"), button:has-text("上架")')
    if (await publishButtons.count() > index) {
      await publishButtons.nth(index).click()
    }
  }
}

/**
 * 公告管理详情/编辑页面
 */
export class AdminNewsDetailPage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl)
  }

  async fillNewsForm(newsData: {
    title?: string
    introduction?: string
    picture?: string
    content?: string
  }): Promise<void> {
    if (newsData.title) {
      await this.fillInput('input[name="title"]', newsData.title)
    }
    if (newsData.introduction) {
      await this.fillInput('input[name="introduction"]', newsData.introduction)
    }
    if (newsData.picture) {
      await this.fillInput('input[name="picture"]', newsData.picture)
    }
    if (newsData.content) {
      await this.fillInput('textarea[name="content"]', newsData.content)
    }
  }

  async saveNews(): Promise<void> {
    await this.submitForm()
  }
}

/**
 * 反馈管理列表页面
 */
export class AdminChatListPage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl)
  }

  async goto(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/#/index/chat`)
    await this.waitForPageLoad()
  }

  async searchChat(keyword: string): Promise<void> {
    await this.search(keyword)
  }

  async viewChatDetail(index = 0): Promise<void> {
    const viewButtons = this.page.locator('button:has-text("查看"), button:has-text("详情")')
    if (await viewButtons.count() > index) {
      await viewButtons.nth(index).click()
    }
  }

  async replyToChat(index = 0): Promise<void> {
    const replyButtons = this.page.locator('button:has-text("回复"), button:has-text("处理")')
    if (await replyButtons.count() > index) {
      await replyButtons.nth(index).click()
    }
  }

  async markAsRead(index = 0): Promise<void> {
    const markButtons = this.page.locator('button:has-text("已读"), button:has-text("标记已读")')
    if (await markButtons.count() > index) {
      await markButtons.nth(index).click()
    }
  }
}

/**
 * 反馈管理详情页面
 */
export class AdminChatDetailPage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl)
  }

  async fillReply(replyContent: string): Promise<void> {
    await this.fillInput('textarea[name="reply"]', replyContent)
  }

  async submitReply(): Promise<void> {
    await this.clickButton('提交回复')
  }
}

/**
 * 系统配置管理页面
 */
export class AdminSystemConfigPage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl)
  }

  async goto(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/#/index/config`)
    await this.waitForPageLoad()
  }

  async updateCarouselSettings(settings: { title?: string, image?: string, link?: string }): Promise<void> {
    if (settings.title) {
      await this.fillInput('input[name="title"]', settings.title)
    }
    if (settings.image) {
      await this.fillInput('input[name="image"]', settings.image)
    }
    if (settings.link) {
      await this.fillInput('input[name="link"]', settings.link)
    }
    await this.clickButton('保存')
  }

  async updateBasicSettings(settings: { siteName?: string, contact?: string, address?: string }): Promise<void> {
    if (settings.siteName) {
      await this.fillInput('input[name="siteName"]', settings.siteName)
    }
    if (settings.contact) {
      await this.fillInput('input[name="contact"]', settings.contact)
    }
    if (settings.address) {
      await this.fillInput('input[name="address"]', settings.address)
    }
    await this.clickButton('保存')
  }
}

/**
 * 报表分析页面
 */
export class AdminReportsPage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl)
  }

  async goto(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/#/index/reports`)
    await this.waitForPageLoad()
  }

  async selectDateRange(startDate: string, endDate: string): Promise<void> {
    await this.fillInput('input[name="startDate"]', startDate)
    await this.fillInput('input[name="endDate"]', endDate)
  }

  async generateReport(): Promise<void> {
    await this.clickButton('生成报表')
  }

  async exportReport(): Promise<void> {
    await this.clickButton('导出')
  }

  async getChartData(): Promise<any> {
    // 获取图表数据的方法
    return await this.page.evaluate(() => {
      const charts = document.querySelectorAll('.chart, .echarts, canvas')
      return {
        chartCount: charts.length,
        hasData: charts.length > 0
      }
    })
  }
}