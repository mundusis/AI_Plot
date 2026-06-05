import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const isDarkMode = ref(false)
  const toasts = ref<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([])

  function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = Date.now().toString()
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 3000)
  }

  return { isDarkMode, toasts, showToast }
})
