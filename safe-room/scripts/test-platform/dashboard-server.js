#!/usr/bin/env node

/**
 * 测试仪表板服务器
 *
 * 提供RESTful API和WebSocket实时推送的测试可视化仪表板后端服务
 */

const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

// 导入我们的工具模块
const TestResultCollector = require('./result-collector')
const TestMetricsAggregator = require('./metrics-aggregator')
const TestHistoryManager = require('./history-manager')

class TestDashboardServer {
  constructor(options = {}) {
    this.options = {
      port: options.port || 3000,
      host: options.host || 'localhost',
      dataDir: options.dataDir || path.join(process.cwd(), 'test-results'),
      corsOrigin: options.corsOrigin || '*',
      enableRealtime: options.enableRealtime !== false,
      ...options
    }

    this.app = null
    this.server = null
    this.io = null
    this.collector = null
    this.aggregator = null
    this.historyManager = null

    this.isRunning = false
    this.startTime = null
  }

  /**
   * 启动服务器
   */
  async start() {
    try {
      console.log('🚀 启动测试仪表板服务器...')

      // 初始化数据管理器
      await this.initializeDataManagers()

      // 创建Express应用
      this.app = express()

      // 配置中间件
      this.configureMiddleware()

      // 配置路由
      this.configureRoutes()

      // 创建HTTP服务器
      this.server = http.createServer(this.app)

      // 配置WebSocket
      if (this.options.enableRealtime) {
        this.configureWebSocket()
      }

      // 启动服务器
      await this.startServer()

      // 设置定期任务
      this.setupScheduledTasks()

      console.log(`✅ 测试仪表板服务器已启动: http://${this.options.host}:${this.options.port}`)
      console.log(`📊 数据目录: ${this.options.dataDir}`)
      console.log(`🔄 实时更新: ${this.options.enableRealtime ? '启用' : '禁用'}`)

      this.isRunning = true
      this.startTime = new Date()

    } catch (error) {
      console.error('❌ 启动服务器失败:', error.message)
      throw error
    }
  }

  /**
   * 初始化数据管理器
   */
  async initializeDataManagers() {
    console.log('📊 初始化数据管理器...')

    // 初始化结果收集器
    this.collector = new TestResultCollector({
      outputDir: this.options.dataDir,
      realtime: this.options.enableRealtime
    })

    // 初始化指标聚合器
    this.aggregator = new TestMetricsAggregator({
      dataDir: this.options.dataDir
    })

    // 初始化历史管理器
    this.historyManager = new TestHistoryManager({
      dataDir: this.options.dataDir
    })

    // 启动结果收集器
    await this.collector.start()

    console.log('✅ 数据管理器初始化完成')
  }

  /**
   * 配置中间件
   */
  configureMiddleware() {
    // CORS配置
    this.app.use(cors({
      origin: this.options.corsOrigin,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }))

    // JSON解析
    this.app.use(express.json({ limit: '50mb' }))
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }))

    // 静态文件服务
    this.app.use('/static', express.static(path.join(__dirname, 'public')))
    this.app.use('/reports', express.static(this.options.dataDir))

    // 请求日志
    this.app.use((req, res, next) => {
      const timestamp = new Date().toISOString()
      console.log(`[${timestamp}] ${req.method} ${req.url}`)
      next()
    })

    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
        timestamp: new Date().toISOString()
      })
    })
  }

  /**
   * 配置路由
   */
  configureRoutes() {
    // API路由
    this.app.use('/api/v1', this.createApiRoutes())

    // 仪表板页面
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'))
    })

    // 404处理
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.url} not found`,
        timestamp: new Date().toISOString()
      })
    })
  }

  /**
   * 创建API路由
   */
  createApiRoutes() {
    const router = express.Router()

    // ========== 仪表板概览 ==========

    // 获取仪表板概览数据
    router.get('/dashboard/overview', async (req, res) => {
      try {
        const timeRange = req.query.timeRange || 'week'
        const overview = this.aggregator.getAggregatedData(timeRange)

        res.json({
          success: true,
          data: {
            summary: {
              totalRuns: overview.totalRuns,
              healthScore: overview.health.score,
              healthLevel: overview.health.level,
              successRate: overview.overall.successRate,
              avgDuration: overview.overall.avgDuration
            },
            frameworks: overview.frameworks,
            trends: overview.trends,
            generatedAt: overview.generatedAt
          }
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: '获取仪表板概览失败',
          message: error.message
        })
      }
    })

    // ========== 测试结果 ==========

    // 获取测试结果列表
    router.get('/results', async (req, res) => {
      try {
        const {
          framework,
          limit = 50,
          offset = 0,
          sortBy = 'timestamp',
          sortOrder = 'desc'
        } = req.query

        const results = this.historyManager.query({
          framework,
          limit: parseInt(limit),
          offset: parseInt(offset),
          sortBy,
          sortOrder
        })

        res.json({
          success: true,
          data: results
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: '获取测试结果失败',
          message: error.message
        })
      }
    })

    // 获取单个测试结果详情
    router.get('/results/:id', async (req, res) => {
      try {
        const { id } = req.params

        // 从历史管理器中查找
        const results = this.historyManager.query({ limit: 1000 })
        const result = results.results.find(r => r.id === id)

        if (!result) {
          return res.status(404).json({
            success: false,
            error: '测试结果未找到'
          })
        }

        res.json({
          success: true,
          data: result
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: '获取测试结果详情失败',
          message: error.message
        })
      }
    })

    // ========== 指标和统计 ==========

    // 获取统计数据
    router.get('/stats', async (req, res) => {
      try {
        const { framework, timeRange } = req.query
        const stats = this.historyManager.getStats({
          framework,
          dateFrom: timeRange ? this.getDateRange(timeRange) : undefined
        })

        res.json({
          success: true,
          data: stats
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: '获取统计数据失败',
          message: error.message
        })
      }
    })

    // 获取趋势数据
    router.get('/trends', async (req, res) => {
      try {
        const { framework, days = 30, interval = 'day' } = req.query
        const trends = this.historyManager.getTrends({
          framework,
          days: parseInt(days),
          interval
        })

        res.json({
          success: true,
          data: trends
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: '获取趋势数据失败',
          message: error.message
        })
      }
    })

    // ========== 覆盖率数据 ==========

    // 获取覆盖率数据
    router.get('/coverage', async (req, res) => {
      try {
        const { framework, timeRange = 'latest' } = req.query

        let coverageData

        if (timeRange === 'latest') {
          // 获取最新的覆盖率数据
          const results = this.historyManager.query({
            framework,
            limit: 1,
            sortBy: 'timestamp',
            sortOrder: 'desc'
          })

          coverageData = results.results[0]?.coverage || null
        } else {
          // 获取指定时间范围的覆盖率统计
          const aggregated = this.aggregator.getAggregatedData(timeRange)
          coverageData = aggregated.overall.coverage
        }

        res.json({
          success: true,
          data: coverageData
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: '获取覆盖率数据失败',
          message: error.message
        })
      }
    })

    // ========== 失败分析 ==========

    // 获取失败模式分析
    router.get('/failures/patterns', async (req, res) => {
      try {
        const { framework, days = 7, minOccurrences = 2 } = req.query
        const patterns = this.historyManager.findFailurePatterns({
          framework,
          days: parseInt(days),
          minOccurrences: parseInt(minOccurrences)
        })

        res.json({
          success: true,
          data: patterns
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: '获取失败模式分析失败',
          message: error.message
        })
      }
    })

    // ========== 系统信息 ==========

    // 获取服务器状态
    router.get('/system/status', (req, res) => {
      const status = {
        server: {
          uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
          startTime: this.startTime,
          version: process.version,
          platform: process.platform,
          arch: process.arch
        },
        data: {
          dataDir: this.options.dataDir,
          totalEntries: this.historyManager ? this.historyManager.history.length : 0,
          realtimeEnabled: this.options.enableRealtime
        },
        collectors: {
          vitest: this.collector?.results ? Array.from(this.collector.results.values()).filter(r => r.framework === 'vitest').length : 0,
          playwright: this.collector?.results ? Array.from(this.collector.results.values()).filter(r => r.framework === 'playwright').length : 0
        }
      }

      res.json({
        success: true,
        data: status
      })
    })

    // 获取存储信息
    router.get('/system/storage', (req, res) => {
      try {
        const storageInfo = this.historyManager.getStorageInfo()

        res.json({
          success: true,
          data: storageInfo
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: '获取存储信息失败',
          message: error.message
        })
      }
    })

    // ========== 数据导出 ==========

    // 导出历史数据
    router.get('/export/history', async (req, res) => {
      try {
        const { format = 'json', framework, limit = 1000 } = req.query

        const exportPath = this.historyManager.exportData({
          format,
          queryOptions: {
            framework,
            limit: parseInt(limit)
          }
        })

        res.download(exportPath, `test-history.${format}`, (err) => {
          if (err) {
            console.error('文件下载失败:', err)
          }
          // 清理临时文件（可选）
          try {
            fs.unlinkSync(exportPath)
          } catch (cleanupError) {
            // 忽略清理错误
          }
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: '导出历史数据失败',
          message: error.message
        })
      }
    })

    // 导出指标报告
    router.get('/export/metrics', async (req, res) => {
      try {
        const { format = 'json', timeRange = 'week' } = req.query

        const exportPath = this.aggregator.exportData(format)

        res.download(exportPath, `metrics-report.${format}`, (err) => {
          if (err) {
            console.error('文件下载失败:', err)
          }
          // 清理临时文件（可选）
          try {
            fs.unlinkSync(exportPath)
          } catch (cleanupError) {
            // 忽略清理错误
          }
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: '导出指标报告失败',
          message: error.message
        })
      }
    })

    return router
  }

  /**
   * 配置WebSocket
   */
  configureWebSocket() {
    this.io = socketIo(this.server, {
      cors: {
        origin: this.options.corsOrigin,
        methods: ['GET', 'POST']
      }
    })

    this.io.on('connection', (socket) => {
      console.log(`🔌 WebSocket客户端连接: ${socket.id}`)

      // 发送欢迎消息
      socket.emit('welcome', {
        message: 'Connected to Test Dashboard',
        timestamp: new Date().toISOString()
      })

      // 监听客户端请求
      socket.on('subscribe', (channels) => {
        if (Array.isArray(channels)) {
          channels.forEach(channel => {
            socket.join(channel)
            console.log(`📡 客户端 ${socket.id} 订阅频道: ${channel}`)
          })
        }
      })

      socket.on('unsubscribe', (channels) => {
        if (Array.isArray(channels)) {
          channels.forEach(channel => {
            socket.leave(channel)
            console.log(`📡 客户端 ${socket.id} 取消订阅频道: ${channel}`)
          })
        }
      })

      socket.on('disconnect', () => {
        console.log(`🔌 WebSocket客户端断开连接: ${socket.id}`)
      })
    })

    // 设置结果收集器的WebSocket回调
    if (this.collector) {
      this.collector.on('result', (result) => {
        // 广播测试结果更新
        this.io.to('results').emit('result-update', result)
        this.io.to(`framework-${result.framework}`).emit('result-update', result)
      })
    }
  }

  /**
   * 启动服务器
   */
  async startServer() {
    return new Promise((resolve, reject) => {
      this.server.listen(this.options.port, this.options.host, (error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  /**
   * 设置定期任务
   */
  setupScheduledTasks() {
    // 每分钟更新一次统计数据
    setInterval(() => {
      if (this.io) {
        const stats = this.aggregator.getAggregatedData('hour')
        this.io.to('stats').emit('stats-update', stats)
      }
    }, 60000) // 1分钟

    // 每5分钟进行数据清理
    setInterval(() => {
      if (this.historyManager) {
        this.historyManager.cleanupOldEntries()
      }
      if (this.aggregator) {
        // 重新计算聚合数据
        this.aggregator.getAggregatedData('day', true) // 强制刷新
      }
    }, 300000) // 5分钟
  }

  /**
   * 获取日期范围
   */
  getDateRange(timeRange) {
    const now = new Date()
    const ranges = {
      hour: () => new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      day: () => new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      week: () => new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      month: () => new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    return ranges[timeRange]?.() || ranges.week()
  }

  /**
   * 停止服务器
   */
  async stop() {
    console.log('🛑 停止测试仪表板服务器...')

    if (this.collector) {
      this.collector.cleanup()
    }

    if (this.io) {
      this.io.close()
    }

    if (this.server) {
      this.server.close(() => {
        console.log('✅ 服务器已停止')
      })
    }

    this.isRunning = false
  }

  /**
   * 获取服务器状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      port: this.options.port,
      host: this.options.host,
      startTime: this.startTime,
      uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
      dataDir: this.options.dataDir,
      realtimeEnabled: this.options.enableRealtime
    }
  }
}

// CLI 接口
async function main() {
  const args = process.argv.slice(2)

  const options = {
    port: parseInt(args.find((arg, index) => arg === '--port' && args[index + 1])?.[index + 1] || '3000'),
    host: args.find((arg, index) => arg === '--host' && args[index + 1])?.[index + 1] || 'localhost',
    dataDir: args.find((arg, index) => arg === '--data-dir' && args[index + 1])?.[index + 1] || './test-results',
    corsOrigin: args.find((arg, index) => arg === '--cors-origin' && args[index + 1])?.[index + 1] || '*',
    enableRealtime: !args.includes('--no-realtime')
  }

  const server = new TestDashboardServer(options)

  try {
    await server.start()

    // 处理优雅关闭
    process.on('SIGINT', async () => {
      console.log('\n接收到 SIGINT，正在关闭服务器...')
      await server.stop()
      process.exit(0)
    })

    process.on('SIGTERM', async () => {
      console.log('\n接收到 SIGTERM，正在关闭服务器...')
      await server.stop()
      process.exit(0)
    })

  } catch (error) {
    console.error('启动服务器失败:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('未处理的错误:', error)
    process.exit(1)
  })
}

module.exports = TestDashboardServer
