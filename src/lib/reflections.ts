import type { MoodId } from './moods'

const STORAGE_KEY = 'qca_reflections_v1'

export interface ReflectionEntry {
  id: string
  text: string
  createdAt: string
  verseRef?: string
  mood?: MoodId
}

function loadRaw(): ReflectionEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as ReflectionEntry[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function save(list: ReflectionEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function loadReflections(): ReflectionEntry[] {
  return loadRaw().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function addReflection(entry: {
  text: string
  verseRef?: string
  mood?: MoodId
}): ReflectionEntry {
  const item: ReflectionEntry = {
    id: crypto.randomUUID(),
    text: entry.text.trim(),
    createdAt: new Date().toISOString(),
    verseRef: entry.verseRef,
    mood: entry.mood,
  }
  const next = [item, ...loadRaw()]
  save(next)
  return item
}

export function deleteReflection(id: string) {
  save(loadRaw().filter((r) => r.id !== id))
}
