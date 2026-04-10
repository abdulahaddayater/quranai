import { Link } from 'react-router-dom'
import type { Chapter } from '../lib/chaptersApi'

type Props = {
  chapter: Chapter
  bookmarked?: boolean
  visited?: boolean
  onToggleBookmark?: (id: number) => void
}

export function ChapterCard({ chapter, bookmarked = false, visited = false, onToggleBookmark }: Props) {
  const place = chapter.revelationPlace === 'makkah' ? 'Meccan' : 'Medinan'
  const placeClass = chapter.revelationPlace === 'makkah' ? 'tag--makkah' : 'tag--madani'

  return (
    <div className={`ch-card${visited ? ' ch-card--visited' : ''}`}>
      <Link to={`/chapters/${chapter.id}`} className="ch-card__inner">
        <span className="ch-card__num">{chapter.id}</span>
        <div className="ch-card__body">
          <span className="ch-card__arabic" lang="ar">
            {chapter.nameArabic}
          </span>
          <span className="ch-card__name">{chapter.nameSimple}</span>
          <span className="ch-card__en">{chapter.translatedName?.name ?? '—'}</span>
        </div>
        <div className="ch-card__meta">
          <span className={`tag ${placeClass}`}>{place}</span>
          <span className="ch-card__verses">{chapter.versesCount} v.</span>
          {visited ? <span className="ch-card__dot" aria-label="Visited" /> : null}
        </div>
      </Link>
      {onToggleBookmark ? (
        <button
          type="button"
          className={`ch-card__bm${bookmarked ? ' ch-card__bm--on' : ''}`}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          onClick={(e) => {
            e.preventDefault()
            onToggleBookmark(chapter.id)
          }}
        >
          {bookmarked ? '★' : '☆'}
        </button>
      ) : null}
    </div>
  )
}
