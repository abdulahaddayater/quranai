import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AppLoader } from '../components/AppLoader'
import { readHabitState, recordActivity } from '../lib/habits'
import { getDailyChapterId, getChapterById, Language, type Chapter } from '../lib/chaptersApi'
import { getJourneyCount, loadBookmarks } from '../lib/chaptersStore'
import { localDateKey } from '../lib/moods'
import { loadReflections } from '../lib/reflections'
import { loadCollections } from '../lib/collections'
import { getInitials } from '../lib/auth'
import {
  getCachedDailyVerse,
  cacheDailyVerse,
  getRandomVerse,
  type Verse,
} from '../lib/versesApi'

function timeGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function Dashboard() {
  const { user, isLoading } = useAuth()
  const { pathname } = useLocation()

  // Auth hasn't finished reading from storage yet
  if (isLoading) return <AppLoader />

  // AuthGuard guarantees authentication, but guard again for type safety
  if (!user) {
    return (
      <div className="page fade-in">
        <div className="auth-wall">
          <p className="auth-wall__msg">Please sign in to view your dashboard.</p>
          <Link to="/login" className="btn btn--primary">Continue with Quran</Link>
        </div>
      </div>
    )
  }
  const [habit, setHabit] = useState(() => readHabitState())
  const [dailySurah, setDailySurah] = useState<Chapter | null>(null)
  const [surahLoading, setSurahLoading] = useState(true)
  const [dailyAyah, setDailyAyah] = useState<Verse | null>(null)
  const [ayahLoading, setAyahLoading] = useState(true)

  const reflections = loadReflections()
  const today = localDateKey()
  const journeyCount = getJourneyCount()
  const bookmarks = loadBookmarks()
  const collections = loadCollections()
  const weekGoal = 7
  const streakProgress = Math.min(100, Math.round((habit.streak / weekGoal) * 100))
  const journeyProgress = Math.round((journeyCount / 114) * 100)
  const dailyId = getDailyChapterId(today)
  const greeting = timeGreeting()

  useEffect(() => {
    recordActivity()
    setHabit(readHabitState())
  }, [pathname])

  useEffect(() => {
    setSurahLoading(true)
    getChapterById(dailyId, Language.ENGLISH)
      .then(setDailySurah)
      .catch(() => setDailySurah(null))
      .finally(() => setSurahLoading(false))
  }, [dailyId])

  useEffect(() => {
    setAyahLoading(true)
    const cached = getCachedDailyVerse(today)
    if (cached) {
      setDailyAyah(cached)
      setAyahLoading(false)
      return
    }
    getRandomVerse()
      .then((v) => {
        cacheDailyVerse(today, v)
        setDailyAyah(v)
      })
      .catch(() => setDailyAyah(null))
      .finally(() => setAyahLoading(false))
  }, [today])

  return (
    <div className="page fade-in">
      {/* ── Personalised greeting ── */}
      <div className="dash-greeting">
        {user && (
          <div
            className="dash-greeting__avatar"
            style={{ background: user.avatarColor }}
            aria-hidden
          >
            {getInitials(user.displayName)}
          </div>
        )}
        <div>
          <h1 className="page__title" style={{ margin: 0 }}>
            {greeting}{user ? `, ${user.displayName}` : ''}
          </h1>
          <p className="page__subtitle" style={{ marginTop: '0.25rem' }}>
            <time dateTime={today}>{today}</time>
            {habit.streak > 1 ? ` · 🔥 ${habit.streak}-day streak` : ' · Day 1 — welcome!'}
          </p>
        </div>
      </div>

      {/* ── Daily Surah ── */}
      <section className="card card--surah-of-day">
        <p className="eyebrow">Today's Surah for you</p>
        {surahLoading ? (
          <p className="card__muted shimmer">Selecting your surah…</p>
        ) : dailySurah ? (
          <div className="surah-rec">
            <div className="surah-rec__left">
              <span className="surah-rec__num">{dailySurah.id}</span>
              <div>
                <h2 className="surah-rec__name">{dailySurah.nameSimple}</h2>
                <p className="surah-rec__sub">
                  {dailySurah.translatedName?.name ?? ''}{dailySurah.translatedName?.name ? ' · ' : ''}
                  {dailySurah.versesCount} verses ·{' '}
                  {dailySurah.revelationPlace === 'makkah' ? 'Meccan' : 'Medinan'}
                </p>
              </div>
            </div>
            <p className="surah-rec__arabic" lang="ar">{dailySurah.nameArabic}</p>
          </div>
        ) : (
          <p className="card__muted">Could not load today's surah.</p>
        )}
        <div className="row-actions">
          {dailySurah && (
            <Link to={`/chapters/${dailySurah.id}`} className="btn btn--primary">
              Explore surah
            </Link>
          )}
          <Link to="/guidance" className="btn btn--ghost">Daily guidance</Link>
          <Link to="/chapters" className="btn btn--ghost">Browse all</Link>
        </div>
      </section>

      {/* ── Daily Ayah ── */}
      <section className="card daily-ayah">
        <p className="eyebrow">Today's Ayah</p>
        {ayahLoading ? (
          <>
            <div className="skel skel--block" style={{ height: '3.5rem', marginBottom: '0.75rem' }} />
            <div className="skel skel--line" style={{ width: '80%' }} />
          </>
        ) : dailyAyah ? (
          <>
            <p className="daily-ayah__arabic" lang="ar" dir="rtl">
              {dailyAyah.arabic}
            </p>
            <p className="daily-ayah__translation">
              {dailyAyah.translation}
            </p>
            <p className="daily-ayah__ref">{dailyAyah.verseKey}</p>
            <div className="row-actions" style={{ marginTop: '1rem' }}>
              <Link to={`/verse/${dailyAyah.verseKey}`} className="btn btn--primary">
                Read &amp; Reflect
              </Link>
              <Link
                to={`/chapters/${dailyAyah.verseKey.split(':')[0]}/read`}
                className="btn btn--ghost"
              >
                Read Surah
              </Link>
            </div>
          </>
        ) : (
          <p className="card__muted">Could not load today's ayah.</p>
        )}
      </section>

      {/* ── Habit stats ── */}
      <section className="grid-2">
        <div className="card card--accent">
          <h2 className="card__title">Streak</h2>
          <p className="stat-big">{habit.streak}</p>
          <p className="card__muted">consecutive days active</p>
          <div className="meter" aria-hidden>
            <div className="meter__fill" style={{ width: `${streakProgress}%` }} />
          </div>
          <p className="card__fine">
            Weekly goal: {Math.min(habit.streak, weekGoal)} / {weekGoal} days
          </p>
        </div>

        <div className="card">
          <h2 className="card__title">Presence</h2>
          <p className="stat-big stat-big--gold">{habit.totalActiveDays}</p>
          <p className="card__muted">total days spent here</p>
          <Link to="/guidance" className="btn btn--primary btn--block">
            Open daily guidance
          </Link>
        </div>
      </section>

      {/* ── Journey + Bookmarks ── */}
      <section className="grid-2">
        <div className="card card--soft">
          <h2 className="card__title">Surah journey</h2>
          <p className="stat-big">{journeyCount}</p>
          <p className="card__muted">of 114 surahs explored</p>
          <div className="meter" aria-hidden>
            <div className="meter__fill" style={{ width: `${journeyProgress}%` }} />
          </div>
          <Link to="/chapters" className="text-btn" style={{ marginTop: '0.65rem', display: 'inline-block' }}>
            Continue journey →
          </Link>
        </div>

        <div className="card card--soft">
          <h2 className="card__title">Bookmarks</h2>
          <p className="stat-big stat-big--gold">{bookmarks.size}</p>
          <p className="card__muted">
            {bookmarks.size === 0
              ? 'No surahs saved yet.'
              : `surah${bookmarks.size !== 1 ? 's' : ''} saved`}
          </p>
          {bookmarks.size > 0 ? (
            <Link to="/chapters" className="text-btn" style={{ marginTop: '0.65rem', display: 'inline-block' }}>
              View bookmarks →
            </Link>
          ) : (
            <Link to="/chapters" className="btn btn--ghost btn--block" style={{ marginTop: '0.75rem' }}>
              Browse chapters
            </Link>
          )}
        </div>
      </section>

      {/* ── Collections ── */}
      <section className="card card--soft">
        <div className="row-between">
          <h2 className="card__title">Collections</h2>
          <Link to="/collections" className="text-btn">Manage</Link>
        </div>
        {collections.length === 0 ? (
          <p className="card__muted">
            No collections yet. Save verses from Daily Guidance into named groups.
          </p>
        ) : (
          <ul className="coll-preview">
            {collections.slice(0, 3).map((c) => (
              <li key={c.id} className="coll-preview__item">
                <span className="coll-preview__name">{c.name}</span>
                <span className="coll-preview__count">{c.verseRefs.length} verse{c.verseRefs.length !== 1 ? 's' : ''}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Reflections ── */}
      <section className="card card--soft">
        <div className="row-between">
          <h2 className="card__title">Reflections</h2>
          <Link to="/reflection" className="text-btn">View all</Link>
        </div>
        {reflections.length === 0 ? (
          <p className="card__muted">
            No reflections yet. After guidance, capture what settled in your heart.
          </p>
        ) : (
          <ul className="reflection-preview">
            {reflections.slice(0, 3).map((r) => (
              <li key={r.id}>
                <p className="reflection-preview__text">{r.text}</p>
                <time className="reflection-preview__time" dateTime={r.createdAt}>
                  {new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
