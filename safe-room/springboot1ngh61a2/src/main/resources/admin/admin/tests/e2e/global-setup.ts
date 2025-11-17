import { chromium, Browser, BrowserContext } from '@playwright/test';
import { testConfig } from './test-config';

/**
 * Global setup for P2P integration tests
 * Sets up test environment and ensures backend connectivity
 */
async function globalSetup() {
  console.log('🚀 Starting P2P Integration Test Setup...');

  try {
    // Verify backend connectivity
    console.log('🔍 Checking backend connectivity...');
    const backendResponse = await fetch(`${testConfig.backendUrl}/actuator/health`, {
      timeout: 10000,
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend health check failed: ${backendResponse.status}`);
    }

    console.log('✅ Backend is healthy');

    // Verify frontend is accessible
    console.log('🔍 Checking frontend accessibility...');
    const frontendResponse = await fetch(testConfig.frontendUrl, {
      timeout: 10000,
    });

    if (!frontendResponse.ok) {
      throw new Error(`Frontend accessibility check failed: ${frontendResponse.status}`);
    }

    console.log('✅ Frontend is accessible');

    // Pre-warm browser context for faster test execution
    console.log('🔄 Pre-warming browser context...');
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'P2P-Integration-Test/1.0',
    });

    // Visit frontend to ensure it's fully loaded
    const page = await context.newPage();
    await page.goto(testConfig.frontendUrl, { waitUntil: 'networkidle' });
    await page.close();

    await context.close();
    await browser.close();

    console.log('✅ Browser context pre-warmed');

    // Setup test database state if needed
    console.log('🗄️ Preparing test database...');
    // Note: Database setup would be handled by test scripts

    console.log('🎉 P2P Integration Test Setup Complete!');

  } catch (error) {
    console.error('❌ P2P Test Setup Failed:', error);
    throw error;
  }
}

export default globalSetup;
