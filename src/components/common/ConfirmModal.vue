<script setup lang="ts">
import BaseModal from './BaseModal.vue'

defineProps<{
  visible: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <BaseModal :visible="visible" :title="title" :closable="true" @close="emit('cancel')">
    <p class="text-[var(--color-text-secondary)] mb-6">{{ message }}</p>
    <div class="flex justify-end gap-3">
      <button
        class="px-4 py-2 rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
        @click="emit('cancel')"
      >
        {{ cancelText || '取消' }}
      </button>
      <button
        :class="[
          'px-4 py-2 rounded-md text-white transition-colors',
          danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[var(--color-accent)] hover:opacity-90'
        ]"
        @click="emit('confirm')"
      >
        {{ confirmText || '确认' }}
      </button>
    </div>
  </BaseModal>
</template>
