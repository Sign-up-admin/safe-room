import { Page, expect } from '@playwright/test'
import { waitForPageLoad, waitForElement, fillFormField, clickElement, logTestStep } from '../shared-helpers'

/**
 * News List Page Object Model
 */
export class NewsListPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    logTestStep('导航到新闻资讯页面')
    await this.page.goto('/#/index/news')
    await waitForPageLoad(this.page, { expectedText: '新闻' })
  }

  async expectLoaded(): Promise<void> {
    // Wait for page to load with multiple fallback checks
    await waitForPageLoad(this.page, { expectedText: '新闻' })

    // Check for various possible news container selectors
    const containerSelectors = [
      '.news-page__grid',
      '.news-list',
      '.news-container',
      '[class*="news"][class*="grid"]',
      '[class*="news"][class*="list"]'
    ]

    let containerFound = false
    for (const selector of containerSelectors) {
      try {
        await expect(this.page.locator(selector)).toBeVisible({ timeout: 3000 })
        containerFound = true
        break
      } catch (error) {
        // Try next selector
      }
    }

    if (!containerFound) {
      // At least check if we have some news-related content
      await expect(this.page.locator('text=新闻, text=资讯')).toBeVisible({ timeout: 5000 })
    }

    logTestStep('新闻列表页面加载完成')
  }

  async searchNews(keyword: string): Promise<void> {
    const searchSuccess = await fillFormField(
      this.page,
      ['input[placeholder*="搜索"]', 'input[type="search"]', '.search-input'],
      keyword
    )

    if (searchSuccess) {
      // Click search button or press enter
      await this.page.keyboard.press('Enter')
      logTestStep(`搜索新闻: ${keyword}`)
    }
  }

  async clickNewsCard(index = 0): Promise<void> {
    // Try multiple selectors for news cards
    const cardSelectors = [
      '.news-card',
      '.news-item',
      '.article-card',
      '[class*="news-card"]',
      '[class*="news-item"]'
    ]

    let cardClicked = false
    for (const selector of cardSelectors) {
      try {
        const cards = this.page.locator(selector)
        const count = await cards.count()
        if (count > index) {
          await cards.nth(index).click()
          cardClicked = true
          logTestStep(`点击第 ${index + 1} 个新闻卡片 (使用选择器: ${selector})`)
          break
        }
      } catch (error) {
        // Try next selector
      }
    }

    if (!cardClicked) {
      throw new Error(`无法找到第 ${index + 1} 个新闻卡片`)
    }
  }

  async getNewsCount(): Promise<number> {
    // Try multiple selectors for news cards
    const cardSelectors = [
      '.news-card',
      '.news-item',
      '.article-card',
      '[class*="news-card"]',
      '[class*="news-item"]'
    ]

    for (const selector of cardSelectors) {
      try {
        const count = await this.page.locator(selector).count()
        if (count > 0) {
          return count
        }
      } catch (error) {
        // Try next selector
      }
    }

    return 0
  }

  async getNewsTitle(index = 0): Promise<string> {
    const cardSelectors = [
      '.news-card',
      '.news-item',
      '.article-card',
      '[class*="news-card"]',
      '[class*="news-item"]'
    ]

    for (const selector of cardSelectors) {
      try {
        const cards = this.page.locator(selector)
        const count = await cards.count()
        if (count > index) {
          const card = cards.nth(index)
          const titleElement = card.locator('h3, .news-title, .title').first()
          return await titleElement.textContent() || ''
        }
      } catch (error) {
        // Try next selector
      }
    }

    return ''
  }

  async getNewsAuthor(index = 0): Promise<string> {
    const cardSelectors = [
      '.news-card',
      '.news-item',
      '.article-card',
      '[class*="news-card"]',
      '[class*="news-item"]'
    ]

    for (const selector of cardSelectors) {
      try {
        const cards = this.page.locator(selector)
        const count = await cards.count()
        if (count > index) {
          const card = cards.nth(index)
          const authorElement = card.locator('.author, .news-author, .writer').first()
          return await authorElement.textContent() || ''
        }
      } catch (error) {
        // Try next selector
      }
    }

    return ''
  }

  async getNewsDate(index = 0): Promise<string> {
    const cardSelectors = [
      '.news-card',
      '.news-item',
      '.article-card',
      '[class*="news-card"]',
      '[class*="news-item"]'
    ]

    for (const selector of cardSelectors) {
      try {
        const cards = this.page.locator(selector)
        const count = await cards.count()
        if (count > index) {
          const card = cards.nth(index)
          const dateElement = card.locator('.date, .news-date, .publish-time').first()
          return await dateElement.textContent() || ''
        }
      } catch (error) {
        // Try next selector
      }
    }

    return ''
  }
}

/**
 * News Detail Page Object Model
 */
export class NewsDetailPage {
  constructor(private page: Page) {}

  async expectLoaded(): Promise<void> {
    await expect(this.page.locator('.news-detail, .news-content, .article-content')).toBeVisible({ timeout: 10000 })
    logTestStep('新闻详情页面加载完成')
  }

  async clickLikeButton(): Promise<void> {
    const likeSuccess = await clickElement(
      this.page,
      ['button:has-text("点赞")', 'button:has-text("赞")', '.like-btn', '.thumbs-up-btn']
    )

    if (likeSuccess) {
      logTestStep('点击点赞按钮')
    }
  }

  async clickCommentButton(): Promise<void> {
    const commentSuccess = await clickElement(
      this.page,
      ['button:has-text("评论")', 'button:has-text("留言")', '.comment-btn', '.reply-btn']
    )

    if (commentSuccess) {
      logTestStep('点击评论按钮')
    }
  }

  async shareNews(platform = 'wechat'): Promise<void> {
    // Click share button first
    await clickElement(
      this.page,
      ['button:has-text("分享")', '.share-btn', '.social-share']
    )

    // Then select platform
    const platformSuccess = await clickElement(
      this.page,
      [`[data-platform="${platform}"]`, `.share-${platform}`, `text=${platform}`]
    )

    if (platformSuccess) {
      logTestStep(`分享到${platform}`)
    }
  }

  async getNewsTitle(): Promise<string> {
    const titleElement = this.page.locator('h1, .news-title, .article-title').first()
    return await titleElement.textContent() || ''
  }

  async getNewsContent(): Promise<string> {
    const contentElement = this.page.locator('.news-content, .article-content, .content').first()
    return await contentElement.textContent() || ''
  }

  async getAuthorName(): Promise<string> {
    const authorElement = this.page.locator('.author, .news-author, .writer').first()
    return await authorElement.textContent() || ''
  }

  async getPublishDate(): Promise<string> {
    const dateElement = this.page.locator('.date, .publish-date, .publish-time').first()
    return await dateElement.textContent() || ''
  }

  async getLikeCount(): Promise<number> {
    const likeElement = this.page.locator('.like-count, .thumbs-up-count, .like-num').first()
    const likeText = await likeElement.textContent() || '0'
    return parseInt(likeText.replace(/\D/g, '')) || 0
  }

  async getCommentCount(): Promise<number> {
    const commentElement = this.page.locator('.comment-count, .reply-count, .comment-num').first()
    const commentText = await commentElement.textContent() || '0'
    return parseInt(commentText.replace(/\D/g, '')) || 0
  }
}

/**
 * News Comment Page Object Model
 */
export class NewsCommentPage {
  constructor(private page: Page) {}

  async expectLoaded(): Promise<void> {
    await expect(this.page.locator('.comment-section, .comments, .replies')).toBeVisible({ timeout: 10000 })
    logTestStep('评论页面加载完成')
  }

  async writeComment(content: string): Promise<void> {
    const commentSuccess = await fillFormField(
      this.page,
      ['textarea[name*="comment"]', 'textarea[placeholder*="评论"]', '.comment-input'],
      content
    )

    if (commentSuccess) {
      logTestStep('输入评论内容')
    }
  }

  async submitComment(): Promise<void> {
    const submitSuccess = await clickElement(
      this.page,
      ['button[type="submit"]', 'button:has-text("提交评论")', 'button:has-text("发表")', '.submit-comment']
    )

    if (submitSuccess) {
      logTestStep('提交评论')
    }
  }

  async replyToComment(index: number, content: string): Promise<void> {
    // Click reply button for specific comment
    const replyButtons = this.page.locator('.reply-btn, .comment-reply')
    if (await replyButtons.count() > index) {
      await replyButtons.nth(index).click()

      // Fill reply content
      await fillFormField(
        this.page,
        ['textarea[name*="reply"]', 'textarea[placeholder*="回复"]', '.reply-input'],
        content
      )

      // Submit reply
      await clickElement(
        this.page,
        ['button:has-text("回复")', 'button:has-text("提交回复")', '.submit-reply']
      )

      logTestStep(`回复第 ${index + 1} 条评论`)
    }
  }

  async getCommentCount(): Promise<number> {
    const commentElements = this.page.locator('.comment-item, .comment, .reply-item')
    return await commentElements.count()
  }

  async getCommentContent(index = 0): Promise<string> {
    const commentElements = this.page.locator('.comment-item, .comment, .reply-item')
    if (await commentElements.count() > index) {
      const commentElement = commentElements.nth(index)
      const contentElement = commentElement.locator('.comment-content, .content').first()
      return await contentElement.textContent() || ''
    }
    return ''
  }

  async getCommentAuthor(index = 0): Promise<string> {
    const commentElements = this.page.locator('.comment-item, .comment, .reply-item')
    if (await commentElements.count() > index) {
      const commentElement = commentElements.nth(index)
      const authorElement = commentElement.locator('.comment-author, .author').first()
      return await authorElement.textContent() || ''
    }
    return ''
  }
}
