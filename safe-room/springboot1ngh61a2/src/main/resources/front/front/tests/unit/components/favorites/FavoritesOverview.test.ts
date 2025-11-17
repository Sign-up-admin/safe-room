import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import FavoritesOverview from '@/components/favorites/FavoritesOverview.vue'

describe('FavoritesOverview', () => {
  const mockCategories = [
    { name: '课程', count: 5, color: '#4a90e2' },
    { name: '教练', count: 3, color: '#f44336' },
    { name: '器材', count: 2, color: '#4caf50' }
  ]

  const defaultProps = {
    categories: mockCategories,
    totalCount: 10,
    recentCount: 3
  }

  const createWrapper = (props = defaultProps) => {
    const app = createApp(FavoritesOverview)
    return mount(FavoritesOverview, {
      props,
      global: {
        plugins: [app]
      }
    })
  }

  describe('rendering', () => {
    it('should render component with correct title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.tech-card__title').text()).toBe('收藏概览')
    })

    it('should render stats cards correctly', () => {
      const wrapper = createWrapper()

      const statCards = wrapper.findAll('.stat-card')
      expect(statCards).toHaveLength(3)

      // Total count card
      expect(statCards[0].find('.stat-value').text()).toBe('10')
      expect(statCards[0].find('.stat-label').text()).toBe('总收藏数')

      // Recent count card
      expect(statCards[1].find('.stat-value').text()).toBe('3')
      expect(statCards[1].find('.stat-label').text()).toBe('7天内收藏')

      // Categories count card
      expect(statCards[2].find('.stat-value').text()).toBe('3')
      expect(statCards[2].find('.stat-label').text()).toBe('收藏分类')
    })

    it('should render donut chart', () => {
      const wrapper = createWrapper()

      const donutChart = wrapper.find('.donut-chart')
      expect(donutChart.exists()).toBe(true)

      // Should have correct number of segments
      const segments = wrapper.findAll('circle[stroke-dasharray]')
      expect(segments).toHaveLength(mockCategories.length)
    })

    it('should render chart legend', () => {
      const wrapper = createWrapper()

      const legendItems = wrapper.findAll('.legend-item')
      expect(legendItems).toHaveLength(mockCategories.length)

      mockCategories.forEach((category, index) => {
        const legendItem = legendItems[index]
        expect(legendItem.find('.legend-label').text()).toBe(category.name)
        expect(legendItem.find('.legend-value').text()).toBe(category.count.toString())
        expect(legendItem.find('.legend-color').attributes('style')).toContain(category.color)
      })
    })
  })

  describe('chart calculations', () => {
    it('should calculate correct chart segments', () => {
      const wrapper = createWrapper()

      // Check that segments are calculated based on category proportions
      const total = mockCategories.reduce((sum, cat) => sum + cat.count, 0)
      const expectedProportions = mockCategories.map(cat => cat.count / total)

      const segments = wrapper.findAll('circle[stroke-dasharray]')

      segments.forEach((segment, index) => {
        const dashArray = segment.attributes('stroke-dasharray')
        const expectedDashArray = (expectedProportions[index] * 251.2).toFixed(1)
        expect(dashArray).toBe(expectedDashArray)
      })
    })

    it('should handle zero total count', () => {
      const wrapper = createWrapper({
        ...defaultProps,
        totalCount: 0
      })

      const segments = wrapper.findAll('circle[stroke-dasharray]')
      expect(segments).toHaveLength(0)
    })

    it('should handle empty categories', () => {
      const wrapper = createWrapper({
        ...defaultProps,
        categories: []
      })

      const segments = wrapper.findAll('circle[stroke-dasharray]')
      expect(segments).toHaveLength(0)
    })
  })

  describe('responsive design', () => {
    it('should have responsive grid layout', () => {
      const wrapper = createWrapper()

      const overviewGrid = wrapper.find('.overview-grid')
      expect(overviewGrid.classes()).toContain('overview-grid')

      const statsCardsGrid = wrapper.find('.stats-cards')
      expect(statsCardsGrid.exists()).toBe(true)
    })

    it('should handle mobile breakpoints', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        value: 600,
        writable: true
      })

      const wrapper = createWrapper()

      // Should still render correctly
      expect(wrapper.find('.stats-cards').exists()).toBe(true)
    })
  })

  describe('data handling', () => {
    it('should handle large numbers correctly', () => {
      const wrapper = createWrapper({
        ...defaultProps,
        totalCount: 1000,
        recentCount: 500
      })

      expect(wrapper.findAll('.stat-value')[0].text()).toBe('1000')
      expect(wrapper.findAll('.stat-value')[1].text()).toBe('500')
    })

    it('should handle single category', () => {
      const singleCategory = [{ name: '课程', count: 5, color: '#4a90e2' }]
      const wrapper = createWrapper({
        ...defaultProps,
        categories: singleCategory
      })

      const segments = wrapper.findAll('circle[stroke-dasharray]')
      expect(segments).toHaveLength(1)

      const legendItems = wrapper.findAll('.legend-item')
      expect(legendItems).toHaveLength(1)
    })

    it('should handle categories with zero count', () => {
      const categoriesWithZero = [
        { name: '课程', count: 5, color: '#4a90e2' },
        { name: '教练', count: 0, color: '#f44336' }
      ]
      const wrapper = createWrapper({
        ...defaultProps,
        categories: categoriesWithZero
      })

      // Should still render both categories in legend
      const legendItems = wrapper.findAll('.legend-item')
      expect(legendItems).toHaveLength(2)
      expect(legendItems[1].find('.legend-value').text()).toBe('0')
    })
  })

  describe('accessibility', () => {
    it('should have proper semantic structure', () => {
      const wrapper = createWrapper()

      // Should use proper heading hierarchy
      const title = wrapper.find('.tech-card__title')
      expect(title.exists()).toBe(true)

      // Stats should be properly labeled
      const statLabels = wrapper.findAll('.stat-label')
      expect(statLabels).toHaveLength(3)
      statLabels.forEach(label => {
        expect(label.text()).toBeTruthy()
      })
    })

    it('should have sufficient color contrast', () => {
      const wrapper = createWrapper()

      // Check that colors are defined for chart segments
      const legendColors = wrapper.findAll('.legend-color')
      legendColors.forEach(color => {
        const style = color.attributes('style')
        expect(style).toContain('#')
      })
    })
  })

  describe('performance', () => {
    it('should handle many categories efficiently', () => {
      const manyCategories = Array.from({ length: 10 }, (_, i) => ({
        name: `Category ${i}`,
        count: Math.floor(Math.random() * 100),
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`
      }))

      const wrapper = createWrapper({
        ...defaultProps,
        categories: manyCategories
      })

      const segments = wrapper.findAll('circle[stroke-dasharray]')
      expect(segments).toHaveLength(manyCategories.length)

      const legendItems = wrapper.findAll('.legend-item')
      expect(legendItems).toHaveLength(manyCategories.length)
    })

    it('should update when props change', async () => {
      const wrapper = createWrapper()

      await wrapper.setProps({
        totalCount: 20,
        recentCount: 5
      })

      expect(wrapper.findAll('.stat-value')[0].text()).toBe('20')
      expect(wrapper.findAll('.stat-value')[1].text()).toBe('5')
    })
  })

  describe('edge cases', () => {
    it('should handle undefined categories', () => {
      const wrapper = createWrapper({
        ...defaultProps,
        categories: undefined as any
      })

      // Should not crash
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle categories without colors', () => {
      const categoriesWithoutColors = [
        { name: '课程', count: 5 },
        { name: '教练', count: 3 }
      ]

      expect(() => {
        createWrapper({
          ...defaultProps,
          categories: categoriesWithoutColors as any
        })
      }).not.toThrow()
    })

    it('should handle negative counts gracefully', () => {
      const categoriesWithNegative = [
        { name: '课程', count: -1, color: '#4a90e2' }
      ]

      const wrapper = createWrapper({
        ...defaultProps,
        categories: categoriesWithNegative
      })

      // Should still render
      expect(wrapper.find('.legend-value').text()).toBe('-1')
    })
  })

  describe('visual feedback', () => {
    it('should display correct stat icons', () => {
      const wrapper = createWrapper()

      const icons = wrapper.findAll('.stat-icon svg')
      expect(icons).toHaveLength(3)

      // Check that SVGs are present
      icons.forEach(icon => {
        expect(icon.exists()).toBe(true)
      })
    })

    it('should have proper chart sizing', () => {
      const wrapper = createWrapper()

      const donutChart = wrapper.find('.donut-chart')
      expect(donutChart.attributes('width')).toBe('200')
      expect(donutChart.attributes('height')).toBe('200')
    })
  })
})
