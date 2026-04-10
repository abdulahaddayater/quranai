import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AudioPlayer } from '../components/AudioPlayer'
import { ExpandableText } from '../components/ExpandableText'
import {
  MOOD_LABELS,
  type MoodId,
  pickVerseForDay,
  localDateKey,
} from '../lib/moods'
import { recordActivity } from '../lib/habits'
import { fetchAyahBundle, type AyahBundle } from '../lib/quranApi'
import {
  addVerseToCollection,
  loadCollections,
  createCollection,
  type Collection,
} from '../lib/collections'

const MOODS: MoodId[] = ['stress', 'motivation', 'discipline', 'gratitude']

export function Guidance() {
  const [mood, setMood] = useState<MoodId>('stress')
  const [bundle, setBundle] = useState<AyahBundle | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [collections, setCollections] = useState<Collection[]>(() => loadCollections())
  const [savingTo, setSavingTo] = useState<string | null>(null)
  const [savedMsg, setSavedMsg] = useState('')
  const [collPickerOpen, setCollPickerOpen] = useState(false)

  const dateKey = useMemo(() => localDateKey(), [])
  const context = useMemo(() => pickVerseForDay(mood, dateKey), [mood, dateKey])

  const load = useCallback(() => {
    setError(null)
    setLoading(true)
    setBundle(null)
    fetchAyahBundle(context.ref)
      .then((data) => {
        setBundle(data)
      })
      .catch((e: unknown) => {
        setBundle(null)
        setError(e instanceof Error ? e.message : 'Something went wrong.')
      })
      .finally(() => setLoading(false))
  }, [context.ref])

  useEffect(() => {
    recordActivity()
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="page fade-in">
      <div className="page__header">
        <h1 className="page__title">Daily guidance</h1>
        <p className="page__subtitle">
          Choose how you’re arriving today. We’ll pair you with a verse, its meaning, and sound.
        </p>
      </div>

      <div className="mood-grid">
        {MOODS.map((id) => {
          const m = MOOD_LABELS[id]
          return (
            <button
              key={id}
              type="button"
              className={`mood-card${mood === id ? ' mood-card--active' : ''}`}
              onClick={() => setMood(id)}
            >
              <span className="mood-card__title">{m.title}</span>
              <span className="mood-card__blurb">{m.blurb}</span>
            </button>
          )
        })}
      </div>

      <section className="card verse-card">
        <div className="row-between verse-card__head">
          <div>
            <p className="eyebrow">Selected for you · {dateKey}</p>
            <h2 className="verse-card__ref">
              {bundle
                ? `Surah ${bundle.surahName} (${bundle.surahNumber}:${bundle.numberInSurah})`
                : `Verse ${context.ref}`}
            </h2>
          </div>
          <button type="button" className="btn btn--ghost btn--small" onClick={load} disabled={loading}>
            Refresh verse
          </button>
        </div>

        {error ? <p className="error-banner">{error}</p> : null}

        {loading && !bundle ? (
          <p className="card__muted shimmer">Gathering Arabic, translation, and tafsir…</p>
        ) : null}

        {bundle ? (
          <>
            <blockquote className="arabic-block" lang="ar" dir="rtl">
              {bundle.arabic}
            </blockquote>
            <p className="translation-block">{bundle.translation}</p>

            <div className="section-block">
              <h3 className="section-block__label">Tafsir snapshot</h3>
              {bundle.tafsir ? (
                <ExpandableText text={bundle.tafsir} collapsedChars={640} />
              ) : (
                <p className="card__muted">
                  Tafsir text could not be loaded. You can still reflect on the translation and the
                  application below.
                </p>
              )}
              <p className="card__fine">
                Abridged English notes (Ibn Kathir) via{' '}
                <a
                  href="https://api.quran.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-link"
                >
                  Quran.com API
                </a>
                .
              </p>
            </div>

            <AudioPlayer src={bundle.audioUrl} />

            <div className="section-block section-block--gold">
              <h3 className="section-block__label">What this means in your daily life</h3>
              <p className="prose-block">{context.dailyLife}</p>
            </div>

            <div className="takeaway">
              <h3 className="takeaway__label">One actionable takeaway</h3>
              <p>{context.takeaway}</p>
            </div>

            {/* ── Save to collection ── */}
            <div className="coll-save-block">
              {savedMsg ? (
                <p className="coll-save-msg">{savedMsg}</p>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn--ghost btn--small"
                    onClick={() => setCollPickerOpen((o) => !o)}
                  >
                    {collPickerOpen ? 'Close' : '＋ Save to collection'}
                  </button>
                  {collPickerOpen && (
                    <div className="coll-picker">
                      {collections.length === 0 ? (
                        <div className="coll-picker__empty">
                          <p>No collections yet.</p>
                          <button
                            type="button"
                            className="btn btn--primary btn--small"
                            onClick={() => {
                              const col = createCollection('My First Collection')
                              setCollections(loadCollections())
                              addVerseToCollection(col.id, bundle.verseKey)
                              setCollPickerOpen(false)
                              setSavedMsg(`Saved to "${col.name}"`)
                              setTimeout(() => setSavedMsg(''), 3000)
                            }}
                          >
                            Create & save
                          </button>
                        </div>
                      ) : (
                        <ul className="coll-picker__list">
                          {collections.map((c) => (
                            <li key={c.id}>
                              <button
                                type="button"
                                className="coll-picker__item"
                                disabled={savingTo === c.id}
                                onClick={() => {
                                  setSavingTo(c.id)
                                  addVerseToCollection(c.id, bundle.verseKey)
                                  setCollPickerOpen(false)
                                  setSavingTo(null)
                                  setSavedMsg(`Saved to "${c.name}"`)
                                  setTimeout(() => setSavedMsg(''), 3000)
                                }}
                              >
                                {c.name}
                                <span className="coll-picker__count">{c.verseRefs.length}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="row-actions">
              <Link
                to="/reflection"
                state={{
                  prefilled: `After ${bundle.surahName} ${bundle.verseKey}: `,
                  verseRef: bundle.verseKey,
                  mood,
                }}
                className="btn btn--primary"
              >
                Write a reflection
              </Link>
              <Link to="/dashboard" className="btn btn--ghost">
                Back to dashboard
              </Link>
            </div>
          </>
        ) : null}
      </section>
    </div>
  )
}
