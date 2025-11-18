import { Page } from '@playwright/test';
import { BasePage } from './base-page';
import { testConfig } from '../test-config';

/**
 * Login Page Object for admin authentication
 */
export class LoginPage extends BasePage {
  // Selectors
  private readonly selectors = {
    usernameInput: this.config.selectors.login.username,
    passwordInput: this.config.selectors.login.password,
    submitButton: this.config.selectors.login.submitButton,
    errorMessage: this.config.selectors.login.errorMessage,
    loginForm: 'form[data-testid="login-form"]',
    forgotPasswordLink: '[data-testid="forgot-password"]',
    registerLink: '[data-testid="register-link"]',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin(): Promise<void> {
    await this.navigateTo(`${this.config.frontendUrl}/login`);
  }

  /**
   * Perform login with credentials
   */
  async login(username: string, password: string): Promise<void> {
    console.log(`🔐 Attempting login for user: ${username}`);

    // Fill username
    await this.fillInput(this.selectors.usernameInput, username);

    // Fill password
    await this.fillInput(this.selectors.passwordInput, password);

    // Click submit and wait for navigation or error
    await Promise.all([
      this.page.waitForURL((url) => !url.pathname.includes('/login'), {
        timeout: this.config.timeouts.pageLoad,
      }).catch(() => {
        // If navigation doesn't happen, check for error message
        return this.waitForElement(this.selectors.errorMessage, 2000).catch(() => null);
      }),
      this.clickElement(this.selectors.submitButton),
    ]);
  }

  /**
   * Login as admin user
   */
  async loginAsAdmin(): Promise<void> {
    await this.login(
      this.config.testUsers.admin.username,
      this.config.testUsers.admin.password
    );
  }

  /**
   * Login as test user
   */
  async loginAsTestUser(): Promise<void> {
    await this.login(
      this.config.testUsers.testUser.username,
      this.config.testUsers.testUser.password
    );
  }

  /**
   * Check if login was successful
   */
  async isLoginSuccessful(): Promise<boolean> {
    try {
      // Check if we're redirected away from login page
      const currentUrl = await this.getCurrentUrl();
      return !currentUrl.includes('/login');
    } catch {
      return false;
    }
  }

  /**
   * Get login error message
   */
  async getErrorMessage(): Promise<string> {
    try {
      return await this.getText(this.selectors.errorMessage);
    } catch {
      return '';
    }
  }

  /**
   * Check if error message is displayed
   */
  async hasErrorMessage(): Promise<boolean> {
    return this.isVisible(this.selectors.errorMessage);
  }

  /**
   * Clear login form
   */
  async clearForm(): Promise<void> {
    await this.fillInput(this.selectors.usernameInput, '');
    await this.fillInput(this.selectors.passwordInput, '');
  }

  /**
   * Test invalid login scenarios
   */
  async attemptInvalidLogin(username: string, password: string): Promise<void> {
    await this.clearForm();
    await this.login(username, password);
    await this.page.waitForTimeout(1000); // Wait for error to appear
  }

  /**
   * Check if forgot password link is available
   */
  async hasForgotPasswordLink(): Promise<boolean> {
    return this.isVisible(this.selectors.forgotPasswordLink);
  }

  /**
   * Check if register link is available
   */
  async hasRegisterLink(): Promise<boolean> {
    return this.isVisible(this.selectors.registerLink);
  }
}

