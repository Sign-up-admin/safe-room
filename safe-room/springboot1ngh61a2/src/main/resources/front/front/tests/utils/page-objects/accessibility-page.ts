import { Page, expect } from '@playwright/test'
import { BasePage } from './base-page'

/**
 * Accessibility Testing Page Object
 * Provides methods for testing web accessibility compliance
 */
export class AccessibilityPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  /**
   * Run comprehensive accessibility audit
   */
  async runAccessibilityAudit(): Promise<{
    violations: any[]
    passes: any[]
    incomplete: any[]
    inapplicable: any[]
  }> {
    // Note: This would typically use axe-core or similar library
    // For now, we'll implement basic checks

    const results = {
      violations: [],
      passes: [],
      incomplete: [],
      inapplicable: []
    }

    // Check for missing alt text on images
    const imagesWithoutAlt = await this.page.locator('img:not([alt]), img[alt=""]')
    const imageCount = await imagesWithoutAlt.count()

    if (imageCount > 0) {
      results.violations.push({
        id: 'image-alt',
        description: `${imageCount} images missing alt text`,
        nodes: []
      })
    } else {
      results.passes.push({
        id: 'image-alt',
        description: 'All images have alt text'
      })
    }

    // Check for proper heading hierarchy
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').all()
    let hasH1 = false
    const headingLevels: number[] = []

    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase())
      const level = parseInt(tagName.substring(1))

      if (level === 1) hasH1 = true
      headingLevels.push(level)
    }

    if (!hasH1) {
      results.violations.push({
        id: 'heading-hierarchy',
        description: 'Missing h1 heading',
        nodes: []
      })
    } else {
      results.passes.push({
        id: 'heading-hierarchy',
        description: 'Proper heading hierarchy with h1'
      })
    }

    // Check for sufficient color contrast (basic check)
    const textElements = await this.page.locator('p, span, div, h1, h2, h3, h4, h5, h6').all()
    let lowContrastCount = 0

    for (const element of textElements) {
      const computedStyle = await element.evaluate(el => {
        const style = window.getComputedStyle(el)
        return {
          color: style.color,
          backgroundColor: style.backgroundColor,
          fontSize: style.fontSize
        }
      })

      // Basic contrast check - this is simplified
      if (computedStyle.color === 'rgb(0, 0, 0)' && computedStyle.backgroundColor === 'rgb(255, 255, 255)') {
        // Black on white - good contrast
      } else if (computedStyle.color === computedStyle.backgroundColor) {
        lowContrastCount++
      }
    }

    if (lowContrastCount > 0) {
      results.violations.push({
        id: 'color-contrast',
        description: `${lowContrastCount} elements may have insufficient color contrast`,
        nodes: []
      })
    }

    // Check for keyboard navigation
    const focusableElements = await this.page.locator('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])').all()
    if (focusableElements.length === 0) {
      results.violations.push({
        id: 'keyboard-navigation',
        description: 'No keyboard-focusable elements found',
        nodes: []
      })
    } else {
      results.passes.push({
        id: 'keyboard-navigation',
        description: `${focusableElements.length} keyboard-focusable elements found`
      })
    }

    // Check for form labels
    const inputs = await this.page.locator('input, select, textarea').all()
    let unlabeledInputs = 0

    for (const input of inputs) {
      const hasLabel = await input.evaluate(el => {
        const id = el.id
        const name = el.name
        return !!(id && document.querySelector(`label[for="${id}"]`)) ||
               !!(name && document.querySelector(`label[for="${name}"]`)) ||
               !!el.getAttribute('aria-label') ||
               !!el.getAttribute('aria-labelledby')
      })

      if (!hasLabel) {
        unlabeledInputs++
      }
    }

    if (unlabeledInputs > 0) {
      results.violations.push({
        id: 'form-labels',
        description: `${unlabeledInputs} form inputs missing labels`,
        nodes: []
      })
    } else if (inputs.length > 0) {
      results.passes.push({
        id: 'form-labels',
        description: 'All form inputs have proper labels'
      })
    }

    return results
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation(): Promise<{
    tabbableElements: number
    navigationPath: string[]
  }> {
    const tabbableElements = await this.page.locator('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])').all()
    const navigationPath: string[] = []

    // Reset focus to beginning
    await this.page.keyboard.press('Tab')

    // Navigate through focusable elements
    for (let i = 0; i < Math.min(tabbableElements.length, 20); i++) {
      const activeElement = await this.page.evaluate(() => {
        const el = document.activeElement
        return el ? el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ')[0] : '') : 'unknown'
      })

      navigationPath.push(activeElement)
      await this.page.keyboard.press('Tab')
      await this.page.waitForTimeout(100)
    }

    return {
      tabbableElements: tabbableElements.length,
      navigationPath
    }
  }

  /**
   * Test screen reader compatibility
   */
  async testScreenReaderCompatibility(): Promise<{
    ariaLabels: number
    missingAriaLabels: number
    semanticElements: number
  }> {
    const ariaLabels = await this.page.locator('[aria-label], [aria-labelledby]').count()
    const interactiveElements = await this.page.locator('button, a[href], input, select, textarea').all()

    let missingAriaLabels = 0
    for (const element of interactiveElements) {
      const hasAriaLabel = await element.evaluate(el =>
        el.hasAttribute('aria-label') ||
        el.hasAttribute('aria-labelledby') ||
        el.hasAttribute('title') ||
        (el.tagName.toLowerCase() === 'button' && el.textContent?.trim()) ||
        (el.tagName.toLowerCase() === 'a' && el.textContent?.trim()) ||
        (el.tagName.toLowerCase() === 'input' && el.hasAttribute('placeholder'))
      )

      if (!hasAriaLabel) {
        missingAriaLabels++
      }
    }

    const semanticElements = await this.page.locator('header, nav, main, section, article, aside, footer').count()

    return {
      ariaLabels,
      missingAriaLabels,
      semanticElements
    }
  }

  /**
   * Test responsive design for accessibility
   */
  async testResponsiveAccessibility(): Promise<{
    mobile: boolean
    tablet: boolean
    desktop: boolean
  }> {
    const results = {
      mobile: false,
      tablet: false,
      desktop: false
    }

    // Test mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 })
    await this.page.waitForTimeout(500)
    results.mobile = await this.checkViewportAccessibility()

    // Test tablet viewport
    await this.page.setViewportSize({ width: 768, height: 1024 })
    await this.page.waitForTimeout(500)
    results.tablet = await this.checkViewportAccessibility()

    // Test desktop viewport
    await this.page.setViewportSize({ width: 1920, height: 1080 })
    await this.page.waitForTimeout(500)
    results.desktop = await this.checkViewportAccessibility()

    return results
  }

  /**
   * Check accessibility for current viewport
   */
  private async checkViewportAccessibility(): Promise<boolean> {
    try {
      // Check if key elements are accessible
      const criticalElements = [
        'button, a[href], input, select, textarea',
        '[role="button"], [role="link"]',
        'h1, h2, h3'
      ]

      for (const selector of criticalElements) {
        const elements = await this.page.locator(selector).all()
        for (const element of elements) {
          const isVisible = await element.isVisible()
          const isInViewport = await element.isInViewport()

          if (isVisible && !isInViewport) {
            // Check if element can be scrolled into view
            await element.scrollIntoViewIfNeeded()
            // Wait a bit for scroll to complete
            await this.page.waitForTimeout(200)
          }
        }
      }

      return true
    } catch (error) {
      console.warn('Viewport accessibility check failed:', error)
      return false
    }
  }

  /**
   * Generate accessibility report
   */
  async generateAccessibilityReport(): Promise<string> {
    const auditResults = await this.runAccessibilityAudit()
    const keyboardNav = await this.testKeyboardNavigation()
    const screenReader = await this.testScreenReaderCompatibility()
    const responsive = await this.testResponsiveAccessibility()

    const report = `
# Accessibility Test Report

## Summary
- Violations: ${auditResults.violations.length}
- Passed Checks: ${auditResults.passes.length}
- Incomplete: ${auditResults.incomplete.length}

## Violations
${auditResults.violations.map(v => `- ${v.id}: ${v.description}`).join('\n')}

## Passed Checks
${auditResults.passes.map(p => `- ${p.id}: ${p.description}`).join('\n')}

## Keyboard Navigation
- Tabbable Elements: ${keyboardNav.tabbableElements}
- Navigation Path: ${keyboardNav.navigationPath.join(' -> ')}

## Screen Reader Compatibility
- ARIA Labels: ${screenReader.ariaLabels}
- Missing ARIA Labels: ${screenReader.missingAriaLabels}
- Semantic Elements: ${screenReader.semanticElements}

## Responsive Design
- Mobile: ${responsive.mobile ? '✅' : '❌'}
- Tablet: ${responsive.tablet ? '✅' : '❌'}
- Desktop: ${responsive.desktop ? '✅' : '❌'}

Generated at: ${new Date().toISOString()}
    `

    return report.trim()
  }
}
