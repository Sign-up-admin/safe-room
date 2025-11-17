/**
 * Menu utility module
 * Provides menu list functionality with backward compatibility
 * @deprecated Use constants/menu.ts instead
 */
import { getMenuList } from '../constants/menu'

const menu = {
  /**
   * Get menu list
   * @returns {Array} Menu configuration array
   */
  list() {
    return getMenuList()
  },
}

export default menu
