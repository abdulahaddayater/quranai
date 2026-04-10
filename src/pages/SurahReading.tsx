import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getChapterById, type Chapter } from '../lib/chaptersApi'
import { getVersesByChapter, type Verse, type VersePagination } from '../lib/versesApi'
import { addReflection } from '../lib/reflections'
import { recordActivity } from '../lib/habits'
import { VerseCard } from '../components/VerseCard'

const PER_PAGE = 20

export function SurahReading() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [verses, setVerses] = useState<Verse[]>([])
  const [pagination, setPagination] = useState<VersePagination | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [chapterLoading, setChapterLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Which verse has audio expanded
  const [activeAudioKey, setActiveAudioKey] = useState<string | null>(null)
  // Which verse has the inline reflection form open
  const [reflectKey, setReflectKey] = useState<string | null>(null)
  const [reflectText, setReflectText] = useState('')
  const [reflectSaved, setReflectSaved] = useState<string | null>(null)
  const reflectRef = useRef<HTMLTextAreaElement>(null)

  const chapterId = id ? Number(id) : null

  useEffect(() => { recordActivity() }, [])

  // Fetch chapter metadata
  useEffect(() => {
    if (!chapterId) return
    setChapterLoading(true)
    getChapterById(chapterId)
      .then(setChapter)
      .catch(() => setChapter(null))
      .finally(() => setChapterLoading(false))
  }, [chapterId])

  // Fetch verses (re-runs on page change)
  useEffect(() => {
    if (!chapterId) return
    setLoading(true)
    setError(null)
    setActiveAudioKey(null)
    setReflectKey(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    getVersesByChapter(chapterId, page, PER_PAGE)
      .then(({ verses: v, pagination: p }) => {
        setVerses(v)
        setPagination(p)
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : 'Failed to load verses.'),
      )
      .finally(() => setLoading(false))
  }, [chapterId, page])

  const toggleAudio = (key: string) => {
    setActiveAudioKey((prev) => (prev === key ? null : key))
  }

  const openReflect = (key: string) => {
    setReflectKey((prev) => {
      if (prev === key) return null
      setReflectText('')
      setReflectSaved(null)
      return key
    })
    setTimeout(() => reflectRef.current?.focus(), 80)
  }

  const saveReflection = useCallback(
    (verse: Verse) => {
      const trimmed = reflectText.trim()
      if (!trimmed) return
      addReflection({ text: trimmed, verseRef: verse.verseKey })
      setReflectText('')
      setReflectSaved(verse.verseKey)
      setTimeout(() => {
        setReflectSaved(null)
        setReflectKey(null)
      }, 1800)
    },
    [reflectText],
  )

  if (!chapterId) {
    return (
      <div className="page fade-in">
        <p className="error-banner">Invalid chapter.</p>
        <Link to="/chapters" className="btn btn--ghost">Back to chapters</Link>
      </div>
    )
  }

  return (
    <div className="page fade-in">
      {/* ── Breadcrumb ── */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/chapters" className="breadcrumb__link">Chapters</Link>
        <span className="breadcrumb__sep" aria-hidden>›</span>
        {chapter ? (
          <Link to={`/chapters/${chapterId}`} className="breadcrumb__link">
            {chapter.nameSimple}
          </Link>
        ) : (
          <span>Chapter {chapterId}</span>
        )}
        <span className="breadcrumb__sep" aria-hidden>›</span>
        <span>Reading</span>
      </nav>

      {/* ── Chapter header ── */}
      <div className="reading-header">
        {chapterLoading ? (
          <div className="skel skel--title" style={{ width: '60%' }} />
        ) : chapter ? (
          <>
            <p className="reading-header__arabic" lang="ar">{chapter.nameArabic}</p>
            <h1 className="reading-header__title">
              {chapter.nameSimple}
              <span className="reading-header__num">Surah {chapter.id}</span>
            </h1>
            <p className="reading-header__meta">
              {chapter.translatedName?.name ?? ''} ·{' '}
              {chapter.versesCount} verses ·{' '}
              {chapter.revelationPlace === 'makkah' ? 'Meccan' : 'Medinan'}
            </p>
          </>
        ) : null}

        {/* Bismillah (shown for all chapters except At-Tawbah, id=9) */}
        {chapter && chapter.id !== 9 && (
          <p className="reading-bismillah" lang="ar" aria-label="Bismillah">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
        )}
      </div>

      {/* ── Verse list ── */}
      {loading ? (
        <div className="verse-skel-list">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="verse-skel">
              <div className="skel skel--line" style={{ width: '100%', height: '3rem' }} />
              <div className="skel skel--line" style={{ width: '80%' }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="error-banner">{error}</div>
      ) : (
        <ol className="verse-list" aria-label="Verses">
          {verses.map((verse) => (
            <VerseCard
              key={verse.verseKey}
              verse={verse}
              isAudioOpen={activeAudioKey === verse.verseKey}
              isReflecting={reflectKey === verse.verseKey}
              reflectText={reflectText}
              reflectSaved={reflectSaved === verse.verseKey}
              reflectRef={reflectKey === verse.verseKey ? reflectRef : undefined}
              onToggleAudio={() => toggleAudio(verse.verseKey)}
              onOpenReflect={() => openReflect(verse.verseKey)}
              onReflectTextChange={setReflectText}
              onSaveReflection={() => saveReflection(verse)}
            />
          ))}
        </ol>
      )}

      {/* ── Pagination ── */}
      {pagination && pagination.totalPages > 1 && !loading && !error && (
        <div className="reading-pagination">
          <button
            type="button"
            className="btn btn--ghost"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Previous
          </button>
          <span className="reading-pagination__info">
            Page {pagination.currentPage} of {pagination.totalPages}
            <span className="reading-pagination__total">
              {pagination.totalRecords} verses
            </span>
          </span>
          <button
            type="button"
            className="btn btn--ghost"
            disabled={!pagination.nextPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Chapter navigation ── */}
      <div className="ch-detail-nav">
        {chapterId > 1 && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => { setPage(1); navigate(`/chapters/${chapterId - 1}/read`) }}
          >
            ← Previous Surah
          </button>
        )}
        <Link to={`/chapters/${chapterId}`} className="btn btn--ghost">
          Chapter info
        </Link>
        {chapterId < 114 && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => { setPage(1); navigate(`/chapters/${chapterId + 1}/read`) }}
          >
            Next Surah →
          </button>
        )}
      </div>
    </div>
  )
}

