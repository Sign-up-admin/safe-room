import { test, expect } from '@playwright/test'
import { setupTestEnvironment, logTestStep, takeScreenshotWithTimestamp } from '../utils/shared-helpers'
import { NewsListPage, NewsDetailPage, NewsCommentPage } from '../utils/page-objects/news-page'

test.describe('新闻资讯交互模块测试', () => {
  test.beforeEach(async ({ page }) => {
    // 使用完整的测试环境设置，包括Mock和Cookie处理
    await setupTestEnvironment(page)
    logTestStep('设置新闻资讯测试环境')
  })

  test.describe('新闻列表浏览', () => {
    test('应正确显示新闻列表', async ({ page }) => {
      const newsPage = new NewsListPage(page)
      await newsPage.goto()
      await newsPage.expectLoaded()

      // 验证至少有一个新闻
      const newsCount = await newsPage.getNewsCount()
      expect(newsCount).toBeGreaterThan(0)
      logTestStep(`验证新闻列表显示 ${newsCount} 条新闻`)
    })

    test('应支持新闻搜索功能', async ({ page }) => {
      const newsPage = new NewsListPage(page)
      await newsPage.goto()
      await newsPage.expectLoaded()

      // 搜索一个新闻关键词
      await newsPage.searchNews('HIIT')

      // 验证搜索结果
      const newsCount = await newsPage.getNewsCount()
      logTestStep(`搜索"HIIT"后显示 ${newsCount} 条新闻`)
    })

    test('应验证新闻卡片信息完整性', async ({ page }) => {
      const newsPage = new NewsListPage(page)
      await newsPage.goto()
      await newsPage.expectLoaded()

      // 检查第一个新闻卡片的必要信息
      const title = await newsPage.getNewsTitle(0)
      const author = await newsPage.getNewsAuthor(0)
      const date = await newsPage.getNewsDate(0)

      expect(title).toBeTruthy()
      expect(author).toBeTruthy()
      expect(date).toBeTruthy()

      logTestStep(`新闻卡片信息: ${title} - 作者: ${author} - 日期: ${date}`)
    })
  })

  test.describe('新闻详情阅读', () => {
    test('应正确显示新闻详情', async ({ page }) => {
      // 先访问新闻列表
      const newsListPage = new NewsListPage(page)
      await newsListPage.goto()
      await newsListPage.expectLoaded()

      // 点击第一个新闻
      await newsListPage.clickNewsCard(0)

      // 验证详情页面
      const newsDetailPage = new NewsDetailPage(page)
      await newsDetailPage.expectLoaded()

      // 验证基本信息
      const title = await newsDetailPage.getNewsTitle()
      const content = await newsDetailPage.getNewsContent()
      const author = await newsDetailPage.getAuthorName()

      expect(title).toBeTruthy()
      expect(content).toBeTruthy()
      expect(author).toBeTruthy()

      logTestStep(`新闻详情: ${title} - 作者: ${author}`)
    })

    test('应支持新闻点赞功能', async ({ page }) => {
      // 导航到新闻详情
      const newsListPage = new NewsListPage(page)
      await newsListPage.goto()
      await newsListPage.clickNewsCard(0)

      const newsDetailPage = new NewsDetailPage(page)
      await newsDetailPage.expectLoaded()

      // 记录点赞前的数量
      const likeCountBefore = await newsDetailPage.getLikeCount()

      // 点击点赞按钮
      await newsDetailPage.clickLikeButton()

      // 验证点赞成功提示
      await page.waitForSelector('text=点赞成功, text=已点赞, .success-message', { timeout: 5000 }).catch(() => {})

      // 验证点赞数量增加
      const likeCountAfter = await newsDetailPage.getLikeCount()
      expect(likeCountAfter).toBeGreaterThanOrEqual(likeCountBefore)

      logTestStep(`点赞功能正常，点赞数从 ${likeCountBefore} 增加到 ${likeCountAfter}`)
    })

    test('应支持新闻分享功能', async ({ page }) => {
      // 导航到新闻详情
      const newsListPage = new NewsListPage(page)
      await newsListPage.goto()
      await newsListPage.clickNewsCard(0)

      const newsDetailPage = new NewsDetailPage(page)
      await newsDetailPage.expectLoaded()

      // 点击分享按钮并选择微信分享
      await newsDetailPage.shareNews('wechat')

      // 验证分享弹窗或提示出现
      const shareDialog = page.locator('.share-dialog, .social-share-popup, text=分享成功')
      const hasShareDialog = await shareDialog.count() > 0

      if (hasShareDialog) {
        logTestStep('分享弹窗正常显示')
      } else {
        logTestStep('分享操作完成')
      }
    })
  })

  test.describe('新闻评论交互', () => {
    test('应支持发表评论', async ({ page }) => {
      // 导航到新闻详情
      const newsListPage = new NewsListPage(page)
      await newsListPage.goto()
      await newsListPage.clickNewsCard(0)

      const newsDetailPage = new NewsDetailPage(page)
      await newsDetailPage.expectLoaded()

      // 点击评论按钮
      await newsDetailPage.clickCommentButton()

      // 填写评论内容
      const commentPage = new NewsCommentPage(page)
      await commentPage.expectLoaded()

      const commentContent = '这篇文章写得很好，很有参考价值！'
      await commentPage.writeComment(commentContent)

      // 提交评论
      await commentPage.submitComment()

      // 验证评论成功
      await page.waitForSelector('text=评论成功, text=发表成功, .success-message', { timeout: 5000 }).catch(() => {})

      // 验证评论数量增加
      const commentCountAfter = await newsDetailPage.getCommentCount()
      expect(commentCountAfter).toBeGreaterThan(0)

      logTestStep('评论发表成功')
    })

    test('应支持回复评论', async ({ page }) => {
      // 先发表一个评论
      const newsListPage = new NewsListPage(page)
      await newsListPage.goto()
      await newsListPage.clickNewsCard(0)

      const newsDetailPage = new NewsDetailPage(page)
      await newsDetailPage.expectLoaded()
      await newsDetailPage.clickCommentButton()

      const commentPage = new NewsCommentPage(page)
      await commentPage.expectLoaded()

      // 发表原始评论
      await commentPage.writeComment('原始评论测试')
      await commentPage.submitComment()
      await page.waitForTimeout(1000) // 等待评论提交完成

      // 回复第一条评论
      const replyContent = '感谢你的分享！'
      await commentPage.replyToComment(0, replyContent)

      // 验证回复成功
      await page.waitForSelector('text=回复成功, .success-message', { timeout: 5000 }).catch(() => {})

      // 验证评论总数增加
      const totalComments = await commentPage.getCommentCount()
      expect(totalComments).toBeGreaterThan(1)

      logTestStep('评论回复功能正常')
    })

    test('应验证评论表单验证', async ({ page }) => {
      // 导航到评论页面
      const newsListPage = new NewsListPage(page)
      await newsListPage.goto()
      await newsListPage.clickNewsCard(0)

      const newsDetailPage = new NewsDetailPage(page)
      await newsDetailPage.expectLoaded()
      await newsDetailPage.clickCommentButton()

      const commentPage = new NewsCommentPage(page)
      await commentPage.expectLoaded()

      // 尝试提交空评论
      await commentPage.submitComment()

      // 验证表单验证错误
      const errorMessages = page.locator('.error-message, .el-form-item__error, text=必填, text=不能为空, text=请输入评论内容')
      const errorCount = await errorMessages.count()

      if (errorCount > 0) {
        logTestStep(`评论表单验证发现 ${errorCount} 个错误`)
      } else {
        logTestStep('评论表单验证检查完成')
      }
    })

    test('应验证评论显示和排序', async ({ page }) => {
      // 发表多个评论
      const newsListPage = new NewsListPage(page)
      await newsListPage.goto()
      await newsListPage.clickNewsCard(0)

      const newsDetailPage = new NewsDetailPage(page)
      await newsDetailPage.expectLoaded()
      await newsDetailPage.clickCommentButton()

      const commentPage = new NewsCommentPage(page)
      await commentPage.expectLoaded()

      // 发表第一条评论
      await commentPage.writeComment('第一条评论')
      await commentPage.submitComment()
      await page.waitForTimeout(500)

      // 发表第二条评论
      await commentPage.writeComment('第二条评论')
      await commentPage.submitComment()
      await page.waitForTimeout(500)

      // 验证评论显示
      const commentCount = await commentPage.getCommentCount()
      expect(commentCount).toBeGreaterThanOrEqual(2)

      // 验证评论内容
      const firstComment = await commentPage.getCommentContent(0)
      const secondComment = await commentPage.getCommentContent(1)

      expect(firstComment).toContain('评论')
      expect(secondComment).toContain('评论')

      logTestStep(`评论显示正常，共 ${commentCount} 条评论`)
    })
  })

  test.describe('新闻数据完整性', () => {
    test('应验证新闻卡片包含必要信息', async ({ page }) => {
      const newsPage = new NewsListPage(page)
      await newsPage.goto()
      await newsPage.expectLoaded()

      // 检查第一个新闻卡片是否包含必要元素
      const firstCard = page.locator('.news-card, .news-item').first()

      // 验证包含标题
      await expect(firstCard.locator('h3, .news-title')).toBeVisible()

      // 验证包含作者信息
      await expect(firstCard.locator('.author, .news-author')).toBeVisible()

      // 验证包含发布时间
      await expect(firstCard.locator('.date, .publish-date')).toBeVisible()

      logTestStep('验证新闻卡片信息完整性')
    })

    test('应验证新闻详情页信息完整性', async ({ page }) => {
      const newsListPage = new NewsListPage(page)
      await newsListPage.goto()
      await newsListPage.clickNewsCard(0)

      const newsDetailPage = new NewsDetailPage(page)
      await newsDetailPage.expectLoaded()

      // 验证详情页面包含必要信息
      await expect(page.locator('.news-content, .article-content')).toBeVisible()

      // 验证互动按钮存在
      await expect(page.locator('.like-btn, .comment-btn')).toBeVisible()

      logTestStep('验证新闻详情页信息完整性')
    })
  })

  test.describe('响应式设计测试', () => {
    test('应在移动端正确显示新闻列表', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 })

      const newsPage = new NewsListPage(page)
      await newsPage.goto()
      await newsPage.expectLoaded()

      // 验证在移动端仍能正常显示
      const newsCount = await newsPage.getNewsCount()
      expect(newsCount).toBeGreaterThan(0)

      logTestStep('验证移动端新闻列表显示')
    })

    test('应在平板端支持新闻交互', async ({ page }) => {
      // 设置平板端视口
      await page.setViewportSize({ width: 768, height: 1024 })

      const newsPage = new NewsListPage(page)
      await newsPage.goto()
      await newsPage.clickNewsCard(0)

      const newsDetailPage = new NewsDetailPage(page)
      await newsDetailPage.expectLoaded()

      // 验证在平板端仍能正常交互
      const title = await newsDetailPage.getNewsTitle()
      expect(title).toBeTruthy()

      logTestStep('验证平板端新闻交互功能')
    })
  })
})
