import { ref } from 'vue'
import { db } from '@/db'

const defaultIds = ref<{ story: number | null; summary: number | null; character: number | null }>({
  story: null,
  summary: null,
  character: null,
})

async function loadDefaultIds() {
  const configs = await db.systemConfigs
    .where('key')
    .equals('底层设定与核心身份')
    .sortBy('sortOrder')

  defaultIds.value = {
    story: configs[0]?.id ?? null,
    summary: configs[1]?.id ?? null,
    character: configs[2]?.id ?? null,
  }
}

function isDefaultId(id: number): boolean {
  return Object.values(defaultIds.value).includes(id)
}

export function useDefaultConfigs() {
  return { defaultIds, loadDefaultIds, isDefaultId }
}
