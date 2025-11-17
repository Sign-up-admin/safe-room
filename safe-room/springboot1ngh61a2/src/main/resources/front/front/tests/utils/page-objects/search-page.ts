import { Page, expect } from '@playwright/test'
import { waitForPageLoad, waitForElement, fillFormField, clickElement, logTestStep } from '../shared-helpers'

/**
 * Search Page Object Model
 */
export class SearchPage {
  constructor(private page: Page) {}

  async goto(searchTerm?: string): Promise<void> {
    logTestStep('导航到搜索页面或执行搜索')
    await this.page.goto('/#/index/home')
    await waitForPageLoad(this.page)

    if (searchTerm) {
      await this.search(searchTerm)
    }
  }

  async expectLoaded(): Promise<void> {
    await waitForPageLoad(this.page)

    // Check for search-related elements
    const searchElements = [
      'input[placeholder*="搜索"]',
      '.search-input',
      '.search-results',
      '.course-card',
      '.coach-card'
    ]

    let searchFound = false
    for (const selector of searchElements) {
      try {
        await expect(this.page.locator(selector)).toBeVisible({ timeout: 3000 })
        searchFound = true
        break
      } catch (error) {
        // Try next selector
      }
    }

    if (!searchFound) {
      // At least check if we have content
      await expect(this.page.locator('text=搜索, text=课程, text=教练')).toBeVisible({ timeout: 5000 })
    }

    logTestStep('搜索页面加载完成')
  }

  async search(searchTerm: string): Promise<void> {
    const searchInput = this.page.locator('input[placeholder*="搜索"], .search-input, [class*="search"] input')

    if (await searchInput.count() > 0) {
      await searchInput.clear()
      await searchInput.fill(searchTerm)
      await this.page.keyboard.press('Enter')
      await this.page.waitForTimeout(1000) // Wait for search results

      logTestStep(`执行搜索: ${searchTerm}`)
    } else {
      // If no search input, navigate to relevant page
      if (searchTerm.includes('课程') || searchTerm.includes('健身')) {
        await this.page.goto('/#/index/jianshenkecheng')
      } else if (searchTerm.includes('教练') || searchTerm.includes('私教')) {
        await this.page.goto('/#/index/sijiaoyuyue')
      }
      await waitForPageLoad(this.page)
      logTestStep(`导航到相关页面进行搜索: ${searchTerm}`)
    }
  }

  async getResultCount(): Promise<number> {
    const resultSelectors = [
      '.search-result',
      '.course-card',
      '.coach-card',
      '.trainer-card',
      '[class*="result"]'
    ]

    for (const selector of resultSelectors) {
      try {
        const count = await this.page.locator(selector).count()
        if (count > 0) {
          return count
        }
      } catch (error) {
        // Try next selector
      }
    }

    return 0
  }

  async applyFilter(filterType: 'category' | 'price' | 'level' | 'time', value: string): Promise<void> {
    const filterMap = {
      category: ['select[name*="category"]', 'select[name*="type"]', '.category-filter'],
      price: ['input[name*="price"]', '.price-filter', '[placeholder*="价格"]'],
      level: ['select[name*="level"]', '.level-filter', '[name*="difficulty"]'],
      time: ['select[name*="time"]', '.time-filter', '[name*="duration"]']
    }

    const selectors = filterMap[filterType]

    for (const selector of selectors) {
      try {
        const filterElement = this.page.locator(selector)

        if (await filterElement.count() > 0) {
          // Check if it's a select dropdown
          if (selector.includes('select')) {
            await filterElement.selectOption(value)
          } else if (selector.includes('input')) {
            await filterElement.fill(value)
          } else {
            // Click filter option
            await this.page.locator(`${selector}:has-text("${value}")`).click()
          }

          await this.page.waitForTimeout(500) // Wait for filter to apply
          logTestStep(`应用${filterType}筛选: ${value}`)
          return
        }
      } catch (error) {
        // Try next selector
      }
    }

    logTestStep(`筛选器 ${filterType} 不可用`)
  }

  async applySorting(sortOption: string): Promise<void> {
    const sortSelectors = [
      `select[name*="sort"]:has(option:has-text("${sortOption}"))`,
      `option:has-text("${sortOption}")`,
      `button:has-text("${sortOption}")`,
      `.sort-option:has-text("${sortOption}")`
    ]

    for (const selector of sortSelectors) {
      try {
        const sortElement = this.page.locator(selector)
        if (await sortElement.count() > 0) {
          await sortElement.click()
          await this.page.waitForTimeout(500) // Wait for sorting to apply
          logTestStep(`应用排序: ${sortOption}`)
          return
        }
      } catch (error) {
        // Try next selector
      }
    }

    logTestStep(`排序选项 ${sortOption} 不可用`)
  }

  async getSearchHistory(): Promise<string[]> {
    const historySelectors = [
      '.search-history',
      '.recent-searches',
      '.search-suggestions'
    ]

    for (const selector of historySelectors) {
      try {
        const historyContainer = this.page.locator(selector)
        if (await historyContainer.count() > 0) {
          const historyItems = historyContainer.locator('li, .history-item, .suggestion-item')
          const count = await historyItems.count()
          const history: string[] = []

          for (let i = 0; i < count; i++) {
            const text = await historyItems.nth(i).textContent()
            if (text) {
              history.push(text.trim())
            }
          }

          return history
        }
      } catch (error) {
        // Try next selector
      }
    }

    return []
  }

  async clearSearchHistory(): Promise<void> {
    const clearSelectors = [
      'button:has-text("清空历史")',
      '.clear-history',
      'button:has-text("清除")'
    ]

    for (const selector of clearSelectors) {
      try {
        const clearButton = this.page.locator(selector)
        if (await clearButton.count() > 0) {
          await clearButton.click()
          logTestStep('清空搜索历史')
          return
        }
      } catch (error) {
        // Try next selector
      }
    }

    logTestStep('无清空历史功能')
  }

  async getSuggestions(): Promise<string[]> {
    const suggestionSelectors = [
      '.search-suggestions',
      '.autocomplete',
      '.dropdown-menu'
    ]

    for (const selector of suggestionSelectors) {
      try {
        const suggestionContainer = this.page.locator(selector)
        if (await suggestionContainer.count() > 0) {
          const suggestions = suggestionContainer.locator('li, .suggestion, .option')
          const count = await suggestions.count()
          const suggestionList: string[] = []

          for (let i = 0; i < count; i++) {
            const text = await suggestions.nth(i).textContent()
            if (text) {
              suggestionList.push(text.trim())
            }
          }

          return suggestionList
        }
      } catch (error) {
        // Try next selector
      }
    }

    return []
  }

  async selectResult(index = 0): Promise<void> {
    const resultSelectors = [
      '.search-result',
      '.course-card',
      '.coach-card',
      '.trainer-card'
    ]

    for (const selector of resultSelectors) {
      try {
        const results = this.page.locator(selector)
        const count = await results.count()
        if (count > index) {
          await results.nth(index).click()
          logTestStep(`选择第 ${index + 1} 个搜索结果`)
          return
        }
      } catch (error) {
        // Try next selector
      }
    }

    throw new Error(`无法找到第 ${index + 1} 个搜索结果`)
  }

  async toggleAdvancedSearch(): Promise<void> {
    const advancedSelectors = [
      'button:has-text("高级搜索")',
      '.advanced-search-toggle',
      'button:has-text("更多筛选")'
    ]

    for (const selector of advancedSelectors) {
      try {
        const advancedButton = this.page.locator(selector)
        if (await advancedButton.count() > 0) {
          await advancedButton.click()
          logTestStep('切换高级搜索')
          return
        }
      } catch (error) {
        // Try next selector
      }
    }

    logTestStep('无高级搜索功能')
  }

  async saveSearch(): Promise<void> {
    const saveSelectors = [
      'button:has-text("保存搜索")',
      '.save-search',
      'button:has-text("收藏搜索")'
    ]

    for (const selector of saveSelectors) {
      try {
        const saveButton = this.page.locator(selector)
        if (await saveButton.count() > 0) {
          await saveButton.click()
          logTestStep('保存搜索')
          return
        }
      } catch (error) {
        // Try next selector
      }
    }

    logTestStep('无保存搜索功能')
  }

  async getSearchFilters(): Promise<{ [key: string]: string[] }> {
    const filters: { [key: string]: string[] } = {}

    // Get active filters
    const activeFilterSelectors = [
      '.active-filter',
      '.filter-tag',
      '.selected-filter'
    ]

    for (const selector of activeFilterSelectors) {
      try {
        const activeFilters = this.page.locator(selector)
        const count = await activeFilters.count()

        if (count > 0) {
          const filterValues: string[] = []
          for (let i = 0; i < count; i++) {
            const text = await activeFilters.nth(i).textContent()
            if (text) {
              filterValues.push(text.trim())
            }
          }

          filters['active'] = filterValues
          break
        }
      } catch (error) {
        // Try next selector
      }
    }

    return filters
  }

  async getSearchStats(): Promise<{
    totalResults: number,
    searchTime: number,
    filters: string[]
  }> {
    const totalResults = await this.getResultCount()

    // Try to get search time
    let searchTime = 0
    const timeSelectors = [
      '.search-time',
      '.query-time',
      'text=/\\d+ms/'
    ]

    for (const selector of timeSelectors) {
      try {
        const timeElement = this.page.locator(selector)
        if (await timeElement.count() > 0) {
          const timeText = await timeElement.textContent()
          const match = timeText?.match(/(\d+)/)
          if (match) {
            searchTime = parseInt(match[1])
            break
          }
        }
      } catch (error) {
        // Try next selector
      }
    }

    const filters = Object.values(await this.getSearchFilters()).flat()

    return {
      totalResults,
      searchTime,
      filters
    }
  }
}
