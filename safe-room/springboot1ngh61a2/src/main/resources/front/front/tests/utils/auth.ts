import { expect, Page } from '@playwright/test'
import fs from 'fs'
import path from 'path'

export type FrontCredentials = {
  username: string
  password: string
  role?: string
}

export const FRONT_STORAGE_STATE = path.resolve(__dirname, '../.auth/front-user.json')

export function ensureAuthDirectory() {
  const dir = path.dirname(FRONT_STORAGE_STATE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export function getFrontCredentials(): FrontCredentials | null {
  const username = process.env.E2E_USERNAME
  const password = process.env.E2E_PASSWORD

  if (!username || !password) {
    return null
  }

  return {
    username,
    password,
    role: process.env.E2E_ROLE,
  }
}

export async function tryFrontLogin(page: Page, credentials: FrontCredentials): Promise<boolean> {
  const usernameInput = page.locator('input[name="username"]')
  const passwordInput = page.locator('input[name="password"]')
  const loginButton = page.getByRole('button', { name: /登录|login/i }).first()

  if ((await usernameInput.count()) === 0 || (await passwordInput.count()) === 0) {
    // 当前版本的前台项目尚未提供可交互的登录表单
    return false
  }

  await usernameInput.fill(credentials.username)
  await passwordInput.fill(credentials.password)

  if (credentials.role) {
    const roleLabel = page.getByLabel(credentials.role)
    if (await roleLabel.count()) {
      await roleLabel.first().check()
    }
  }

  if (await loginButton.count()) {
    await Promise.all([page.waitForLoadState('networkidle'), loginButton.click()])
  } else {
    await passwordInput.press('Enter')
    await page.waitForLoadState('networkidle')
  }

  await expect(page).not.toHaveURL(/login/i)
  return true
}


