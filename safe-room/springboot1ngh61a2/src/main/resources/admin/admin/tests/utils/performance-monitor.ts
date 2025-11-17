/**
 * 测试性能监控工具
 * 用于监控测试执行时间、内存使用和生成性能报告
 */

export interface TestPerformanceMetrics {
  testName: string;
  fileName: string;
  duration: number;
  startTime: number;
  endTime: number;
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
}

export interface PerformanceReport {
  totalTests: number;
  totalDuration: number;
  averageDuration: number;
  slowestTests: TestPerformanceMetrics[];
  fastestTests: TestPerformanceMetrics[];
  memoryUsage: {
    peak: number;
    average: number;
    trend: number[];
  };
  timestamp: number;
}

/**
 * 性能监控工具类
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: TestPerformanceMetrics[] = [];
  private startTime = 0;
  private memorySnapshots: number[] = [];

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 开始测试会话监控
   */
  startSession(): void {
    this.startTime = Date.now();
    this.metrics = [];
    this.memorySnapshots = [];
    console.log('🚀 测试性能监控会话已开始');
  }

  /**
   * 记录测试开始
   */
  recordTestStart(testName: string, fileName: string): void {
    const startTime = Date.now();
    const memoryUsage = this.getMemoryUsage();

    // 添加到当前测试指标（将在测试结束时更新）
    this.metrics.push({
      testName,
      fileName,
      duration: 0,
      startTime,
      endTime: 0,
      memoryUsage
    });

    this.takeMemorySnapshot();
  }

  /**
   * 记录测试结束
   */
  recordTestEnd(testName: string, fileName: string): void {
    const endTime = Date.now();
    const metric = this.metrics.find(
      m => m.testName === testName && m.fileName === fileName && m.endTime === 0
    );

    if (metric) {
      metric.endTime = endTime;
      metric.duration = endTime - metric.startTime;
      metric.memoryUsage = this.getMemoryUsage();
    }

    this.takeMemorySnapshot();
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      return {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external
      };
    }
    return undefined;
  }

  /**
   * 记录内存快照
   */
  private takeMemorySnapshot(): void {
    const memory = this.getMemoryUsage();
    if (memory) {
      this.memorySnapshots.push(memory.heapUsed);
    }
  }

  /**
   * 生成性能报告
   */
  generateReport(): PerformanceReport {
    const totalTests = this.metrics.length;
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageDuration = totalTests > 0 ? totalDuration / totalTests : 0;

    // 按执行时间排序
    const sortedMetrics = [...this.metrics].sort((a, b) => b.duration - a.duration);
    const slowestTests = sortedMetrics.slice(0, 5);
    const fastestTests = sortedMetrics.slice(-5).reverse();

    // 内存使用统计
    const memoryUsage = this.calculateMemoryStats();

    return {
      totalTests,
      totalDuration,
      averageDuration,
      slowestTests,
      fastestTests,
      memoryUsage,
      timestamp: Date.now()
    };
  }

  /**
   * 计算内存使用统计
   */
  private calculateMemoryStats() {
    const peak = Math.max(...this.memorySnapshots);
    const average = this.memorySnapshots.length > 0
      ? this.memorySnapshots.reduce((sum, mem) => sum + mem, 0) / this.memorySnapshots.length
      : 0;

    return {
      peak,
      average,
      trend: this.memorySnapshots
    };
  }

  /**
   * 打印性能报告到控制台
   */
  printReport(): void {
    const report = this.generateReport();

    console.log('\n📊 测试性能报告');
    console.log('='.repeat(50));
    console.log(`总测试数: ${report.totalTests}`);
    console.log(`总执行时间: ${report.totalDuration.toFixed(2)}ms`);
    console.log(`平均执行时间: ${report.averageDuration.toFixed(2)}ms`);

    if (report.memoryUsage.peak > 0) {
      console.log(`内存峰值: ${(report.memoryUsage.peak / 1024 / 1024).toFixed(2)}MB`);
      console.log(`内存平均: ${(report.memoryUsage.average / 1024 / 1024).toFixed(2)}MB`);
    }

    if (report.slowestTests.length > 0) {
      console.log('\n🐌 最慢的测试:');
      report.slowestTests.forEach((test, index) => {
        console.log(`  ${index + 1}. ${test.testName} (${test.fileName}): ${test.duration}ms`);
      });
    }

    if (report.fastestTests.length > 0) {
      console.log('\n⚡ 最快的测试:');
      report.fastestTests.forEach((test, index) => {
        console.log(`  ${index + 1}. ${test.testName} (${test.fileName}): ${test.duration}ms`);
      });
    }

    console.log('='.repeat(50));
  }

  /**
   * 保存性能报告到文件
   */
  async saveReportToFile(filePath: string): Promise<void> {
    const report = this.generateReport();
    const fs = await import('fs/promises');

    try {
      await fs.writeFile(filePath, JSON.stringify(report, null, 2));
      console.log(`💾 性能报告已保存到: ${filePath}`);
    } catch (error) {
      console.error('保存性能报告失败:', error);
    }
  }

  /**
   * 检查是否有慢测试
   */
  checkForSlowTests(thresholdMs = 1000): TestPerformanceMetrics[] {
    return this.metrics.filter(m => m.duration > thresholdMs);
  }

  /**
   * 获取所有指标
   */
  getAllMetrics(): TestPerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * 清理数据
   */
  clear(): void {
    this.metrics = [];
    this.memorySnapshots = [];
    this.startTime = 0;
  }
}

// 导出单例实例
export const performanceMonitor = PerformanceMonitor.getInstance();
