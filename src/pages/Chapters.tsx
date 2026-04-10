import { useEffect, useMemo, useState } from 'react'
import { ChapterCard } from '../components/ChapterCard'
import { getAllChapters, Language, type Chapter } from '../lib/chaptersApi'
import {
  isBookmarked,
  loadBookmarks,
  loadJourney,
  loadLanguage,
  LANGUAGE_OPTIONS,
  saveLanguage,
  toggleBookmark,
  type SupportedLanguage,
} from '../lib/chaptersStore'
import { recordActivity } from '../lib/habits'

type Filter = 'all' | 'bookmarked' | 'visited'
type Place = 'all' | 'makkah' | 'madinah'

export function Chapters() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lang, setLang] = useState<SupportedLanguage>(() => loadLanguage())
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [place, setPlace] = useState<Place>('all')
  const [bookmarks, setBookmarks] = useState<Set<number>>(() => loadBookmarks())
  const [visited] = useState<Set<number>>(() => loadJourney())
  const [_, tick] = useState(0)

  useEffect(() => {
    recordActivity()
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    getAllChapters(lang === 'ur' ? Language.URDU : Language.ENGLISH)
      .then(setChapters)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load chapters.'))
      .finally(() => setLoading(false))
  }, [lang])

  const handleLang = (l: SupportedLanguage) => {
    setLang(l)
    saveLanguage(l)
  }

  const handleBookmark = (id: number) => {
    toggleBookmark(id)
    setBookmarks(loadBookmarks())
    tick((n) => n + 1)
  }

  const filtered = useMemo(() => {
    let list = chapters
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (c) =>
          c.nameSimple.toLowerCase().includes(q) ||
          c.transliteratedName.toLowerCase().includes(q) ||
          c.translatedName.name.toLowerCase().includes(q) ||
          String(c.id).includes(q),
      )
    }
    if (filter === 'bookmarked') list = list.filter((c) => isBookmarked(c.id))
    if (filter === 'visited') list = list.filter((c) => visited.has(c.id))
    if (place !== 'all') list = list.filter((c) => c.revelationPlace === place)
    return list
  }, [chapters, search, filter, place, bookmarks, visited, _])

  const bmCount = bookmarks.size
  const visitedCount = visited.size

  return (
    <div className="page fade-in">
      <div className="page__header">
        <h1 className="page__title">Quran Chapters</h1>
        <p className="page__subtitle">
          All 114 surahs — explore, learn, bookmark, and track your journey.
        </p>
      </div>

      {/* ── Journey progress ── */}
      <div className="journey-banner">
        <div className="journey-banner__inner">
          <span className="journey-banner__label">Surah journey</span>
          <span className="journey-banner__stat">
            {visitedCount} / 114 explored
          </span>
        </div>
        <div className="meter">
          <div
            className="meter__fill"
            style={{ width: `${Math.round((visitedCount / 114) * 100)}%` }}
          />
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="ch-toolbar">
        <input
          type="search"
          className="ch-search"
          placeholder="Search by name, number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search chapters"
        />

        <div className="ch-toolbar__filters">
          <div className="seg-ctrl">
            {(['all', 'bookmarked', 'visited'] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                className={`seg-ctrl__btn${filter === f ? ' seg-ctrl__btn--on' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'bookmarked' ? `Saved (${bmCount})` : `Visited (${visitedCount})`}
              </button>
            ))}
          </div>

          <div className="seg-ctrl">
            {(['all', 'makkah', 'madinah'] as Place[]).map((p) => (
              <button
                key={p}
                type="button"
                className={`seg-ctrl__btn${place === p ? ' seg-ctrl__btn--on' : ''}`}
                onClick={() => setPlace(p)}
              >
                {p === 'all' ? 'All' : p === 'makkah' ? 'Meccan' : 'Medinan'}
              </button>
            ))}
          </div>

          <div className="seg-ctrl">
            {LANGUAGE_OPTIONS.map((l) => (
              <button
                key={l.value}
                type="button"
                lang={l.value === 'ur' ? 'ur' : undefined}
                className={`seg-ctrl__btn${lang === l.value ? ' seg-ctrl__btn--on' : ''}`}
                onClick={() => handleLang(l.value)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? <p className="error-banner">{error}</p> : null}

      {loading ? (
        <div className="ch-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="ch-card ch-card--skel" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>No chapters match your filters.</p>
          <button type="button" className="btn btn--ghost" onClick={() => { setSearch(''); setFilter('all'); setPlace('all') }}>
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="ch-grid" role="list">
          {filtered.map((ch) => (
            <li key={ch.id} role="listitem">
              <ChapterCard
                chapter={ch}
                bookmarked={bookmarks.has(ch.id)}
                visited={visited.has(ch.id)}
                onToggleBookmark={handleBookmark}
              />
            </li>
          ))}
        </ul>
      )}

      {bmCount > 0 && filter !== 'bookmarked' && (
        <div className="bookmark-tray">
          <p className="bookmark-tray__label">
            {bmCount} bookmark{bmCount !== 1 ? 's' : ''} saved —{' '}
            <button type="button" className="text-btn" onClick={() => setFilter('bookmarked')}>
              view them
            </button>
          </p>
        </div>
      )}
    </div>
  )
}
