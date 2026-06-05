import { db } from '@/db'
import type { Archive, Message } from '@/types'

export function useArchiveIO() {
  async function exportArchive(archiveId: number) {
    const archive = await db.archives.get(archiveId)
    if (!archive) return

    const messages = await db.messages.where('archiveId').equals(archiveId).toArray()

    const data = {
      archive,
      messages,
      exportedAt: Date.now(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${archive.title}-${Date.now()}.nforge.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importArchive(file: File) {
    const text = await file.text()
    const data = JSON.parse(text)

    if (!data.archive || !data.messages) {
      throw new Error('无效的存档文件')
    }

    const newArchiveId = await db.archives.add({
      ...data.archive,
      id: undefined,
      createdAt: Date.now(),
      worldSetting: data.archive.worldSetting || '',
      worldConfigs: data.archive.worldConfigs || [],
    })

    if (data.messages?.length) {
      const newMessages = data.messages.map((msg: Message) => ({
        ...msg,
        id: undefined,
        archiveId: newArchiveId,
      }))
      await db.messages.bulkAdd(newMessages)
    }

    return newArchiveId
  }

  return { exportArchive, importArchive }
}
