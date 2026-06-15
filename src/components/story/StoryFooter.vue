<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSessionStore } from '@/stores/session'
import { storeToRefs } from 'pinia'
import { Send, Play } from 'lucide-vue-next'

const emit = defineEmits<{
  send: [text: string]
  continue: []
}>()

const text = ref('')
const textareaRef = ref<HTMLTextAreaElement>()
const sessionStore = useSessionStore()
const { isGenerating } = storeToRefs(sessionStore)

const sendDisabled = computed(() => !text.value.trim() || isGenerating.value)
const continueDisabled = computed(() => isGenerating.value)

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.overflow = 'hidden'
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  el.style.overflow = el.scrollHeight > 160 ? 'auto' : 'hidden'
}

function handleSend() {
  if (sendDisabled.value) return
  emit('send', text.value)
  text.value = ''
  autoResize()
}

function handleContinue() {
  if (continueDisabled.value) return
  emit('continue')
}

function onInput() {
  autoResize()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <footer
    class="flex items-end gap-2 sm:gap-3 px-2 sm:px-4 py-3 border-t border-[var(--color-border)] shrink-0"
  >
    <button
      class="flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-md border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-black/[0.06] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
      :disabled="continueDisabled"
      @click="handleContinue"
    >
      <Play :size="16" />
      <span class="hidden sm:inline">继续</span>
    </button>
    <textarea
      ref="textareaRef"
      v-model="text"
      class="flex-1 px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] resize-none focus:outline-none focus:border-[var(--color-accent)]"
      rows="1"
      placeholder="输入你的行动..."
      @input="onInput"
      @keydown="onKeydown"
    />
    <button
      class="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-md bg-[var(--color-accent)] text-white text-sm hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
      :disabled="sendDisabled"
      @click="handleSend"
    >
      <Send :size="14" />
      <span class="hidden sm:inline">发送</span>
    </button>
  </footer>
</template>
