<script setup lang="ts">
import { ref, onMounted, toRaw, nextTick, computed } from 'vue'
import { db } from '@/db'
import { useAppStore } from '@/stores/app'
import { useLLM } from '@/composables/useLLM'
import type { ApiConfig } from '@/types'
import { Plus } from 'lucide-vue-next'
import ApiConfigItem from './ApiConfigItem.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const appStore = useAppStore()
const { fetchModels } = useLLM()

const configs = ref<ApiConfig[]>([])
const expandedId = ref<number | null>(null)
const deleteTarget = ref<number | null>(null)
const fetchingModelId = ref<number | null>(null)
const testingModelId = ref<number | null>(null)
const listBottom = ref<HTMLElement | null>(null)
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)
const dirtyIds = ref(new Set<number>())
let tempIdCounter = -1

async function loadConfigs() {
  const fromDb = await db.apiConfigs.toArray()
  for (const item of fromDb) {
    if (item.sortOrder === undefined || item.sortOrder === null) item.sortOrder = item.id || 0
  }
  fromDb.sort((a, b) => a.sortOrder - b.sortOrder)
  configs.value = fromDb
  dirtyIds.value.clear()
}

function addConfig() {
  const newCfg: ApiConfig = {
    id: tempIdCounter--,
    name: '新配置',
    baseUrl: '',
    apiKey: '',
    model: '',
    modelsList: [],
    temperature: 0.8,
    sortOrder: configs.value.length,
  }
  configs.value.push(newCfg)
  expandedId.value = newCfg.id!
  nextTick(() => {
    listBottom.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

function updateConfig(config: ApiConfig) {
  const idx = configs.value.findIndex(c => c.id === config.id)
  if (idx !== -1) {
    configs.value[idx] = { ...config }
    dirtyIds.value.add(config.id!)
  }
}

function requestDelete(id: number) {
  deleteTarget.value = id
}

async function confirmDelete() {
  if (deleteTarget.value === null) return
  const id = deleteTarget.value
  if (id > 0) await db.apiConfigs.delete(id)
  configs.value = configs.value.filter(c => c.id !== id)
  if (expandedId.value === id) expandedId.value = null
  dirtyIds.value.delete(id)
  deleteTarget.value = null
}

async function handleFetchModels(config: ApiConfig) {
  if (!config.baseUrl || !config.apiKey) {
    appStore.showToast('请先填写 Base URL 和 API Key', 'error')
    return
  }
  fetchingModelId.value = config.id!
  try {
    const models = await fetchModels(config.baseUrl, config.apiKey)
    const idx = configs.value.findIndex(c => c.id === config.id)
    if (idx !== -1) {
      configs.value[idx] = { ...configs.value[idx], modelsList: models, model: models[0] || config.model }
    }
    appStore.showToast('模型列表已更新', 'success')
  } catch {
    appStore.showToast('获取模型列表失败', 'error')
  } finally {
    fetchingModelId.value = null
  }
}

async function handleTest(config: ApiConfig) {
  if (!config.baseUrl || !config.apiKey) {
    appStore.showToast('请先填写 Base URL 和 API Key', 'error')
    return
  }
  testingModelId.value = config.id!
  try {
    const response = await fetch(`${config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
      }),
    })
    if (response.ok) {
      appStore.showToast('连接测试成功', 'success')
    } else {
      const err = await response.text()
      appStore.showToast(`连接失败: ${response.status} ${err.substring(0, 80)}`, 'error')
    }
  } catch {
    appStore.showToast('网络请求失败，请检查 Base URL', 'error')
  } finally {
    testingModelId.value = null
  }
}

async function handleSaveConfig(config: ApiConfig) {
  const raw = toRaw(config)
  if (raw.id! < 0) {
    const { id, ...rest } = raw
    const clean = JSON.parse(JSON.stringify(rest))
    const newId = await db.apiConfigs.add(clean as ApiConfig)
    const idx = configs.value.findIndex(c => c.id === raw.id)
    if (idx !== -1) configs.value[idx] = { ...clean, id: newId }
    if (expandedId.value === raw.id) expandedId.value = newId
  } else {
    await db.apiConfigs.update(raw.id!, JSON.parse(JSON.stringify(raw)))
  }
  dirtyIds.value.delete(raw.id!)
  appStore.showToast('配置已保存', 'success')
}

function toggleExpand(id: number) {
  expandedId.value = expandedId.value === id ? null : id
}

function onDragStart(e: DragEvent, idx: number) {
  const cfg = configs.value[idx]
  if (expandedId.value === cfg.id!) {
    expandedId.value = null
  }
  dragIndex.value = idx
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(idx))
  }
}

function onDragOver(e: DragEvent, idx: number) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  dragOverIndex.value = idx
}

async function onDrop(e: DragEvent, targetIdx: number) {
  e.preventDefault()
  if (dragIndex.value === null || dragIndex.value === targetIdx) {
    dragIndex.value = null
    dragOverIndex.value = null
    return
  }
  const oldIdx = dragIndex.value
  const moved = configs.value.splice(oldIdx, 1)[0]
  configs.value.splice(targetIdx, 0, moved)
  for (let i = 0; i < configs.value.length; i++) {
    configs.value[i].sortOrder = i
    if (configs.value[i].id! > 0) {
      await db.apiConfigs.update(configs.value[i].id!, { sortOrder: i })
    }
  }
  const newSet = new Set<number>()
  for (const id of dirtyIds.value) {
    if (configs.value.some(c => c.id === id)) newSet.add(id)
  }
  dirtyIds.value = newSet
  dragIndex.value = null
  dragOverIndex.value = null
}

function onDragEnd() {
  dragIndex.value = null
  dragOverIndex.value = null
}

function save() {}

const isDirty = computed(() => dirtyIds.value.size > 0)

defineExpose({ save, loadConfigs, isDirty })

onMounted(() => {
  loadConfigs()
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between sticky top-0 z-10 bg-[var(--color-bg)] pt-8 pb-2">
      <h2 class="text-sm sm:text-base font-semibold section-title">API 配置</h2>
      <button
        class="flex items-center gap-1 px-2 py-1 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors text-sm sm:text-base"
        @click="addConfig()"
      >
        <Plus :size="14" />
        添加
      </button>
    </div>

    <div v-if="configs.length === 0" class="text-center py-12 text-sm text-[var(--color-text-muted)] empty-state rounded-lg">
      暂无 API 配置
    </div>

    <ApiConfigItem
      v-for="(config, idx) in configs"
      :key="config.id"
      :config="config"
      :expanded="expandedId === config.id"
      :fetching="fetchingModelId === config.id"
      :testing="testingModelId === config.id"
      :idx="idx"
      :drag-over="dragOverIndex === idx && dragIndex !== idx"
      :is-dragging="dragIndex === idx"
      :dirty="dirtyIds.has(config.id!)"
      @toggle="toggleExpand(config.id!)"
      @update="updateConfig"
      @delete="(id) => requestDelete(id)"
      @fetch-models="handleFetchModels"
      @test="handleTest"
      @save="handleSaveConfig"
      @drag-start="onDragStart"
      @drag-over="onDragOver"
      @drop="onDrop"
      @drag-end="onDragEnd"
    />

    <div ref="listBottom" />

    <ConfirmModal
      :visible="deleteTarget !== null"
      title="删除 API 配置"
      message="确认删除此 API 配置？此操作不可撤销。"
      confirm-text="删除"
      :danger="true"
      @confirm="confirmDelete()"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
