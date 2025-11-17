export interface ParticleSystemOptions {
  canvas: HTMLCanvasElement
  colorPalette: string[]
  density?: number
  speed?: number
  parallax?: boolean
}

interface Particle {
  x: number
  y: number
  radius: number
  velocityX: number
  velocityY: number
  color: string
}

export class ParticleSystem {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private options: Required<Omit<ParticleSystemOptions, 'canvas' | 'colorPalette'>> & {
    colorPalette: string[]
  }

  private particles: Particle[] = []
  private rafId: number | null = null

  constructor(options: ParticleSystemOptions) {
    const ctx = options.canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Canvas 2D context is not available')
    }

    this.canvas = options.canvas
    this.ctx = ctx
    this.options = {
      colorPalette: options.colorPalette,
      density: options.density ?? 0.6,
      speed: options.speed ?? 0.4,
      parallax: options.parallax ?? false,
    }

    this.resize()
    window.addEventListener('resize', this.resize)
  }

  private createParticle = (): Particle => {
    const { width, height } = this.canvas
    const speedMultiplier = this.options.speed
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.4,
      velocityX: (Math.random() - 0.5) * speedMultiplier,
      velocityY: (Math.random() - 0.5) * speedMultiplier,
      color: this.options.colorPalette[Math.floor(Math.random() * this.options.colorPalette.length)],
    }
  }

  private populateParticles() {
    const particleCount = Math.floor(
      (this.canvas.width * this.canvas.height) / (1200 / this.options.density),
    )
    this.particles = Array.from({ length: particleCount }, this.createParticle)
  }

  private drawParticles() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    for (const particle of this.particles) {
      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      const gradient = this.ctx.createRadialGradient(
        particle.x,
        particle.y,
        particle.radius * 0.5,
        particle.x,
        particle.y,
        particle.radius * 6,
      )
      gradient.addColorStop(0, particle.color)
      gradient.addColorStop(1, 'rgba(0,0,0,0)')

      this.ctx.fillStyle = gradient
      this.ctx.fill()
    }
  }

  private updateParticles() {
    const { width, height } = this.canvas

    for (const particle of this.particles) {
      particle.x += particle.velocityX
      particle.y += particle.velocityY

      if (particle.x < 0 || particle.x > width) {
        particle.velocityX *= -1
      }

      if (particle.y < 0 || particle.y > height) {
        particle.velocityY *= -1
      }
    }
  }

  private animate = () => {
    this.updateParticles()
    this.drawParticles()
    this.rafId = requestAnimationFrame(this.animate)
  }

  public start() {
    if (this.rafId === null) {
      this.animate()
    }
  }

  public stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  public resize = () => {
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()
    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr
    this.ctx.scale(dpr, dpr)
    this.populateParticles()
  }

  public destroy() {
    this.stop()
    window.removeEventListener('resize', this.resize)
  }
}

