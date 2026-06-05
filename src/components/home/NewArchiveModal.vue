<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [title: string]
}>()

const title = ref('')

function confirm() {
  if (!title.value.trim()) return
  emit('confirm', title.value.trim())
  title.value = ''
}

function close() {
  title.value = ''
  emit('close')
}
</script>

<template>
  <BaseModal :visible="visible" title="新建存档" :closable="true" @close="close">
    <div class="mb-6">
      <label class="block text-sm text-[var(--color-text-secondary)] mb-2">存档名称</label>
      <input
        v-model="title"
        type="text"
        class="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
        placeholder="请输入存档名称"
        @keyup.enter="confirm"
      />
    </div>
    <div class="flex justify-end gap-3">
      <button
        class="px-4 py-2 rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
        @click="close"
      >
        取消
      </button>
      <button
        class="px-4 py-2 rounded-md bg-[var(--color-accent)] text-white hover:opacity-90 transition-colors disabled:opacity-50"
        :disabled="!title.trim()"
        @click="confirm"
      >
        创建
      </button>
    </div>
  </BaseModal>
</template>
