import { defineStore } from 'pinia'
import { RouteLocationNormalized } from 'vue-router'

/**
 * Tag view interface for tabs management
 */
export interface TagView {
  fullPath: string
  path: string
  name?: string
  query?: Record<string, any>
  meta?: {
    title?: string
    affix?: boolean
    noCache?: boolean
  }
  title?: string
}

/**
 * Tags view store state interface
 */
interface TagsViewState {
  visitedViews: TagView[]
  cachedViews: string[]
}

/**
 * Tags view store for managing tab navigation
 */
export const useTagsViewStore = defineStore('tagsView', {
  state: (): TagsViewState => ({
    visitedViews: [],
    cachedViews: [],
  }),

  actions: {
    /**
     * Add a visited view to the tags list
     * @param view - Route location or tag view to add
     */
    addVisitedView(view: RouteLocationNormalized | TagView) {
      let tagView: TagView
      if ('fullPath' in view && typeof view.fullPath === 'string') {
        // Check if it's already a TagView by checking if it has all TagView properties
        tagView = view as TagView
      } else {
        // It's a RouteLocationNormalized
        const routeView = view as RouteLocationNormalized
        tagView = {
          fullPath: routeView.fullPath || routeView.path,
          path: routeView.path,
          name: typeof routeView.name === 'string' ? routeView.name : undefined,
          query: routeView.query,
          meta: routeView.meta,
          title: (routeView.meta && (routeView.meta as any).title) || 'no-name',
        }
      }
      if (this.visitedViews.some(v => v.path === tagView.path)) return
      this.visitedViews.push(tagView)
    },

    /**
     * Add a cached view for keep-alive
     * @param view - Route location to cache
     */
    addCachedView(view: RouteLocationNormalized) {
      if (this.cachedViews.includes(view.name as string)) return
      if (!(view.meta as any)?.noCache) {
        this.cachedViews.push(view.name as string)
      }
    },

    addView(view: RouteLocationNormalized | TagView) {
      this.addVisitedView(view)
      if ('name' in view) {
        const normalized = view as RouteLocationNormalized
        this.addCachedView(normalized)
      }
    },

    delVisitedView(view: RouteLocationNormalized | TagView) {
      const path = view.path
      for (const [i, v] of this.visitedViews.entries()) {
        if (v.path === path) {
          this.visitedViews.splice(i, 1)
          break
        }
      }
    },

    delCachedView(view: RouteLocationNormalized | TagView) {
      const name = typeof view.name === 'string' ? view.name : undefined
      if (name) {
        const index = this.cachedViews.indexOf(name)
        if (index > -1) {
          this.cachedViews.splice(index, 1)
        }
      }
    },

    delView(view: RouteLocationNormalized | TagView) {
      this.delVisitedView(view)
      this.delCachedView(view)
      return {
        visitedViews: [...this.visitedViews],
        cachedViews: [...this.cachedViews],
      }
    },

    delOthersVisitedViews(view: RouteLocationNormalized | TagView) {
      const path = view.path
      this.visitedViews = this.visitedViews.filter(v => (v.meta && v.meta.affix) || v.path === path)
    },

    delOthersCachedViews(view: RouteLocationNormalized | TagView) {
      const name = typeof view.name === 'string' ? view.name : undefined
      if (name) {
        const index = this.cachedViews.indexOf(name)
        if (index > -1) {
          this.cachedViews = this.cachedViews.slice(index, index + 1)
        } else {
          this.cachedViews = []
        }
      } else {
        this.cachedViews = []
      }
    },

    delOthersViews(view: RouteLocationNormalized | TagView) {
      this.delOthersVisitedViews(view)
      this.delOthersCachedViews(view)
      return {
        visitedViews: [...this.visitedViews],
        cachedViews: [...this.cachedViews],
      }
    },

    delAllVisitedViews() {
      const affixTags = this.visitedViews.filter(tag => tag.meta && tag.meta.affix)
      this.visitedViews = affixTags
    },

    delAllCachedViews() {
      this.cachedViews = []
    },

    delAllViews() {
      this.delAllVisitedViews()
      this.delAllCachedViews()
      return {
        visitedViews: [...this.visitedViews],
        cachedViews: [...this.cachedViews],
      }
    },

    updateVisitedView(view: RouteLocationNormalized | TagView) {
      let tagView: TagView
      if ('fullPath' in view && typeof view.fullPath === 'string') {
        tagView = view as TagView
      } else {
        const routeView = view as RouteLocationNormalized
        tagView = {
          fullPath: routeView.fullPath || routeView.path,
          path: routeView.path,
          name: typeof routeView.name === 'string' ? routeView.name : undefined,
          query: routeView.query,
          meta: routeView.meta,
          title: (routeView.meta && (routeView.meta as any).title) || undefined,
        }
      }
      for (let i = 0; i < this.visitedViews.length; i++) {
        if (this.visitedViews[i].path === tagView.path) {
          this.visitedViews[i] = { ...this.visitedViews[i], ...tagView }
          break
        }
      }
    },
  },
})
