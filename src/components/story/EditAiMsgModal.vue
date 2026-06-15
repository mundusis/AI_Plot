<script setup lang="ts">
import { ref, watch } from 'vue'
import { db } from '@/db'
import { useMessageParser } from '@/composables/useMessageParser'
import type { ParsedBlock } from '@/types'
import BaseModal from '@/components/common/BaseModal.vue'
import { Plus, Trash2, Copy } from 'lucide-vue-next'
import { useClipboard } from '@/composables/useClipboard'

const props = defineProps<{
  visible: boolean
  messageId: number | null
}>()

const emit = defineEmits<{
  close: []
  save: [content: string]
}>()

const { parseAiContent, blocksToRaw } = useMessageParser()
const { copyToClipboard } = useClipboard()
const blocks = ref<ParsedBlock[]>([])
const rawContent = ref('')

watch(() => props.messageId, async (id) => {
  if (id) {
    const msg = await db.messages.get(id)
    if (msg) {
      rawContent.value = msg.content
      blocks.value = parseAiContent(msg.content)
    }
  }
})

function addBlock(at?: number) {
  const block: ParsedBlock = { type: 'narration', content: '' }
  if (at !== undefined) {
    blocks.value.splice(at, 0, block)
  } else {
    blocks.value.push(block)
  }
}

function removeBlock(index: number) {
  blocks.value.splice(index, 1)
}

function handleSave() {
  const raw = blocksToRaw(blocks.value)
  emit('save', raw)
}

function copyRaw() {
  copyToClipboard(rawContent.value)
}
</script>

<template>
  <BaseModal :visible="visible" title="编辑 AI 消息" :closable="true" :fullscreen="true" @close="emit('close')">
    <template #header-actions>
      <button
        class="px-3 py-1.5 rounded-md bg-[var(--color-accent)] text-white text-sm hover:opacity-90 transition-colors"
        @click="handleSave"
      >
        保存
      </button>
    </template>
    <div class="flex-1 space-y-3 overflow-y-auto">
      <details class="border border-[var(--color-border)] rounded-lg">
        <summary class="px-3 py-2 text-sm text-[var(--color-text-secondary)] cursor-pointer select-none flex items-center justify-between">
          <span>原始内容</span>
          <button
            class="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
            @click.stop.prevent="copyRaw"
          >
            <Copy :size="14" />
          </button>
        </summary>
        <pre class="px-3 py-2 text-sm text-[var(--color-text-muted)] whitespace-pre-wrap border-t border-[var(--color-border)]">{{ rawContent }}</pre>
      </details>
      <template v-for="(block, i) in blocks" :key="i">
        <div class="border border-[var(--color-border)] rounded-lg p-3">
          <div class="flex items-center justify-between mb-2">
            <select
              :value="block.type"
              class="text-sm bg-[var(--color-bg)] rounded px-2 py-1 border border-[var(--color-border)] focus:outline-none"
              @change="(e) => block.type = (e.target as HTMLSelectElement).value as ParsedBlock['type']"
            >
              <option value="announcement">系统公告</option>
              <option value="dialog">对话</option>
              <option value="narration">旁白</option>
              <option value="action">动作</option>
            </select>
            <button
              class="text-red-400 hover:text-red-600 transition-colors"
              @click="removeBlock(i)"
            >
              <Trash2 :size="14" />
            </button>
          </div>
          <div v-if="block.type === 'dialog'" class="mb-2">
            <input
              v-model="block.speaker"
              type="text"
              class="w-full text-xs bg-[var(--color-bg)] rounded px-2 py-1 border border-[var(--color-border)] focus:outline-none"
              placeholder="说话人（可选）"
            />
          </div>
          <textarea
            v-model="block.content"
            class="w-full bg-[var(--color-bg)] rounded px-2 py-1.5 text-sm border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none min-h-[60px]"
            placeholder="内容"
          />
        </div>
        <button
          class="flex items-center gap-1 text-sm text-[var(--color-accent)] hover:opacity-80 transition-colors"
          @click="addBlock(i + 1)"
        >
          <Plus :size="14" />
          添加段落
        </button>
      </template>
    </div>
  </BaseModal>
</template>
