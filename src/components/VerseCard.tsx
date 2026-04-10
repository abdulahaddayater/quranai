import { Link } from 'react-router-dom'
import type { Verse } from '../lib/versesApi'
import { loadReflections } from '../lib/reflections'

interface VerseCardProps {
  verse: Verse
  isAudioOpen: boolean
  isReflecting: boolean
  reflectText: string
  reflectSaved: boolean
  reflectRef?: React.RefObject<HTMLTextAreaElement | null>
  onToggleAudio: () => void
  onOpenReflect: () => void
  onReflectTextChange: (v: string) => void
  onSaveReflection: () => void
}

export function VerseCard({
  verse,
  isAudioOpen,
  isReflecting,
  reflectText,
  reflectSaved,
  reflectRef,
  onToggleAudio,
  onOpenReflect,
  onReflectTextChange,
  onSaveReflection,
}: VerseCardProps) {
  // Count existing reflections for this verse
  const existingCount = loadReflections().filter((r) => r.verseRef === verse.verseKey).length

  return (
    <li className="verse-card">
      <div className="verse-card__num-wrap">
        <span className="verse-card__num" aria-label={`Verse ${verse.verseNumber}`}>
          {verse.verseNumber}
        </span>
      </div>

      <p className="verse-card__arabic" lang="ar" dir="rtl">
        {verse.arabic}
      </p>

      <p className="verse-card__translation">
        {verse.translation || <em className="verse-card__missing">Translation unavailable</em>}
      </p>

      <div className="verse-card__actions">
        <button
          type="button"
          className={`verse-btn${isAudioOpen ? ' verse-btn--active' : ''}`}
          onClick={onToggleAudio}
          aria-expanded={isAudioOpen}
          aria-label={isAudioOpen ? 'Hide audio' : 'Play recitation'}
        >
          {isAudioOpen ? '⏸ Audio' : '▶ Play'}
        </button>
        <button
          type="button"
          className={`verse-btn${isReflecting ? ' verse-btn--active' : ''}`}
          onClick={onOpenReflect}
          aria-expanded={isReflecting}
        >
          ✍ Reflect{existingCount > 0 ? ` (${existingCount})` : ''}
        </button>
        <Link
          to={`/verse/${verse.verseKey}`}
          className="verse-btn"
          aria-label="Open verse detail"
        >
          Tafsir →
        </Link>
      </div>

      {isAudioOpen && (
        <div className="verse-card__audio fade-in">
          <audio
            controls
            autoPlay
            preload="auto"
            src={verse.audioUrl}
            className="verse-audio-el"
            aria-label={`Recitation of verse ${verse.verseKey}`}
          >
            Your browser does not support audio.
          </audio>
        </div>
      )}

      {isReflecting && (
        <div className="verse-card__reflect fade-in">
          {reflectSaved ? (
            <p className="verse-reflect__saved">✓ Reflection saved</p>
          ) : (
            <>
              <textarea
                ref={reflectRef}
                className="verse-reflect__input"
                rows={3}
                placeholder={`What does ${verse.verseKey} mean to you today?`}
                value={reflectText}
                onChange={(e) => onReflectTextChange(e.target.value)}
                maxLength={1000}
              />
              <div className="verse-reflect__row">
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  disabled={!reflectText.trim()}
                  onClick={onSaveReflection}
                >
                  Save reflection
                </button>
                <span className="verse-reflect__count">
                  {reflectText.length}/1000
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </li>
  )
}
