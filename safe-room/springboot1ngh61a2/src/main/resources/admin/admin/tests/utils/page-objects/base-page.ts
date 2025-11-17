import { Page, Locator } from '@playwright/test'

/**
 * 基础页面类
 * 提供所有页面对象的通用功能
 */
export class BasePage {
  protected readonly page: Page
  protected readonly baseUrl: string

  constructor(page: Page, baseUrl = 'http://127.0.0.1:8081') {
    this.page = page
    this.baseUrl = baseUrl
  }

  /**
   * 等待页面加载完成
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * 等待元素可见
   */
  async waitForElement(selector: string, timeout = 5000): Promise<Locator> {
    const element = this.page.locator(selector)
    await element.waitFor({ state: 'visible', timeout })
    return element
  }

  /**
   * 点击元素
   */
  async clickElement(selector: string): Promise<void> {
    const element = await this.waitForElement(selector)
    await element.click()
  }

  /**
   * 填写输入框
   */
  async fillInput(selector: string, value: string): Promise<void> {
    const element = await this.waitForElement(selector)
    await element.fill(value)
  }

  /**
   * 获取元素文本
   */
  async getElementText(selector: string): Promise<string> {
    const element = await this.waitForElement(selector)
    return await element.textContent() || ''
  }

  /**
   * 检查元素是否存在
   */
  async isElementVisible(selector: string): Promise<boolean> {
    const element = this.page.locator(selector)
    return await element.isVisible()
  }

  /**
   * 选择下拉框选项
   */
  async selectOption(selector: string, value: string): Promise<void> {
    const element = await this.waitForElement(selector)
    await element.selectOption(value)
  }

  /**
   * 等待并点击按钮
   */
  async clickButton(buttonText: string): Promise<void> {
    const button = this.page.locator(`button:has-text("${buttonText}"), input[value="${buttonText}"]`).first()
    await button.waitFor({ state: 'visible' })
    await button.click()
  }

  /**
   * 通用表格操作
   */
  async getTableRowCount(): Promise<number> {
    const rows = this.page.locator('tbody tr, .el-table__row')
    return await rows.count()
  }

  /**
   * 获取表格数据
   */
  async getTableData(): Promise<string[][]> {
    const rows = this.page.locator('tbody tr, .el-table__row')
    const rowCount = await rows.count()
    const data: string[][] = []

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i)
      const cells = row.locator('td, .el-table__cell')
      const cellCount = await cells.count()
      const rowData: string[] = []

      for (let j = 0; j < cellCount; j++) {
        const cell = cells.nth(j)
        const text = await cell.textContent()
        rowData.push(text?.trim() || '')
      }

      data.push(rowData)
    }

    return data
  }

  /**
   * 搜索功能
   */
  async search(searchTerm: string): Promise<void> {
    const searchInput = this.page.locator('input[placeholder*="搜索"], input[placeholder*="查询"]').first()
    await searchInput.fill(searchTerm)
    await this.page.keyboard.press('Enter')
    await this.page.waitForTimeout(500)
  }

  /**
   * 通用表单提交
   */
  async submitForm(): Promise<void> {
    const submitButton = this.page.locator('button[type="submit"], button:has-text("保存"), button:has-text("提交")').first()
    await submitButton.click()
    await this.page.waitForTimeout(1000)
  }

  /**
   * 通用删除操作
   */
  async deleteRow(index = 0): Promise<void> {
    const deleteButtons = this.page.locator('button:has-text("删除"), .delete-btn')
    if (await deleteButtons.count() > index) {
      await deleteButtons.nth(index).click()

      // 确认删除
      const confirmButton = this.page.locator('button:has-text("确认"), button:has-text("确定")').first()
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
      }
    }
  }

  /**
   * 截图
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` })
  }
}
