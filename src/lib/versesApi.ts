/**
 * Quran verses API — wraps api.quran.com/api/v4/verses endpoints.
 * Arabic text: Uthmanic script (text_uthmani)
 * Translation: Sahih International (resource 131)
 * Tafsir: Ibn Kathir Abridged (resource 169)
 * Audio: Islamic Network CDN (Mishary Alafasy, 128 kbps)
 */

const BASE = 'https://api.quran.com/api/v4'
const TRANSLATION_ID = 131
const TAFSIR_ID = 169
const DAILY_VERSE_KEY = 'qca_daily_verse_v2'

// ── Types ──────────────────────────────────────────────────────────────────

export interface Verse {
  id: number          // global ayah number 1–6236
  verseNumber: number // position within the chapter
  verseKey: string    // "chapter:verse" e.g. "2:255"
  arabic: string      // Uthmanic script
  translation: string // Sahih International
  audioUrl: string    // CDN audio URL (Mishary Alafasy)
  tafsir: string | null
}

export interface VersePagination {
  perPage: number
  currentPage: number
  nextPage: number | null
  totalPages: number
  totalRecords: number
}

export interface VersePage {
  verses: Verse[]
  pagination: VersePagination
}

// ── Internal raw types ─────────────────────────────────────────────────────

interface RawTranslation {
  resource_id: number
  text: string
}

interface RawTafsir {
  resource_id: number
  text?: string
  body?: string
}

interface RawVerse {
  id: number
  verse_number: number
  verse_key: string
  text_uthmani?: string
  translations?: RawTranslation[]
  tafsirs?: RawTafsir[]
}

interface RawPagination {
  per_page: number
  current_page: number
  next_page: number | null
  total_pages: number
  total_records: number
}

// ── Helpers ────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<sup[^>]*>.*?<\/sup>/gi, '') // remove footnote superscripts
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/** Audio URL via Islamic Network CDN (same provider as alquran.cloud) */
function buildAudioUrl(globalId: number): string {
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalId}.mp3`
}

function mapVerse(raw: RawVerse): Verse {
  const rawTranslation = raw.translations?.find((t) => t.resource_id === TRANSLATION_ID)
    ?? raw.translations?.[0]
  const rawTafsir = raw.tafsirs?.find((t) => t.resource_id === TAFSIR_ID)
    ?? raw.tafsirs?.[0]

  const translationText = rawTranslation?.text ?? ''
  const tafsirText = rawTafsir?.text ?? rawTafsir?.body ?? null

  return {
    id: raw.id,
    verseNumber: raw.verse_number,
    verseKey: raw.verse_key,
    arabic: raw.text_uthmani ?? '',
    translation: translationText ? stripHtml(translationText) : '',
    audioUrl: buildAudioUrl(raw.id),
    tafsir: tafsirText ? stripHtml(tafsirText) : null,
  }
}

async function get<T>(
  path: string,
  params: Record<string, string | number> = {},
): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v))
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Quran API ${res.status}: ${res.statusText}`)
  return (await res.json()) as T
}

const BASE_PARAMS = {
  translations: TRANSLATION_ID,
  fields: 'text_uthmani,verse_key,verse_number',
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Fetch paginated verses for a chapter.
 * Default: 20 per page.
 */
export async function getVersesByChapter(
  chapterId: number | string,
  page = 1,
  perPage = 20,
): Promise<VersePage> {
  const data = await get<{ verses: RawVerse[]; pagination: RawPagination }>(
    `/verses/by_chapter/${chapterId}`,
    { ...BASE_PARAMS, page, per_page: perPage },
  )
  return {
    verses: (data.verses ?? []).map(mapVerse),
    pagination: {
      perPage: data.pagination?.per_page ?? perPage,
      currentPage: data.pagination?.current_page ?? page,
      nextPage: data.pagination?.next_page ?? null,
      totalPages: data.pagination?.total_pages ?? 1,
      totalRecords: data.pagination?.total_records ?? 0,
    },
  }
}

/**
 * Fetch a single verse by its key (e.g. "2:255").
 * Includes tafsir for the detail page.
 */
export async function getVerseByKey(key: string): Promise<Verse> {
  const data = await get<{ verse: RawVerse }>(
    `/verses/by_key/${encodeURIComponent(key)}`,
    { ...BASE_PARAMS, tafsirs: TAFSIR_ID },
  )
  if (!data.verse) throw new Error(`Verse ${key} not found.`)
  return mapVerse(data.verse)
}

/**
 * Fetch a random verse from the Quran.
 */
export async function getRandomVerse(): Promise<Verse> {
  const data = await get<{ verse: RawVerse }>('/verses/random', BASE_PARAMS)
  if (!data.verse) throw new Error('Could not load random verse.')
  return mapVerse(data.verse)
}

/**
 * Fetch all verses for a specific page of the Mushaf.
 * Quran has 604 pages.
 */
export async function getVersesByPage(pageNumber: number | string): Promise<Verse[]> {
  const data = await get<{ verses: RawVerse[] }>(
    `/verses/by_page/${pageNumber}`,
    { ...BASE_PARAMS }
  )
  return (data.verses ?? []).map(mapVerse)
}

// ── Daily Ayah cache ───────────────────────────────────────────────────────

interface CachedDailyVerse {
  dateKey: string
  verse: Verse
}

export function getCachedDailyVerse(dateKey: string): Verse | null {
  try {
    const raw = localStorage.getItem(DAILY_VERSE_KEY)
    if (!raw) return null
    const cached = JSON.parse(raw) as CachedDailyVerse
    return cached.dateKey === dateKey ? cached.verse : null
  } catch {
    return null
  }
}

export function cacheDailyVerse(dateKey: string, verse: Verse): void {
  try {
    localStorage.setItem(DAILY_VERSE_KEY, JSON.stringify({ dateKey, verse }))
  } catch {
    // storage quota — non-critical
  }
}
