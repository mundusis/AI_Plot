import Dexie, { type Table } from 'dexie'
import type { Archive, Message, ApiConfig, SystemConfigItem } from './schemas'

export class NarrativeForgeDB extends Dexie {
  archives!: Table<Archive, number>
  messages!: Table<Message, number>
  apiConfigs!: Table<ApiConfig, number>
  systemConfigs!: Table<SystemConfigItem, number>

  constructor() {
    super('NarrativeForgeDB')
    this.version(1).stores({
      archives: '++id, createdAt',
      messages: '++id, archiveId, [archiveId+timestamp], [archiveId+summaryStatus]',
      apiConfigs: '++id, name',
      systemConfigs: '++id, key',
    })
  }
}

export const db = new NarrativeForgeDB()
