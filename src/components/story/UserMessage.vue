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

const { renderUserContent } = useMessageParser()
const segments = computed(() => renderUserContent(props.message.content))
</script>

<template>
  <div class="flex justify-end px-4 py-3">
    <div
      class="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-md bg-[rgb(248,246,243)] border border-[var(--color-border)] text-[rgb(140,132,126)]"
      @contextmenu.prevent="emit('contextmenu', $event)"
    >
      <template v-for="(seg, i) in segments.segments" :key="i">
        <span
          v-if="seg.type === 'dialog'"
          class="dialog-highlight"
        >{{ seg.content }}</span>
        <span v-else-if="seg.type === 'normal'">{{ seg.content }}</span>
      </template>
    </div>
  </div>
</template>
