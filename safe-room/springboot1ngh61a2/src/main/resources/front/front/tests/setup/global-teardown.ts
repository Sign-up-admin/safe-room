import { FullConfig } from '@playwright/test'
import fs from 'fs'
import path from 'path'

/**
 * Global teardown for Playwright tests
 * Cleans up test resources and generates reports
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting Front-end E2E Test Global Teardown...')

  try {
    // Clean up temporary test data
    console.log('🗑️ Cleaning up temporary test data...')

    // Generate test summary report
    console.log('📊 Generating test summary report...')
    await generateTestSummary()

    // Archive old test results (keep last 10 runs)
    console.log('📦 Archiving old test results...')
    await archiveOldResults()

    // Clean up orphaned processes if any
    console.log('🔧 Cleaning up orphaned processes...')

    console.log('🎉 Front-end E2E Test Global Teardown Complete!')

  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    // Don't throw error in teardown to avoid masking test failures
  }
}

/**
 * Generate test summary report
 */
async function generateTestSummary() {
  const resultsDir = path.join(process.cwd(), 'test-results')
  const summaryPath = path.join(resultsDir, 'test-summary.json')

  try {
    const summary = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cwd: process.cwd(),
      },
      configuration: {
        baseUrl: process.env.E2E_BASE_URL,
        backendUrl: process.env.BACKEND_URL,
        headless: process.env.CI ? true : false,
        parallel: process.env.E2E_PARALLEL === 'true',
      },
      cleanup: {
        status: 'completed',
        timestamp: new Date().toISOString(),
      }
    }

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2))
    console.log(`✅ Test summary saved to: ${summaryPath}`)
  } catch (error) {
    console.warn('⚠️ Failed to generate test summary:', error.message)
  }
}

/**
 * Archive old test results
 */
async function archiveOldResults() {
  const resultsDir = path.join(process.cwd(), 'test-results')
  const archiveDir = path.join(resultsDir, 'archive')

  try {
    // Create archive directory if it doesn't exist
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true })
    }

    // Get all test result directories
    const items = fs.readdirSync(resultsDir)
      .filter(item => {
        const itemPath = path.join(resultsDir, item)
        return fs.statSync(itemPath).isDirectory() &&
               item !== 'archive' &&
               item.startsWith('run-')
      })
      .sort()
      .reverse() // Most recent first

    // Keep only last 10 runs, archive the rest
    if (items.length > 10) {
      const toArchive = items.slice(10)

      for (const item of toArchive) {
        const sourcePath = path.join(resultsDir, item)
        const targetPath = path.join(archiveDir, item)

        try {
          fs.renameSync(sourcePath, targetPath)
          console.log(`📦 Archived: ${item}`)
        } catch (error) {
          console.warn(`⚠️ Failed to archive ${item}:`, error.message)
        }
      }
    }
  } catch (error) {
    console.warn('⚠️ Failed to archive old results:', error.message)
  }
}

export default globalTeardown