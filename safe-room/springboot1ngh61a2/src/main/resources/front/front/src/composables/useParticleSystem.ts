import { onMounted, onUnmounted, ref } from 'vue'
import { ParticleSystem, ParticleSystemOptions } from '@/utils/particleSystem'

interface UseParticleSystemOptions extends Omit<ParticleSystemOptions, 'canvas'> {
  canvas: HTMLCanvasElement | null
}

export const useParticleSystem = (options: UseParticleSystemOptions) => {
  const system = ref<ParticleSystem>()

  const mount = () => {
    if (options.canvas) {
      system.value = new ParticleSystem({ ...options, canvas: options.canvas })
      system.value.start()
    }
  }

  const destroy = () => {
    system.value?.destroy()
    system.value = undefined
  }

  onMounted(() => {
    if (!system.value) {
      mount()
    }
  })

  onUnmounted(() => {
    destroy()
  })

  return {
    mount,
    destroy,
  }
}
