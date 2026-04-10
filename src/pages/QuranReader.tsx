import { useEffect, useState, useMemo } from 'react'
import { getVersesByPage, type Verse } from '../lib/versesApi'
import { loadLastPage, saveLastPage } from '../lib/chaptersStore'
import { recordActivity } from '../lib/habits'
import { getAllChapters, type Chapter } from '../lib/chaptersApi'

export function QuranReader() {
  const [page, setPage] = useState(() => loadLastPage())
  const [verses, setVerses] = useState<Verse[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    recordActivity()
    getAllChapters().then(setChapters).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    
    // Auto-scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' })

    getVersesByPage(page)
      .then((v) => {
        setVerses(v)
        saveLastPage(page)
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Failed to load Quran page.')
      })
      .finally(() => setLoading(false))
  }, [page])

  const handleJump = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const target = Number(formData.get('page'))
    if (!isNaN(target) && target >= 1 && target <= 604) {
      setPage(target)
    }
  }

  const currentPageSurah = useMemo(() => {
    if (!verses.length || !chapters.length) return null
    const firstVerseChapterId = parseInt(verses[0].verseKey.split(':')[0])
    return chapters.find((c) => c.id === firstVerseChapterId)
  }, [verses, chapters])

  return (
    <div className="mushaf-container">
      {error ? (
        <div className="page fade-in">
          <div className="error-banner">{error}</div>
          <div className="qca-center" style={{ marginTop: '2rem' }}>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setPage((p) => (p > 1 ? p : 1))}
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="mushaf-viewport">
          {/* ── Page Navigation Header ── */}
          <header className={`mushaf-ui ${loading ? 'mushaf-ui--loading' : ''}`}>
            <div className="mushaf-ui__inner">
              <button
                type="button"
                className="mushaf-ui__btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous Page"
              >
                ←
              </button>

              <div className="mushaf-ui__meta">
                <form className="mushaf-ui__jump" onSubmit={handleJump}>
                  <input
                    type="number"
                    name="page"
                    min={1}
                    max={604}
                    defaultValue={page}
                    key={page}
                    className="mushaf-ui__input"
                  />
                  <span className="mushaf-ui__total">/ 604</span>
                </form>
              </div>

              <button
                type="button"
                className="mushaf-ui__btn"
                disabled={page >= 604}
                onClick={() => setPage((p) => Math.min(604, p + 1))}
                aria-label="Next Page"
              >
                →
              </button>
            </div>
          </header>

          {/* ── The Mushaf Page Content ── */}
          <main className="mushaf-page-wrap">
            {loading ? (
              <div className="mushaf-skel">
                <div className="mushaf-skel__line" style={{ width: '90%' }} />
                <div className="mushaf-skel__line" style={{ width: '85%' }} />
                <div className="mushaf-skel__line" style={{ width: '95%' }} />
                <div className="mushaf-skel__line" style={{ width: '80%' }} />
                <div className="mushaf-skel__line" style={{ width: '90%' }} />
              </div>
            ) : (
              <div className="mushaf-card fade-in">
                {currentPageSurah && (
                  <div className="mushaf-card__header">
                    <span className="mushaf-card__surah-en">{currentPageSurah.nameSimple}</span>
                    <span className="mushaf-card__surah-ar" lang="ar">{currentPageSurah.nameArabic}</span>
                  </div>
                )}
                
                <div className="mushaf-text" dir="rtl">
                  {verses.map((v) => (
                    <span key={v.verseKey} className="mushaf-verse">
                      {v.arabic}
                      <span className="mushaf-ayah-num">{v.verseNumber}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* ── Floating Progress Indicator ── */}
          {!loading && (
            <div className="mushaf-progress">
              <div 
                className="mushaf-progress__bar" 
                style={{ width: `${(page / 604) * 100}%` }} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
