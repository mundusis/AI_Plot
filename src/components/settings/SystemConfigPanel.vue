<script setup lang="ts">
import { ref, onMounted, toRaw } from 'vue'
import { db } from '@/db'
import { useAppStore } from '@/stores/app'
import type { SystemConfigItem } from '@/types'
import { Plus, Trash2, ChevronDown, X } from 'lucide-vue-next'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const appStore = useAppStore()
const items = ref<SystemConfigItem[]>([])
const expandedId = ref<number | null>(null)
const deleteTarget = ref<number | null>(null)
const pendingDeletes = ref<Set<number>>(new Set())

const showAddForm = ref(false)
const newKey = ref('')
const newValue = ref('')
const pendingAdds = ref<SystemConfigItem[]>([])
let tempIdCounter = -1

async function loadItems() {
  const fromDb = await db.systemConfigs.toArray()
  items.value = fromDb
  pendingDeletes.value = new Set()
  pendingAdds.value = []
}

function addItem() {
  if (!newKey.value.trim()) return
  const newItem: SystemConfigItem = {
    id: tempIdCounter--,
    key: newKey.value.trim(),
    value: newValue.value,
    createdAt: Date.now(),
  }
  pendingAdds.value.push(newItem)
  items.value.push(newItem)
  showAddForm.value = false
  newKey.value = ''
  newValue.value = ''
  expandedId.value = newItem.id!
}

function updateItem(item: SystemConfigItem) {
  const idx = items.value.findIndex(i => i.id === item.id)
  if (idx !== -1) {
    items.value[idx] = { ...item }
  }
}

function requestDelete(id: number) {
  deleteTarget.value = id
}

function confirmDelete() {
  if (deleteTarget.value === null) return
  const id = deleteTarget.value
  if (id < 0) {
    pendingAdds.value = pendingAdds.value.filter(c => c.id !== id)
  } else {
    pendingDeletes.value = new Set(pendingDeletes.value).add(id)
  }
  items.value = items.value.filter(i => i.id !== id)
  if (expandedId.value === id) expandedId.value = null
  deleteTarget.value = null
}

function toggleExpand(id: number) {
  expandedId.value = expandedId.value === id ? null : id
}

async function save() {
  for (const id of pendingDeletes.value) {
    await db.systemConfigs.delete(id)
  }
  for (const item of items.value) {
    const raw = toRaw(item)
    if (raw.id! < 0) {
      const { id, ...rest } = raw
      await db.systemConfigs.add(JSON.parse(JSON.stringify(rest)) as SystemConfigItem)
    } else {
      await db.systemConfigs.update(raw.id!, { key: raw.key, value: raw.value })
    }
  }
  await loadItems()
}

defineExpose({ save })

onMounted(() => {
  loadItems()
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold section-title">系统配置项</h2>
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--color-accent)] text-white hover:opacity-90 transition-colors"
        @click="showAddForm = true; expandedId = null"
      >
        <Plus :size="16" />
        添加自定义配置
      </button>
    </div>

    <div v-if="items.length === 0 && !showAddForm" class="text-center py-12 text-[var(--color-text-muted)] empty-state rounded-lg">
      暂无系统配置项
    </div>

    <div
      v-for="item in items"
      :key="item.id"
      :class="[
        'border rounded-lg overflow-hidden transition-shadow',
        expandedId === item.id ? 'border-[var(--color-accent)]/30 shadow-sm' : 'border-[var(--color-border)] hover:shadow-sm'
      ]"
    >
      <div
        class="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer select-none"
        @click="toggleExpand(item.id!)"
      >
        <span class="font-semibold">{{ item.key }}</span>
        <div class="flex items-center gap-2">
          <button
            class="text-red-400 hover:text-red-600 transition-colors"
            @click.stop="requestDelete(item.id!)"
          >
            <Trash2 :size="16" />
          </button>
          <ChevronDown
            :size="16"
            class="text-[var(--color-text-muted)] transition-transform duration-200"
            :class="{ 'rotate-180': expandedId === item.id }"
          />
        </div>
      </div>
      <div v-if="expandedId === item.id" class="px-4 pb-4 space-y-3 border-t border-[var(--color-border)] pt-3 bg-[var(--color-surface-hover)]/30">
        <div>
          <label class="block text-sm text-[var(--color-text-secondary)] mb-1">配置名称</label>
          <input
            :value="item.key"
            type="text"
            class="w-full bg-[var(--color-bg)] rounded-lg px-3 py-2.5 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 focus:outline-none transition-shadow"
            placeholder="配置名称"
            @input="(e) => { item.key = (e.target as HTMLInputElement).value; updateItem(item) }"
          />
        </div>
        <div>
          <label class="block text-sm text-[var(--color-text-secondary)] mb-1">配置内容</label>
          <textarea
            :value="item.value"
            class="w-full bg-[var(--color-bg)] rounded px-3 py-2 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none " rows="2" v-auto-resize
            placeholder="配置内容"
            @input="(e) => { item.value = (e.target as HTMLTextAreaElement).value; updateItem(item) }"
          />
        </div>
      </div>
    </div>

    <div v-if="showAddForm" class="border border-[var(--color-accent)] rounded-lg overflow-hidden">
      <div class="w-full flex items-center justify-between px-4 py-3 bg-[var(--color-bg)]">
        <span class="font-semibold text-[var(--color-accent)]">新建配置</span>
        <button
          class="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          @click="showAddForm = false; newKey = ''; newValue = ''"
        >
          <X :size="16" />
        </button>
      </div>
      <div class="px-4 pb-4 space-y-3 border-t border-[var(--color-border)] pt-3">
        <div>
          <label class="block text-sm text-[var(--color-text-secondary)] mb-1">配置名称</label>
          <input
            v-model="newKey"
            type="text"
            class="w-full bg-[var(--color-surface)] rounded-lg px-3 py-2.5 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 focus:outline-none transition-shadow"
            placeholder="配置名称"
          />
        </div>
        <div>
          <label class="block text-sm text-[var(--color-text-secondary)] mb-1">配置内容</label>
          <textarea
            v-model="newValue"
            class="w-full bg-[var(--color-surface)] rounded px-3 py-2 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none " rows="2" v-auto-resize
            placeholder="配置内容"
          />
        </div>
        <div class="flex justify-end gap-2">
          <button
            class="px-3 py-1.5 rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
            @click="showAddForm = false; newKey = ''; newValue = ''"
          >
            取消
          </button>
          <button
            class="px-3 py-1.5 rounded-md bg-[var(--color-accent)] text-white hover:opacity-90 transition-colors disabled:opacity-50"
            :disabled="!newKey.trim()"
            @click="addItem()"
          >
            添加
          </button>
        </div>
      </div>
    </div>

    <ConfirmModal
      :visible="deleteTarget !== null"
      title="删除系统配置"
      message="确认删除此系统配置？此操作不可撤销。"
      confirm-text="删除"
      :danger="true"
      @confirm="confirmDelete()"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
