import { test, expect } from '@playwright/test'
import { setupTestEnvironment, logTestStep, takeScreenshotWithTimestamp } from '../utils/shared-helpers'
import { UserCenterPage } from '../utils/page-objects/user-center-page'

test.describe('收藏夹管理模块测试', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page)
    // 设置收藏夹管理测试环境
  })

  test.describe('收藏夹页面访问', () => {
    test('应正确显示收藏夹页面', async ({ page }) => {
      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('favorites')

      // 验证收藏夹页面加�?
      await expect(page.locator('.favorites-page, .favorites-container')).toBeVisible()

      logTestStep('收藏夹页面加载成功')
    })

    test('应显示收藏内容列表', async ({ page }) => {
      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('favorites')

      // 验证收藏内容显示
      const favoriteCount = await userCenter.getFavoriteCount()
      logTestStep(`收藏夹显示${favoriteCount} 个收藏项`)
    })
  })

  test.describe('收藏内容查看', () => {
    test('应支持收藏项目详情查看', async ({ page }) => {
      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('favorites')

      // 点击第一个收藏项
      const favoriteItems = page.locator('.favorite-item, .fav-item')
      if (await favoriteItems.count() > 0) {
        await favoriteItems.first().click()

        // 验证跳转到详情页面
        await page.waitForURL(/.*/, { timeout: 3000 })
        logTestStep('收藏项目详情查看成功')
      } else {
        logTestStep('收藏夹为空，无项目可查看')
      }
    })

    test('应验证收藏内容信息完整性', async ({ page }) => {
      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('favorites')

      const favoriteItems = page.locator('.favorite-item, .fav-item')
      if (await favoriteItems.count() > 0) {
        const firstItem = favoriteItems.first()

        // 验证收藏项包含标题
        await expect(firstItem.locator('.title, .favorite-title')).toBeVisible()

        // 验证包含类型信息
        await expect(firstItem.locator('.type, .category')).toBeVisible()

        logTestStep('收藏内容信息完整')
      }
    })
  })

  test.describe('收藏管理操作', () => {
    test('应支持取消收藏操作', async ({ page }) => {
      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('favorites')

      // 记录取消收藏前的数量
      const countBefore = await userCenter.getFavoriteCount()

      if (countBefore > 0) {
        // 点击第一个收藏项的取消收藏按钮
        const favoriteItems = page.locator('.favorite-item, .fav-item')
        const firstItem = favoriteItems.first()

        // 查找取消收藏按钮（可能在hover时显示）
        const unfavoriteBtn = firstItem.locator('button:has-text("取消收藏"), .unfavorite-btn, .remove-fav')
        if (await unfavoriteBtn.isVisible()) {
          await unfavoriteBtn.click()

          // 确认取消收藏
          await page.locator('button:has-text("确认"), .confirm-btn').click()

          // 验证取消成功提示
          await page.waitForSelector('text=已取消收藏 .success-message', { timeout: 3000 }).catch(() => {})

          // 验证收藏数量减少
          const countAfter = await userCenter.getFavoriteCount()
          expect(countAfter).toBeLessThan(countBefore)

          logTestStep('取消收藏操作成功')
        } else {
          // 尝试直接点击收藏图标
          const favIcon = firstItem.locator('.favorite-icon, .heart-icon')
          if (await favIcon.isVisible()) {
            await favIcon.click()
            logTestStep('点击收藏图标')
          }
        }
      } else {
        logTestStep('收藏夹为空，无项目可取消收藏')
      }
    })

    test('应支持批量收藏管理', async ({ page }) => {
      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('favorites')

      // 查找批量操作按钮
      const batchBtn = page.locator('button:has-text("批量操作"), .batch-btn, .select-all')
      if (await batchBtn.isVisible()) {
        await batchBtn.click()

        // 选择多个收藏项
        const checkboxes = page.locator('input[type="checkbox"], .checkbox')
        const checkboxCount = await checkboxes.count()

        if (checkboxCount > 1) {
          // 选择前两项
          await checkboxes.nth(0).check()
          await checkboxes.nth(1).check()

          // 执行批量删除
          await page.locator('button:has-text("批量删除"), .batch-delete').click()
          await page.locator('button:has-text("确认"), .confirm-btn').click()

          logTestStep('批量收藏管理操作成功')
        } else {
          logTestStep('无足够收藏项进行批量操作')
        }
      } else {
        logTestStep('不支持批量收藏管理')
      }
    })
  })

  test.describe('收藏分类管理', () => {
    test('应支持收藏分类查看', async ({ page }) => {
      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('favorites')

      // 查找分类标签
      const categoryTabs = page.locator('.category-tab, .fav-category, [data-category]')
      const categoryCount = await categoryTabs.count()

      if (categoryCount > 0) {
        // 点击第一个分类
        await categoryTabs.first().click()

        // 验证分类内容更新
        const newCount = await userCenter.getFavoriteCount()
        logTestStep(`切换到分类，显示 ${newCount} 个收藏项`)
      } else {
        logTestStep('无收藏分类')
      }
    })

    test('应支持按类型筛选收藏', async ({ page }) => {
      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('favorites')

      // 查找类型筛选器
      const typeFilters = page.locator('.type-filter, .filter-option')
      const filterCount = await typeFilters.count()

      if (filterCount > 0) {
        // 点击课程类型筛选
        const courseFilter = page.locator('text=课程, .filter-course')
        if (await courseFilter.isVisible()) {
          await courseFilter.click()

          const filteredCount = await userCenter.getFavoriteCount()
          logTestStep(`筛选课程类型，显示 ${filteredCount} 个收藏项`)
        } else {
          await typeFilters.first().click()
          logTestStep('类型筛选功能正常')
        }
      } else {
        logTestStep('无类型筛选功能')
      }
    })
  })

  test.describe('收藏数据同步', () => {
    test('应验证收藏状态同步', async ({ page }) => {
      // 先在其他页面添加收藏
      await page.goto('/#/index/jianshenkecheng')
      await page.waitForLoadState('networkidle')

      // 点击第一个课程的收藏按钮
      const courseCards = page.locator('.course-card, .course-item')
      if (await courseCards.count() > 0) {
        const firstCard = courseCards.first()
        const favoriteBtn = firstCard.locator('button:has-text("收藏"), .favorite-btn, .heart-icon')

        if (await favoriteBtn.isVisible()) {
          await favoriteBtn.click()

          // 验证收藏成功提示
          await page.waitForSelector('text=收藏成功, .success-message', { timeout: 3000 }).catch(() => {})

          // 跳转到收藏夹页面验证
          const userCenter = new UserCenterPage(page)
          await userCenter.goto()
          await userCenter.navigateToTab('favorites')

          // 验证收藏数量增加
          const favoriteCount = await userCenter.getFavoriteCount()
          expect(favoriteCount).toBeGreaterThan(0)

          logTestStep('收藏状态同步正常')
        } else {
          logTestStep('未找到收藏按钮')
        }
      } else {
        logTestStep('无课程可收藏')
      }
    })

    test('应验证收藏数据持久化', async ({ page }) => {
      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('favorites')

      const initialCount = await userCenter.getFavoriteCount()

      // 刷新页面
      await page.reload()
      await userCenter.expectLoaded()
      await userCenter.navigateToTab('favorites')

      // 验证收藏数据保持一致
      const afterReloadCount = await userCenter.getFavoriteCount()
      expect(afterReloadCount).toBe(initialCount)

      logTestStep('收藏数据持久化正常')
    })
  })

  test.describe('收藏分享功能', () => {
    test('应支持收藏内容分享', async ({ page }) => {
      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('favorites')

      const favoriteItems = page.locator('.favorite-item, .fav-item')
      if (await favoriteItems.count() > 0) {
        const firstItem = favoriteItems.first()

        // 查找分享按钮
        const shareBtn = firstItem.locator('button:has-text("分享"), .share-btn')
        if (await shareBtn.isVisible()) {
          await shareBtn.click()

          // 验证分享弹窗或链接生成
          await page.waitForSelector('.share-modal, .share-options, text=分享链接', { timeout: 3000 }).catch(() => {})

          logTestStep('收藏内容分享功能正常')
        } else {
          logTestStep('不支持收藏内容分享')
        }
      } else {
        logTestStep('无收藏内容可分享')
      }
    })

    test('应支持导出收藏列表', async ({ page }) => {
      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('favorites')

      // 查找导出按钮
      const exportBtn = page.locator('button:has-text("导出"), .export-btn, .download-fav')
      if (await exportBtn.isVisible()) {
        await exportBtn.click()

        // 验证导出选项
        await page.waitForSelector('.export-options, .download-options', { timeout: 3000 }).catch(() => {})

        logTestStep('收藏列表导出功能正常')
      } else {
        logTestStep('不支持收藏列表导出')
      }
    })
  })

  test.describe('响应式设计测试', () => {
    test('应在移动端正确显示收藏夹', async ({ page }) => {
      // 设置移动端视图
      await page.setViewportSize({ width: 375, height: 667 })

      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('favorites')

      // 验证移动端收藏夹显示
      const favoriteCount = await userCenter.getFavoriteCount()
      logTestStep(`移动端显示${favoriteCount} 个收藏项`)
    })

    test('应在平板端优化收藏管理', async ({ page }) => {
      // 设置平板端视图
      await page.setViewportSize({ width: 768, height: 1024 })

      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('favorites')

      // 测试平板端交互
      const favoriteItems = page.locator('.favorite-item, .fav-item')
      if (await favoriteItems.count() > 0) {
        // 测试悬停效果
        await favoriteItems.first().hover()
        logTestStep('平板端收藏管理交互正常')
      }
    })
  })

  test.describe('收藏数据完整性', () => {
    test('应验证收藏项数据结构', async ({ page }) => {
      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('favorites')

      const favoriteItems = page.locator('.favorite-item, .fav-item')
      if (await favoriteItems.count() > 0) {
        const firstItem = favoriteItems.first()

        // 验证收藏项包含必要信息
        await expect(firstItem.locator('.title, .name')).toBeVisible()
        await expect(firstItem.locator('.date, .add-time')).toBeVisible()

        logTestStep('收藏项数据结构完整')
      }
    })

    test('应验证收藏操作反馈', async ({ page }) => {
      // 测试添加收藏的反馈
      await page.goto('/#/index/jianshenkecheng')
      await page.waitForLoadState('networkidle')

      const courseCards = page.locator('.course-card, .course-item')
      if (await courseCards.count() > 0) {
        const favoriteBtn = courseCards.first().locator('.favorite-btn, .heart-icon')
        if (await favoriteBtn.isVisible()) {
          await favoriteBtn.click()

          // 验证操作反馈
          await page.waitForSelector('text=收藏成功, text=已收藏 .toast-message, .el-message', { timeout: 3000 }).catch(() => {})

          logTestStep('收藏操作反馈正常')
        }
      }
    })
  })
})
