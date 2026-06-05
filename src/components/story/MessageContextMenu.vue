<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { Edit3, RotateCcw, Copy, Trash2 } from 'lucide-vue-next'

const props = defineProps<{
  visible: boolean
  x: number
  y: number
  role?: string
}>()

const MENU_W = 150
const MENU_H = 170

const adjustedX = computed(() => {
  if (props.x + MENU_W > window.innerWidth) {
    return Math.max(0, props.x - MENU_W)
  }
  return props.x
})

const adjustedY = computed(() => {
  if (props.y + MENU_H > window.innerHeight) {
    return Math.max(0, props.y - MENU_H)
  }
  return props.y
})

const emit = defineEmits<{
  edit: []
  resend: []
  copy: []
  delete: []
  close: []
}>()

const menuRef = ref<HTMLElement>()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
  }
}

function onDocumentClick(e: MouseEvent) {
  if (!props.visible) return
  if (menuRef.value?.contains(e.target as Node)) return
  emit('close')
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick, true)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick, true)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="menuRef"
      class="fixed z-[110] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg py-1 min-w-[140px]"
      @contextmenu.prevent
      :style="{ left: adjustedX + 'px', top: adjustedY + 'px' }"
    >
      <button
        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors text-left"
        @click="emit('copy')"
      >
        <Copy :size="14" />
        复制
      </button>
      <button
        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors text-left"
        @click="emit('edit')"
      >
        <Edit3 :size="14" />
        编辑
      </button>
      <button
        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
        v-if="props.role === 'user'"
        @click="emit('resend')"
      >
        <RotateCcw :size="14" />
        重新发送（此消息及之后）
      </button>
      <button
        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
        @click="emit('delete')"
      >
        <Trash2 :size="14" />
        删除
      </button>
    </div>
  </Teleport>
</template>
