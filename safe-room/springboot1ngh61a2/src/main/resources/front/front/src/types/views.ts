/**
 * View Model Types
 * 
 * View models are presentation-layer types that extend or transform entity models
 * for specific UI components and use cases. They may include computed properties,
 * formatted data, or additional UI-specific fields.
 */

import type { CoachNode } from '@/utils/forceGraph'
import type { Jianshenjiaolian } from './modules'

/**
 * Coach node view for force graph visualization
 * Extends CoachNode with additional display properties
 */
export interface CoachNodeView extends CoachNode {
  clients?: string
  awards?: string
  rating?: string
}

/**
 * Coach view for list and detail pages
 * Transforms Jianshenjiaolian entity for display purposes
 */
export interface CoachView {
  id: string
  name: string
  avatar: string
  role: string
  description: string
  years: number
  price: number
  rating: string
  clients: number
  skills: string[]
  featured?: boolean
}

/**
 * Course view for display purposes
 * May extend Jianshenkecheng with computed or formatted fields
 */
export interface CourseView {
  id: number
  name: string
  type: string
  image?: string
  time: string
  location: string
  price?: number
  description?: string
  coachName?: string
  clickCount?: number
  rating?: number
}

/**
 * Equipment view for 3D visualization
 * Extends Jianshenqicai with 3D-specific properties
 */
export interface EquipmentView {
  id: number
  name: string
  image?: string
  brand?: string
  usage?: string
  effect?: string
  description?: string
  video?: string
  modelType?: 'chest' | 'leg' | 'back' | 'core' | 'dumbbell'
}





