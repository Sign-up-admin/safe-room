import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMessageCenter, type MessageEntity } from '@/composables/useMessageCenter'
import { getModuleService } from '@/services/crud'
import { cleanupTest } from '../../utils/test-helpers'

// Mock the crud service
vi.mock('@/services/crud', () => ({
  getModuleService: vi.fn()
}))

describe('useMessageCenter', () => {
  let messageCenter: ReturnType<typeof useMessageCenter>

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mock for getModuleService
    const mockCrudService = {
      list: vi.fn()
    }
    vi.mocked(getModuleService).mockReturnValue(mockCrudService)

    messageCenter = useMessageCenter()
  })

  afterEach(() => {
    cleanupTest()
  })

  it('should initialize with default state', () => {
    expect(messageCenter.messages.value).toEqual([])
    expect(messageCenter.loading.value).toBe(false)
    expect(messageCenter.unreadCount.value).toBe(0)
  })

  it('should compute unread messages correctly', () => {
    const mockMessages: MessageEntity[] = [
      { id: 1, userid: 1, title: 'Test 1', content: 'Content 1', type: 'system', isread: 0, addtime: '2023-01-01' },
      { id: 2, userid: 1, title: 'Test 2', content: 'Content 2', type: 'reminder', isread: 1, addtime: '2023-01-02' },
      { id: 3, userid: 1, title: 'Test 3', content: 'Content 3', type: 'system', isread: 0, addtime: '2023-01-03' }
    ]

    messageCenter.messages.value = mockMessages

    expect(messageCenter.unreadMessages.value).toHaveLength(2)
    expect(messageCenter.unreadMessages.value.map(m => m.id)).toEqual([1, 3])
  })

  it('should compute reminder messages correctly', () => {
    const mockMessages: MessageEntity[] = [
      { id: 1, userid: 1, title: 'Test 1', content: 'Content 1', type: 'system', isread: 0, addtime: '2023-01-01' },
      { id: 2, userid: 1, title: 'Test 2', content: 'Content 2', type: 'reminder', isread: 1, addtime: '2023-01-02' },
      { id: 3, userid: 1, title: 'Test 3', content: 'Content 3', type: 'reminder', isread: 0, addtime: '2023-01-03' }
    ]

    messageCenter.messages.value = mockMessages

    expect(messageCenter.reminderMessages.value).toHaveLength(2)
    expect(messageCenter.reminderMessages.value.map(m => m.id)).toEqual([2, 3])
  })

  it('should load messages successfully', async () => {
    const mockMessages: MessageEntity[] = [
      { id: 1, userid: 1, title: 'Test Message', content: 'Test Content', type: 'system', isread: 0, addtime: '2023-01-01' }
    ]

    const mockList = vi.fn().mockResolvedValue({
      list: mockMessages
    })

    vi.mocked(getModuleService).mockReturnValue({
      list: mockList
    })

    await messageCenter.loadMessages()

    expect(mockList).toHaveBeenCalledWith({
      page: 1,
      limit: 50,
      order: 'desc',
      sort: 'addtime'
    })

    expect(messageCenter.messages.value).toEqual(mockMessages)
    expect(messageCenter.loading.value).toBe(false)
    expect(messageCenter.unreadCount.value).toBe(1) // 1 unread message
  })

  it('should handle load messages error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const mockList = vi.fn().mockRejectedValue(new Error('Network error'))

    vi.mocked(getModuleService).mockReturnValue({
      list: mockList
    })

    await messageCenter.loadMessages()

    expect(consoleSpy).toHaveBeenCalledWith('加载消息失败:', expect.any(Error))
    expect(messageCenter.loading.value).toBe(false)

    consoleSpy.mockRestore()
  })

  it('should load unread count successfully', async () => {
    const mockResponse = { count: 5 }
    const mockFetch = vi.mocked(fetch).mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockResponse)
    } as any)

    await messageCenter.loadUnreadCount()

    expect(mockFetch).toHaveBeenCalledWith('/messages/unreadCount', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    expect(messageCenter.unreadCount.value).toBe(5)
  })

  it('should handle load unread count error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

    await messageCenter.loadUnreadCount()

    expect(consoleSpy).toHaveBeenCalledWith('获取未读消息数量失败:', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('should mark messages as read', async () => {
    const mockMessages: MessageEntity[] = [
      { id: 1, userid: 1, title: 'Test 1', content: 'Content 1', type: 'system', isread: 0, addtime: '2023-01-01' },
      { id: 2, userid: 1, title: 'Test 2', content: 'Content 2', type: 'system', isread: 0, addtime: '2023-01-02' }
    ]

    messageCenter.messages.value = mockMessages

    const mockFetch = vi.mocked(fetch).mockResolvedValue({} as any)

    await messageCenter.markAsRead([1])

    expect(mockFetch).toHaveBeenCalledWith('/messages/markRead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([1])
    })

    expect(messageCenter.messages.value[0].isread).toBe(1) // First message marked as read
    expect(messageCenter.messages.value[1].isread).toBe(0) // Second message still unread
    expect(messageCenter.unreadCount.value).toBe(1) // Only one unread message left
  })

  it('should handle mark as read error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

    await messageCenter.markAsRead([1])

    expect(consoleSpy).toHaveBeenCalledWith('标记消息已读失败:', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('should send reminder message successfully', async () => {
    const mockParams = {
      userId: 1,
      title: 'Reminder Title',
      content: 'Reminder Content',
      relatedType: 'course',
      relatedId: 123
    }

    const mockFetch = vi.mocked(fetch).mockResolvedValue({} as any)

    await expect(messageCenter.sendReminderMessage(mockParams)).resolves.not.toThrow()

    expect(mockFetch).toHaveBeenCalledWith('/messages/sendReminder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mockParams)
    })
  })

  it('should handle send reminder message error', async () => {
    const mockParams = {
      userId: 1,
      title: 'Reminder Title',
      content: 'Reminder Content'
    }

    vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

    await expect(messageCenter.sendReminderMessage(mockParams)).rejects.toThrow('Network error')
  })

  it('should initialize message center', async () => {
    const loadMessagesSpy = vi.fn().mockResolvedValue(undefined)
    const loadUnreadCountSpy = vi.fn().mockResolvedValue(undefined)

    // Mock the methods
    messageCenter.loadMessages = loadMessagesSpy
    messageCenter.loadUnreadCount = loadUnreadCountSpy

    await messageCenter.init()

    expect(loadMessagesSpy).toHaveBeenCalled()
    expect(loadUnreadCountSpy).toHaveBeenCalled()
  })

  it('should load messages with custom params', async () => {
    const customParams = { type: 'system', isread: 0 }

    const mockList = vi.fn().mockResolvedValue({
      list: [],
      total: 0
    })

    vi.mocked(getModuleService).mockReturnValue({
      list: mockList
    })

    await messageCenter.loadMessages(customParams)

    expect(mockList).toHaveBeenCalledWith({
      page: 1,
      limit: 50,
      order: 'desc',
      sort: 'addtime',
      ...customParams
    })
  })

  it('should handle empty message list', async () => {
    const mockCrudService = vi.mocked(getModuleService).mockReturnValue({
      list: vi.fn().mockResolvedValue({
        list: null, // API returns null for empty list
        total: 0
      })
    })

    await messageCenter.loadMessages()

    expect(messageCenter.messages.value).toEqual([])
    expect(messageCenter.unreadCount.value).toBe(0)
  })

  it('should handle zero unread count from API', async () => {
    const mockResponse = { count: 0 }
    vi.mocked(fetch).mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockResponse)
    } as any)

    await messageCenter.loadUnreadCount()

    expect(messageCenter.unreadCount.value).toBe(0)
  })

  it('should handle undefined unread count from API', async () => {
    const mockResponse = {} // No count property
    vi.mocked(fetch).mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockResponse)
    } as any)

    await messageCenter.loadUnreadCount()

    expect(messageCenter.unreadCount.value).toBe(0)
  })
})
