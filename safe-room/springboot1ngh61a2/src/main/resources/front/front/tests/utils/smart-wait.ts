import { Page, Locator } from '@playwright/test';

/**
 * 智能等待工具类
 * 提供更稳定的元素等待和页面状态检查
 */
export class SmartWait {
  private page: Page;
  private defaultTimeout: number;

  constructor(page: Page, defaultTimeout = 15000) {
    this.page = page;
    this.defaultTimeout = defaultTimeout;
  }

  /**
   * 等待元素稳定出现（结合可见性和DOM稳定性）
   */
  async waitForElementStable(
    locator: Locator,
    options: {
      timeout?: number;
      stableDuration?: number;
      checkInterval?: number;
    } = {}
  ): Promise<void> {
    const {
      timeout = this.defaultTimeout,
      stableDuration = 1000,
      checkInterval = 100
    } = options;

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        // 检查元素是否可见
        const isVisible = await locator.isVisible();
        if (!isVisible) {
          await new Promise(resolve => setTimeout(resolve, checkInterval));
          continue;
        }

        // 检查元素是否稳定（在指定时间内不发生变化）
        const initialBoundingBox = await locator.boundingBox();
        await new Promise(resolve => setTimeout(resolve, stableDuration));

        const finalBoundingBox = await locator.boundingBox();
        if (!finalBoundingBox) {
          continue;
        }

        // 检查边界框是否稳定（允许小范围的差异）
        const isStable = this.isBoundingBoxStable(initialBoundingBox, finalBoundingBox, 2);
        if (isStable) {
          return;
        }
      } catch (error) {
        // 元素可能暂时不存在，继续等待
      }

      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    throw new Error(`元素在 ${timeout}ms 内未达到稳定状态`);
  }

  /**
   * 等待网络空闲（改进版本）
   */
  waitForNetworkIdle(options: {
    timeout?: number;
    idleTime?: number;
    maxInflightRequests?: number;
  } = {}): Promise<void> {
    const {
      timeout = 30000,
      idleTime = 500
    } = options;

    return new Promise((resolve, reject) => {
      const timeoutId: NodeJS.Timeout;
      let lastActivity = Date.now();

      const cleanup = () => {
        this.page.off('request', onRequest);
        this.page.off('response', onResponse);
        if (timeoutId) clearTimeout(timeoutId);
      };

      const onRequest = () => {
        lastActivity = Date.now();
      };

      const onResponse = () => {
        lastActivity = Date.now();
      };

      const checkIdle = () => {
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivity;

        if (timeSinceLastActivity >= idleTime) {
          cleanup();
          resolve();
        } else {
          setTimeout(checkIdle, 100);
        }
      };

      // 设置超时
      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error(`网络在 ${timeout}ms 内未达到空闲状态`));
      }, timeout);

      // 开始监控
      this.page.on('request', onRequest);
      this.page.on('response', onResponse);

      // 立即检查一次
      checkIdle();
    });
  }

  /**
   * 等待页面完全加载（结合多种检查）
   */
  async waitForPageLoad(options: {
    timeout?: number;
    waitForNetwork?: boolean;
    waitForDOM?: boolean;
    customCheck?: () => Promise<boolean>;
  } = {}): Promise<void> {
    const {
      timeout = this.defaultTimeout,
      waitForNetwork = true,
      waitForDOM = true,
      customCheck
    } = options;

    const promises: Promise<void>[] = [];

    if (waitForNetwork) {
      promises.push(this.waitForNetworkIdle({ timeout }));
    }

    if (waitForDOM) {
      promises.push(this.page.waitForLoadState('domcontentloaded', { timeout }));
    }

    if (customCheck) {
      promises.push(
        new Promise<void>((resolve, reject) => {
          const startTime = Date.now();
          const checkInterval = setInterval(async () => {
            try {
              const result = await customCheck();
              if (result) {
                clearInterval(checkInterval);
                resolve();
              } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                reject(new Error('自定义检查在超时时间内未通过'));
              }
            } catch (error) {
              clearInterval(checkInterval);
              reject(error);
            }
          }, 500);
        })
      );
    }

    await Promise.all(promises);
  }

  /**
   * 智能点击（等待元素稳定后再点击）
   */
  async smartClick(
    locator: Locator,
    options: {
      timeout?: number;
      retries?: number;
      stableDuration?: number;
    } = {}
  ): Promise<void> {
    const {
      timeout = this.defaultTimeout,
      retries = 3,
      stableDuration = 500
    } = options;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // 等待元素稳定
        await this.waitForElementStable(locator, {
          timeout: timeout / retries,
          stableDuration
        });

        // 执行点击
        await locator.click();
        return;
      } catch (error) {
        if (attempt === retries) {
          throw new Error(`智能点击失败，已重试 ${retries} 次: ${error.message}`);
        }

        // 短暂等待后重试
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  /**
   * 检查边界框是否稳定
   */
  private isBoundingBoxStable(
    box1: { x: number; y: number; width: number; height: number } | null,
    box2: { x: number; y: number; width: number; height: number } | null,
    tolerance = 1
  ): boolean {
    if (!box1 || !box2) return false;

    return Math.abs(box1.x - box2.x) <= tolerance &&
           Math.abs(box1.y - box2.y) <= tolerance &&
           Math.abs(box1.width - box2.width) <= tolerance &&
           Math.abs(box1.height - box2.height) <= tolerance;
  }
}

/**
 * 创建智能等待实例的辅助函数
 */
export function createSmartWait(page: Page, defaultTimeout?: number): SmartWait {
  return new SmartWait(page, defaultTimeout);
}
