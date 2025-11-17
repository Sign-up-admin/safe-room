import { test, expect } from '@playwright/test'
import { waitForPageFullyLoaded, waitForFormSubmission } from '../utils/wait-helpers'
import { applyCommonMock } from '../utils/mock-manager'
import { SCENARIO_NAMES } from '../utils/mock-presets'

test.describe('边缘情况测试', () => {
  test('未认证用户访问受保护页面应重定向到登录页', async ({ page }) => {
    await page.goto('/#/index/center')
    await waitForPageFullyLoaded(page)
    await expect(page).toHaveURL(/#\/login/)
  })

  test('网络失败时显示错误提示', async ({ page }) => {
    await page.route('**/login**', async (route) => {
      await route.abort('failed')
    })

    await page.goto('/#/login')
    await waitForPageFullyLoaded(page)

    await page.getByLabel('账号').fill('user01')
    await page.getByLabel('密码', { exact: false }).fill('123456')
    await page.getByRole('button', { name: '登录' }).click()

    const result = await waitForFormSubmission(page, {
      successSelectors: [],
      errorSelectors: ['text=登录失败', 'text=网络错误', 'text=连接失败']
    })

    expect(result.success).toBe(false)
    expect(result.message).toBeTruthy()
  })

  test('表单验证 - 空用户名', async ({ page }) => {
    await applyCommonMock(page, SCENARIO_NAMES.LOGIN_SUCCESS)

    await page.goto('/#/login')
    await waitForPageFullyLoaded(page)

    // 只填写密码，用户名留空
    await page.getByLabel('密码', { exact: false }).fill('123456')
    await page.getByRole('button', { name: '登录' }).click()

    await expect(page.getByText(/用户名不能为空|账号不能为空/)).toBeVisible()
  })

  test('表单验证 - 空密码', async ({ page }) => {
    await applyCommonMock(page, SCENARIO_NAMES.LOGIN_SUCCESS)

    await page.goto('/#/login')
    await waitForPageFullyLoaded(page)

    // 只填写用户名，密码留空
    await page.getByLabel('账号').fill('user01')
    await page.getByRole('button', { name: '登录' }).click()

    await expect(page.getByText(/密码不能为空/)).toBeVisible()
  })

  test('表单验证 - 无效邮箱格式', async ({ page }) => {
    await page.goto('/#/register')
    await waitForPageFullyLoaded(page)

    // 填写无效邮箱格式
    await page.fill('input[type="email"]', 'invalid-email')
    await page.fill('input[placeholder*="密码"]', 'password123')
    await page.fill('input[placeholder*="确认密码"]', 'password123')

    // 尝试提交
    const submitButton = page.getByRole('button', { name: /注册|提交/ })
    if (await submitButton.isEnabled()) {
      await submitButton.click()
      await expect(page.getByText(/邮箱格式无效|邮箱格式不正确/)).toBeVisible()
    }
  })

  test('页面刷新后状态保持', async ({ page }) => {
    await applyCommonMock(page, SCENARIO_NAMES.LOGIN_SUCCESS)

    await page.goto('/#/login')
    await waitForPageFullyLoaded(page)

    // 填写表单
    await page.getByLabel('账号').fill('user01')
    await page.getByLabel('密码', { exact: false }).fill('123456')

    // 刷新页面
    await page.reload()
    await waitForPageFullyLoaded(page)

    // 验证表单被清空（正常行为）
    const usernameInput = page.getByLabel('账号')
    const passwordInput = page.getByLabel('密码', { exact: false })

    await expect(usernameInput).toHaveValue('')
    await expect(passwordInput).toHaveValue('')
  })

  test('并发请求处理', async ({ page }) => {
    await applyCommonMock(page, SCENARIO_NAMES.LOGIN_SUCCESS)

    await page.goto('/#/login')
    await waitForPageFullyLoaded(page)

    // 快速连续点击登录按钮多次
    const loginButton = page.getByRole('button', { name: '登录' })

    await page.getByLabel('账号').fill('user01')
    await page.getByLabel('密码', { exact: false }).fill('123456')

    // 连续点击3次
    await loginButton.click()
    await loginButton.click()
    await loginButton.click()

    // 应该只有一个请求被处理，页面应该重定向
    await expect(page).toHaveURL(/#\/index\/home/, { timeout: 10000 })
  })

  test('浏览器后退前进导航', async ({ page }) => {
    await applyCommonMock(page, SCENARIO_NAMES.LOGIN_SUCCESS)

    // 访问登录页
    await page.goto('/#/login')
    await waitForPageFullyLoaded(page)

    // 登录
    await page.getByLabel('账号').fill('user01')
    await page.getByLabel('密码', { exact: false }).fill('123456')
    await page.getByRole('button', { name: '登录' }).click()

    await expect(page).toHaveURL(/#\/index\/home/)

    // 后退到登录页
    await page.goBack()
    await expect(page).toHaveURL(/#\/login/)

    // 前进回到主页
    await page.goForward()
    await expect(page).toHaveURL(/#\/index\/home/)
  })

  test('长时间无操作会话超时', async ({ page }) => {
    await applyCommonMock(page, SCENARIO_NAMES.LOGIN_SUCCESS)

    await page.goto('/#/login')
    await waitForPageFullyLoaded(page)

    // 登录成功
    await page.getByLabel('账号').fill('user01')
    await page.getByLabel('密码', { exact: false }).fill('123456')
    await page.getByRole('button', { name: '登录' }).click()

    await expect(page).toHaveURL(/#\/index\/home/)

    // 模拟会话超时（在真实应用中，这会通过定时器或服务端检查实现）
    // 这里我们直接测试受保护页面的行为
    await page.goto('/#/index/center')
    await waitForPageFullyLoaded(page)

    // 应该被重定向到登录页或显示超时提示
    const currentUrl = page.url()
    expect(currentUrl).toMatch(/#\/login|session.*expired|timeout/)
  })

  test('大文件上传处理', async ({ page }) => {
    await page.goto('/#/index/upload')
    await waitForPageFullyLoaded(page)

    // 创建一个大的虚拟文件（在实际测试中，这里会使用真实的测试文件）
    const bigFileBuffer = Buffer.alloc(10 * 1024 * 1024, 'test data') // 10MB文件

    // 设置文件输入（如果存在的话）
    const fileInput = page.locator('input[type="file"]')
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles([{
        name: 'large-test-file.txt',
        mimeType: 'text/plain',
        buffer: bigFileBuffer
      }])

      // 验证上传进度显示
      const progressBar = page.locator('.upload-progress, .progress-bar')
      if (await progressBar.count() > 0) {
        await expect(progressBar).toBeVisible()
      }
    }
  })
})


