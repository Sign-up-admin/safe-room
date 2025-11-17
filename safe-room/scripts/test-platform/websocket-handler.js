/**
 * WebSocket处理器
 *
 * 处理WebSocket连接和实时数据推送
 */

class WebSocketHandler {
  constructor(io, aggregator, historyManager, collector) {
    this.io = io
    this.aggregator = aggregator
    this.historyManager = historyManager
    this.collector = collector

    this.connectedClients = new Map()
    this.subscriptions = new Map()

    this.setupSocketHandlers()
    this.setupDataListeners()
  }

  /**
   * 设置Socket.io事件处理器
   */
  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 新WebSocket连接: ${socket.id}`)

      // 存储客户端信息
      this.connectedClients.set(socket.id, {
        id: socket.id,
        connectedAt: new Date(),
        subscriptions: new Set()
      })

      // 发送欢迎消息
      socket.emit('welcome', {
        message: 'Connected to Test Dashboard WebSocket',
        clientId: socket.id,
        timestamp: new Date().toISOString(),
        serverCapabilities: [
          'realtime-updates',
          'test-results',
          'metrics-updates',
          'alerts',
          'health-monitoring'
        ]
      })

      // 处理订阅请求
      socket.on('subscribe', (data) => {
        this.handleSubscription(socket, data)
      })

      // 处理取消订阅请求
      socket.on('unsubscribe', (data) => {
        this.handleUnsubscription(socket, data)
      })

      // 处理客户端请求
      socket.on('request-data', (request) => {
        this.handleDataRequest(socket, request)
      })

      // 处理心跳
      socket.on('ping', (data) => {
        socket.emit('pong', {
          ...data,
          serverTime: new Date().toISOString()
        })
      })

      // 处理断开连接
      socket.on('disconnect', (reason) => {
        console.log(`🔌 WebSocket断开连接: ${socket.id}, 原因: ${reason}`)
        this.handleDisconnection(socket.id)
      })

      // 处理连接错误
      socket.on('error', (error) => {
        console.error(`WebSocket错误 ${socket.id}:`, error)
      })
    })
  }

  /**
   * 设置数据监听器
   */
  setupDataListeners() {
    // 监听结果收集器的事件
    if (this.collector) {
      this.collector.on('result', (result) => {
        this.broadcastToChannel('test-results', 'result-update', result)
        this.broadcastToChannel(`framework-${result.framework}`, 'result-update', result)
      })
    }

    // 设置定期广播
    this.setupPeriodicBroadcasts()
  }

  /**
   * 处理订阅请求
   */
  handleSubscription(socket, data) {
    try {
      const { channels, filters } = data

      if (!Array.isArray(channels)) {
        socket.emit('error', { message: 'Channels must be an array' })
        return
      }

      const client = this.connectedClients.get(socket.id)
      if (!client) return

      channels.forEach(channel => {
        socket.join(channel)
        client.subscriptions.add(channel)

        console.log(`📡 客户端 ${socket.id} 订阅频道: ${channel}`)

        // 根据频道类型发送初始数据
        this.sendInitialDataForChannel(socket, channel, filters)
      })

      socket.emit('subscription-success', {
        channels,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('订阅处理失败:', error)
      socket.emit('error', { message: 'Subscription failed', error: error.message })
    }
  }

  /**
   * 处理取消订阅请求
   */
  handleUnsubscription(socket, data) {
    try {
      const { channels } = data

      if (!Array.isArray(channels)) {
        socket.emit('error', { message: 'Channels must be an array' })
        return
      }

      const client = this.connectedClients.get(socket.id)
      if (!client) return

      channels.forEach(channel => {
        socket.leave(channel)
        client.subscriptions.delete(channel)

        console.log(`📡 客户端 ${socket.id} 取消订阅频道: ${channel}`)
      })

      socket.emit('unsubscription-success', {
        channels,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('取消订阅处理失败:', error)
      socket.emit('error', { message: 'Unsubscription failed', error: error.message })
    }
  }

  /**
   * 处理数据请求
   */
  async handleDataRequest(socket, request) {
    try {
      const { type, params = {} } = request

      let data

      switch (type) {
        case 'dashboard-overview':
          data = this.aggregator.getAggregatedData(params.timeRange || 'week')
          break

        case 'recent-results':
          const results = this.historyManager.query({
            limit: params.limit || 10,
            sortBy: 'timestamp',
            sortOrder: 'desc',
            ...params
          })
          data = results.results
          break

        case 'framework-stats':
          data = this.aggregator.getAggregatedData('day').frameworks
          break

        case 'health-score':
          const aggregated = this.aggregator.getAggregatedData(params.timeRange || 'week')
          data = aggregated.health
          break

        case 'trends':
          data = this.historyManager.getTrends({
            days: params.days || 7,
            interval: params.interval || 'day',
            framework: params.framework
          })
          break

        case 'alerts':
          data = await this.generateAlerts(params)
          break

        default:
          throw new Error(`Unknown request type: ${type}`)
      }

      socket.emit('data-response', {
        requestId: request.requestId,
        type,
        data,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('数据请求处理失败:', error)
      socket.emit('error', {
        message: 'Data request failed',
        requestId: request.requestId,
        error: error.message
      })
    }
  }

  /**
   * 为频道发送初始数据
   */
  async sendInitialDataForChannel(socket, channel, filters = {}) {
    try {
      let data

      switch (channel) {
        case 'dashboard':
          data = this.aggregator.getAggregatedData('hour')
          socket.emit('initial-data', { channel, type: 'dashboard-overview', data })
          break

        case 'test-results':
          const results = this.historyManager.query({
            limit: 5,
            sortBy: 'timestamp',
            sortOrder: 'desc',
            ...filters
          })
          socket.emit('initial-data', { channel, type: 'recent-results', data: results.results })
          break

        case 'metrics':
          data = this.aggregator.getAggregatedData('hour')
          socket.emit('initial-data', { channel, type: 'current-metrics', data })
          break

        case 'alerts':
          data = await this.generateAlerts(filters)
          socket.emit('initial-data', { channel, type: 'current-alerts', data })
          break

        default:
          // 检查是否为框架特定频道
          if (channel.startsWith('framework-')) {
            const framework = channel.replace('framework-', '')
            const results = this.historyManager.query({
              framework,
              limit: 3,
              sortBy: 'timestamp',
              sortOrder: 'desc'
            })
            socket.emit('initial-data', {
              channel,
              type: 'framework-results',
              data: results.results
            })
          }
          break
      }
    } catch (error) {
      console.error(`发送初始数据失败 (${channel}):`, error)
    }
  }

  /**
   * 生成警报数据
   */
  async generateAlerts(filters = {}) {
    const alerts = []
    const aggregated = this.aggregator.getAggregatedData('day')

    // 成功率警报
    if (aggregated.overall.successRate < 85) {
      alerts.push({
        id: `success-rate-${Date.now()}`,
        type: 'warning',
        severity: aggregated.overall.successRate < 70 ? 'high' : 'medium',
        title: '测试成功率异常',
        message: `成功率: ${aggregated.overall.successRate.toFixed(1)}%`,
        value: aggregated.overall.successRate,
        threshold: 85,
        timestamp: new Date().toISOString()
      })
    }

    // 性能警报
    if (aggregated.overall.avgDuration > 300000) { // 5分钟
      alerts.push({
        id: `performance-${Date.now()}`,
        type: 'info',
        severity: 'low',
        title: '测试执行缓慢',
        message: `平均执行时间: ${(aggregated.overall.avgDuration / 1000).toFixed(1)}秒`,
        value: aggregated.overall.avgDuration,
        threshold: 300000,
        timestamp: new Date().toISOString()
      })
    }

    // 过滤警报
    let filteredAlerts = alerts
    if (filters.severity) {
      const severities = Array.isArray(filters.severity) ? filters.severity : [filters.severity]
      filteredAlerts = alerts.filter(alert => severities.includes(alert.severity))
    }

    if (filters.limit) {
      filteredAlerts = filteredAlerts.slice(0, filters.limit)
    }

    return {
      alerts: filteredAlerts,
      total: filteredAlerts.length,
      severities: {
        critical: filteredAlerts.filter(a => a.severity === 'critical').length,
        high: filteredAlerts.filter(a => a.severity === 'high').length,
        medium: filteredAlerts.filter(a => a.severity === 'medium').length,
        low: filteredAlerts.filter(a => a.severity === 'low').length
      }
    }
  }

  /**
   * 设置定期广播
   */
  setupPeriodicBroadcasts() {
    // 每30秒广播实时统计
    setInterval(() => {
      try {
        const stats = this.aggregator.getAggregatedData('hour')
        this.broadcastToChannel('metrics', 'stats-update', {
          successRate: stats.overall.successRate,
          totalTests: stats.overall.totalTests,
          avgDuration: stats.overall.avgDuration,
          healthScore: stats.health.score,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        console.error('定期统计广播失败:', error)
      }
    }, 30000)

    // 每分钟广播健康状态
    setInterval(() => {
      try {
        const health = this.aggregator.getAggregatedData('day').health
        this.broadcastToChannel('health', 'health-update', {
          score: health.score,
          level: health.level,
          factors: health.factors,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        console.error('定期健康广播失败:', error)
      }
    }, 60000)

    // 每5分钟广播警报更新
    setInterval(async () => {
      try {
        const alerts = await this.generateAlerts()
        this.broadcastToChannel('alerts', 'alerts-update', alerts)
      } catch (error) {
        console.error('定期警报广播失败:', error)
      }
    }, 300000)
  }

  /**
   * 广播到频道
   */
  broadcastToChannel(channel, event, data) {
    try {
      this.io.to(channel).emit(event, {
        ...data,
        channel,
        broadcastTime: new Date().toISOString()
      })
    } catch (error) {
      console.error(`广播到频道 ${channel} 失败:`, error)
    }
  }

  /**
   * 处理断开连接
   */
  handleDisconnection(clientId) {
    this.connectedClients.delete(clientId)

    // 清理订阅记录
    for (const [channel, subscribers] of this.subscriptions) {
      subscribers.delete(clientId)
      if (subscribers.size === 0) {
        this.subscriptions.delete(channel)
      }
    }
  }

  /**
   * 获取连接统计
   */
  getConnectionStats() {
    const clients = Array.from(this.connectedClients.values())
    const channels = {}

    for (const [channel, subscribers] of this.subscriptions) {
      channels[channel] = subscribers.size
    }

    return {
      totalClients: clients.length,
      clientsByChannel: channels,
      uptime: clients.length > 0 ? Date.now() - Math.min(...clients.map(c => c.connectedAt.getTime())) : 0
    }
  }

  /**
   * 关闭处理器
   */
  close() {
    console.log('关闭WebSocket处理器...')

    // 清理所有连接
    for (const clientId of this.connectedClients.keys()) {
      this.handleDisconnection(clientId)
    }

    console.log('WebSocket处理器已关闭')
  }
}

module.exports = WebSocketHandler
