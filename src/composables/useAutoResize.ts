import type { Directive } from 'vue'

export const vAutoResize: Directive<HTMLTextAreaElement, number | undefined> = {
  mounted(el: HTMLTextAreaElement, binding) {
    const maxH = binding.value ?? 200
    el._autoResizeMaxH = maxH
    el.style.resize = 'none'
    el.style.overflow = 'hidden'

    function resize() {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, maxH) + 'px'
      el.style.overflow = el.scrollHeight > maxH ? 'auto' : 'hidden'
    }

    resize()

    el.addEventListener('input', resize)

    const ro = new ResizeObserver(() => resize())
    ro.observe(el)

    el._autoResizeCleanup = () => {
      el.removeEventListener('input', resize)
      ro.disconnect()
      el.style.overflow = ''
    }
  },

  updated(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, (el._autoResizeMaxH ?? 200)) + 'px'
    el.style.overflow = el.scrollHeight > (el._autoResizeMaxH ?? 200) ? 'auto' : 'hidden'
  },

  unmounted(el: HTMLTextAreaElement | null) {
    el?._autoResizeCleanup?.()
  },
}

declare global {
  interface HTMLTextAreaElement {
    _autoResizeCleanup?: () => void
    _autoResizeMaxH?: number
  }
}
