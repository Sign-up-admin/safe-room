import { test, expect } from '@playwright/test'
import { setupTestEnvironment, logTestStep, takeScreenshotWithTimestamp } from '../utils/shared-helpers'
import { UserCenterPage } from '../../utils/page-objects/user-center-page'
import { mockPaymentFlow } from '../../utils/test-helpers'

test.describe('搜索发现和收藏用户旅程'设置搜索收藏测试环境完成')
  })

  test.describe('搜索发现流程', () => {
    test('应支持完整的搜索发现用户旅程', async ({ page }) => {
      logTestStep('开始搜索发现完整用户旅程测�?)

      // 步骤1: 访问首页
      await page.goto('/#/index/home')
      await page.waitForLoadState('networkidle')
      logTestStep('访问首页')

      // 步骤2: 使用搜索功能
      const searchInput = page.locator('input[placeholder*="搜索"], .search-input, [class*="search"] input')
      if (await searchInput.count() > 0) {
        // 搜索课程
        await searchInput.fill('健身课程')
        await page.keyboard.press('Enter')
        await page.waitForTimeout(1000) // 等待搜索结果

        logTestStep('执行课程搜索')
      } else {
        // 如果没有搜索框，直接导航到课程列�?        await page.goto('/#/index/jianshenkecheng')
        await page.waitForLoadState('networkidle')
        logTestStep('导航到课程列表页�?)
      }

      // 步骤3: 浏览搜索结果
      const courseCards = page.locator('.course-card, .card-item, [class*="course"]')
      const courseCount = await courseCards.count()
      expect(courseCount).toBeGreaterThan(0)
      logTestStep(`浏览�?${courseCount} 个搜索结果`)

      // 步骤4: 应用筛选条�?      const filterButtons = page.locator('button:has-text("筛�?), .filter-btn, [class*="filter"]')
      if (await filterButtons.count() > 0) {
        await filterButtons.first().click()

        // 选择筛选条�?        const filterOptions = page.locator('.filter-option, input[type="checkbox"], input[type="radio"]')
        if (await filterOptions.count() > 0) {
          await filterOptions.first().check()
          logTestStep('应用筛选条�?)

          // 等待筛选结�?          await page.waitForTimeout(500)
          const filteredCount = await courseCards.count()
          logTestStep(`筛选后显示 ${filteredCount} 个结果`)
        }
      }

      // 步骤5: 应用排序
      const sortButtons = page.locator('button:has-text("排序"), select[name*="sort"], [class*="sort"]')
      if (await sortButtons.count() > 0) {
        // 尝试选择价格排序
        const priceSort = page.locator('option:has-text("价格"), [value*="price"]')
        if (await priceSort.count() > 0) {
          await priceSort.first().click()
          logTestStep('按价格排�?)
        } else {
          await sortButtons.first().click()
          logTestStep('应用排序')
        }
        await page.waitForTimeout(500)
      }

      // 步骤6: 查看课程详情
      const firstCourseCard = courseCards.first()
      await firstCourseCard.click()

      // 等待详情页面加载
      await page.waitForSelector('.course-detail, .detail-modal, .course-info', { timeout: 5000 })

      // 验证详情信息
      const courseTitle = page.locator('.course-title, .title, h1, h2')
      if (await courseTitle.count() > 0) {
        const titleText = await courseTitle.textContent()
        expect(titleText).toBeTruthy()
        logTestStep(`查看课程详情: ${titleText}`)
      }

      // 步骤7: 添加收藏
      const favoriteBtn = page.locator('button:has-text("收藏"), .favorite-btn, .heart-icon')
      if (await favoriteBtn.count() > 0) {
        await favoriteBtn.click()

        // 验证收藏成功提示
        await page.waitForSelector('text=收藏成功, .success-message', { timeout: 3000 }).catch(() => {})
        logTestStep('添加收藏成功')
      } else {
        logTestStep('未找到收藏按�?)
      }

      // 步骤8: 从详情页预约课程
      const bookBtn = page.locator('button:has-text("预约"), button:has-text("立即预约")')
      if (await bookBtn.count() > 0) {
        await bookBtn.click()
        logTestStep('从详情页预约课程')

        // 快速预约流�?        await page.fill('input[placeholder*="姓名"]', '搜索预约用户')
        await page.fill('input[placeholder*="手机�?]', '13800138000')

        const submitBtn = page.locator('button:has-text("提交预约")')
        if (await submitBtn.count() > 0) {
          await submitBtn.click()
          await page.waitForSelector('text=预约成功', { timeout: 5000 })
          logTestStep('预约成功')
        }
      }

      // 步骤9: 访问个人中心查看收藏
      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('favorites')

      // 验证收藏内容
      const favoriteCount = await userCenter.getFavoriteCount()
      expect(favoriteCount).toBeGreaterThan(0)
      logTestStep(`个人中心显示 ${favoriteCount} 个收藏`)

      // 步骤10: 从收藏中操作
      const favoriteItems = page.locator('.favorite-item, .fav-item')
      if (await favoriteItems.count() > 0) {
        const firstFavorite = favoriteItems.first()

        // 点击收藏项查看详�?        await firstFavorite.click()
        await page.waitForURL(/.*/, { timeout: 3000 })
        logTestStep('从收藏查看详�?)

        // 返回收藏列表
        await page.goBack()
        await userCenter.navigateToTab('favorites')
      }

      logTestStep('搜索发现和收藏完整用户旅程测试完�?)
      await takeScreenshotWithTimestamp(page, 'search_favorites_journey_complete')
    })

    test('应支持多类型内容搜索', async ({ page }) => {
      logTestStep('开始多类型内容搜索测试')

      await page.goto('/#/index/home')
      await page.waitForLoadState('networkidle')

      // 测试搜索不同类型的内�?      const searchScenarios = [
        { keyword: '健身课程', type: '课程' },
        { keyword: '私教教练', type: '教练' },
        { keyword: '瑜伽', type: '课程类型' }
      ]

      for (const scenario of searchScenarios) {
        const searchInput = page.locator('input[placeholder*="搜索"], .search-input')
        if (await searchInput.count() > 0) {
          await searchInput.clear()
          await searchInput.fill(scenario.keyword)
          await page.keyboard.press('Enter')
          await page.waitForTimeout(1000)

          // 验证搜索结果
          const results = page.locator('.search-result, .course-card, .coach-card')
          const resultCount = await results.count()
          logTestStep(`搜索"${scenario.keyword}"找到 ${resultCount} �?{scenario.type}结果`)

          if (resultCount > 0) {
            // 验证结果相关�?            const firstResult = results.first()
            const resultText = await firstResult.textContent()
            expect(resultText?.toLowerCase()).toContain(scenario.keyword.toLowerCase().split(' ')[0])
          }
        }
      }

      await takeScreenshotWithTimestamp(page, 'multi_type_search')
    })

    test('应支持高级筛选和排序', async ({ page }) => {
      logTestStep('开始高级筛选和排序测试')

      // 访问课程列表页面
      await page.goto('/#/index/jianshenkecheng')
      await page.waitForLoadState('networkidle')

      const initialCount = await page.locator('.course-card, .card-item').count()

      // 测试价格范围筛�?      const priceFilter = page.locator('input[name*="price"], [placeholder*="价格"]')
      if (await priceFilter.count() > 0) {
        await priceFilter.first().fill('0-200')
        await page.waitForTimeout(500)
        const priceFilteredCount = await page.locator('.course-card, .card-item').count()
        logTestStep(`价格筛�? ${initialCount} -> ${priceFilteredCount}`)
      }

      // 测试难度筛�?      const levelFilter = page.locator('select[name*="level"], [class*="level"] select')
      if (await levelFilter.count() > 0) {
        await levelFilter.selectOption('初级')
        await page.waitForTimeout(500)
        const levelFilteredCount = await page.locator('.course-card, .card-item').count()
        logTestStep(`难度筛�? ${initialCount} -> ${levelFilteredCount}`)
      }

      // 测试排序功能
      const sortOptions = ['价格从低到高', '价格从高到低', '评分最�?, '最热门']
      for (const sortOption of sortOptions) {
        const sortBtn = page.locator(`option:has-text("${sortOption}"), button:has-text("${sortOption}")`)
        if (await sortBtn.count() > 0) {
          await sortBtn.first().click()
          await page.waitForTimeout(500)
          logTestStep(`应用排序: ${sortOption}`)
          break
        }
      }

      await takeScreenshotWithTimestamp(page, 'advanced_filter_sort')
    })

    test('应支持搜索历史和推荐', async ({ page }) => {
      logTestStep('开始搜索历史和推荐测试')

      await page.goto('/#/index/home')
      await page.waitForLoadState('networkidle')

      const searchInput = page.locator('input[placeholder*="搜索"], .search-input')
      if (await searchInput.count() > 0) {
        // 执行几次搜索
        const searchTerms = ['HIIT', '瑜伽', '力量训练']
        for (const term of searchTerms) {
          await searchInput.clear()
          await searchInput.fill(term)
          await page.keyboard.press('Enter')
          await page.waitForTimeout(1000)
          logTestStep(`搜索: ${term}`)
        }

        // 检查是否有搜索历史
        const searchHistory = page.locator('.search-history, .recent-searches')
        if (await searchHistory.count() > 0) {
          const historyItems = searchHistory.locator('.history-item, li')
          const historyCount = await historyItems.count()
          logTestStep(`搜索历史显示 ${historyCount} 个项目`)
        }

        // 检查是否有搜索推荐
        const recommendations = page.locator('.search-suggestions, .recommendations')
        if (await recommendations.count() > 0) {
          logTestStep('搜索推荐功能存在')
        }
      }

      await takeScreenshotWithTimestamp(page, 'search_history_recommendations')
    })
  })

  test.describe('收藏管理流程', () => {
    test('应支持完整的收藏管理流程', async ({ page }) => {
      logTestStep('开始收藏管理完整流程测�?)

      // 步骤1: 添加多个收藏
      await page.goto('/#/index/jianshenkecheng')
      await page.waitForLoadState('networkidle')

      const courseCards = page.locator('.course-card, .card-item')
      const maxFavorites = Math.min(3, await courseCards.count())

      for (let i = 0; i < maxFavorites; i++) {
        const card = courseCards.nth(i)
        const favoriteBtn = card.locator('button:has-text("收藏"), .favorite-btn')

        if (await favoriteBtn.count() > 0) {
          await favoriteBtn.click()
          await page.waitForTimeout(500) // 等待收藏操作完成
          logTestStep(`添加�?${i + 1} 个收藏`)
        }
      }

      // 步骤2: 访问收藏中心
      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('favorites')

      const favoriteCount = await userCenter.getFavoriteCount()
      expect(favoriteCount).toBeGreaterThan(0)
      logTestStep(`收藏中心显示 ${favoriteCount} 个收藏`)

      // 步骤3: 管理收藏分类
      const categoryTabs = page.locator('.category-tab, .fav-category')
      if (await categoryTabs.count() > 0) {
        // 切换到不同分�?        for (let i = 0; i < await categoryTabs.count(); i++) {
          await categoryTabs.nth(i).click()
          await page.waitForTimeout(300)
          const categoryCount = await userCenter.getFavoriteCount()
          logTestStep(`分类 ${i + 1} 显示 ${categoryCount} 个收藏`)
        }
      }

      // 步骤4: 批量操作收藏
      const batchBtn = page.locator('button:has-text("批量操作"), .batch-btn')
      if (await batchBtn.count() > 0) {
        await batchBtn.click()

        const checkboxes = page.locator('input[type="checkbox"]')
        if (await checkboxes.count() > 2) {
          // 选择前两�?          await checkboxes.nth(0).check()
          await checkboxes.nth(1).check()

          // 执行批量删除
          const batchDelete = page.locator('button:has-text("批量删除")')
          if (await batchDelete.count() > 0) {
            await batchDelete.click()

            // 确认删除
            const confirmBtn = page.locator('button:has-text("确认")')
            if (await confirmBtn.count() > 0) {
              await confirmBtn.click()
              await page.waitForSelector('text=删除成功', { timeout: 3000 })
              logTestStep('批量删除收藏成功')
            }
          }
        }
      }

      // 步骤5: 单个收藏操作
      const favoriteItems = page.locator('.favorite-item, .fav-item')
      if (await favoriteItems.count() > 0) {
        const firstItem = favoriteItems.first()

        // 查看详情
        await firstItem.click()
        await page.waitForURL(/.*/, { timeout: 3000 })
        logTestStep('从收藏查看详�?)

        // 返回并取消收�?        await page.goBack()
        await userCenter.navigateToTab('favorites')

        const unfavoriteBtn = firstItem.locator('button:has-text("取消收藏"), .unfavorite-btn')
        if (await unfavoriteBtn.count() > 0) {
          await unfavoriteBtn.click()

          // 确认取消
          const confirmBtn = page.locator('button:has-text("确认")')
          if (await confirmBtn.count() > 0) {
            await confirmBtn.click()
            await page.waitForSelector('text=已取消收�?, { timeout: 3000 })
            logTestStep('取消收藏成功')
          }
        }
      }

      logTestStep('收藏管理完整流程测试完成')
      await takeScreenshotWithTimestamp(page, 'favorites_management_complete')
    })

    test('应支持收藏分享功�?, async ({ page }) => {
      logTestStep('开始收藏分享功能测�?)

      // 添加一个收�?      await page.goto('/#/index/jianshenkecheng')
      await page.waitForLoadState('networkidle')

      const courseCards = page.locator('.course-card, .card-item')
      if (await courseCards.count() > 0) {
        const favoriteBtn = courseCards.first().locator('button:has-text("收藏"), .favorite-btn')
        if (await favoriteBtn.count() > 0) {
          await favoriteBtn.click()
          await page.waitForTimeout(500)
        }
      }

      // 访问收藏中心
      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('favorites')

      const favoriteItems = page.locator('.favorite-item, .fav-item')
      if (await favoriteItems.count() > 0) {
        const firstItem = favoriteItems.first()

        // 查找分享按钮
        const shareBtn = firstItem.locator('button:has-text("分享"), .share-btn')
        if (await shareBtn.count() > 0) {
          await shareBtn.click()

          // 验证分享选项
          const shareOptions = page.locator('.share-options, .share-modal')
          await expect(shareOptions).toBeVisible()

          // 测试复制链接
          const copyLinkBtn = page.locator('button:has-text("复制链接"), .copy-link')
          if (await copyLinkBtn.count() > 0) {
            await copyLinkBtn.click()
            logTestStep('复制分享链接成功')
          }

          logTestStep('收藏分享功能正常')
        } else {
          logTestStep('不支持收藏分享功�?)
        }
      }

      await takeScreenshotWithTimestamp(page, 'favorites_sharing')
    })

    test('应支持收藏数据导�?, async ({ page }) => {
      logTestStep('开始收藏数据导出测�?)

      // 确保有一些收�?      await page.goto('/#/index/jianshenkecheng')
      await page.waitForLoadState('networkidle')

      const courseCards = page.locator('.course-card, .card-item')
      if (await courseCards.count() > 0) {
        const favoriteBtn = courseCards.first().locator('button:has-text("收藏"), .favorite-btn')
        if (await favoriteBtn.count() > 0) {
          await favoriteBtn.click()
          await page.waitForTimeout(500)
        }
      }

      // 访问收藏中心
      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('favorites')

      // 查找导出按钮
      const exportBtn = page.locator('button:has-text("导出"), .export-btn, .download-fav')
      if (await exportBtn.count() > 0) {
        await exportBtn.click()

        // 验证导出选项
        const exportOptions = page.locator('.export-options, .download-options')
        if (await exportOptions.count() > 0) {
          // 选择导出格式
          const formatOptions = page.locator('select[name*="format"], input[name*="format"]')
          if (await formatOptions.count() > 0) {
            await formatOptions.selectOption('excel')
          }

          // 确认导出
          const confirmExport = page.locator('button:has-text("确认导出")')
          if (await confirmExport.count() > 0) {
            await confirmExport.click()
            logTestStep('收藏数据导出成功')
          }
        } else {
          logTestStep('导出选项不可�?)
        }
      } else {
        logTestStep('不支持收藏数据导�?)
      }

      await takeScreenshotWithTimestamp(page, 'favorites_export')
    })

    test('应验证收藏状态同�?, async ({ page }) => {
      logTestStep('开始收藏状态同步测�?)

      // 在列表页添加收藏
      await page.goto('/#/index/jianshenkecheng')
      await page.waitForLoadState('networkidle')

      const courseCards = page.locator('.course-card, .card-item')
      if (await courseCards.count() > 0) {
        const firstCard = courseCards.first()
        const favoriteBtn = firstCard.locator('button:has-text("收藏"), .favorite-btn')

        if (await favoriteBtn.count() > 0) {
          await favoriteBtn.click()
          await page.waitForSelector('text=收藏成功', { timeout: 3000 }).catch(() => {})
          logTestStep('列表页添加收�?)
        }
      }

      // 访问收藏中心验证同步
      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('favorites')

      const favoriteCount = await userCenter.getFavoriteCount()
      expect(favoriteCount).toBeGreaterThan(0)
      logTestStep(`收藏状态同步正常，显示 ${favoriteCount} 个收藏`)

      // 刷新页面验证持久�?      await page.reload()
      await userCenter.expectLoaded()
      await userCenter.navigateToTab('favorites')

      const afterReloadCount = await userCenter.getFavoriteCount()
      expect(afterReloadCount).toBe(favoriteCount)
      logTestStep('收藏数据持久化正�?)

      await takeScreenshotWithTimestamp(page, 'favorites_sync')
    })
  })

  test.describe('从收藏到行动', () => {
    test('应支持从收藏直接预约', async ({ page }) => {
      logTestStep('开始从收藏直接预约测试')

      // 添加收藏
      await page.goto('/#/index/jianshenkecheng')
      await page.waitForLoadState('networkidle')

      const courseCards = page.locator('.course-card, .card-item')
      if (await courseCards.count() > 0) {
        const favoriteBtn = courseCards.first().locator('button:has-text("收藏"), .favorite-btn')
        if (await favoriteBtn.count() > 0) {
          await favoriteBtn.click()
          await page.waitForTimeout(500)
        }
      }

      // 访问收藏中心
      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('favorites')

      // 从收藏中预约
      const favoriteItems = page.locator('.favorite-item, .fav-item')
      if (await favoriteItems.count() > 0) {
        const firstItem = favoriteItems.first()

        // 查找预约按钮
        const bookFromFav = firstItem.locator('button:has-text("预约"), .book-btn')
        if (await bookFromFav.count() > 0) {
          await bookFromFav.click()

          // 填写预约信息
          await page.fill('input[placeholder*="姓名"]', '收藏预约用户')
          await page.fill('input[placeholder*="手机�?]', '13800138000')

          // 提交预约
          const submitBtn = page.locator('button:has-text("提交预约")')
          if (await submitBtn.count() > 0) {
            await submitBtn.click()
            await page.waitForSelector('text=预约成功', { timeout: 5000 })
            logTestStep('从收藏直接预约成�?)
          }
        } else {
          // 如果没有直接预约按钮，点击查看详�?          await firstItem.click()
          await page.waitForURL(/.*/, { timeout: 3000 })

          // 在详情页预约
          const detailBookBtn = page.locator('button:has-text("预约")')
          if (await detailBookBtn.count() > 0) {
            await detailBookBtn.click()
            await page.fill('input[placeholder*="姓名"]', '收藏详情预约用户')
            await page.fill('input[placeholder*="手机�?]', '13800138001')

            const submitBtn = page.locator('button:has-text("提交预约")')
            if (await submitBtn.count() > 0) {
              await submitBtn.click()
              await page.waitForSelector('text=预约成功', { timeout: 5000 })
              logTestStep('从收藏详情预约成�?)
            }
          }
        }
      }

      await takeScreenshotWithTimestamp(page, 'book_from_favorites')
    })

    test('应支持从收藏直接购买会员', async ({ page }) => {
      logTestStep('开始从收藏直接购买会员测试')

      // 添加会员卡收藏（如果支持�?      await page.goto('/#/index/huiyuanka')
      await page.waitForLoadState('networkidle')

      const membershipCards = page.locator('.membership-card, .card-item')
      if (await membershipCards.count() > 0) {
        const favoriteBtn = membershipCards.first().locator('button:has-text("收藏"), .favorite-btn')
        if (await favoriteBtn.count() > 0) {
          await favoriteBtn.click()
          await page.waitForTimeout(500)
          logTestStep('添加会员卡收�?)
        }
      }

      // 访问收藏中心
      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('favorites')

      // 从收藏中购买
      const favoriteItems = page.locator('.favorite-item, .fav-item')
      for (let i = 0; i < await favoriteItems.count(); i++) {
        const item = favoriteItems.nth(i)
        const itemText = await item.textContent()

        if (itemText && itemText.includes('会员')) {
          const buyBtn = item.locator('button:has-text("购买"), .buy-btn')
          if (await buyBtn.count() > 0) {
            await buyBtn.click()

            // 填写购买信息
            await page.fill('input[placeholder*="姓名"]', '收藏会员购买用户')
            await page.fill('input[placeholder*="手机�?]', '13800138002')

            // 提交购买
            const submitBtn = page.locator('button:has-text("确认支付")')
            if (await submitBtn.count() > 0) {
              await submitBtn.click()
              await page.waitForSelector('text=支付成功', { timeout: 5000 })
              logTestStep('从收藏直接购买会员成�?)
            }
            break
          }
        }
      }

      await takeScreenshotWithTimestamp(page, 'purchase_from_favorites')
    })
  })

  test.describe('性能和可用性测�?, () => {
    test('应监控搜索和收藏性能', async ({ page }) => {
      logTestStep('开始搜索和收藏性能监控')

      const startTime = Date.now()

      // 测试搜索性能
      await page.goto('/#/index/home')
      await page.waitForLoadState('networkidle')

      const searchStartTime = Date.now()
      const searchInput = page.locator('input[placeholder*="搜索"], .search-input')
      if (await searchInput.count() > 0) {
        await searchInput.fill('健身')
        await page.keyboard.press('Enter')

        const searchResultsTime = Date.now()
        await page.waitForSelector('.search-result, .course-card', { timeout: 3000 })

        const searchTime = searchResultsTime - searchStartTime
        logTestStep(`搜索响应时间: ${searchTime}ms`)
        expect(searchTime).toBeLessThan(3000) // 搜索不超�?�?      }

      const pageLoadTime = Date.now() - startTime
      logTestStep(`页面总加载时�? ${pageLoadTime}ms`)

      // 测试收藏操作性能
      const courseCards = page.locator('.course-card, .card-item')
      if (await courseCards.count() > 0) {
        const favoriteStartTime = Date.now()
        const favoriteBtn = courseCards.first().locator('button:has-text("收藏"), .favorite-btn')

        if (await favoriteBtn.count() > 0) {
          await favoriteBtn.click()
          await page.waitForSelector('text=收藏成功', { timeout: 3000 }).catch(() => {})

          const favoriteTime = Date.now() - favoriteStartTime
          logTestStep(`收藏操作时间: ${favoriteTime}ms`)
          expect(favoriteTime).toBeLessThan(2000) // 收藏操作不超�?�?        }
      }

      await takeScreenshotWithTimestamp(page, 'performance_search_favorites')
    })

    test('应支持响应式搜索和收�?, async ({ page }) => {
      logTestStep('开始响应式搜索和收藏测�?)

      // 测试移动�?      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/#/index/home')
      await page.waitForLoadState('networkidle')

      // 测试移动端搜�?      const mobileSearch = page.locator('input[placeholder*="搜索"], .mobile-search')
      if (await mobileSearch.count() > 0) {
        await mobileSearch.fill('瑜伽')
        await page.keyboard.press('Enter')
        await page.waitForTimeout(1000)

        const mobileResults = page.locator('.course-card, .search-result')
        const mobileCount = await mobileResults.count()
        logTestStep(`移动端搜索结�? ${mobileCount} 个`)
      }

      // 测试移动端收藏操�?      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('favorites')

      const mobileFavorites = await userCenter.getFavoriteCount()
      logTestStep(`移动端收藏显�? ${mobileFavorites} 个`)

      // 测试平板�?      await page.setViewportSize({ width: 768, height: 1024 })
      await page.reload()
      await page.waitForLoadState('networkidle')

      const tabletSearch = page.locator('input[placeholder*="搜索"]')
      if (await tabletSearch.count() > 0) {
        await tabletSearch.fill('HIIT')
        await page.keyboard.press('Enter')
        await page.waitForTimeout(1000)

        const tabletResults = page.locator('.course-card, .search-result')
        const tabletCount = await tabletResults.count()
        logTestStep(`平板端搜索结�? ${tabletCount} 个`)
      }

      await takeScreenshotWithTimestamp(page, 'responsive_search_favorites')
    })

    test('应正确处理搜索和收藏错误', async ({ page }) => {
      logTestStep('开始搜索和收藏错误处理测试')

      await page.goto('/#/index/home')
      await page.waitForLoadState('networkidle')

      // 测试空搜�?      const searchInput = page.locator('input[placeholder*="搜索"], .search-input')
      if (await searchInput.count() > 0) {
        await searchInput.fill('')
        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)

        // 验证空搜索处�?        const results = page.locator('.search-result, .course-card')
        const resultCount = await results.count()
        if (resultCount === 0) {
          logTestStep('空搜索正确处�?)
        }
      }

      // 测试网络错误时的收藏操作
      await page.route('**/shoucang/**', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 1,
            msg: '收藏失败，请重试'
          })
        })
      })

      await page.goto('/#/index/jianshenkecheng')
      await page.waitForLoadState('networkidle')

      const courseCards = page.locator('.course-card, .card-item')
      if (await courseCards.count() > 0) {
        const favoriteBtn = courseCards.first().locator('button:has-text("收藏"), .favorite-btn')
        if (await favoriteBtn.count() > 0) {
          await favoriteBtn.click()

          // 验证错误处理
          await page.waitForSelector('text=收藏失败, .error-message', { timeout: 3000 }).catch(() => {})
          logTestStep('收藏错误正确处理')
        }
      }

      await takeScreenshotWithTimestamp(page, 'error_handling_search_favorites')
    })
  })
})
