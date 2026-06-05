<script setup lang="ts">
import type { Archive } from '@/types'
import { BookOpen, Download, Trash2 } from 'lucide-vue-next'

defineProps<{
  archive: Archive
  messageCount: number
  lastUpdated: string
}>()

const emit = defineEmits<{
  click: []
  export: []
  delete: []
}>()
</script>

<template>
  <div
    class="book-card relative rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex flex-col"
    @click="emit('click')"
  >
    <div class="flex flex-col justify-center items-center p-4">
      <BookOpen :size="32" class="text-[var(--color-accent)] mb-2" />
      <h3 class="text-base font-semibold text-center line-clamp-2 mb-1">{{ archive.title }}</h3>
      <p class="text-sm text-[var(--color-text-muted)]">
        {{ messageCount }} 条消息
      </p>
      <p class="text-sm text-[var(--color-text-muted)]">{{ lastUpdated }}</p>
    </div>
    <div class="flex border-t border-[var(--color-border)]">
      <button
        class="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
        @click.stop="emit('export')"
      >
        <Download :size="14" />
        导出
      </button>
      <button
        class="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors border-l border-[var(--color-border)]"
        @click.stop="emit('delete')"
      >
        <Trash2 :size="14" />
        删除
      </button>
    </div>
  </div>
</template>
