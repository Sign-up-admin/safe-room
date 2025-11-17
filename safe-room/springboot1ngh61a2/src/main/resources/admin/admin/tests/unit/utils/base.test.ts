import { describe, it, expect } from 'vitest'
import base from '@/utils/base'

describe('Base Utils', () => {
  describe('get()', () => {
    it('should return the base configuration object', () => {
      const config = base.get()

      expect(config).toBeDefined()
      expect(typeof config).toBe('object')
      expect(config).toHaveProperty('url')
      expect(config).toHaveProperty('name')
      expect(config).toHaveProperty('indexUrl')
    })

    it('should return correct URL', () => {
      const config = base.get()

      // In dev environment, returns relative path; in prod, returns full URL
      expect(config.url).toMatch(/^(\/|https?:\/\/).*springboot1ngh61a2\/$/)
    })

    it('should return correct name', () => {
      const config = base.get()

      expect(config.name).toBe('springboot1ngh61a2')
    })

    it('should return correct index URL', () => {
      const config = base.get()

      // In dev environment, returns relative path; in prod, returns full URL
      expect(config.indexUrl).toMatch(/.*springboot1ngh61a2\/front\/dist\/index\.html$/)
    })

    it('should return consistent configuration', () => {
      const config1 = base.get()
      const config2 = base.get()

      expect(config1).toEqual(config2)
      expect(config1.url).toBe(config2.url)
      expect(config1.name).toBe(config2.name)
      expect(config1.indexUrl).toBe(config2.indexUrl)
    })

    it('should have valid URL format', () => {
      const config = base.get()

      // URL can be relative path (dev) or full URL (prod)
      expect(config.url).toMatch(/^(\/|https?:\/\/).+\/$/)
      expect(config.indexUrl).toMatch(/^(\/|https?:\/\/).+\/.+$/)
    })
  })

  describe('getProjectName()', () => {
    it('should return the project name object', () => {
      const projectName = base.getProjectName()

      expect(projectName).toBeDefined()
      expect(typeof projectName).toBe('object')
      expect(projectName).toHaveProperty('projectName')
    })

    it('should return correct project name', () => {
      const projectName = base.getProjectName()

      expect(projectName.projectName).toBe('Gym Management System')
    })

    it('should return consistent project name', () => {
      const projectName1 = base.getProjectName()
      const projectName2 = base.getProjectName()

      expect(projectName1).toEqual(projectName2)
      expect(projectName1.projectName).toBe(projectName2.projectName)
    })

    it('should return string project name', () => {
      const projectName = base.getProjectName()

      expect(typeof projectName.projectName).toBe('string')
      expect(projectName.projectName.length).toBeGreaterThan(0)
    })
  })

  describe('Base object structure', () => {
    it('should be a properly structured object', () => {
      expect(base).toBeDefined()
      expect(typeof base).toBe('object')
      expect(base).toHaveProperty('get')
      expect(base).toHaveProperty('getProjectName')
    })

    it('should have callable methods', () => {
      expect(typeof base.get).toBe('function')
      expect(typeof base.getProjectName).toBe('function')
    })
  })

  describe('Configuration values', () => {
    it('should have reasonable URL structure', () => {
      const config = base.get()

      // Should contain the project path
      expect(config.url).toContain('springboot1ngh61a2')
      // In dev, it's a relative path; in prod, it contains localhost:8080
      if (config.url.startsWith('http')) {
        expect(config.url).toContain('localhost')
        expect(config.url).toContain('8080')
      }
    })

    it('should have proper frontend URL', () => {
      const config = base.get()

      expect(config.indexUrl).toContain('front')
      expect(config.indexUrl).toContain('dist')
      expect(config.indexUrl).toContain('index.html')
    })

    it('should have meaningful project name', () => {
      const projectName = base.getProjectName()

      expect(projectName.projectName).toContain('Gym')
      expect(projectName.projectName).toContain('Management')
      expect(projectName.projectName).toContain('System')
    })
  })

  describe('Method calls', () => {
    it('should allow multiple calls to get()', () => {
      expect(() => {
        base.get()
        base.get()
        base.get()
      }).not.toThrow()
    })

    it('should allow multiple calls to getProjectName()', () => {
      expect(() => {
        base.getProjectName()
        base.getProjectName()
        base.getProjectName()
      }).not.toThrow()
    })

    it('should return new objects on each call', () => {
      const config1 = base.get()
      const config2 = base.get()

      // Should return new object instances
      expect(config1).not.toBe(config2)
      // But with same values
      expect(config1).toEqual(config2)
    })
  })
})
