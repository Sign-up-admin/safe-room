import { Page } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Dashboard Page Object for admin dashboard interactions
 */
export class DashboardPage extends BasePage {
  // Selectors
  private readonly selectors = {
    welcomeMessage: '[data-testid="welcome-message"]',
    userCount: '[data-testid="user-count"]',
    courseCount: '[data-testid="course-count"]',
    recentActivity: '[data-testid="recent-activity"]',
    quickStats: '[data-testid="quick-stats"]',
    navigationMenu: '[data-testid="navigation-menu"]',
    logoutButton: '[data-testid="logout-button"]',
    dashboardCards: '.dashboard-card',
    loadingSpinner: '[data-testid="loading-spinner"]',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Wait for dashboard to load completely
   */
  async waitForDashboardLoad(): Promise<void> {
    await this.waitForPageLoad();

    // Wait for key dashboard elements
    await this.waitForElement(this.selectors.welcomeMessage);
    await this.waitForElement(this.selectors.quickStats);

    // Wait for loading spinner to disappear if present
    try {
      await this.page.locator(this.selectors.loadingSpinner).waitFor({
        state: 'hidden',
        timeout: 10000,
      });
    } catch {
      // Loading spinner might not be present, continue
    }
  }

  /**
   * Get welcome message
   */
  async getWelcomeMessage(): Promise<string> {
    return this.getText(this.selectors.welcomeMessage);
  }

  /**
   * Get user count from dashboard
   */
  async getUserCount(): Promise<number> {
    const countText = await this.getText(this.selectors.userCount);
    return parseInt(countText.replace(/\D/g, '')) || 0;
  }

  /**
   * Get course count from dashboard
   */
  async getCourseCount(): Promise<number> {
    const countText = await this.getText(this.selectors.courseCount);
    return parseInt(countText.replace(/\D/g, '')) || 0;
  }

  /**
   * Get recent activity items
   */
  async getRecentActivity(): Promise<string[]> {
    const activityElements = this.page.locator(`${this.selectors.recentActivity} li`);
    return activityElements.allTextContents();
  }

  /**
   * Check if dashboard is fully loaded
   */
  async isDashboardLoaded(): Promise<boolean> {
    try {
      await this.waitForElement(this.selectors.welcomeMessage, 5000);
      await this.waitForElement(this.selectors.quickStats, 5000);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Navigate to users management page
   */
  async navigateToUsers(): Promise<void> {
    await this.clickElement('[data-testid="nav-users"]');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to courses management page
   */
  async navigateToCourses(): Promise<void> {
    await this.clickElement('[data-testid="nav-courses"]');
    await this.waitForPageLoad();
  }

  /**
   * Perform logout
   */
  async logout(): Promise<void> {
    await this.clickElement(this.selectors.logoutButton);

    // Wait for redirect to login page
    await this.page.waitForURL((url) => url.pathname.includes('/login'), {
      timeout: this.config.timeouts.pageLoad,
    });
  }

  /**
   * Get dashboard cards information
   */
  async getDashboardCards(): Promise<Array<{ title: string; value: string; change?: string }>> {
    const cards = await this.page.locator(this.selectors.dashboardCards).all();

    const cardData = await Promise.all(
      cards.map(async (card) => {
        const title = await card.locator('.card-title').textContent() || '';
        const value = await card.locator('.card-value').textContent() || '';
        const change = await card.locator('.card-change').textContent() || undefined;

        return { title: title.trim(), value: value.trim(), change: change?.trim() };
      })
    );

    return cardData;
  }

  /**
   * Check if navigation menu is visible
   */
  async isNavigationVisible(): Promise<boolean> {
    return this.isVisible(this.selectors.navigationMenu);
  }

  /**
   * Get current user information from dashboard
   */
  async getCurrentUser(): Promise<{ name: string; role: string }> {
    const name = await this.getText('[data-testid="current-user-name"]');
    const role = await this.getText('[data-testid="current-user-role"]');

    return {
      name: name || 'Unknown',
      role: role || 'Unknown',
    };
  }

  /**
   * Refresh dashboard data
   */
  async refreshDashboard(): Promise<void> {
    await this.clickElement('[data-testid="refresh-dashboard"]');
    await this.waitForDashboardLoad();
  }

  /**
   * Take dashboard screenshot for reporting
   */
  async captureDashboardState(): Promise<void> {
    await this.takeScreenshot('dashboard-state');
  }
}
