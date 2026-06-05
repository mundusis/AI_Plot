<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Archive } from '@/types'
import { ArrowLeft, BookOpen, Settings } from 'lucide-vue-next'
import ApiSelector from './ApiSelector.vue'

defineProps<{
  archive: Archive
  messageCount: number
  compressedCount: number
}>()

const router = useRouter()
</script>

<template>
  <header
    class="flex items-center px-5 py-5 page-header shrink-0 relative"
  >
    <!-- 左侧返回 -->
    <button
      class="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors shrink-0"
      @click="router.back()"
    >
      <ArrowLeft :size="20" />
    </button>

    <!-- 中间标题与统计：绝对居中 -->
    <div class="absolute left-1/2 -translate-x-1/2 text-center max-w-[60%]">
      <div class="text-xl font-semibold truncate">{{ archive.title }}</div>
      <div class="text-sm text-[var(--color-text-muted)]">
        Token 未命中 {{ archive.tokenStats.missCost.toLocaleString() }}
        | 命中 {{ archive.tokenStats.hitCost.toLocaleString() }}
        | 输出 {{ archive.tokenStats.outputCost.toLocaleString() }}
      </div>
      <div class="text-sm text-[var(--color-text-muted)]">
        消息 {{ messageCount }} | 已压缩 {{ compressedCount }}
      </div>
    </div>

    <!-- 占位，保证 flex 布局 -->
    <div class="flex-1" />

    <!-- 右侧按钮组 -->
    <div class="flex items-center gap-2 shrink-0">
      <ApiSelector />
      <button
        class="flex items-center gap-1.5 px-3 py-2 rounded-md border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
        @click="router.push(`/story/${archive.id}/memory`)"
      >
        <BookOpen :size="16" />
        存档记忆
      </button>
      <button
        class="flex items-center gap-1.5 px-3 py-2 rounded-md border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
        @click="router.push(`/story/${archive.id}/config`)"
      >
        <Settings :size="14" />
        存档配置
      </button>
    </div>
  </header>
</template>
