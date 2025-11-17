/**
 * TypeScript type definitions for particles.js library
 * @see https://github.com/VincentGarreau/particles.js
 */

export interface ParticlesConfig {
  particles?: {
    number?: {
      value?: number
      density?: {
        enable?: boolean
        value_area?: number
      }
    }
    color?: {
      value?:
        | string
        | string[]
        | { r?: number; g?: number; b?: number }
        | { h?: number; s?: number; l?: number }
        | 'random'
    }
    shape?: {
      type?: string | string[]
      stroke?: {
        width?: number
        color?: string
      }
      polygon?: {
        nb_sides?: number
      }
      image?: {
        src?: string
        width?: number
        height?: number
      }
    }
    opacity?: {
      value?: number
      random?: boolean
      anim?: {
        enable?: boolean
        speed?: number
        opacity_min?: number
        sync?: boolean
      }
    }
    size?: {
      value?: number
      random?: boolean
      anim?: {
        enable?: boolean
        speed?: number
        size_min?: number
        sync?: boolean
      }
    }
    line_linked?: {
      enable?: boolean
      distance?: number
      color?: string
      opacity?: number
      width?: number
    }
    move?: {
      enable?: boolean
      speed?: number
      direction?:
        | 'none'
        | 'top'
        | 'top-right'
        | 'right'
        | 'bottom-right'
        | 'bottom'
        | 'bottom-left'
        | 'left'
        | 'top-left'
      random?: boolean
      straight?: boolean
      out_mode?: 'out' | 'bounce'
      bounce?: boolean
      attract?: {
        enable?: boolean
        rotateX?: number
        rotateY?: number
      }
    }
    array?: any[]
  }
  interactivity?: {
    detect_on?: 'canvas' | 'window'
    events?: {
      onhover?: {
        enable?: boolean
        mode?: string | string[]
      }
      onclick?: {
        enable?: boolean
        mode?: string | string[]
      }
      resize?: boolean
    }
    modes?: {
      grab?: {
        distance?: number
        line_linked?: {
          opacity?: number
        }
      }
      bubble?: {
        distance?: number
        size?: number
        duration?: number
        opacity?: number
      }
      repulse?: {
        distance?: number
        duration?: number
      }
      push?: {
        particles_nb?: number
      }
      remove?: {
        particles_nb?: number
      }
    }
    mouse?: {
      pos_x?: number | null
      pos_y?: number | null
      click_pos_x?: number | null
      click_pos_y?: number | null
      click_time?: number | null
    }
  }
  retina_detect?: boolean
}

declare global {
  interface Window {
    particlesJS: (tagId: string, params?: ParticlesConfig) => void
    particlesJS?: {
      load: (tagId: string, pathConfigJson: string, callback?: () => void) => void
    }
    pJSDom: any[]
    requestAnimFrame: (callback: FrameRequestCallback) => number
    cancelRequestAnimFrame: (handle: number) => void
  }
}

export {}
