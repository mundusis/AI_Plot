<script setup lang="ts">
defineEmits<{
  prev: []
  next: []
  bottom: []
}>()
</script>

<template>
  <div class="fixed right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40">
    <!-- 上一条消息 -->
    <button
      class="w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-colors"
      title="上一条消息"
      @click="$emit('prev')"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
    <!-- 下一条消息 -->
    <button
      class="w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-colors"
      title="下一条消息"
      @click="$emit('next')"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
    <!-- 页面底部 -->
    <button
      class="w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-colors"
      title="页面底部"
      @click="$emit('bottom')"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9" />
        <line x1="6" y1="19" x2="18" y2="19" />
      </svg>
    </button>
  </div>
</template>
