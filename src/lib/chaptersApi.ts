/**
 * Thin wrapper over the public api.quran.com/api/v4 endpoints.
 * Uses the same Chapter / ChapterInfo shapes as @quranjs/api but without
 * requiring OAuth credentials.
 */
import type { Chapter, ChapterInfo } from '@quranjs/api'
import { Language } from '@quranjs/api'

const BASE = 'https://api.quran.com/api/v4'

export type { Chapter, ChapterInfo }
export { Language }

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Quran API ${res.status}: ${res.statusText}`)
  return (await res.json()) as T
}

export async function getAllChapters(language: Language | string = Language.ENGLISH): Promise<Chapter[]> {
  const { chapters } = await get<{ chapters: Chapter[] }>('/chapters', { language })
  return chapters
}

export async function getChapterById(
  id: number | string,
  language: Language | string = Language.ENGLISH,
): Promise<Chapter> {
  const { chapter } = await get<{ chapter: Chapter }>(`/chapters/${id}`, { language })
  return chapter
}

export async function getChapterInfo(
  id: number | string,
  language: Language | string = Language.ENGLISH,
): Promise<ChapterInfo> {
  const { chapterInfo } = await get<{ chapterInfo: ChapterInfo }>(`/chapters/${id}/info`, {
    language,
  })
  return chapterInfo
}

/** Stable "random" chapter for today (changes once per calendar day). */
export function getDailyChapterId(dateKey: string): number {
  let h = 0
  for (let i = 0; i < dateKey.length; i++) {
    h = (Math.imul(31, h) + dateKey.charCodeAt(i)) | 0
  }
  return (Math.abs(h) % 114) + 1
}
