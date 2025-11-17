import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// 全局测试清理
async function globalTeardown(config: FullConfig) {
  console.log('🧹 开始 E2E 测试全局清理...');

  const testResultsDir = path.join(process.cwd(), 'test-results');

  try {
    // 记录测试结束时间
    const endTime = new Date().toISOString();
    fs.writeFileSync(
      path.join(testResultsDir, 'test-end-time.txt'),
      endTime
    );

    // 计算测试总耗时
    const startTimeFile = path.join(testResultsDir, 'test-start-time.txt');
    if (fs.existsSync(startTimeFile)) {
      const startTime = new Date(fs.readFileSync(startTimeFile, 'utf8'));
      const duration = new Date(endTime).getTime() - startTime.getTime();
      const durationMinutes = Math.round(duration / (1000 * 60));

      fs.writeFileSync(
        path.join(testResultsDir, 'test-duration.txt'),
        `${durationMinutes} minutes`
      );

      console.log(`⏱️ 测试总耗时: ${durationMinutes} 分钟`);
    }

    // 清理临时文件
    const tempFiles = [
      'test-results/.auth',
      'test-results/.cache',
      'playwright-report'
    ];

    for (const tempFile of tempFiles) {
      const tempPath = path.join(process.cwd(), tempFile);
      if (fs.existsSync(tempPath)) {
        try {
          fs.rmSync(tempPath, { recursive: true, force: true });
          console.log(`🗑️ 已清理临时目录: ${tempFile}`);
        } catch (error) {
          console.warn(`⚠️ 清理临时目录失败 ${tempFile}:`, error.message);
        }
      }
    }

    // 生成测试执行摘要
    const summary = {
      endTime,
      duration: fs.existsSync(path.join(testResultsDir, 'test-duration.txt'))
        ? fs.readFileSync(path.join(testResultsDir, 'test-duration.txt'), 'utf8')
        : 'unknown',
      environment: process.env.NODE_ENV || 'test',
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    };

    fs.writeFileSync(
      path.join(testResultsDir, 'execution-summary.json'),
      JSON.stringify(summary, null, 2)
    );

    console.log('✅ 全局清理完成');

  } catch (error) {
    console.error('❌ 全局清理过程中出错:', error.message);
  }
}

export default globalTeardown;
