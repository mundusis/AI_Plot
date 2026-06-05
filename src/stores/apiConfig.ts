import { ref } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/db'
import type { ApiConfig } from '@/types'

export const useApiConfigStore = defineStore('apiConfig', () => {
  const apiConfigs = ref<ApiConfig[]>([])

  async function loadApiConfigs() {
    apiConfigs.value = await db.apiConfigs.toArray()
  }

  async function getApiConfigById(id: number): Promise<ApiConfig | undefined> {
    return db.apiConfigs.get(id)
  }

  return { apiConfigs, loadApiConfigs, getApiConfigById }
})
