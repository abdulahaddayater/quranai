import { Link } from 'react-router-dom'
import type { Chapter } from '../lib/chaptersApi'

type Props = {
  chapter: Chapter
  bookmarked?: boolean
  visited?: boolean
  onToggleBookmark?: (id: number) => void
}

export function ChapterCard({ chapter, bookmarked = false, visited = false, onToggleBookmark }: Props) {

  return (
    <div className={`ch-card${visited ? ' ch-card--visited' : ''}`}>
      <Link to={`/chapters/${chapter.id}`} className="ch-card__inner">
        <div className="ch-card__num-wrap">
          <span className="ch-card__num">{chapter.id}</span>
          <span className="ch-card__count">{chapter.versesCount}</span>
        </div>
        <div className="ch-card__body">
          <div className="ch-card__names">
            <span className="ch-card__name">{chapter.nameSimple}</span>
            <span className="ch-card__en">{chapter.translatedName?.name ?? '—'}</span>
          </div>
          <span className="ch-card__arabic" lang="ar">
            {chapter.nameArabic}
          </span>
        </div>
        {visited ? <div className="ch-card__visited-indicator" aria-label="Visited" /> : null}
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
