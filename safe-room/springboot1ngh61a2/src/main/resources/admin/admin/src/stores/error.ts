import { defineStore } from 'pinia'

interface ErrorState {
  lastError: {
    code: string
    message: string
    timestamp: number
    from: string
  } | null
}

export const useErrorStore = defineStore('error', {
  state: (): ErrorState => ({
    lastError: null,
  }),
  actions: {
    setError(code: string, message: string, from: string) {
      this.lastError = {
        code,
        message,
        timestamp: Date.now(),
        from,
      }
    },
    clearError() {
      this.lastError = null
    },
  },
})
