import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSessionStore = defineStore('session', () => {
  const currentArchiveId = ref<number | null>(null)
  const selectedApiId = ref<number | null>(null)
  const isGenerating = ref(false)
  const generatingSeconds = ref(0)
  let timer: ReturnType<typeof setInterval> | null = null

  function startGenerating() {
    isGenerating.value = true
    generatingSeconds.value = 0
    timer = setInterval(() => { generatingSeconds.value++ }, 1000)
  }

  function stopGenerating() {
    isGenerating.value = false
    if (timer) { clearInterval(timer); timer = null }
  }

  return {
    currentArchiveId,
    selectedApiId,
    isGenerating,
    generatingSeconds,
    startGenerating,
    stopGenerating,
  }
})
