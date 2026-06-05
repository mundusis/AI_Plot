<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Save } from 'lucide-vue-next'
import ApiConfigPanel from '@/components/settings/ApiConfigPanel.vue'
import SystemConfigPanel from '@/components/settings/SystemConfigPanel.vue'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const appStore = useAppStore()
const activeTab = ref<'api' | 'system'>('api')

const apiPanelRef = ref<InstanceType<typeof ApiConfigPanel> | null>(null)
const systemPanelRef = ref<InstanceType<typeof SystemConfigPanel> | null>(null)

async function handleSave() {
  const panel = activeTab.value === 'api' ? apiPanelRef.value : systemPanelRef.value
  if (panel) {
    await panel.save()
    appStore.showToast('配置已保存', 'success')
  }
}
</script>

<template>
  <div class="h-full flex flex-col">
    <header class="flex items-center gap-4 px-4 py-3 page-header shrink-0">
      <button
        class="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        @click="router.back()"
      >
        <ArrowLeft :size="20" />
      </button>
      <h1 class="text-lg font-semibold flex-1">配置设置</h1>
      <button
        class="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[var(--color-accent)] text-white text-sm hover:opacity-90 transition-colors"
        @click="handleSave"
      >
        <Save :size="16" />
        保存
      </button>
    </header>

    <div class="flex gap-1 px-4 py-2 border-b border-[var(--color-border)] shrink-0">
      <button
        :class="[
          'flex-1 py-2 rounded-md font-medium transition-all',
          activeTab === 'api'
            ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] shadow-sm'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
        ]"
        @click="activeTab = 'api'"
      >
        API 配置
      </button>
      <button
        :class="[
          'flex-1 py-2 rounded-md font-medium transition-all',
          activeTab === 'system'
            ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] shadow-sm'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
        ]"
        @click="activeTab = 'system'"
      >
        系统配置项
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-4">
      <ApiConfigPanel v-if="activeTab === 'api'" ref="apiPanelRef" />
      <SystemConfigPanel v-else ref="systemPanelRef" />
    </div>
  </div>
</template>
