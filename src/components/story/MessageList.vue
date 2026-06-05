<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import type { Message } from '@/types'
import { db } from '@/db'
import UserMessage from './UserMessage.vue'
import AiMessage from './AiMessage.vue'
import TypingIndicator from '@/components/common/TypingIndicator.vue'
import { useSessionStore } from '@/stores/session'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  archiveId: number
  resendTargetId: number | null
}>()

const emit = defineEmits<{
  contextMenu: [messageId: number, x: number, y: number, role: string]
  resendDone: []
}>()

const messages = ref<Message[]>([])
const sessionStore = useSessionStore()
const { isGenerating, generatingSeconds } = storeToRefs(sessionStore)
const listRef = ref<HTMLElement>()

// 长按菜单（移动端）
const longPressTimers = new Map<number, ReturnType<typeof setTimeout>>()

function onPointerDown(msgId: number, e: PointerEvent) {
  longPressTimers.set(msgId, setTimeout(() => {
    emit('contextMenu', msgId, e.clientX, e.clientY)
    longPressTimers.delete(msgId)
  }, 500))
}

function onPointerUpOrLeave(msgId: number) {
  const timer = longPressTimers.get(msgId)
  if (timer) {
    clearTimeout(timer)
    longPressTimers.delete(msgId)
  }
}

onBeforeUnmount(() => {
  for (const timer of longPressTimers.values()) {
    clearTimeout(timer)
  }
  longPressTimers.clear()
})

async function loadMessages() {
  messages.value = await db.messages
    .where('archiveId')
    .equals(props.archiveId)
    .sortBy('timestamp')
}

async function scrollToBottom(smooth = true) {
  nextTick().then(() => {
    const el = listRef.value
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'instant' })
    }
  })
}

function scrollToPrevMessage() {
  const el = listRef.value
  if (!el) return
  const items = el.querySelectorAll('[data-message-id]')
  if (items.length === 0) return
  const scrollTop = el.scrollTop
  let target: Element | null = null
  for (let i = items.length - 1; i >= 0; i--) {
    const rect = (items[i] as HTMLElement).getBoundingClientRect()
    const containerRect = el.getBoundingClientRect()
    const itemTop = rect.top - containerRect.top + scrollTop
    if (itemTop < scrollTop - 10) {
      target = items[i]
      break
    }
  }
  if (target) {
    ;(target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function scrollToNextMessage() {
  const el = listRef.value
  if (!el) return
  const items = el.querySelectorAll('[data-message-id]')
  if (items.length === 0) return
  const scrollTop = el.scrollTop
  for (let i = 0; i < items.length; i++) {
    const rect = (items[i] as HTMLElement).getBoundingClientRect()
    const containerRect = el.getBoundingClientRect()
    const itemTop = rect.top - containerRect.top + scrollTop
    if (itemTop > scrollTop + 10) {
      ;(items[i] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
  }
  scrollToBottom()
}

async function appendUserMessage() {
  const msgs = await db.messages
    .where('archiveId')
    .equals(props.archiveId)
    .sortBy('timestamp')
  const last = msgs.filter(m => m.role === 'user').pop()
  if (last) {
    messages.value.push(last)
    await scrollToBottom()
  }
}

async function appendAiMessage() {
  const msgs = await db.messages
    .where('archiveId')
    .equals(props.archiveId)
    .sortBy('timestamp')
  const last = msgs.filter(m => m.role === 'assistant').pop()
  if (last) {
    messages.value.push(last)
  }
}

function updateMessage(id: number) {
  const idx = messages.value.findIndex(m => m.id === id)
  if (idx !== -1) {
    // 触发响应式更新，从 DB 重新读取
    db.messages.get(id).then(msg => {
      if (msg) messages.value[idx] = msg
    })
  }
}

function removeMessage(id: number) {
  const idx = messages.value.findIndex(m => m.id === id)
  if (idx !== -1) {
    messages.value.splice(idx, 1)
  }
}

function onContextMenu(messageId: number, e: MouseEvent) {
  e.preventDefault()
  const msg = messages.value.find(m => m.id === messageId)
  emit('contextMenu', messageId, e.clientX, e.clientY, msg?.role || 'user')
}

defineExpose({
  loadMessages,
  appendUserMessage,
  appendAiMessage,
  updateMessage,
  removeMessage,
  scrollToBottom,
  scrollToPrevMessage,
  scrollToNextMessage,
})

onMounted(() => {
  loadMessages().then(() => scrollToBottom(false))
})
</script>

<template>
  <div ref="listRef" class="flex-1 overflow-y-auto py-2">
    <div
      v-for="msg in messages"
      :key="msg.id"
      :data-message-id="msg.id"
      @pointerdown="onPointerDown(msg.id!, $event)"
      @pointerup="onPointerUpOrLeave(msg.id!)"
      @pointerleave="onPointerUpOrLeave(msg.id!)"
      @pointercancel="onPointerUpOrLeave(msg.id!)"
    >
      <UserMessage
        v-if="msg.role === 'user'"
        :message="msg"
        @contextmenu="onContextMenu(msg.id!, $event)"
      />
      <AiMessage
        v-else
        :message="msg"
        @contextmenu="onContextMenu(msg.id!, $event)"
      />
    </div>
    <TypingIndicator v-if="isGenerating" :seconds="generatingSeconds" />
    <div v-if="messages.length === 0 && !isGenerating" class="flex items-center justify-center h-full text-[var(--color-text-muted)]">
      尚未开始剧情，请在下方输入框发送消息
    </div>
  </div>
</template>
