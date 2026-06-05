<script setup lang="ts">
import { ref, onMounted, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '@/db'
import { useAppStore } from '@/stores/app'
import type { CustomConfigItem } from '@/types'
import { ArrowLeft, Save, Plus, X, ChevronDown } from 'lucide-vue-next'
import BaseModal from '@/components/common/BaseModal.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const archiveId = Number(route.params.id)
const activeTab = ref<'prompts' | 'configs' | 'world'>('prompts')

const promptStory = ref('')
const promptSummary = ref('')
const worldSetting = ref('')
const writingStyle = ref('')
const outputLimit = ref('')
const privateConfigs = ref<CustomConfigItem[]>([])
const worldConfigs = ref<CustomConfigItem[]>([])
const referencedSystemConfigKeys = ref<string[]>([])

// 配置项 tab 内联新增
const showAddPrivateForm = ref(false)
const newPrivateKey = ref('')
const newPrivateValue = ref('')
const expandedPrivateIdx = ref<number | null>(null)
const deletePrivateIdx = ref<number | null>(null)

// 世界观 tab 内联新增
const showAddWorldForm = ref(false)
const newWorldKey = ref('')
const newWorldValue = ref('')
const expandedWorldIdx = ref<number | null>(null)
const deleteWorldIdx = ref<number | null>(null)

// 系统配置弹窗
const showAddSystemModal = ref(false)
const systemKeyInput = ref('')
const deleteSystemKey = ref<string | null>(null)

async function loadData() {
  const a = await db.archives.get(archiveId)
  if (!a) { router.replace('/'); return }

  promptStory.value = a.promptStory
  promptSummary.value = a.promptSummary
  worldSetting.value = a.worldSetting
  writingStyle.value = a.writingStyle
  outputLimit.value = a.outputLimit
  privateConfigs.value = a.privateConfigs ? [...a.privateConfigs] : []
  worldConfigs.value = a.worldConfigs ? [...a.worldConfigs] : []
  referencedSystemConfigKeys.value = a.referencedSystemConfigKeys ? [...a.referencedSystemConfigKeys] : []
}

async function handleSave() {
  await db.archives.update(archiveId, {
    promptStory: promptStory.value,
    promptSummary: promptSummary.value,
    worldSetting: worldSetting.value,
    writingStyle: writingStyle.value,
    outputLimit: outputLimit.value,
    privateConfigs: JSON.parse(JSON.stringify(toRaw(privateConfigs.value))),
    worldConfigs: JSON.parse(JSON.stringify(toRaw(worldConfigs.value))),
    referencedSystemConfigKeys: toRaw(referencedSystemConfigKeys.value),
  })
  appStore.showToast('配置保存成功', 'success')
}

function addPrivateConfig() {
  if (!newPrivateKey.value.trim()) return
  privateConfigs.value = [...privateConfigs.value, { key: newPrivateKey.value.trim(), value: newPrivateValue.value }]
  newPrivateKey.value = ''
  newPrivateValue.value = ''
  showAddPrivateForm.value = false
}

function addWorldConfig() {
  if (!newWorldKey.value.trim()) return
  worldConfigs.value = [...worldConfigs.value, { key: newWorldKey.value.trim(), value: newWorldValue.value }]
  newWorldKey.value = ''
  newWorldValue.value = ''
  showAddWorldForm.value = false
}

async function addSystemConfig() {
  if (!systemKeyInput.value.trim()) return
  const key = systemKeyInput.value.trim()
  const sysCfg = await db.systemConfigs.where('key').equals(key).first()
  if (!sysCfg) { appStore.showToast('未找到该系统配置项', 'error'); return }
  if (!referencedSystemConfigKeys.value.includes(key)) {
    referencedSystemConfigKeys.value = [...referencedSystemConfigKeys.value, key]
  }
  systemKeyInput.value = ''
  showAddSystemModal.value = false
}

function removeSystemConfig(key: string) {
  referencedSystemConfigKeys.value = referencedSystemConfigKeys.value.filter(k => k !== key)
  deleteSystemKey.value = null
}

onMounted(() => { loadData() })
</script>

<template>
  <div class="h-full flex flex-col">
    <header class="flex items-center gap-4 px-4 py-3 page-header shrink-0">
      <button class="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors" @click="router.back()">
        <ArrowLeft :size="20" />
      </button>
      <h1 class="text-lg font-semibold flex-1">存档配置</h1>
      <button class="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[var(--color-accent)] text-white text-sm hover:opacity-90 transition-colors" @click="handleSave">
        <Save :size="16" />保存
      </button>
    </header>

    <div class="flex border-b border-[var(--color-border)] shrink-0">
      <button v-for="tab in [{k:'prompts',l:'提示词'},{k:'configs',l:'配置项'},{k:'world',l:'世界观'}]" :key="tab.k"
        :class="['flex-1 py-2.5 font-medium transition-colors', activeTab === tab.k ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]']"
        @click="activeTab = tab.k as any">{{ tab.l }}</button>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-4">

      <!-- 提示词 -->
      <template v-if="activeTab === 'prompts'">
        <div>
          <label class="block font-medium mb-1">大模型剧情推动提示词</label>
          <textarea v-model="promptStory" class="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-accent)] focus:outline-none" rows="2" v-auto-resize />
        </div>
        <div>
          <label class="block font-medium mb-1">大模型总结提示词</label>
          <textarea v-model="promptSummary" class="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-accent)] focus:outline-none" rows="2" v-auto-resize />
        </div>
      </template>

      <!-- 配置项 -->
      <template v-if="activeTab === 'configs'">
        <div>
          <label class="block font-medium mb-1">回复文笔</label>
          <textarea v-model="writingStyle" class="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-accent)] focus:outline-none" rows="2" v-auto-resize />
        </div>
        <div>
          <label class="block font-medium mb-1">输出字数要求</label>
          <textarea v-model="outputLimit" class="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-accent)] focus:outline-none" rows="2" v-auto-resize />
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="font-medium">私有自定义配置项</label>
            <button class="flex items-center gap-1 px-2 py-1 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
              @click="showAddPrivateForm = true; expandedPrivateIdx = null"><Plus :size="14" />添加自定义配置</button>
          </div>
          <div v-for="(cfg, i) in privateConfigs" :key="i" class="border border-[var(--color-border)] rounded-lg overflow-hidden mb-2">
            <div class="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer select-none"
              @click="expandedPrivateIdx = expandedPrivateIdx === i ? null : i">
              <span class="font-semibold">{{ cfg.key || '未命名配置' }}</span>
              <div class="flex items-center gap-2">
                <button class="text-red-400 hover:text-red-600 transition-colors" @click.stop="deletePrivateIdx = i"><X :size="16" /></button>
                <ChevronDown :size="16" class="text-[var(--color-text-muted)] transition-transform duration-200" :class="{ 'rotate-180': expandedPrivateIdx === i }" />
              </div>
            </div>
            <div v-if="expandedPrivateIdx === i" class="px-4 pb-4 space-y-3 border-t border-[var(--color-border)] pt-3">
              <div>
                <label class="block text-sm text-[var(--color-text-secondary)] mb-1">配置名称</label>
                <input v-model="cfg.key" type="text" class="w-full bg-[var(--color-bg)] rounded px-3 py-2 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none" placeholder="配置名称" />
              </div>
              <div>
                <label class="block text-sm text-[var(--color-text-secondary)] mb-1">配置内容</label>
                <textarea v-model="cfg.value" class="w-full bg-[var(--color-bg)] rounded px-3 py-2 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none" rows="2" v-auto-resize placeholder="配置内容" />
              </div>
            </div>
          </div>
          <div v-if="showAddPrivateForm" class="border border-[var(--color-accent)] rounded-lg overflow-hidden mb-2">
            <div class="w-full flex items-center justify-between px-4 py-3 bg-[var(--color-bg)]">
              <span class="font-semibold text-[var(--color-accent)]">新建配置</span>
              <button class="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors" @click="showAddPrivateForm = false; newPrivateKey = ''; newPrivateValue = ''"><X :size="16" /></button>
            </div>
            <div class="px-4 pb-4 space-y-3 border-t border-[var(--color-border)] pt-3">
              <div>
                <label class="block text-sm text-[var(--color-text-secondary)] mb-1">配置名称</label>
                <input v-model="newPrivateKey" type="text" class="w-full bg-[var(--color-surface)] rounded px-3 py-2 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none" placeholder="配置名称" />
              </div>
              <div>
                <label class="block text-sm text-[var(--color-text-secondary)] mb-1">配置内容</label>
                <textarea v-model="newPrivateValue" class="w-full bg-[var(--color-surface)] rounded px-3 py-2 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none" rows="2" v-auto-resize placeholder="配置内容" />
              </div>
              <div class="flex justify-end gap-2">
                <button class="px-3 py-1.5 rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors" @click="showAddPrivateForm = false; newPrivateKey = ''; newPrivateValue = ''">取消</button>
                <button class="px-3 py-1.5 rounded-md bg-[var(--color-accent)] text-white hover:opacity-90 transition-colors disabled:opacity-50" :disabled="!newPrivateKey.trim()" @click="addPrivateConfig()">添加</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 引用系统配置项 -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="font-medium">引用系统配置项</label>
            <button class="flex items-center gap-1 px-2 py-1 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors" @click="showAddSystemModal = true">
              <Plus :size="14" />调用系统配置项</button>
          </div>
          <div class="flex flex-wrap gap-2">
            <span v-for="key in referencedSystemConfigKeys" :key="key" class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20">
              {{ key }}
              <button class="hover:text-red-500 transition-colors" @click="deleteSystemKey = key"><X :size="10" /></button>
            </span>
            <span v-if="referencedSystemConfigKeys.length === 0" class="text-[var(--color-text-muted)]">暂无引用</span>
          </div>
        </div>
      </template>

      <!-- 世界观 -->
      <template v-if="activeTab === 'world'">
        <div>
          <label class="block font-medium mb-1">初始世界观</label>
          <textarea v-model="worldSetting" class="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-accent)] focus:outline-none" rows="2" v-auto-resize placeholder="描述这个世界的背景设定、历史、地理、势力等..." />
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="font-medium">私有自定义配置项</label>
            <button class="flex items-center gap-1 px-2 py-1 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
              @click="showAddWorldForm = true; expandedWorldIdx = null"><Plus :size="14" />添加自定义配置</button>
          </div>
          <div v-for="(cfg, i) in worldConfigs" :key="i" class="border border-[var(--color-border)] rounded-lg overflow-hidden mb-2">
            <div class="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer select-none"
              @click="expandedWorldIdx = expandedWorldIdx === i ? null : i">
              <span class="font-semibold">{{ cfg.key || '未命名配置' }}</span>
              <div class="flex items-center gap-2">
                <button class="text-red-400 hover:text-red-600 transition-colors" @click.stop="deleteWorldIdx = i"><X :size="16" /></button>
                <ChevronDown :size="16" class="text-[var(--color-text-muted)] transition-transform duration-200" :class="{ 'rotate-180': expandedWorldIdx === i }" />
              </div>
            </div>
            <div v-if="expandedWorldIdx === i" class="px-4 pb-4 space-y-3 border-t border-[var(--color-border)] pt-3">
              <div>
                <label class="block text-sm text-[var(--color-text-secondary)] mb-1">配置名称</label>
                <input v-model="cfg.key" type="text" class="w-full bg-[var(--color-bg)] rounded px-3 py-2 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none" placeholder="配置名称" />
              </div>
              <div>
                <label class="block text-sm text-[var(--color-text-secondary)] mb-1">配置内容</label>
                <textarea v-model="cfg.value" class="w-full bg-[var(--color-bg)] rounded px-3 py-2 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none" rows="2" v-auto-resize placeholder="配置内容" />
              </div>
            </div>
          </div>
          <div v-if="showAddWorldForm" class="border border-[var(--color-accent)] rounded-lg overflow-hidden mb-2">
            <div class="w-full flex items-center justify-between px-4 py-3 bg-[var(--color-bg)]">
              <span class="font-semibold text-[var(--color-accent)]">新建配置</span>
              <button class="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors" @click="showAddWorldForm = false; newWorldKey = ''; newWorldValue = ''"><X :size="16" /></button>
            </div>
            <div class="px-4 pb-4 space-y-3 border-t border-[var(--color-border)] pt-3">
              <div>
                <label class="block text-sm text-[var(--color-text-secondary)] mb-1">配置名称</label>
                <input v-model="newWorldKey" type="text" class="w-full bg-[var(--color-surface)] rounded px-3 py-2 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none" placeholder="配置名称" />
              </div>
              <div>
                <label class="block text-sm text-[var(--color-text-secondary)] mb-1">配置内容</label>
                <textarea v-model="newWorldValue" class="w-full bg-[var(--color-surface)] rounded px-3 py-2 border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none" rows="2" v-auto-resize placeholder="配置内容" />
              </div>
              <div class="flex justify-end gap-2">
                <button class="px-3 py-1.5 rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors" @click="showAddWorldForm = false; newWorldKey = ''; newWorldValue = ''">取消</button>
                <button class="px-3 py-1.5 rounded-md bg-[var(--color-accent)] text-white hover:opacity-90 transition-colors disabled:opacity-50" :disabled="!newWorldKey.trim()" @click="addWorldConfig()">添加</button>
              </div>
            </div>
          </div>
        </div>
      </template>

    </div>

    <BaseModal :visible="showAddSystemModal" title="调用系统配置项" @close="showAddSystemModal = false">
      <div class="mb-6">
        <label class="block text-[var(--color-text-secondary)] mb-1">配置名称</label>
        <input v-model="systemKeyInput" type="text" class="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-accent)]" placeholder="输入系统配置名称" @keyup.enter="addSystemConfig()" />
      </div>
      <div class="flex justify-end gap-3">
        <button class="px-4 py-2 rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors" @click="showAddSystemModal = false">取消</button>
        <button class="px-4 py-2 rounded-md bg-[var(--color-accent)] text-white hover:opacity-90 transition-colors disabled:opacity-50" :disabled="!systemKeyInput.trim()" @click="addSystemConfig()">确定</button>
      </div>
    </BaseModal>

    <ConfirmModal :visible="deletePrivateIdx !== null" title="删除自定义配置" :message="`确认删除自定义配置「${deletePrivateIdx !== null ? privateConfigs[deletePrivateIdx]?.key : ''}」？`" confirm-text="删除" :danger="true"
      @confirm="privateConfigs.splice(deletePrivateIdx!, 1); deletePrivateIdx = null" @cancel="deletePrivateIdx = null" />
    <ConfirmModal :visible="deleteWorldIdx !== null" title="删除自定义配置" :message="`确认删除自定义配置「${deleteWorldIdx !== null ? worldConfigs[deleteWorldIdx]?.key : ''}」？`" confirm-text="删除" :danger="true"
      @confirm="worldConfigs.splice(deleteWorldIdx!, 1); deleteWorldIdx = null" @cancel="deleteWorldIdx = null" />
    <ConfirmModal :visible="deleteSystemKey !== null" title="解除引用" :message="`确认解除对系统配置项「${deleteSystemKey}」的引用？`" confirm-text="解除"
      @confirm="deleteSystemKey !== null && removeSystemConfig(deleteSystemKey)" @cancel="deleteSystemKey = null" />
  </div>
</template>
