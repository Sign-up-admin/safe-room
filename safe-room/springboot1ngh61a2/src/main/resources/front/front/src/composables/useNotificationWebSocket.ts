import { ref, computed, onMounted, onUnmounted, readonly } from 'vue'
import type { WebSocketNotificationMessage, Notification } from '@/types/notification'
import { useNotificationStore } from '@/stores/notification'
import { createNotificationWebSocket } from '@/services/notification'

interface UseNotificationWebSocketOptions {
  url?: string
  autoConnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
}

export function useNotificationWebSocket(options: UseNotificationWebSocketOptions = {}) {
  const {
    url = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/notifications`,
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    heartbeatInterval = 30000,
  } = options

  // 响应式状态
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const reconnectAttempts = ref(0)
  const lastHeartbeat = ref<number | null>(null)
  const connectionId = ref<string | null>(null)

  // Store
  const notificationStore = useNotificationStore()

  // 计算属性
  const connectionStatus = computed(() => {
    if (isConnecting.value) return 'connecting'
    if (isConnected.value) return 'connected'
    return 'disconnected'
  })

  const canReconnect = computed(() => reconnectAttempts.value < maxReconnectAttempts)

  // WebSocket事件处理
  const handleOpen = (event: Event) => {
    console.log('通知WebSocket连接已建立', event)
    isConnected.value = true
    isConnecting.value = false
    reconnectAttempts.value = 0

    // 发送认证信息
    sendAuth()

    // 启动心跳
    startHeartbeat()

    // 更新store状态
    notificationStore.setWsConnected(true)
  }

  const handleClose = (event: CloseEvent) => {
    console.log('通知WebSocket连接已关闭', event.code, event.reason)
    isConnected.value = false
    isConnecting.value = false

    // 停止心跳
    stopHeartbeat()

    // 更新store状态
    notificationStore.setWsConnected(false)

    // 自动重连
    if (canReconnect.value && event.code !== 1000) {
      // 1000是正常关闭
      scheduleReconnect()
    }
  }

  const handleError = (event: Event) => {
    console.error('通知WebSocket连接错误', event)
    isConnecting.value = false

    // 错误时也尝试重连
    if (canReconnect.value) {
      scheduleReconnect()
    }
  }

  const handleMessage = (event: MessageEvent) => {
    try {
      const data: WebSocketNotificationMessage | any = JSON.parse(event.data)

      if (data.type === 'notification') {
        handleNotificationMessage(data.data)
      } else if (data.type === 'heartbeat') {
        handleHeartbeatResponse(data)
      } else if (data.type === 'auth') {
        handleAuthResponse(data)
      } else {
        console.log('收到未知消息类型:', data.type, data)
      }
    } catch (error) {
      console.error('解析WebSocket消息失败:', error, event.data)
    }
  }

  // 消息处理方法
  const handleNotificationMessage = (notification: Notification) => {
    console.log('收到新通知:', notification)

    // 添加到store
    notificationStore.addNotification(notification)

    // 这里可以触发全局toast显示
    // emit('notification', notification)
  }

  const handleHeartbeatResponse = (data: any) => {
    lastHeartbeat.value = Date.now()
    console.log('收到心跳响应')
  }

  const handleAuthResponse = (data: any) => {
    if (data.success) {
      connectionId.value = data.connectionId
      console.log('WebSocket认证成功，连接ID:', connectionId.value)
    } else {
      console.error('WebSocket认证失败:', data.message)
      disconnect()
    }
  }

  // 连接管理方法
  const connect = () => {
    if (ws.value && (ws.value.readyState === WebSocket.OPEN || ws.value.readyState === WebSocket.CONNECTING)) {
      return // 已经在连接或已连接
    }

    console.log('开始连接通知WebSocket...')
    isConnecting.value = true

    try {
      ws.value = createNotificationWebSocket({
        url,
        token: getAuthToken(),
        reconnectInterval,
        maxReconnectAttempts,
      })

      // 绑定事件处理器
      ws.value.addEventListener('open', handleOpen)
      ws.value.addEventListener('close', handleClose)
      ws.value.addEventListener('error', handleError)
      ws.value.addEventListener('message', handleMessage)
    } catch (error) {
      console.error('创建WebSocket连接失败:', error)
      isConnecting.value = false
    }
  }

  const disconnect = () => {
    if (ws.value) {
      console.log('断开通知WebSocket连接...')
      ws.value.close(1000, '客户端主动断开')
      ws.value = null
    }

    isConnected.value = false
    isConnecting.value = false
    connectionId.value = null
    stopHeartbeat()
  }

  const reconnect = () => {
    if (reconnectAttempts.value >= maxReconnectAttempts) {
      console.error('达到最大重连次数，停止重连')
      return
    }

    reconnectAttempts.value++
    console.log(`尝试重连通知WebSocket (${reconnectAttempts.value}/${maxReconnectAttempts})`)

    disconnect()
    setTimeout(() => {
      connect()
    }, reconnectInterval)
  }

  const scheduleReconnect = () => {
    setTimeout(() => {
      reconnect()
    }, reconnectInterval)
  }

  // 心跳机制
  let heartbeatTimer: number | null = null

  const startHeartbeat = () => {
    stopHeartbeat() // 确保没有重复的定时器

    heartbeatTimer = window.setInterval(() => {
      if (ws.value && ws.value.readyState === WebSocket.OPEN) {
        sendHeartbeat()
      }
    }, heartbeatInterval)
  }

  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  const sendHeartbeat = () => {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(
        JSON.stringify({
          type: 'heartbeat',
          timestamp: Date.now(),
          connectionId: connectionId.value,
        }),
      )
    }
  }

  // 认证和消息发送
  const getAuthToken = (): string =>
    // 从localStorage或其他地方获取token
    localStorage.getItem('token') || ''

  const sendAuth = () => {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(
        JSON.stringify({
          type: 'auth',
          token: getAuthToken(),
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        }),
      )
    }
  }

  const sendMessage = (message: any) => {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket未连接，无法发送消息:', message)
    }
  }

  // 生命周期
  if (autoConnect) {
    onMounted(() => {
      connect()
    })
  }

  onUnmounted(() => {
    disconnect()
  })

  // 暴露API
  return {
    // 状态
    isConnected: readonly(isConnected),
    isConnecting: readonly(isConnecting),
    connectionStatus: readonly(connectionStatus),
    reconnectAttempts: readonly(reconnectAttempts),
    connectionId: readonly(connectionId),

    // 方法
    connect,
    disconnect,
    reconnect,
    sendMessage,

    // WebSocket实例（谨慎使用）
    ws: readonly(ws),
  }
}
