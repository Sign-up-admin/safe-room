import { test as setup } from '@playwright/test'
import { ensureAuthDirectory, FRONT_STORAGE_STATE, getFrontCredentials, tryFrontLogin } from '../utils/auth'

setup('seed front auth state', async ({ page }) => {
  const credentials = getFrontCredentials()

  if (!credentials) {
    setup.skip()
  }

  ensureAuthDirectory()
  await page.goto('/#/login')
  await page.waitForLoadState('domcontentloaded')

  const success = await tryFrontLogin(page, credentials)

  if (!success) {
    setup.skip()
  }

  await page.context().storageState({ path: FRONT_STORAGE_STATE })
})


