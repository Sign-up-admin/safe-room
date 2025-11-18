import { chromium, FullConfig } from '@playwright/test'
import fs from 'fs'
import path from 'path'

/**
 * Global setup for Playwright tests
 * Prepares test environment and creates necessary resources
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Front-end E2E Test Global Setup...')

  try {
    // Create test directories
    const dirs = [
      'test-results',
      'test-results/screenshots',
      'test-results/videos',
      'test-results/traces',
      'test-results/reports'
    ]

    dirs.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir)
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true })
        console.log(`📁 Created directory: ${dir}`)
      }
    })

    // Verify backend connectivity
    console.log('🔍 Checking backend connectivity...')
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
      const response = await fetch(`${backendUrl}/actuator/health`, {
        timeout: 10000,
      })

      if (response.ok) {
        console.log('✅ Backend is healthy')
      } else {
        console.warn('⚠️ Backend health check failed, tests will use mocks')
      }
    } catch (error) {
      console.warn('⚠️ Backend connectivity check failed, tests will use mocks')
    }

    // Pre-warm browser for faster test execution
    console.log('🔄 Pre-warming browser...')
    const browser = await chromium.launch()
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'E2E-Test-Prewarm/1.0',
    })

    // Visit frontend to ensure it's accessible
    const frontendUrl = config.use?.baseURL || 'http://localhost:5173'
    try {
      const page = await context.newPage()
      await page.goto(frontendUrl, { waitUntil: 'networkidle', timeout: 30000 })
      console.log('✅ Frontend is accessible')
      await page.close()
    } catch (error) {
      console.warn('⚠️ Frontend accessibility check failed:', error.message)
    }

    await context.close()
    await browser.close()

    // Setup test data cleanup script
    console.log('🗄️ Preparing test data cleanup...')

    console.log('🎉 Front-end E2E Test Global Setup Complete!')

  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  }
}

export default globalSetup