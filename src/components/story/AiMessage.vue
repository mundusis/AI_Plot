<script setup lang="ts">
import type { Message } from '@/types'
import { useMessageParser } from '@/composables/useMessageParser'
import { computed } from 'vue'

const props = defineProps<{
  message: Message
}>()

const emit = defineEmits<{
  contextmenu: [e: MouseEvent]
}>()

const { parseAiContent } = useMessageParser()
const blocks = computed(() => parseAiContent(props.message.content))
</script>

<template>
  <div
    class="mx-2 my-2 px-4 py-3 border border-[var(--color-border)] rounded-lg"
    @contextmenu.prevent="emit('contextmenu', $event)"
  >
    <div class="story-content">
      <div
        v-for="(block, i) in blocks"
        :key="i"
        :class="[
          block.type === 'announcement' ? 'block-announcement' :
          block.type === 'action' ? 'block-action' :
          block.type === 'dialog' ? 'block-dialog max-w-[85%]' :
          'block-narration'
        ]"
      >
        <span v-if="block.speaker" class="speaker">{{ block.speaker }}：</span>
        {{ block.content }}
      </div>
    </div>
  </div>
</template>
