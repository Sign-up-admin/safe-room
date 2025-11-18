/**
 * P2P Integration Test Configuration
 * Centralized configuration for all test environments and settings
 */

export interface TestConfig {
  // URLs
  backendUrl: string;
  frontendUrl: string;

  // Test Data
  testUsers: {
    admin: {
      username: string;
      password: string;
      role: string;
    };
    testUser: {
      username: string;
      password: string;
      role: string;
    };
  };

  // Timeouts (in milliseconds)
  timeouts: {
    pageLoad: number;
    apiCall: number;
    elementWait: number;
    testExecution: number;
  };

  // Test Environment
  environment: 'development' | 'staging' | 'production';

  // Browser Settings
  browser: {
    headless: boolean;
    viewport: {
      width: number;
      height: number;
    };
    slowMo?: number;
  };

  // API Endpoints
  api: {
    login: string;
    logout: string;
    users: string;
    courses: string;
    dashboard: string;
  };

  // Selectors (CSS/XPath)
  selectors: {
    login: {
      username: string;
      password: string;
      submitButton: string;
      errorMessage: string;
    };
    dashboard: {
      welcomeMessage: string;
      userCount: string;
      recentActivity: string;
    };
    navigation: {
      home: string;
      users: string;
      courses: string;
      logout: string;
    };
  };

  // Test Data Cleanup
  cleanup: {
    enabled: boolean;
    strategies: ('api' | 'database')[];
  };
}

/**
 * Load configuration from environment variables or use defaults
 */
function loadConfig(): TestConfig {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const isCI = !!process.env.CI;

  return {
    backendUrl,
    frontendUrl,

    testUsers: {
      admin: {
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'ADMIN',
      },
      testUser: {
        username: process.env.TEST_USERNAME || 'testuser',
        password: process.env.TEST_PASSWORD || 'test123',
        role: 'USER',
      },
    },

    timeouts: {
      pageLoad: parseInt(process.env.PAGE_LOAD_TIMEOUT || '30000'),
      apiCall: parseInt(process.env.API_CALL_TIMEOUT || '10000'),
      elementWait: parseInt(process.env.ELEMENT_WAIT_TIMEOUT || '5000'),
      testExecution: parseInt(process.env.TEST_EXECUTION_TIMEOUT || '60000'),
    },

    environment: (process.env.NODE_ENV as TestConfig['environment']) || 'development',

    browser: {
      headless: isCI || process.env.HEADLESS === 'true',
      viewport: {
        width: parseInt(process.env.VIEWPORT_WIDTH || '1280'),
        height: parseInt(process.env.VIEWPORT_HEIGHT || '720'),
      },
      slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : undefined,
    },

    api: {
      login: `${backendUrl}/api/auth/login`,
      logout: `${backendUrl}/api/auth/logout`,
      users: `${backendUrl}/api/users`,
      courses: `${backendUrl}/api/courses`,
      dashboard: `${backendUrl}/api/dashboard`,
    },

    selectors: {
      login: {
        username: '[data-testid="username-input"]',
        password: '[data-testid="password-input"]',
        submitButton: '[data-testid="login-submit"]',
        errorMessage: '[data-testid="login-error"]',
      },
      dashboard: {
        welcomeMessage: '[data-testid="welcome-message"]',
        userCount: '[data-testid="user-count"]',
        recentActivity: '[data-testid="recent-activity"]',
      },
      navigation: {
        home: '[data-testid="nav-home"]',
        users: '[data-testid="nav-users"]',
        courses: '[data-testid="nav-courses"]',
        logout: '[data-testid="nav-logout"]',
      },
    },

    cleanup: {
      enabled: process.env.TEST_CLEANUP !== 'false',
      strategies: ['api'], // Default to API cleanup, database cleanup handled by scripts
    },
  };
}

export const testConfig = loadConfig();

// Environment validation
export function validateConfig(): void {
  const requiredUrls = [testConfig.backendUrl, testConfig.frontendUrl];
  const invalidUrls = requiredUrls.filter(url => !url || !url.startsWith('http'));

  if (invalidUrls.length > 0) {
    throw new Error(`Invalid URLs in configuration: ${invalidUrls.join(', ')}`);
  }

  console.log('✅ Test configuration validated');
  console.log(`📍 Backend: ${testConfig.backendUrl}`);
  console.log(`🌐 Frontend: ${testConfig.frontendUrl}`);
  console.log(`🏭 Environment: ${testConfig.environment}`);
}


