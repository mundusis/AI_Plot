import { useAppStore } from '@/stores/app'

export function useClipboard() {
  const appStore = useAppStore()

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      appStore.showToast('已复制', 'success')
    } catch {
      appStore.showToast('复制失败', 'error')
    }
  }

  return { copyToClipboard }
}
