import { vi } from 'vitest'

// Mock jQuery constructor function
const jQuery = function(selector: any) {
  // Handle style injection for dynamic CSS
  if (typeof selector === 'string' && selector.includes('<style')) {
    return {
      length: 1,
      css: vi.fn().mockReturnThis(),
      appendTo: vi.fn().mockReturnThis()
    }
  }

  // Handle DOM element selection
  if (selector instanceof Element || selector instanceof HTMLElement) {
    return createJQueryObject(selector, 1)
  }

  // Handle string selectors
  if (typeof selector === 'string') {
    // Mock querySelector results
    const mockElement = {
      tagName: selector.toUpperCase().replace(/[.#[]/g, ''),
      className: '',
      id: '',
      style: {},
      attributes: {},
      children: [],
      parentElement: null
    }
    return createJQueryObject(mockElement, selector.startsWith('#') ? 1 : 0)
  }

  // Handle function (document ready)
  if (typeof selector === 'function') {
    // Mock document ready
    if (document.readyState === 'complete') {
      selector.call(document)
    } else {
      // Simulate async ready
      setTimeout(() => {
        selector.call(document)
      }, 1)
    }
    return jQuery(document)
  }

  // Default empty selection
  return createJQueryObject(null, 0)
}

// Create a jQuery object with common methods
function createJQueryObject(element: any, length: number) {
  const obj = {
    length,
    selector: '',
    context: document,
    _elements: element ? [element] : [],

    // Core methods
    each(callback: (index: number, element: any) => void) {
      for (let i = 0; i < this.length; i++) {
        callback.call(this._elements[i] || this, i, this._elements[i] || this)
      }
      return this
    },

    css(prop: string | object, value?: string | number) {
      if (typeof prop === 'object') {
        // Set multiple properties
        Object.assign(this._elements[0]?.style || {}, prop)
      } else if (value !== undefined) {
        // Set single property
        if (this._elements[0]) {
          this._elements[0].style = this._elements[0].style || {}
          this._elements[0].style[prop] = value
        }
      } else {
        // Get property
        return this._elements[0]?.style?.[prop] || ''
      }
      return this
    },

    attr(name: string, value?: any) {
      if (value !== undefined) {
        if (this._elements[0]) {
          this._elements[0].attributes = this._elements[0].attributes || {}
          this._elements[0].attributes[name] = value
        }
        return this
      }
      return this._elements[0]?.attributes?.[name] || null
    },

    prop(name: string, value?: any) {
      if (value !== undefined) {
        if (this._elements[0]) {
          this._elements[0][name] = value
        }
        return this
      }
      return this._elements[0]?.[name] || null
    },

    val(value?: any) {
      if (value !== undefined) {
        if (this._elements[0]) {
          this._elements[0].value = value
        }
        return this
      }
      return this._elements[0]?.value || ''
    },

    html(html?: string) {
      if (html !== undefined) {
        if (this._elements[0]) {
          this._elements[0].innerHTML = html
        }
        return this
      }
      return this._elements[0]?.innerHTML || ''
    },

    text(text?: string) {
      if (text !== undefined) {
        if (this._elements[0]) {
          this._elements[0].textContent = text
        }
        return this
      }
      return this._elements[0]?.textContent || ''
    },

    // Traversing methods
    find(selector: string) {
      return jQuery(selector)
    },

    parent() {
      const parent = this._elements[0]?.parentElement || null
      return parent ? jQuery(parent) : jQuery()
    },

    children(selector?: string) {
      const children = this._elements[0]?.children || []
      return jQuery(Array.from(children))
    },

    siblings(selector?: string) {
      // Mock siblings - simplified
      return jQuery()
    },

    next() {
      // Mock next sibling - simplified
      return jQuery()
    },

    prev() {
      // Mock previous sibling - simplified
      return jQuery()
    },

    first() {
      return this.length > 0 ? jQuery(this._elements[0]) : jQuery()
    },

    last() {
      return this.length > 0 ? jQuery(this._elements[this.length - 1]) : jQuery()
    },

    eq(index: number) {
      return index >= 0 && index < this.length ? jQuery(this._elements[index]) : jQuery()
    },

    filter(selector: string | Function) {
      // Simplified filter - return self
      return this
    },

    not(selector: string | Function) {
      // Simplified not - return empty
      return jQuery()
    },

    is(selector: string | Function) {
      return false
    },

    has(selector: string) {
      return jQuery()
    },

    // Manipulation methods
    append(content: any) {
      return this
    },

    prepend(content: any) {
      return this
    },

    appendTo(target: any) {
      return this
    },

    prependTo(target: any) {
      return this
    },

    // Event methods
    on(events: string, handler: Function) {
      return this
    },

    off(events?: string, handler?: Function) {
      return this
    },

    trigger(event: string) {
      return this
    },

    // Style methods
    addClass(className: string) {
      if (this._elements[0]) {
        this._elements[0].className = (this._elements[0].className || '') + ' ' + className
      }
      return this
    },

    removeClass(className?: string) {
      if (this._elements[0]) {
        this._elements[0].className = this._elements[0].className || ''
      }
      return this
    },

    toggleClass(className: string) {
      return this
    },

    hasClass(className: string) {
      return (this._elements[0]?.className || '').includes(className)
    },

    // Visibility methods
    show() {
      if (this._elements[0]) {
        this._elements[0].style.display = ''
      }
      return this
    },

    hide() {
      if (this._elements[0]) {
        this._elements[0].style.display = 'none'
      }
      return this
    },

    toggle() {
      return this
    },

    // Animation methods (simplified)
    fadeIn(duration?: number) {
      return this
    },

    fadeOut(duration?: number) {
      return this
    },

    slideDown(duration?: number) {
      return this
    },

    slideUp(duration?: number) {
      return this
    },

    animate(properties: object, duration?: number) {
      return this
    }
  }

  // Add jQuery plugins
  obj.RotateVerify = vi.fn().mockReturnThis()
  obj.VerifyPlugin = vi.fn().mockReturnThis()

  return obj
}

// jQuery static methods
jQuery.fn = jQuery.prototype = {
  RotateVerify: vi.fn().mockReturnThis(),
  VerifyPlugin: vi.fn().mockReturnThis()
}

// Additional jQuery static methods
jQuery.extend = Object.assign
jQuery.isArray = Array.isArray
jQuery.isFunction = (obj: any) => typeof obj === 'function'
jQuery.isPlainObject = (obj: any) => obj && typeof obj === 'object' && obj.constructor === Object
jQuery.trim = (str: string) => str.trim()
jQuery.type = (obj: any) => {
  if (obj === null) return 'null'
  if (obj === undefined) return 'undefined'
  return typeof obj
}

// Create $ alias
const $ = jQuery

// Mock jQuery plugins that might be used in admin
$.fn.extend({
  RotateVerify: vi.fn().mockReturnThis(),
  VerifyPlugin: vi.fn().mockReturnThis(),
  dataTable: vi.fn().mockReturnThis(),
  datepicker: vi.fn().mockReturnThis(),
  tooltip: vi.fn().mockReturnThis(),
  popover: vi.fn().mockReturnThis(),
  modal: vi.fn().mockReturnThis(),
  dropdown: vi.fn().mockReturnThis()
})

export { jQuery, $ }
export default jQuery
