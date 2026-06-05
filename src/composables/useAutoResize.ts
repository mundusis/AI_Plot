import type { Directive } from 'vue'

export const vAutoResize: Directive<HTMLTextAreaElement, number | undefined> = {
  mounted(el: HTMLTextAreaElement, binding) {
    const maxH = binding.value ?? 200
    el.style.resize = 'none'
    el.style.overflow = 'hidden'

    function resize() {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, maxH) + 'px'
      el.style.overflow = el.scrollHeight > maxH ? 'auto' : 'hidden'
    }

    const ro = new ResizeObserver(() => resize())
    ro.observe(el)

    el._autoResizeCleanup = () => {
      ro.disconnect()
      el.style.overflow = ''
    }
  },

  unmounted(el: HTMLTextAreaElement | null) {
    el?._autoResizeCleanup?.()
  },
}

declare global {
  interface HTMLTextAreaElement {
    _autoResizeCleanup?: () => void
  }
}
