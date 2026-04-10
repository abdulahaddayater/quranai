import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getVerseByKey, type Verse } from '../lib/versesApi'
import { addReflection, deleteReflection, loadReflections, type ReflectionEntry } from '../lib/reflections'
import { ExpandableText } from '../components/ExpandableText'
import { recordActivity } from '../lib/habits'

export function VerseDetail() {
  const { key } = useParams<{ key: string }>()

  const [verse, setVerse] = useState<Verse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [reflections, setReflections] = useState<ReflectionEntry[]>([])
  const [reflectText, setReflectText] = useState('')
  const [reflectErr, setReflectErr] = useState('')
  const [reflectSaved, setReflectSaved] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Parse chapter id from key ("2:255" → 2)
  const chapterId = key ? parseInt(key.split(':')[0] ?? '0', 10) : null

  useEffect(() => { recordActivity() }, [])

  useEffect(() => {
    if (!key) return
    setLoading(true)
    setError(null)
    setVerse(null)

    getVerseByKey(key)
      .then((v) => {
        setVerse(v)
        setReflections(loadReflections().filter((r) => r.verseRef === v.verseKey))
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : 'Failed to load verse.'),
      )
      .finally(() => setLoading(false))
  }, [key])

  const handleSave = () => {
    const trimmed = reflectText.trim()
    if (!trimmed) { setReflectErr('Please write something before saving.'); return }
    if (trimmed.length > 1000) { setReflectErr('Maximum 1,000 characters.'); return }
    if (!verse) return

    const entry = addReflection({ text: trimmed, verseRef: verse.verseKey })
    setReflections((prev) => [entry, ...prev])
    setReflectText('')
    setReflectErr('')
    setReflectSaved(true)
    setTimeout(() => setReflectSaved(false), 2200)
  }

  const handleDelete = (id: string) => {
    deleteReflection(id)
    setReflections((prev) => prev.filter((r) => r.id !== id))
    setDeleteConfirm(null)
  }

  if (loading) {
    return (
      <div className="page fade-in">
        <div className="detail-skel">
          <div className="skel skel--line" style={{ width: '40%', height: '1.5rem', marginBottom: '1.5rem' }} />
          <div className="skel skel--block" style={{ height: '6rem' }} />
          <div className="skel skel--line" style={{ width: '85%' }} />
          <div className="skel skel--line" style={{ width: '70%' }} />
        </div>
      </div>
    )
  }

  if (error || !verse) {
    return (
      <div className="page fade-in">
        <p className="error-banner">{error ?? 'Verse not found.'}</p>
        <Link to="/chapters" className="btn btn--ghost">Back to chapters</Link>
      </div>
    )
  }

  const [surahId, ayahNum] = verse.verseKey.split(':')

  return (
    <div className="page fade-in">
      {/* ── Breadcrumb ── */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/chapters" className="breadcrumb__link">Chapters</Link>
        <span className="breadcrumb__sep" aria-hidden>›</span>
        {chapterId && (
          <>
            <Link to={`/chapters/${chapterId}`} className="breadcrumb__link">
              Surah {chapterId}
            </Link>
            <span className="breadcrumb__sep" aria-hidden>›</span>
            <Link to={`/chapters/${chapterId}/read`} className="breadcrumb__link">
              Reading
            </Link>
            <span className="breadcrumb__sep" aria-hidden>›</span>
          </>
        )}
        <span>Verse {verse.verseKey}</span>
      </nav>

      {/* ── Verse key badge ── */}
      <div className="vd-key">
        <span className="vd-key__badge">
          Surah {surahId} · Ayah {ayahNum}
        </span>
      </div>

      {/* ── Arabic text ── */}
      <div className="vd-arabic-wrap">
        <p className="vd-arabic" lang="ar" dir="rtl">
          {verse.arabic}
        </p>
      </div>

      {/* ── Translation ── */}
      <section className="card vd-card">
        <h2 className="card__title">Translation</h2>
        <p className="vd-translation">
          {verse.translation || <em className="card__muted">Translation unavailable</em>}
        </p>
        <p className="card__fine">Sahih International</p>
      </section>

      {/* ── Audio ── */}
      <section className="card vd-card">
        <h2 className="card__title">Recitation</h2>
        <audio
          controls
          preload="none"
          src={verse.audioUrl}
          className="vd-audio"
          aria-label={`Recitation of verse ${verse.verseKey}`}
        >
          Your browser does not support audio.
        </audio>
        <p className="card__fine">Mishary Rashid Alafasy · 128 kbps</p>
      </section>

      {/* ── Tafsir ── */}
      {verse.tafsir ? (
        <section className="card vd-card">
          <h2 className="card__title">Tafsir</h2>
          <ExpandableText text={verse.tafsir} collapsedChars={500} />
          <p className="card__fine">Ibn Kathir (Abridged)</p>
        </section>
      ) : (
        <section className="card vd-card">
          <h2 className="card__title">Tafsir</h2>
          <p className="card__muted">
            Tafsir is not available for this verse in the current language.
          </p>
        </section>
      )}

      {/* ── Reflect ── */}
      <section className="card vd-card">
        <h2 className="card__title">Your reflection</h2>
        <p className="card__muted" style={{ marginBottom: '1rem' }}>
          What does this verse mean in your life today?
        </p>
        <textarea
          ref={textareaRef}
          className="field-input vd-reflect-input"
          rows={4}
          placeholder={`Reflect on verse ${verse.verseKey}…`}
          value={reflectText}
          onChange={(e) => { setReflectText(e.target.value); setReflectErr('') }}
          maxLength={1000}
          aria-label="Your reflection"
        />
        {reflectErr && <p className="field-err">{reflectErr}</p>}
        <div className="vd-reflect-row">
          {reflectSaved ? (
            <span className="vd-reflect-saved">✓ Saved</span>
          ) : (
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleSave}
            >
              Save reflection
            </button>
          )}
          <span className="card__fine">{reflectText.length}/1000</span>
        </div>
      </section>

      {/* ── Past reflections for this verse ── */}
      {reflections.length > 0 && (
        <section className="card vd-card">
          <h2 className="card__title">Past reflections on this verse</h2>
          <ul className="vd-reflections">
            {reflections.map((r) => (
              <li key={r.id} className="vd-reflection-item">
                <p className="vd-reflection-item__text">{r.text}</p>
                <div className="vd-reflection-item__footer">
                  <time dateTime={r.createdAt} className="card__fine">
                    {new Date(r.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </time>
                  {deleteConfirm === r.id ? (
                    <span className="vd-delete-confirm">
                      Delete?{' '}
                      <button
                        type="button"
                        className="text-btn text-btn--danger"
                        onClick={() => handleDelete(r.id)}
                      >
                        Yes
                      </button>
                      {' / '}
                      <button
                        type="button"
                        className="text-btn"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="text-btn text-btn--danger"
                      onClick={() => setDeleteConfirm(r.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Navigation ── */}
      <div className="ch-detail-nav">
        {chapterId && (
          <Link to={`/chapters/${chapterId}/read`} className="btn btn--ghost">
            ← Back to reading
          </Link>
        )}
        <Link to="/reflection" className="btn btn--ghost">
          All reflections
        </Link>
      </div>
    </div>
  )
}
