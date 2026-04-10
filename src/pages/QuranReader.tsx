import { useEffect, useState } from 'react'
import { getVersesByPage, type Verse } from '../lib/versesApi'
import { loadLastPage, saveLastPage } from '../lib/chaptersStore'
import { recordActivity } from '../lib/habits'
import { VerseCard } from '../components/VerseCard'

export function QuranReader() {
  const [page, setPage] = useState(() => loadLastPage())
  const [verses, setVerses] = useState<Verse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    recordActivity()
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

  return (
    <div className="page fade-in">
      <div className="page__header">
        <h1 className="page__title">Read Quran</h1>
        <p className="page__subtitle">
          Read the entire Quran page by page. Your progress is saved automatically.
        </p>
      </div>

      {/* ── Page Navigation ── */}
      <div className="quran-nav">
        <div className="quran-nav__controls">
          <button
            type="button"
            className="btn btn--ghost btn--small"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Prev Page
          </button>
          
          <form className="quran-nav__jump" onSubmit={handleJump}>
            <input
              type="number"
              name="page"
              min={1}
              max={604}
              defaultValue={page}
              key={page} // reset input on page change
              className="quran-nav__input"
              aria-label="Go to page"
            />
            <span className="quran-nav__total">of 604</span>
            <button type="submit" className="btn btn--primary btn--small">Go</button>
          </form>

          <button
            type="button"
            className="btn btn--ghost btn--small"
            disabled={page >= 604}
            onClick={() => setPage((p) => Math.min(604, p + 1))}
          >
            Next Page →
          </button>
        </div>
      </div>

      {error ? (
        <div className="error-banner">{error}</div>
      ) : loading ? (
        <div className="verse-skel-list">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="verse-skel">
              <div className="skel skel--line" style={{ width: '100%', height: '3rem' }} />
              <div className="skel skel--line" style={{ width: '80%' }} />
            </div>
          ))}
        </div>
      ) : (
        <ol className="verse-list" aria-label={`Verses on page ${page}`}>
          {verses.map((verse) => (
            <VerseCard
              key={verse.verseKey}
              verse={verse}
              simple
            />
          ))}
        </ol>
      )}

      {/* ── Footer Nav ── */}
      {!loading && !error && (
        <div className="quran-foot">
          <div className="reading-pagination">
            <button
              type="button"
              className="btn btn--ghost"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Previous Page
            </button>
            <span className="reading-pagination__info">
              Page {page} of 604
            </span>
            <button
              type="button"
              className="btn btn--ghost"
              disabled={page >= 604}
              onClick={() => setPage((p) => Math.min(604, p + 1))}
            >
              Next Page →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
