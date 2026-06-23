<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Toast from '@/components/common/Toast.vue'

const router = useRouter()
const isNavigating = ref(false)

router.beforeEach(() => {
  isNavigating.value = true
})
router.afterEach(() => {
  isNavigating.value = false
})
</script>

<template>
  <div class="h-full w-full flex flex-col">
    <div v-if="isNavigating" class="global-loading-bar" />
    <router-view v-slot="{ Component }">
      <keep-alive :include="['StoryView']">
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <Toast />
  </div>
</template>

<style>
.global-loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  z-index: 9999;
  background: var(--color-accent);
  border-radius: 0 2px 2px 0;
  animation: loading-slide 2s cubic-bezier(0.4, 0, 1, 1) forwards;
  will-change: width;
}

@keyframes loading-slide {
  0%   { width: 0; }
  30%  { width: 30%; }
  60%  { width: 60%; }
  80%  { width: 75%; }
  100% { width: 95%; }
}
</style>
