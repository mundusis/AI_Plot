export interface Archive {
  id?: number
  title: string
  createdAt: number
  selectedApiId?: number
  memoryApiId?: number
  promptStory: string
  promptSummary: string
  worldSetting: string
  writingStyle: string
  outputLimit: string
  privateConfigs: CustomConfigItem[]
  worldConfigs: CustomConfigItem[]
  referencedSystemConfigKeys: number[]
  referencedPrivateConfigKeys: string[]
  referencedSystemRoleIds: number[]
  memory: {
    currentStatus: string
    plotLine: string
    characterRelations: string
    pendingIssues: string
    keyInfo: string
  }
  tokenStats: {
    missCost: number
    hitCost: number
    outputCost: number
  }
}

export interface Message {
  id?: number
  archiveId: number
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  summaryStatus: '未操作' | '已总结' | '已跳过'
}

export interface ApiConfig {
  id?: number
  name: string
  baseUrl: string
  apiKey: string
  model: string
  modelsList: string[]
  temperature: number
  sortOrder: number
}

export interface SystemConfigItem {
  id?: number
  key: string
  value: string
  remark: string
  sortOrder: number
  createdAt: number
}

export interface CustomConfigItem {
  key: string
  value: string
  remark: string
}

export interface ParsedBlock {
  type: 'announcement' | 'dialog' | 'narration' | 'action'
  content: string
  speaker?: string
}

export interface TokenUsage {
  promptTokens: number
  cachedTokens: number
  completionTokens: number
}

export interface CharacterRole {
  id?: number
  remark: string
  name: string
  age: string
  gender: string
  identity: string
  background: string
  appearance: string
  personalityPreferences: string
  keyLines: string
  abilities: string
  images: string[]
  createdAt: number
  updatedAt: number
  sortOrder: number
  archiveId?: number
}
