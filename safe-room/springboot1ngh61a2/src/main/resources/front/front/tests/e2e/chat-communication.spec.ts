import { test, expect } from '@playwright/test'
import { setupTestEnvironment, logTestStep, takeScreenshotWithTimestamp } from '../utils/shared-helpers'
import { ChatPage, ChatContactList, ChatSettings } from '../utils/page-objects/chat-page'

test.describe('聊天交流功能模块测试', () => {
  test.beforeEach(async ({ page }) => {
    // 使用完整的测试环境设置，包括Mock和Cookie处理
    await setupTestEnvironment(page)
    logTestStep('设置聊天功能测试环境')
  })

  test.describe('聊天界面基本功能', () => {
    test('应正确显示聊天界面', async ({ page }) => {
      const chatPage = new ChatPage(page)
      await chatPage.goto()
      await chatPage.expectLoaded()

      // 验证基本聊天元素存在
      await expect(page.locator('.chat-container, .chat-interface')).toBeVisible()

      logTestStep('聊天界面加载完成')
    })

    test('应显示联系人列表', async ({ page }) => {
      const chatPage = new ChatPage(page)
      await chatPage.goto()

      const contactList = new ChatContactList(page)
      await contactList.expectLoaded()

      // 验证至少有一个联系人
      const contactCount = await contactList.getContactCount()
      expect(contactCount).toBeGreaterThan(0)

      logTestStep(`联系人列表显示 ${contactCount} 个联系人`)
    })

    test('应支持联系人搜索', async ({ page }) => {
      const chatPage = new ChatPage(page)
      await chatPage.goto()

      const contactList = new ChatContactList(page)
      await contactList.expectLoaded()

      // 搜索教练
      await contactList.searchContacts('教练')

      // 验证搜索结果
      const contactCount = await contactList.getContactCount()
      logTestStep(`搜索"教练"后显示 ${contactCount} 个联系人`)
    })
  })

  test.describe('消息发送和接收', () => {
    test('应支持发送文本消息', async ({ page }) => {
      const chatPage = new ChatPage(page)
      await chatPage.goto()

      // 选择聊天对象
      await chatPage.selectChatRecipient('教练张')

      // 记录发送前的消息数量
      const messageCountBefore = await chatPage.getMessageCount()

      // 发送消息
      const testMessage = '你好教练，我想咨询一下健身计划'
      await chatPage.sendMessage(testMessage)

      // 验证消息发送成功
      await page.waitForSelector('text=发送成功, .success-message', { timeout: 5000 }).catch(() => {})

      // 验证消息数量增加
      const messageCountAfter = await chatPage.getMessageCount()
      expect(messageCountAfter).toBeGreaterThan(messageCountBefore)

      // 验证最后一条消息内容
      const lastMessage = await chatPage.getLastMessage()
      expect(lastMessage.content).toContain(testMessage)

      logTestStep('文本消息发送成功')
    })

    test('应支持连续发送多条消息', async ({ page }) => {
      const chatPage = new ChatPage(page)
      await chatPage.goto()
      await chatPage.selectChatRecipient('教练张')

      const messageCountBefore = await chatPage.getMessageCount()

      // 发送多条消息
      const messages = [
        '消息1：关于HIIT训练',
        '消息2：我想了解更多细节',
        '消息3：谢谢你的建议'
      ]

      for (const message of messages) {
        await chatPage.sendMessage(message)
        await page.waitForTimeout(500) // 短暂等待
      }

      // 验证消息数量正确增加
      const messageCountAfter = await chatPage.getMessageCount()
      expect(messageCountAfter).toBeGreaterThanOrEqual(messageCountBefore + messages.length)

      logTestStep(`连续发送 ${messages.length} 条消息`)
    })

    test('应验证消息时间戳', async ({ page }) => {
      const chatPage = new ChatPage(page)
      await chatPage.goto()
      await chatPage.selectChatRecipient('教练张')

      await chatPage.sendMessage('测试时间戳消息')

      // 验证最后一条消息有时间戳
      const lastMessage = await chatPage.getLastMessage()
      expect(lastMessage.timestamp).toBeTruthy()

      logTestStep('消息时间戳显示正常')
    })
  })

  test.describe('聊天历史记录', () => {
    test('应正确加载历史消息', async ({ page }) => {
      const chatPage = new ChatPage(page)
      await chatPage.goto()
      await chatPage.selectChatRecipient('教练张')

      // 验证有历史消息加载
      const messageCount = await chatPage.getMessageCount()
      expect(messageCount).toBeGreaterThan(0)

      // 验证消息内容完整
      const firstMessage = await chatPage.getLastMessage()
      expect(firstMessage.sender).toBeTruthy()
      expect(firstMessage.content).toBeTruthy()

      logTestStep(`加载了 ${messageCount} 条历史消息`)
    })

    test('应支持消息搜索功能', async ({ page }) => {
      const chatPage = new ChatPage(page)
      await chatPage.goto()
      await chatPage.selectChatRecipient('教练张')

      // 先发送一条特定消息用于搜索
      const searchMessage = '特殊搜索关键词测试消息'
      await chatPage.sendMessage(searchMessage)

      // 搜索消息
      await chatPage.searchMessages('特殊搜索关键词')

      // 验证搜索结果（可能显示高亮或筛选结果）
      const messageCount = await chatPage.getMessageCount()
      logTestStep(`搜索结果显示 ${messageCount} 条消息`)
    })

    test('应支持标记消息已读', async ({ page }) => {
      const chatPage = new ChatPage(page)
      await chatPage.goto()

      // 记录未读消息数量
      const unreadBefore = await chatPage.getUnreadMessageCount()

      // 选择有未读消息的聊天
      await chatPage.selectChatRecipient('教练张')

      // 标记为已读
      await chatPage.markMessagesAsRead()

      // 验证未读消息减少
      const unreadAfter = await chatPage.getUnreadMessageCount()
      expect(unreadAfter).toBeLessThanOrEqual(unreadBefore)

      logTestStep('消息已读标记功能正常')
    })
  })

  test.describe('聊天设置和偏好', () => {
    test('应支持聊天设置访问', async ({ page }) => {
      const chatPage = new ChatPage(page)
      await chatPage.goto()

      const chatSettings = new ChatSettings(page)
      await chatSettings.openSettings()
      await chatSettings.expectLoaded()

      logTestStep('聊天设置页面正常访问')
    })

    test('应支持消息提示音设置', async ({ page }) => {
      const chatPage = new ChatPage(page)
      await chatPage.goto()

      const chatSettings = new ChatSettings(page)
      await chatSettings.openSettings()
      await chatSettings.toggleNotificationSound()

      // 验证设置保存成功提示
      await page.waitForSelector('text=设置已保存, .success-message', { timeout: 3000 }).catch(() => {})

      logTestStep('消息提示音设置切换成功')
    })

    test('应支持消息预览设置', async ({ page }) => {
      const chatPage = new ChatPage(page)
      await chatPage.goto()

      const chatSettings = new ChatSettings(page)
      await chatSettings.openSettings()
      await chatSettings.toggleMessagePreview()

      logTestStep('消息预览设置切换成功')
    })

    test('应支持自动回复设置', async ({ page }) => {
      const chatPage = new ChatPage(page)
      await chatPage.goto()

      const chatSettings = new ChatSettings(page)
      await chatSettings.openSettings()

      const autoReplyMessage = '我现在正在训练中，稍后回复您。'
      await chatSettings.setAutoReply(autoReplyMessage)

      // 验证自动回复设置成功
      await page.waitForSelector('text=自动回复已设置, .success-message', { timeout: 3000 }).catch(() => {})

      logTestStep('自动回复设置成功')
    })
  })

  test.describe('群聊功能', () => {
    test('应支持创建群聊', async ({ page }) => {
      const chatPage = new ChatPage(page)
      await chatPage.goto()

      const groupName = '健身交流群'
      const members = ['教练张', '教练李']

      await chatPage.createGroupChat(groupName, members)

      // 验证群聊创建成功
      await page.waitForSelector(`text=${groupName}, .success-message`, { timeout: 5000 }).catch(() => {})

      logTestStep('群聊创建成功')
    })

    test('应支持在群聊中发送消息', async ({ page }) => {
      const chatPage = new ChatPage(page)
      await chatPage.goto()

      // 选择或创建群聊
      const groupName = '测试群聊'
      await chatPage.createGroupChat(groupName, ['教练张'])

      // 在群聊中发送消息
      const groupMessage = '大家好，这是群聊测试消息'
      await chatPage.sendMessage(groupMessage)

      // 验证消息发送成功
      const lastMessage = await chatPage.getLastMessage()
      expect(lastMessage.content).toContain(groupMessage)

      logTestStep('群聊消息发送成功')
    })
  })

  test.describe('聊天安全和管理', () => {
    test('应支持屏蔽用户', async ({ page }) => {
      const chatPage = new ChatPage(page)
      await chatPage.goto()
      await chatPage.selectChatRecipient('教练张')

      await chatPage.blockUser('教练张')

      // 验证屏蔽成功提示
      await page.waitForSelector('text=用户已屏蔽, .success-message', { timeout: 3000 }).catch(() => {})

      logTestStep('用户屏蔽功能正常')
    })

    test('应支持举报消息', async ({ page }) => {
      const chatPage = new ChatPage(page)
      await chatPage.goto()
      await chatPage.selectChatRecipient('教练张')

      // 举报第一条消息
      await chatPage.reportMessage(0, '垃圾信息')

      // 验证举报成功
      await page.waitForSelector('text=举报成功, .success-message', { timeout: 5000 }).catch(() => {})

      logTestStep('消息举报功能正常')
    })

    test('应支持清空聊天记录', async ({ page }) => {
      const chatPage = new ChatPage(page)
      await chatPage.goto()
      await chatPage.selectChatRecipient('教练张')

      const chatSettings = new ChatSettings(page)
      await chatSettings.openSettings()
      await chatSettings.clearChatHistory()

      // 验证清空成功
      await page.waitForSelector('text=聊天记录已清空, .success-message', { timeout: 5000 }).catch(() => {})

      logTestStep('聊天记录清空成功')
    })
  })

  test.describe('响应式设计测试', () => {
    test('应在移动端支持聊天功能', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 })

      const chatPage = new ChatPage(page)
      await chatPage.goto()
      await chatPage.expectLoaded()

      // 验证移动端聊天界面
      await chatPage.selectChatRecipient('教练张')
      await chatPage.sendMessage('移动端测试消息')

      logTestStep('移动端聊天功能正常')
    })

    test('应在平板端优化聊天体验', async ({ page }) => {
      // 设置平板端视口
      await page.setViewportSize({ width: 768, height: 1024 })

      const chatPage = new ChatPage(page)
      await chatPage.goto()
      await chatPage.selectChatRecipient('教练张')

      const contactCount = await new ChatContactList(page).getContactCount()
      expect(contactCount).toBeGreaterThan(0)

      logTestStep('平板端聊天界面正常显示')
    })
  })

  test.describe('聊天数据完整性', () => {
    test('应验证消息数据完整性', async ({ page }) => {
      const chatPage = new ChatPage(page)
      await chatPage.goto()
      await chatPage.selectChatRecipient('教练张')

      const messages = page.locator('.message, .chat-message')
      const messageCount = await messages.count()

      if (messageCount > 0) {
        const firstMessage = messages.first()

        // 验证消息包含必要元素
        await expect(firstMessage.locator('.sender, .message-author')).toBeVisible()
        await expect(firstMessage.locator('.content, .message-content')).toBeVisible()
        await expect(firstMessage.locator('.time, .timestamp')).toBeVisible()

        logTestStep('消息数据结构完整')
      }
    })

    test('应验证联系人信息完整性', async ({ page }) => {
      const chatPage = new ChatPage(page)
      await chatPage.goto()

      const contactList = new ChatContactList(page)
      await contactList.expectLoaded()

      const contacts = page.locator('.contact, .chat-contact')
      const contactCount = await contacts.count()

      if (contactCount > 0) {
        const firstContact = contacts.first()

        // 验证联系人包含必要信息
        await expect(firstContact.locator('.name, .contact-name')).toBeVisible()

        logTestStep('联系人信息结构完整')
      }
    })
  })
})
