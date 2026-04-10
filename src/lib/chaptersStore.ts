/** localStorage helpers for bookmarks, journey tracking, and language preference. */

const BOOKMARKS_KEY = 'qca_bookmarks_v1'
const JOURNEY_KEY = 'qca_journey_v1'
const LANG_KEY = 'qca_lang_v1'

// ── Bookmarks ─────────────────────────────────────────────────────────────

export function loadBookmarks(): Set<number> {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as number[]
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

export function saveBookmarks(set: Set<number>): void {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...set]))
}

export function toggleBookmark(id: number): boolean {
  const set = loadBookmarks()
  if (set.has(id)) {
    set.delete(id)
    saveBookmarks(set)
    return false
  }
  set.add(id)
  saveBookmarks(set)
  return true
}

export function isBookmarked(id: number): boolean {
  return loadBookmarks().has(id)
}

// ── Journey tracker ───────────────────────────────────────────────────────

export function loadJourney(): Set<number> {
  try {
    const raw = localStorage.getItem(JOURNEY_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as number[]
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

export function markChapterVisited(id: number): void {
  const set = loadJourney()
  set.add(id)
  localStorage.setItem(JOURNEY_KEY, JSON.stringify([...set]))
}

export function getJourneyCount(): number {
  return loadJourney().size
}

// ── Language preference ───────────────────────────────────────────────────

export type SupportedLanguage = 'en' | 'ur'

export const LANGUAGE_OPTIONS: { value: SupportedLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'ur', label: 'اردو' },
]

export function loadLanguage(): SupportedLanguage {
  const raw = localStorage.getItem(LANG_KEY)
  return raw === 'ur' ? 'ur' : 'en'
}

export function saveLanguage(lang: SupportedLanguage): void {
  localStorage.setItem(LANG_KEY, lang)
}
