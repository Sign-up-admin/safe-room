import { Page, expect } from '@playwright/test'
import { waitForPageLoad, waitForElement, fillFormField, clickElement, logTestStep } from '../shared-helpers'

/**
 * Chat Page Object Model
 */
export class ChatPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    logTestStep('导航到聊天页面')
    await this.page.goto('/#/index/chat')
    await waitForPageLoad(this.page, { expectedText: '聊天' })
  }

  async expectLoaded(): Promise<void> {
    // Wait for page to load with multiple fallback checks
    await waitForPageLoad(this.page, { expectedText: '聊天' })

    // Check for various possible chat container selectors
    const containerSelectors = [
      '.chat-page',
      '.chat-container',
      '.chat-interface',
      '.chat-window',
      '[class*="chat"]'
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
      // At least check if we have some chat-related content
      await expect(this.page.locator('text=聊天, text=消息')).toBeVisible({ timeout: 5000 })
    }

    logTestStep('聊天页面加载完成')
  }

  async selectChatRecipient(recipientName: string): Promise<void> {
    const recipientSuccess = await clickElement(
      this.page,
      [`text=${recipientName}`, `.chat-contact:has-text("${recipientName}")`, `[data-contact="${recipientName}"]`]
    )

    if (recipientSuccess) {
      logTestStep(`选择聊天对象: ${recipientName}`)
    }
  }

  async sendMessage(message: string): Promise<void> {
    // Fill message input
    const inputSuccess = await fillFormField(
      this.page,
      ['input[placeholder*="输入消息"]', 'textarea[placeholder*="输入消息"]', '.chat-input', '.message-input'],
      message
    )

    if (inputSuccess) {
      // Click send button or press enter
      const sendSuccess = await clickElement(
        this.page,
        ['button:has-text("发送")', '.send-btn', '.send-message', '[type="submit"]']
      )

      if (sendSuccess) {
        logTestStep(`发送消息: ${message}`)
      } else {
        // Try pressing Enter
        await this.page.keyboard.press('Enter')
        logTestStep(`通过回车发送消息: ${message}`)
      }
    }
  }

  async sendImage(filePath?: string): Promise<void> {
    // Click image upload button
    await clickElement(
      this.page,
      ['button:has-text("图片")', '.image-btn', '.upload-image', '[data-type="image"]']
    )

    // If file path provided, upload it (otherwise just test the UI)
    if (filePath) {
      const fileInput = this.page.locator('input[type="file"]')
      await fileInput.setInputFiles(filePath)
      logTestStep('上传图片文件')
    } else {
      // Just test clicking the image button
      logTestStep('点击图片上传按钮')
    }
  }

  async getMessageCount(): Promise<number> {
    const messageElements = this.page.locator('.message, .chat-message, .message-item')
    return await messageElements.count()
  }

  async getLastMessage(): Promise<{
    sender: string,
    content: string,
    timestamp: string
  }> {
    const messages = this.page.locator('.message, .chat-message, .message-item')
    const lastMessage = messages.last()

    const sender = await lastMessage.locator('.sender, .message-author').textContent() || ''
    const content = await lastMessage.locator('.content, .message-content').textContent() || ''
    const timestamp = await lastMessage.locator('.time, .timestamp').textContent() || ''

    return { sender, content, timestamp }
  }

  async getUnreadMessageCount(): Promise<number> {
    const unreadElements = this.page.locator('.unread-badge, .unread-count, .message-unread')
    let totalUnread = 0

    const count = await unreadElements.count()
    for (let i = 0; i < count; i++) {
      const text = await unreadElements.nth(i).textContent() || '0'
      totalUnread += parseInt(text.replace(/\D/g, '')) || 0
    }

    return totalUnread
  }

  async markMessagesAsRead(): Promise<void> {
    const markReadSuccess = await clickElement(
      this.page,
      ['button:has-text("标记已读")', '.mark-read-btn', '.read-all']
    )

    if (markReadSuccess) {
      logTestStep('标记消息为已读')
    }
  }

  async searchMessages(keyword: string): Promise<void> {
    const searchSuccess = await fillFormField(
      this.page,
      ['input[placeholder*="搜索消息"]', '.message-search', '.chat-search'],
      keyword
    )

    if (searchSuccess) {
      await this.page.keyboard.press('Enter')
      logTestStep(`搜索消息: ${keyword}`)
    }
  }

  async createGroupChat(groupName: string, members: string[]): Promise<void> {
    // Click create group button
    await clickElement(
      this.page,
      ['button:has-text("创建群聊")', '.create-group-btn', '.new-group']
    )

    // Fill group name
    await fillFormField(
      this.page,
      ['input[placeholder*="群聊名称"]', '.group-name-input'],
      groupName
    )

    // Select members
    for (const member of members) {
      await clickElement(
        this.page,
        [`text=${member}`, `.member-option:has-text("${member}")`]
      )
    }

    // Confirm creation
    await clickElement(
      this.page,
      ['button:has-text("创建")', '.create-confirm-btn']
    )

    logTestStep(`创建群聊: ${groupName}, 成员: ${members.join(', ')}`)
  }

  async leaveChat(): Promise<void> {
    await clickElement(
      this.page,
      ['button:has-text("退出聊天")', '.leave-chat-btn', '.exit-chat']
    )
    logTestStep('退出当前聊天')
  }

  async blockUser(userName: string): Promise<void> {
    // Open user options
    await clickElement(
      this.page,
      ['.user-options', '.chat-options', '[data-user="' + userName + '"]']
    )

    // Click block option
    await clickElement(
      this.page,
      ['text=屏蔽用户', '.block-user', '.block-option']
    )

    logTestStep(`屏蔽用户: ${userName}`)
  }

  async reportMessage(messageIndex: number, reason: string): Promise<void> {
    // Right-click or long-press on message
    const messages = this.page.locator('.message, .chat-message')
    const targetMessage = messages.nth(messageIndex)

    // Try context menu
    await targetMessage.click({ button: 'right' })

    // Click report option
    await clickElement(
      this.page,
      ['text=举报', '.report-message', '.report-option']
    )

    // Select reason
    await clickElement(
      this.page,
      [`text=${reason}`, `.report-reason:has-text("${reason}")`]
    )

    // Confirm report
    await clickElement(
      this.page,
      ['button:has-text("确认举报")', '.report-confirm']
    )

    logTestStep(`举报第 ${messageIndex + 1} 条消息，原因: ${reason}`)
  }
}

/**
 * Chat Contact List Object Model
 */
export class ChatContactList {
  constructor(private page: Page) {}

  async expectLoaded(): Promise<void> {
    await expect(this.page.locator('.contact-list, .chat-contacts')).toBeVisible({ timeout: 10000 })
    logTestStep('联系人列表加载完成')
  }

  async searchContacts(keyword: string): Promise<void> {
    const searchSuccess = await fillFormField(
      this.page,
      ['input[placeholder*="搜索联系人"]', '.contact-search'],
      keyword
    )

    if (searchSuccess) {
      await this.page.keyboard.press('Enter')
      logTestStep(`搜索联系人: ${keyword}`)
    }
  }

  async getContactCount(): Promise<number> {
    const contactElements = this.page.locator('.contact, .chat-contact, .contact-item')
    return await contactElements.count()
  }

  async getContactName(index = 0): Promise<string> {
    const contacts = this.page.locator('.contact, .chat-contact, .contact-item')
    if (await contacts.count() > index) {
      const contact = contacts.nth(index)
      const nameElement = contact.locator('.name, .contact-name').first()
      return await nameElement.textContent() || ''
    }
    return ''
  }

  async getOnlineContacts(): Promise<number> {
    const onlineContacts = this.page.locator('.contact.online, .contact-item[data-status="online"]')
    return await onlineContacts.count()
  }

  async filterContactsByStatus(status: 'online' | 'offline' | 'all'): Promise<void> {
    await clickElement(
      this.page,
      [`.filter-${status}`, `[data-filter="${status}"]`, `text=${status === 'online' ? '在线' : status === 'offline' ? '离线' : '全部'}`]
    )
    logTestStep(`筛选联系人状态: ${status}`)
  }
}

/**
 * Chat Settings Object Model
 */
export class ChatSettings {
  constructor(private page: Page) {}

  async openSettings(): Promise<void> {
    await clickElement(
      this.page,
      ['button:has-text("设置")', '.chat-settings-btn', '.settings']
    )
    logTestStep('打开聊天设置')
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page.locator('.chat-settings, .settings-panel')).toBeVisible({ timeout: 10000 })
    logTestStep('聊天设置页面加载完成')
  }

  async toggleNotificationSound(): Promise<void> {
    await clickElement(
      this.page,
      ['.sound-toggle', '[data-setting="sound"]', 'text=消息提示音']
    )
    logTestStep('切换消息提示音设置')
  }

  async toggleMessagePreview(): Promise<void> {
    await clickElement(
      this.page,
      ['.preview-toggle', '[data-setting="preview"]', 'text=消息预览']
    )
    logTestStep('切换消息预览设置')
  }

  async setAutoReply(message: string): Promise<void> {
    await clickElement(
      this.page,
      ['text=自动回复', '.auto-reply-toggle']
    )

    await fillFormField(
      this.page,
      ['textarea[placeholder*="自动回复内容"]', '.auto-reply-input'],
      message
    )

    await clickElement(
      this.page,
      ['button:has-text("保存")', '.save-auto-reply']
    )

    logTestStep(`设置自动回复: ${message}`)
  }

  async clearChatHistory(): Promise<void> {
    await clickElement(
      this.page,
      ['text=清空聊天记录', '.clear-history-btn']
    )

    // Confirm clearing
    await clickElement(
      this.page,
      ['button:has-text("确认")', '.confirm-clear']
    )

    logTestStep('清空聊天记录')
  }
}
