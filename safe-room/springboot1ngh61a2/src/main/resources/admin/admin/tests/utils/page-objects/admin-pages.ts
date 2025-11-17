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
