<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  visible: boolean
  title?: string
  closable?: boolean
  fullscreen?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.closable !== false) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="modal-overlay"
        @click.self="closable !== false && $emit('close')"
      >
        <div :class="['modal-container', fullscreen && 'modal-fullscreen']">
          <div
            v-if="title || closable !== false || $slots['header-actions']"
            class="flex items-center justify-between mb-4 shrink-0"
          >
            <div class="flex items-center gap-3">
              <button
                v-if="closable !== false"
                class="w-8 h-8 flex items-center justify-center text-[var(--color-text-primary)] hover:opacity-60 text-3xl -mt-[6px]"
                @click="$emit('close')"
              >
                &times;
              </button>
              <h2 v-if="title" class="text-lg font-semibold">{{ title }}</h2>
            </div>
            <slot name="header-actions" />
          </div>
          <div class="modal-body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-container {
  transform: scale(0.95);
}
.modal-leave-to .modal-container {
  transform: scale(0.95);
}
</style>
