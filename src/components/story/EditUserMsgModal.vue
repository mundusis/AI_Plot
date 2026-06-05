<script setup lang="ts">
import { ref, watch } from 'vue'
import { db } from '@/db'
import BaseModal from '@/components/common/BaseModal.vue'

const props = defineProps<{
  visible: boolean
  messageId: number | null
}>()

const emit = defineEmits<{
  close: []
  save: [content: string]
}>()

const content = ref('')

watch(() => props.messageId, async (id) => {
  if (id) {
    const msg = await db.messages.get(id)
    content.value = msg?.content || ''
  }
})
</script>

<template>
  <BaseModal :visible="visible" title="编辑用户消息" :closable="true" :fullscreen="true" @close="emit('close')">
    <template #header-actions>
      <button
        class="px-3 py-1.5 rounded-md bg-[var(--color-accent)] text-white text-sm hover:opacity-90 transition-colors"
        @click="emit('save', content)"
      >
        保存
      </button>
    </template>
    <textarea
      v-model="content"
      class="w-full flex-1 px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
      rows="5"
      v-auto-resize
    />
  </BaseModal>
</template>
