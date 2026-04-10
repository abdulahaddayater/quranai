import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ExpandableText } from '../components/ExpandableText'
import { getChapterById, getChapterInfo, Language, type Chapter, type ChapterInfo } from '../lib/chaptersApi'
import {
  isBookmarked,
  loadLanguage,
  markChapterVisited,
  toggleBookmark,
} from '../lib/chaptersStore'
import { recordActivity } from '../lib/habits'

export function ChapterDetail() {
  const { id } = useParams<{ id: string }>()
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [info, setInfo] = useState<ChapterInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookmarked, setBookmarked] = useState(false)
  const [learnOpen, setLearnOpen] = useState(false)
  const learnRef = useRef<HTMLDivElement>(null)

  const lang = loadLanguage()
  const apiLang = lang === 'ur' ? Language.URDU : Language.ENGLISH

  useEffect(() => {
    recordActivity()
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    setChapter(null)
    setInfo(null)

    Promise.all([
      getChapterById(id, apiLang),
      getChapterInfo(id, apiLang),
    ])
      .then(([ch, inf]) => {
        setChapter(ch)
        setInfo(inf)
        markChapterVisited(ch.id)
        setBookmarked(isBookmarked(ch.id))
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load chapter.'))
      .finally(() => setLoading(false))
  }, [id, apiLang])

  const handleBookmark = () => {
    if (!chapter) return
    const next = toggleBookmark(chapter.id)
    setBookmarked(next)
  }

  const handleLearnToggle = () => {
    setLearnOpen((o) => !o)
    if (!learnOpen) {
      setTimeout(() => learnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }
  }

  const place = chapter?.revelationPlace === 'makkah' ? 'Meccan' : 'Medinan'
  const placeClass = chapter?.revelationPlace === 'makkah' ? 'tag--makkah' : 'tag--madani'

  if (loading) {
    return (
      <div className="page fade-in">
        <div className="detail-skel">
          <div className="skel skel--title" />
          <div className="skel skel--line" />
          <div className="skel skel--block" />
        </div>
      </div>
    )
  }

  if (error || !chapter) {
    return (
      <div className="page fade-in">
        <p className="error-banner">{error ?? 'Chapter not found.'}</p>
        <Link to="/chapters" className="btn btn--ghost">
          Back to chapters
        </Link>
      </div>
    )
  }

  return (
    <div className="page fade-in">
      {/* ── Breadcrumb ── */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/chapters" className="breadcrumb__link">
          Chapters
        </Link>
        <span className="breadcrumb__sep" aria-hidden>›</span>
        <span>{chapter.nameSimple}</span>
      </nav>

      {/* ── Hero ── */}
      <div className="ch-detail-hero">
        <div className="ch-detail-hero__left">
          <p className="eyebrow">
            Surah {chapter.id} · {chapter.versesCount} verses
          </p>
          <h1 className="ch-detail-hero__title">{chapter.nameSimple}</h1>
          <p className="ch-detail-hero__trans">{chapter.translatedName?.name ?? ''}</p>
          <div className="ch-detail-hero__tags">
            <span className={`tag ${placeClass}`}>{place}</span>
            <span className="tag tag--juz">Revelation order: {chapter.revelationOrder}</span>
            {chapter.bismillahPre && <span className="tag tag--soft">Bismillah pre.</span>}
          </div>
        </div>
        <div className="ch-detail-hero__right">
          <p className="ch-detail-arabic" lang="ar">
            {chapter.nameArabic}
          </p>
          <p className="ch-detail-trans">{chapter.transliteratedName}</p>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="row-actions row-actions--detail">
        <Link
          to={`/chapters/${chapter.id}/read`}
          className="btn btn--primary"
        >
          📖 Read Surah
        </Link>
        <button
          type="button"
          className={`btn ${bookmarked ? 'btn--primary' : 'btn--ghost'}`}
          onClick={handleBookmark}
        >
          {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
        </button>
        <button
          type="button"
          className={`btn ${learnOpen ? 'btn--primary' : 'btn--ghost'}`}
          onClick={handleLearnToggle}
        >
          {learnOpen ? 'Hide Quick Learn' : '⚡ Quick Learn'}
        </button>
        <Link
          to={`https://quran.com/${chapter.id}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn--ghost"
        >
          Quran.com ↗
        </Link>
      </div>

      {/* ── Quick Learn Mode ── */}
      {learnOpen && info ? (
        <section className="quick-learn fade-in" ref={learnRef}>
          <h2 className="quick-learn__heading">⚡ Quick Learn — {chapter.nameSimple}</h2>
          <div className="quick-learn__grid">
            <div className="ql-block ql-block--summary">
              <h3 className="ql-block__label">Short summary</h3>
              <p>{info.shortText || 'No summary available in this language.'}</p>
            </div>
            <div className="ql-block ql-block--key">
              <h3 className="ql-block__label">Why it matters</h3>
              <p>
                {info.shortText
                  ? `Surah ${chapter.nameSimple} (${chapter.translatedName?.name ?? ''}) is a ${place} surah with ${chapter.versesCount} verses, revealed in ${place === 'Meccan' ? 'Makkah during the early period of Islam, addressing core themes of faith, monotheism, and the hereafter.' : 'Madinah, covering societal, legal, and communal guidance for the Muslim community.'}`
                  : 'Consult a scholar or tafsir for deeper context.'}
              </p>
            </div>
            <div className="ql-block ql-block--takeaway">
              <h3 className="ql-block__label">Key takeaway</h3>
              <p>
                {info.shortText
                  ? info.shortText.length > 120
                    ? info.shortText.slice(0, 117) + '…'
                    : info.shortText
                  : `Reflect on Surah ${chapter.nameSimple}'s message in your day.`}
              </p>
            </div>
          </div>
        </section>
      ) : learnOpen && !info ? (
        <p className="card__muted" ref={learnRef}>
          Chapter info unavailable for this language — try switching to English.
        </p>
      ) : null}

      {/* ── Metadata ── */}
      <section className="card ch-meta-card">
        <h2 className="card__title">Metadata</h2>
        <dl className="meta-list">
          <div className="meta-list__row">
            <dt>Arabic name</dt>
            <dd lang="ar">{chapter.nameArabic}</dd>
          </div>
          <div className="meta-list__row">
            <dt>Transliteration</dt>
            <dd>{chapter.transliteratedName}</dd>
          </div>
          <div className="meta-list__row">
            <dt>Translation</dt>
            <dd>{chapter.translatedName?.name ?? '—'}</dd>
          </div>
          <div className="meta-list__row">
            <dt>Revelation type</dt>
            <dd className={`tag tag--inline ${placeClass}`}>{place}</dd>
          </div>
          <div className="meta-list__row">
            <dt>Revelation order</dt>
            <dd>{chapter.revelationOrder}</dd>
          </div>
          <div className="meta-list__row">
            <dt>Verses</dt>
            <dd>{chapter.versesCount}</dd>
          </div>
          <div className="meta-list__row">
            <dt>Pages (Mushaf)</dt>
            <dd>
              {chapter.pages?.length
                ? `${chapter.pages[0]}–${chapter.pages[chapter.pages.length - 1]}`
                : '—'}
            </dd>
          </div>
          <div className="meta-list__row">
            <dt>Bismillah pre.</dt>
            <dd>{chapter.bismillahPre ? 'Yes' : 'No'}</dd>
          </div>
        </dl>
      </section>

      {/* ── Chapter info / description ── */}
      {info ? (
        <section className="card ch-info-card">
          <h2 className="card__title">About this Surah</h2>

          {info.shortText ? (
            <div className="section-block section-block--gold">
              <h3 className="section-block__label">Overview</h3>
              <p className="prose-block">{info.shortText}</p>
            </div>
          ) : null}

          {info.text ? (
            <div className="section-block">
              <h3 className="section-block__label">Full description</h3>
              <ExpandableText text={stripHtml(info.text)} collapsedChars={600} />
              {info.source ? <p className="card__fine">Source: {info.source}</p> : null}
            </div>
          ) : null}

          {!info.shortText && !info.text ? (
            <p className="card__muted">
              No detailed info available in this language. Switch to English for full descriptions.
            </p>
          ) : null}
        </section>
      ) : null}

      {/* ── Navigation ── */}
      <div className="ch-detail-nav">
        {chapter.id > 1 && (
          <Link to={`/chapters/${chapter.id - 1}`} className="btn btn--ghost">
            ← Previous
          </Link>
        )}
        <Link to="/chapters" className="btn btn--ghost">
          All chapters
        </Link>
        {chapter.id < 114 && (
          <Link to={`/chapters/${chapter.id + 1}`} className="btn btn--ghost">
            Next →
          </Link>
        )}
      </div>
    </div>
  )
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s{2,}/g, ' ').trim()
}
