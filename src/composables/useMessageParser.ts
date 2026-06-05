import type { ParsedBlock, RenderedSegment } from '@/types'

export function useMessageParser() {
  function renderUserContent(raw: string): { segments: RenderedSegment[] } {
    const processed = raw.replace(/[\[【].*?[\]】]/g, '')

    const segments: RenderedSegment[] = []
    const regex = /["“]([^"”]*)["”]|([^"“”]+)/g
    let match

    while ((match = regex.exec(processed)) !== null) {
      if (match[1] !== undefined) {
        const prev = segments[segments.length - 1]
        const needsSpace = prev && prev.type === 'normal' && !/[，。、；：！？\s"'“”]$/.test(prev.content)
        if (needsSpace) {
          prev.content = prev.content + ' '
        }
        segments.push({ type: 'dialog', content: `“${match[1]}”` })
      } else if (match[2] !== undefined) {
        segments.push({ type: 'normal', content: match[2] })
      }
    }

    return { segments }
  }

  function parseAiContent(raw: string): ParsedBlock[] {
    const lines = raw.split('\n')
    const blocks: ParsedBlock[] = []

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      if (trimmed.startsWith('[系统公告]') || trimmed.startsWith('【系统公告】')) {
        blocks.push({
          type: 'announcement',
          content: trimmed.replace(/^\[系统公告\]：?|^【系统公告】[：:]?/g, ''),
        })
      } else if (trimmed.startsWith('[动作]') || (trimmed.startsWith('（') && trimmed.endsWith('）'))) {
        blocks.push({
          type: 'action',
          content: trimmed.startsWith('[动作]') ? trimmed.replace(/^\[动作\]：?/g, '') : trimmed,
        })
      } else if (trimmed.includes('说：') || trimmed.startsWith('”') || trimmed.startsWith('“') || trimmed.startsWith('「')) {
        const speakerMatch = trimmed.match(/^(.+?)说：/)
        const speaker = speakerMatch ? speakerMatch[1] : undefined
        const content = speaker ? trimmed.slice(speaker.length + '说：'.length).trim() : trimmed
        blocks.push({ type: 'dialog', content, speaker })
      } else {
        blocks.push({ type: 'narration', content: trimmed })
      }
    }

    return blocks
  }

  function blocksToRaw(blocks: ParsedBlock[]): string {
    return blocks.map(b => {
      switch (b.type) {
        case 'announcement':
          return `[系统公告]${b.content}`
        case 'action':
          return `[动作]${b.content}`
        case 'dialog':
          return b.speaker ? `${b.speaker}说：${b.content}` : b.content
        case 'narration':
          return b.content
      }
    }).join('\n')
  }

  return { renderUserContent, parseAiContent, blocksToRaw }
}
