// Sidebar components exports
export { default as SidebarHeader } from './SidebarHeader.vue'
export { default as SidebarNavigation } from './SidebarNavigation.vue'
export { default as SidebarConversations } from './SidebarConversations.vue'

// Re-export types
export interface Conversation {
  id: string
  title: string
}
