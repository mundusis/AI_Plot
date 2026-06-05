<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from 'lucide-vue-next'

const emit = defineEmits<{
  import: [file: File]
}>()

const fileInput = ref<HTMLInputElement>()

function triggerInput() {
  fileInput.value?.click()
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('import', file)
  }
  target.value = ''
}
</script>

<template>
  <button
    class="flex items-center gap-1.5 px-3 py-2 rounded-md border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
    @click="triggerInput"
  >
    <Upload :size="16" />
    导入存档
  </button>
  <input
    ref="fileInput"
    type="file"
    accept=".json"
    class="hidden"
    @change="onFileChange"
  />
</template>
