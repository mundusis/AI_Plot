<script setup lang="ts">
defineProps<{
  seconds: number
}>()

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
</script>

<template>
  <div class="flex items-center gap-3 py-4 px-2">
    <div class="flex gap-1.5">
      <span class="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style="animation-delay: 0ms" />
      <span class="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style="animation-delay: 150ms" />
      <span class="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style="animation-delay: 300ms" />
    </div>
    <span class="text-sm text-[var(--color-text-muted)]">
      正在输入中 ({{ formatTime(seconds) }})
    </span>
  </div>
</template>
