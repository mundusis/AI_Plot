<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

defineEmits<{
  prev: []
  next: []
  bottom: []
}>()

const visible = ref(false)
const isHovering = ref(false)
let hideTimer: ReturnType<typeof setTimeout> | null = null

function tryHide() {
  if (!isHovering.value) {
    visible.value = false
  }
}

function onScroll() {
  visible.value = true
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(tryHide, 1500)
}

function onButtonClick() {
  visible.value = true
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(tryHide, 3000)
}

function onMouseEnter() {
  isHovering.value = true
  visible.value = true
  if (hideTimer) clearTimeout(hideTimer)
}

function onMouseLeave() {
  isHovering.value = false
  hideTimer = setTimeout(tryHide, 1000)
}

document.addEventListener('scroll', onScroll, { passive: true, capture: true })

onUnmounted(() => {
  document.removeEventListener('scroll', onScroll, { capture: true })
  if (hideTimer) clearTimeout(hideTimer)
})
</script>

<template>
  <div
    :class="['fixed right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50 transition-opacity duration-700', visible ? 'opacity-100' : 'opacity-0 pointer-events-none']"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- 上一条消息 -->
    <button
      class="w-9 h-9 rounded-full flex items-center justify-center transition hover:scale-110"
      title="上一条消息"
      :style="{ background: 'rgba(255,255,255,0.6)', boxShadow: '0 1px 6px rgba(0,0,0,0.12)' }"
      @click="onButtonClick(); $emit('prev')"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
    <!-- 下一条消息 -->
    <button
      class="w-9 h-9 rounded-full flex items-center justify-center transition hover:scale-110"
      title="下一条消息"
      :style="{ background: 'rgba(255,255,255,0.6)', boxShadow: '0 1px 6px rgba(0,0,0,0.12)' }"
      @click="onButtonClick(); $emit('next')"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
    <!-- 页面底部 -->
    <button
      class="w-9 h-9 rounded-full flex items-center justify-center transition hover:scale-110"
      title="页面底部"
      :style="{ background: 'rgba(255,255,255,0.6)', boxShadow: '0 1px 6px rgba(0,0,0,0.12)' }"
      @click="onButtonClick(); $emit('bottom')"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9" />
        <line x1="6" y1="19" x2="18" y2="19" />
      </svg>
    </button>
  </div>
</template>
