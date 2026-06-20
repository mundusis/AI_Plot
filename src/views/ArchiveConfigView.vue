<script setup lang="ts">
import { ref, onMounted, onUnmounted, toRaw } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { db } from '@/db'
import { useAppStore } from '@/stores/app'
import type { CustomConfigItem, SystemConfigItem } from '@/types'
import { ArrowLeft, Plus, X, ChevronDown, Trash2 } from 'lucide-vue-next'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const archiveId = Number(route.params.id)
const activeTab = ref<'configs' | 'world'>('world')

const promptStory = ref('')
const promptSummary = ref('')
const worldSetting = ref('')
const writingStyle = ref('')
const outputLimit = ref('')
const privateConfigs = ref<CustomConfigItem[]>([])
const worldConfigs = ref<CustomConfigItem[]>([])
const referencedSystemConfigIds = ref<number[]>([])

// 配置项 tab 内联新增
const showAddPrivateForm = ref(false)
const newPrivateKey = ref('')
const newPrivateValue = ref('')
const newPrivateRemark = ref('')
const expandedPrivateIdx = ref<number | null>(null)
const deletePrivateIdx = ref<number | null>(null)
const privateDragIdx = ref<number | null>(null)
const privateDragOverIdx = ref<number | null>(null)
const privateRemarkBeforeEdit = ref('')

// 世界观 tab 内联新增
const showAddWorldForm = ref(false)
const newWorldKey = ref('')
const newWorldValue = ref('')
const newWorldRemark = ref('')
const expandedWorldIdx = ref<number | null>(null)
const deleteWorldIdx = ref<number | null>(null)
const worldDragIdx = ref<number | null>(null)
const worldDragOverIdx = ref<number | null>(null)
const worldRemarkBeforeEdit = ref('')

// 系统配置引用
const systemSearchInput = ref('')
const systemSearchResults = ref<SystemConfigItem[]>([])
const showSystemDropdown = ref(false)
const systemDropdownRef = ref<HTMLElement | null>(null)
const deleteSystemId = ref<number | null>(null)

const systemConfigCache = ref<Map<number, { key: string; remark: string }>>(new Map())

async function refreshSystemConfigCache() {
  const all = await db.systemConfigs.toArray()
  const map = new Map<number, { key: string; remark: string }>()
  for (const item of all) {
    map.set(item.id!, { key: item.key, remark: item.remark || item.key })
  }
  systemConfigCache.value = map
}

function getSystemConfigDisplay(id: number): string {
  const info = systemConfigCache.value.get(id)
  return info ? info.remark : `已删除配置 (ID:${id})`
}

const dirtyPrivateIdx = ref(new Set<number>())
const dirtyWorldIdx = ref(new Set<number>())
const dirtyWorldSetting = ref(false)
const dirtyRefConfigs = ref(false)

const showLeaveConfirm = ref(false)
const leaving = ref(false)

onBeforeRouteLeave((to, from, next) => {
  if (leaving.value) {
    next()
    return
  }
  if (dirtyPrivateIdx.value.size > 0 || dirtyWorldIdx.value.size > 0 || dirtyWorldSetting.value || dirtyRefConfigs.value) {
    showLeaveConfirm.value = true
    next(false)
  } else {
    next()
  }
})

async function confirmLeave() {
  leaving.value = true
  await loadData()
  router.back()
}

async function loadData() {
  const a = await db.archives.get(archiveId)
  if (!a) { router.replace('/'); return }

  promptStory.value = a.promptStory
  promptSummary.value = a.promptSummary
  worldSetting.value = a.worldSetting
  writingStyle.value = a.writingStyle
  outputLimit.value = a.outputLimit
  privateConfigs.value = a.privateConfigs ? a.privateConfigs.map(c => ({ ...c, remark: c.remark || c.key })) : []
  worldConfigs.value = a.worldConfigs ? a.worldConfigs.map(c => ({ ...c, remark: c.remark || c.key })) : []
  if (a.referencedSystemConfigKeys && a.referencedSystemConfigKeys.length > 0) {
    const raw = a.referencedSystemConfigKeys
    if (typeof raw[0] === 'string') {
      const ids: number[] = []
      for (const key of raw as unknown as string[]) {
        const sysCfg = await db.systemConfigs.where('key').equals(key).first()
        if (sysCfg) ids.push(sysCfg.id!)
      }
      referencedSystemConfigIds.value = ids
    } else {
      referencedSystemConfigIds.value = [...raw as number[]]
    }
  } else {
    referencedSystemConfigIds.value = []
  }
  await refreshSystemConfigCache()
  dirtyPrivateIdx.value.clear()
  dirtyWorldIdx.value.clear()
  dirtyWorldSetting.value = false
  dirtyRefConfigs.value = false
}

async function savePrivateConfigs(idx: number) {
  await db.archives.update(archiveId, {
    privateConfigs: JSON.parse(JSON.stringify(toRaw(privateConfigs.value))),
  })
  dirtyPrivateIdx.value.delete(idx)
  appStore.showToast('私有配置已保存', 'success')
}

async function saveWorldConfigs(idx: number) {
  await db.archives.update(archiveId, {
    worldConfigs: JSON.parse(JSON.stringify(toRaw(worldConfigs.value))),
  })
  dirtyWorldIdx.value.delete(idx)
  appStore.showToast('世界观配置已保存', 'success')
}

async function saveWorldSetting() {
  await db.archives.update(archiveId, {
    worldSetting: worldSetting.value,
  })
  dirtyWorldSetting.value = false
  appStore.showToast('初始世界观已保存', 'success')
}

async function saveReferencedConfigs() {
  await db.archives.update(archiveId, {
    referencedSystemConfigKeys: toRaw(referencedSystemConfigIds.value),
  })
  dirtyRefConfigs.value = false
  appStore.showToast('引用配置已保存', 'success')
}

function checkPrivateRemarkConflict(remark: string, excludeIdx?: number): boolean {
  const trimmed = remark.trim()
  if (!trimmed) return false
  return privateConfigs.value.some((c, i) => i !== excludeIdx && c.remark.trim() === trimmed)
}

function validatePrivateRemarkOnBlur(cfg: CustomConfigItem, idx: number) {
  const trimmed = cfg.remark.trim()
  if (!trimmed) return
  if (checkPrivateRemarkConflict(trimmed, idx)) {
    cfg.remark = privateRemarkBeforeEdit.value
    appStore.showToast(`备注「${trimmed}」已存在，不可重复`, 'error')
  }
  privateRemarkBeforeEdit.value = ''
}

function checkWorldRemarkConflict(remark: string, excludeIdx?: number): boolean {
  const trimmed = remark.trim()
  if (!trimmed) return false
  return worldConfigs.value.some((c, i) => i !== excludeIdx && c.remark.trim() === trimmed)
}

function validateWorldRemarkOnBlur(cfg: CustomConfigItem, idx: number) {
  const trimmed = cfg.remark.trim()
  if (!trimmed) return
  if (checkWorldRemarkConflict(trimmed, idx)) {
    cfg.remark = worldRemarkBeforeEdit.value
    appStore.showToast(`备注「${trimmed}」已存在，不可重复`, 'error')
  }
  worldRemarkBeforeEdit.value = ''
}

function addPrivateConfig() {
  if (!newPrivateKey.value.trim()) return
  const remark = newPrivateRemark.value.trim() || newPrivateKey.value.trim()
  if (checkPrivateRemarkConflict(remark)) {
    appStore.showToast(`备注「${remark}」已存在，不可重复`, 'error')
    return
  }
  privateConfigs.value = [...privateConfigs.value, {
    key: newPrivateKey.value.trim(),
    value: newPrivateValue.value,
    remark,
  }]
  newPrivateKey.value = ''
  newPrivateValue.value = ''
  newPrivateRemark.value = ''
  showAddPrivateForm.value = false
  dirtyPrivateIdx.value.add(privateConfigs.value.length - 1)
}

function addWorldConfig() {
  if (!newWorldKey.value.trim()) return
  const remark = newWorldRemark.value.trim() || newWorldKey.value.trim()
  if (checkWorldRemarkConflict(remark)) {
    appStore.showToast(`备注「${remark}」已存在，不可重复`, 'error')
    return
  }
  worldConfigs.value = [...worldConfigs.value, {
    key: newWorldKey.value.trim(),
    value: newWorldValue.value,
    remark,
  }]
  newWorldKey.value = ''
  newWorldValue.value = ''
  newWorldRemark.value = ''
  showAddWorldForm.value = false
  dirtyWorldIdx.value.add(worldConfigs.value.length - 1)
}

async function searchSystemConfigs() {
  const q = systemSearchInput.value.trim()
  let results: SystemConfigItem[]
  if (!q) {
    results = await db.systemConfigs.toArray()
  } else {
    results = await db.systemConfigs.filter(c => c.key.includes(q) || (c.remark ? c.remark.includes(q) : false)).toArray()
  }
  results = results.filter(c => !referencedSystemConfigIds.value.includes(c.id!) && c.key !== 'AI 剧情推动提示词' && c.key !== 'AI 总结提示词')
  systemSearchResults.value = results
  showSystemDropdown.value = true
}

function selectSystemResult(item: SystemConfigItem) {
  systemSearchInput.value = item.key
  showSystemDropdown.value = false
}

async function addSystemConfig() {
  const key = systemSearchInput.value.trim()
  if (!key) { appStore.showToast('请输入或搜索配置项名称', 'error'); return }
  const sysCfg = await db.systemConfigs.where('key').equals(key).first()
  if (!sysCfg) { appStore.showToast('未找到该系统配置项', 'error'); return }
  if (referencedSystemConfigIds.value.includes(sysCfg.id!)) {
    appStore.showToast('该配置项已引用', 'error')
    return
  }
  referencedSystemConfigIds.value = [...referencedSystemConfigIds.value, sysCfg.id!]
  await refreshSystemConfigCache()
  systemSearchInput.value = ''
  showSystemDropdown.value = false
  dirtyRefConfigs.value = true
}

function handleClickOutside(e: MouseEvent) {
  if (systemDropdownRef.value && !systemDropdownRef.value.contains(e.target as Node)) {
    showSystemDropdown.value = false
  }
}

function removeSystemConfig(id: number) {
  referencedSystemConfigIds.value = referencedSystemConfigIds.value.filter(x => x !== id)
  deleteSystemId.value = null
  dirtyRefConfigs.value = true
}

function confirmDeletePrivate() {
  const idx = deletePrivateIdx.value!
  privateConfigs.value.splice(idx, 1)
  const newSet = new Set<number>()
  for (const i of dirtyPrivateIdx.value) {
    if (i < idx) newSet.add(i)
    else if (i > idx) newSet.add(i - 1)
  }
  dirtyPrivateIdx.value = newSet
  deletePrivateIdx.value = null
}

function confirmDeleteWorld() {
  const idx = deleteWorldIdx.value!
  worldConfigs.value.splice(idx, 1)
  const newSet = new Set<number>()
  for (const i of dirtyWorldIdx.value) {
    if (i < idx) newSet.add(i)
    else if (i > idx) newSet.add(i - 1)
  }
  dirtyWorldIdx.value = newSet
  deleteWorldIdx.value = null
}

// ---- 私有配置拖拽 ----
function onPrivateDragStart(e: DragEvent, idx: number) {
  if (expandedPrivateIdx.value === idx) expandedPrivateIdx.value = null
  privateDragIdx.value = idx
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', 'private-' + idx)
  }
}
function onPrivateDragOver(e: DragEvent, idx: number) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  privateDragOverIdx.value = idx
}
function onPrivateDrop(e: DragEvent, targetIdx: number) {
  e.preventDefault()
  if (privateDragIdx.value === null || privateDragIdx.value === targetIdx) {
    privateDragIdx.value = null
    privateDragOverIdx.value = null
    return
  }
  const oldIdx = privateDragIdx.value
  const moved = privateConfigs.value.splice(oldIdx, 1)[0]
  privateConfigs.value.splice(targetIdx, 0, moved)
  const newSet = new Set<number>()
  for (const i of dirtyPrivateIdx.value) {
    if (i === oldIdx) {
      newSet.add(targetIdx)
    } else if (oldIdx < targetIdx) {
      if (i > oldIdx && i <= targetIdx) newSet.add(i - 1)
      else newSet.add(i)
    } else {
      if (i >= targetIdx && i < oldIdx) newSet.add(i + 1)
      else newSet.add(i)
    }
  }
  dirtyPrivateIdx.value = newSet
  privateDragIdx.value = null
  privateDragOverIdx.value = null
}
function onPrivateDragEnd() {
  privateDragIdx.value = null
  privateDragOverIdx.value = null
}

// ---- 世界观配置拖拽 ----
function onWorldDragStart(e: DragEvent, idx: number) {
  if (expandedWorldIdx.value === idx) expandedWorldIdx.value = null
  worldDragIdx.value = idx
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', 'world-' + idx)
  }
}
function onWorldDragOver(e: DragEvent, idx: number) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  worldDragOverIdx.value = idx
}
function onWorldDrop(e: DragEvent, targetIdx: number) {
  e.preventDefault()
  if (worldDragIdx.value === null || worldDragIdx.value === targetIdx) {
    worldDragIdx.value = null
    worldDragOverIdx.value = null
    return
  }
  const oldIdx = worldDragIdx.value
  const moved = worldConfigs.value.splice(oldIdx, 1)[0]
  worldConfigs.value.splice(targetIdx, 0, moved)
  const newSet = new Set<number>()
  for (const i of dirtyWorldIdx.value) {
    if (i === oldIdx) {
      newSet.add(targetIdx)
    } else if (oldIdx < targetIdx) {
      if (i > oldIdx && i <= targetIdx) newSet.add(i - 1)
      else newSet.add(i)
    } else {
      if (i >= targetIdx && i < oldIdx) newSet.add(i + 1)
      else newSet.add(i)
    }
  }
  dirtyWorldIdx.value = newSet
  worldDragIdx.value = null
  worldDragOverIdx.value = null
}
function onWorldDragEnd() {
  worldDragIdx.value = null
  worldDragOverIdx.value = null
}

onMounted(() => {
  loadData()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="h-full flex flex-col">
    <header class="flex items-center gap-4 px-4 py-3 page-header shrink-0">
      <button class="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors" @click="router.back()">
        <ArrowLeft :size="20" />
      </button>
      <h1 class="text-lg font-semibold flex-1">存档配置</h1>
    </header>

    <div class="flex border-b border-[var(--color-border)] shrink-0">
      <button v-for="tab in [{k:'world',l:'世界观'},{k:'configs',l:'存档配置项'}]" :key="tab.k"
        :class="['flex-1 py-2.5 font-medium transition-colors text-sm sm:text-base', activeTab === tab.k ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]']"
        @click="activeTab = tab.k as any">{{ tab.l }}</button>
    </div>

    <div class="flex-1 overflow-y-auto px-4 pb-4 space-y-4">

      <!-- 存档配置项 -->
      <template v-if="activeTab === 'configs'">
        <div>
          <div class="flex items-center justify-between mb-2 sticky top-0 z-10 bg-[var(--color-bg)] pt-4 pb-2">
            <label class="font-medium text-sm sm:text-base">私有自定义配置项</label>
            <button class="flex items-center gap-1 px-2 py-1 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors text-sm sm:text-base"
              @click="showAddPrivateForm = true; expandedPrivateIdx = null"><Plus :size="14" />添加</button>
          </div>
          <div v-for="(cfg, i) in privateConfigs" :key="i"
            :class="['border rounded-lg overflow-hidden mb-2', privateDragOverIdx === i && privateDragIdx !== i ? 'border-t-2 border-t-[var(--color-accent)]' : 'border-[var(--color-border)]']">
            <div
              draggable="true"
              class="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer select-none"
              :class="{ 'cursor-grab': privateDragIdx === null, 'cursor-grabbing': privateDragIdx === i }"
              @click="expandedPrivateIdx !== i ? (privateRemarkBeforeEdit = cfg.remark, expandedPrivateIdx = i) : expandedPrivateIdx = null"
              @dragstart="onPrivateDragStart($event, i)"
              @dragover="onPrivateDragOver($event, i)"
              @drop="onPrivateDrop($event, i)"
              @dragend="onPrivateDragEnd">
              <span class="font-semibold text-sm">{{ cfg.remark || cfg.key || '未命名配置' }}</span>
              <div class="flex items-center gap-2">
                <button class="text-red-400 hover:text-red-600 transition-colors" @click.stop="deletePrivateIdx = i"><Trash2 :size="16" /></button>
                <ChevronDown :size="16" class="text-[var(--color-text-muted)] transition-transform duration-200" :class="{ 'rotate-180': expandedPrivateIdx === i }" />
              </div>
            </div>
            <div v-if="expandedPrivateIdx === i" class="px-4 pb-4 space-y-3 border-t border-[var(--color-border)] pt-3">
              <div>
                <label class="block text-xs text-[var(--color-text-secondary)] mb-1">备注</label>
                <input v-model="cfg.remark" type="text" class="w-full bg-[var(--color-bg)] rounded px-3 py-1.5 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none text-sm" placeholder="备注" @input="dirtyPrivateIdx.add(i)" @blur="validatePrivateRemarkOnBlur(cfg, i)" />
              </div>
              <div>
                <label class="block text-xs text-[var(--color-text-secondary)] mb-1">配置名称</label>
                <input v-model="cfg.key" type="text" class="w-full bg-[var(--color-bg)] rounded px-3 py-1.5 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none text-sm" placeholder="配置名称" @input="dirtyPrivateIdx.add(i)" />
              </div>
              <div>
                <label class="block text-xs text-[var(--color-text-secondary)] mb-1">配置内容</label>
                <textarea v-model="cfg.value" class="w-full bg-[var(--color-bg)] rounded px-3 py-1.5 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none text-sm" rows="2" v-auto-resize placeholder="配置内容" @input="dirtyPrivateIdx.add(i)" />
              </div>
              <button
                style="width: 95%" class="py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-colors disabled:opacity-50 text-sm block mx-auto"
                :disabled="!dirtyPrivateIdx.has(i)"
                @click="savePrivateConfigs(i)"
              >
                保存
              </button>
            </div>
          </div>
          <div v-if="privateConfigs.length === 0 && !showAddPrivateForm" class="text-center py-12 text-sm text-[var(--color-text-muted)] empty-state rounded-lg">
            暂无自定义配置
          </div>
          <div v-if="showAddPrivateForm" class="border border-[var(--color-accent)] rounded-lg overflow-hidden mb-2">
            <div class="w-full flex items-center justify-between px-4 py-3 bg-[var(--color-bg)]">
              <span class="font-semibold text-sm text-[var(--color-accent)]">新建配置</span>
              <button class="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors" @click="showAddPrivateForm = false; newPrivateKey = ''; newPrivateValue = ''; newPrivateRemark = ''"><X :size="16" /></button>
            </div>
            <div class="px-4 pb-4 space-y-3 border-t border-[var(--color-border)] pt-3">
              <div>
                <label class="block text-xs text-[var(--color-text-secondary)] mb-1">备注</label>
                <input v-model="newPrivateRemark" type="text" class="w-full bg-[var(--color-surface)] rounded px-3 py-1.5 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none text-sm" placeholder="备注" />
              </div>
              <div>
                <label class="block text-xs text-[var(--color-text-secondary)] mb-1">配置名称</label>
                <input v-model="newPrivateKey" type="text" class="w-full bg-[var(--color-surface)] rounded px-3 py-1.5 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none text-sm" placeholder="配置名称" />
              </div>
              <div>
                <label class="block text-xs text-[var(--color-text-secondary)] mb-1">配置内容</label>
                <textarea v-model="newPrivateValue" class="w-full bg-[var(--color-surface)] rounded px-3 py-1.5 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none text-sm" rows="2" v-auto-resize placeholder="配置内容" />
              </div>
              <div class="flex justify-end gap-2">
                <button class="px-3 py-1.5 rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors text-xs" @click="showAddPrivateForm = false; newPrivateKey = ''; newPrivateValue = ''; newPrivateRemark = ''">取消</button>
                <button class="px-3 py-1.5 rounded-md bg-[var(--color-accent)] text-white hover:opacity-90 transition-colors disabled:opacity-50 text-xs" :disabled="!newPrivateKey.trim()" @click="addPrivateConfig()">添加</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 引用系统配置项 -->
        <div ref="systemDropdownRef">
          <div class="flex items-center justify-between mb-2 sticky top-0 z-10 bg-[var(--color-bg)] pt-4 pb-2">
            <div class="flex items-center gap-2">
              <label class="font-medium shrink-0 text-sm sm:text-base">引用系统配置项</label>
              <div class="flex items-center gap-1">
                <div class="relative">
                  <input v-model="systemSearchInput" type="text" class="w-36 px-2 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:border-[var(--color-accent)] focus:outline-none" placeholder="搜索配置项" @keyup.enter="searchSystemConfigs()" />
                  <div v-if="showSystemDropdown" class="absolute top-full left-0 right-0 mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md shadow-lg z-20 max-h-40 overflow-y-auto">
                    <div v-for="item in systemSearchResults" :key="item.id" class="px-3 py-1.5 text-sm cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors" @click="selectSystemResult(item)">{{ item.remark || item.key }}</div>
                  </div>
                </div>
                <button class="flex items-center justify-center px-2 py-1 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors text-sm sm:text-base" @click="searchSystemConfigs()"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>&#8203;</button>
                <button class="flex items-center gap-1 px-2 py-1 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors text-sm sm:text-base" @click="addSystemConfig()"><Plus :size="14" />引用</button>
              </div>
            </div>
            <button
              class="px-3 py-1.5 rounded-md bg-[var(--color-accent)] text-white hover:opacity-90 transition-colors disabled:opacity-50 text-sm"
              :disabled="!dirtyRefConfigs"
              @click="saveReferencedConfigs()"
            >
              保存
            </button>
          </div>
<div v-if="referencedSystemConfigIds.length === 0" class="text-center py-12 text-sm text-[var(--color-text-muted)] empty-state rounded-lg">
            暂无引用系统配置项
          </div>
          <div v-else class="flex flex-wrap gap-2">
            <span v-for="id in referencedSystemConfigIds" :key="id" class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20">
              {{ getSystemConfigDisplay(id) }}
              <button class="hover:text-red-500 transition-colors" @click="deleteSystemId = id"><X :size="10" /></button>
            </span>
          </div>
        </div>
      </template>

      <!-- 世界观 -->
      <template v-if="activeTab === 'world'">
        <div>
          <div class="flex items-center justify-between pt-4 pb-2 mb-2">
            <label class="font-medium text-sm sm:text-base">初始世界观</label>
            <button
              class="px-3 py-1.5 rounded-md bg-[var(--color-accent)] text-white hover:opacity-90 transition-colors disabled:opacity-50 text-sm"
              :disabled="!dirtyWorldSetting"
              @click="saveWorldSetting()"
            >
              保存
            </button>
          </div>
          <textarea v-model="worldSetting" class="w-full px-3 py-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-accent)] focus:outline-none text-sm" rows="2" v-auto-resize placeholder="描述这个世界的背景设定、历史、地理、势力等..." @input="dirtyWorldSetting = true" />
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="font-medium text-sm sm:text-base">其他世界观</label>
            <button class="flex items-center gap-1 px-2 py-1 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors text-sm sm:text-base"
              @click="showAddWorldForm = true; expandedWorldIdx = null"><Plus :size="14" />添加</button>
          </div>
          <div v-for="(cfg, i) in worldConfigs" :key="i"
            :class="['border rounded-lg overflow-hidden mb-2', worldDragOverIdx === i && worldDragIdx !== i ? 'border-t-2 border-t-[var(--color-accent)]' : 'border-[var(--color-border)]']">
            <div
              draggable="true"
              class="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer select-none"
              :class="{ 'cursor-grab': worldDragIdx === null, 'cursor-grabbing': worldDragIdx === i }"
              @click="expandedWorldIdx !== i ? (worldRemarkBeforeEdit = cfg.remark, expandedWorldIdx = i) : expandedWorldIdx = null"
              @dragstart="onWorldDragStart($event, i)"
              @dragover="onWorldDragOver($event, i)"
              @drop="onWorldDrop($event, i)"
              @dragend="onWorldDragEnd">
              <span class="font-semibold text-sm">{{ cfg.remark || cfg.key || '未命名配置' }}</span>
              <div class="flex items-center gap-2">
                <button class="text-red-400 hover:text-red-600 transition-colors" @click.stop="deleteWorldIdx = i"><Trash2 :size="16" /></button>
                <ChevronDown :size="16" class="text-[var(--color-text-muted)] transition-transform duration-200" :class="{ 'rotate-180': expandedWorldIdx === i }" />
              </div>
            </div>
            <div v-if="expandedWorldIdx === i" class="px-4 pb-4 space-y-3 border-t border-[var(--color-border)] pt-3">
              <div>
                <label class="block text-xs text-[var(--color-text-secondary)] mb-1">备注</label>
                <input v-model="cfg.remark" type="text" class="w-full bg-[var(--color-bg)] rounded px-3 py-1.5 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none text-sm" placeholder="备注" @input="dirtyWorldIdx.add(i)" @blur="validateWorldRemarkOnBlur(cfg, i)" />
              </div>
              <div>
                <label class="block text-xs text-[var(--color-text-secondary)] mb-1">配置名称</label>
                <input v-model="cfg.key" type="text" class="w-full bg-[var(--color-bg)] rounded px-3 py-1.5 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none text-sm" placeholder="配置名称" @input="dirtyWorldIdx.add(i)" />
              </div>
              <div>
                <label class="block text-xs text-[var(--color-text-secondary)] mb-1">配置内容</label>
                <textarea v-model="cfg.value" class="w-full bg-[var(--color-bg)] rounded px-3 py-1.5 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none text-sm" rows="2" v-auto-resize placeholder="配置内容" @input="dirtyWorldIdx.add(i)" />
              </div>
              <button
                style="width: 95%" class="py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-colors disabled:opacity-50 text-sm block mx-auto"
                :disabled="!dirtyWorldIdx.has(i)"
                @click="saveWorldConfigs(i)"
              >
                保存
              </button>
            </div>
          </div>
          <div v-if="worldConfigs.length === 0 && !showAddWorldForm" class="text-center py-12 text-sm text-[var(--color-text-muted)] empty-state rounded-lg">
            暂无其他世界观
          </div>
          <div v-if="showAddWorldForm" class="border border-[var(--color-accent)] rounded-lg overflow-hidden mb-2">
            <div class="w-full flex items-center justify-between px-4 py-3 bg-[var(--color-bg)]">
              <span class="font-semibold text-sm text-[var(--color-accent)]">新建配置</span>
              <button class="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors" @click="showAddWorldForm = false; newWorldKey = ''; newWorldValue = ''; newWorldRemark = ''"><X :size="16" /></button>
            </div>
            <div class="px-4 pb-4 space-y-3 border-t border-[var(--color-border)] pt-3">
              <div>
                <label class="block text-xs text-[var(--color-text-secondary)] mb-1">备注</label>
                <input v-model="newWorldRemark" type="text" class="w-full bg-[var(--color-surface)] rounded px-3 py-1.5 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none text-sm" placeholder="备注" />
              </div>
              <div>
                <label class="block text-xs text-[var(--color-text-secondary)] mb-1">配置名称</label>
                <input v-model="newWorldKey" type="text" class="w-full bg-[var(--color-surface)] rounded px-3 py-1.5 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none text-sm" placeholder="配置名称" />
              </div>
              <div>
                <label class="block text-xs text-[var(--color-text-secondary)] mb-1">配置内容</label>
                <textarea v-model="newWorldValue" class="w-full bg-[var(--color-surface)] rounded px-3 py-1.5 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none text-sm" rows="2" v-auto-resize placeholder="配置内容" />
              </div>
              <div class="flex justify-end gap-2">
                <button class="px-3 py-1.5 rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors text-xs" @click="showAddWorldForm = false; newWorldKey = ''; newWorldValue = ''; newWorldRemark = ''">取消</button>
                <button class="px-3 py-1.5 rounded-md bg-[var(--color-accent)] text-white hover:opacity-90 transition-colors disabled:opacity-50 text-xs" :disabled="!newWorldKey.trim()" @click="addWorldConfig()">添加</button>
              </div>
            </div>
          </div>
        </div>
      </template>

    </div>

    <ConfirmModal :visible="deletePrivateIdx !== null" title="删除自定义配置" :message="`确认删除自定义配置「${deletePrivateIdx !== null ? privateConfigs[deletePrivateIdx]?.remark || privateConfigs[deletePrivateIdx]?.key : ''}」？`" confirm-text="删除" :danger="true"
      @confirm="confirmDeletePrivate()" @cancel="deletePrivateIdx = null" />
    <ConfirmModal :visible="deleteWorldIdx !== null" title="删除自定义配置" :message="`确认删除自定义配置「${deleteWorldIdx !== null ? worldConfigs[deleteWorldIdx]?.remark || worldConfigs[deleteWorldIdx]?.key : ''}」？`" confirm-text="删除" :danger="true"
      @confirm="confirmDeleteWorld()" @cancel="deleteWorldIdx = null" />
    <ConfirmModal :visible="deleteSystemId !== null" title="解除引用" :message="`确认解除对系统配置项「${deleteSystemId !== null ? getSystemConfigDisplay(deleteSystemId) : ''}」的引用？`" confirm-text="解除"
      @confirm="deleteSystemId !== null && removeSystemConfig(deleteSystemId)" @cancel="deleteSystemId = null" />

    <ConfirmModal
      :visible="showLeaveConfirm"
      title="未保存的更改"
      message="当前有未保存的更改，离开将丢失所有修改。确认离开？"
      confirm-text="确认离开"
      :danger="true"
      @confirm="confirmLeave()"
      @cancel="showLeaveConfirm = false"
    />
  </div>
</template>
