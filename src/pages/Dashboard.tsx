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
  return 'Assalamu Alaikum'
}

export function Dashboard() {
  const { user, isLoading } = useAuth()
  const { pathname } = useLocation()

  if (isLoading) return <AppLoader />

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
      {/* ── Greeting ── */}
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
            {greeting}{user ? `, ${user.displayName.split(' ')[0]}` : ''}
          </h1>
          <p className="page__subtitle" style={{ marginTop: '0.15rem' }}>
            {habit.streak > 0 ? `Your ${habit.streak}-day streak is going strong.` : 'Welcome to Hidayah AI'}
          </p>
        </div>
      </div>

      {/* ── Daily Highlights ── */}
      <div className="grid-2">
        <section className="card">
          <p className="eyebrow">Surah of the Day</p>
          {surahLoading ? (
            <p className="shimmer">Selecting...</p>
          ) : dailySurah ? (
            <Link to={`/chapters/${dailySurah.id}`} className="mini-surah">
              <span className="mini-surah__num">{dailySurah.id}</span>
              <span className="mini-surah__name">{dailySurah.nameSimple}</span>
            </Link>
          ) : null}
        </section>

        <section className="card">
          <p className="eyebrow">Daily Ayah</p>
          {ayahLoading ? (
            <p className="shimmer">Loading...</p>
          ) : dailyAyah ? (
            <Link to={`/verse/${dailyAyah.verseKey}`} className="mini-surah">
              <span className="mini-surah__num">📖</span>
              <span className="mini-surah__name">{dailyAyah.verseKey}</span>
            </Link>
          ) : null}
        </section>
      </div>

      {/* ── Quick Stats Grid ── */}
      <div className="dash-minimal-grid">
        <div className="mini-stat">
          <span className="mini-stat__val">{habit.streak}</span>
          <span className="mini-stat__label">Streak</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat__val">{bookmarks.size}</span>
          <span className="mini-stat__label">Bookmarks</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat__val">{reflections.length}</span>
          <span className="mini-stat__label">Reflections</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat__val">{collections.length}</span>
          <span className="mini-stat__label">Collections</span>
        </div>
      </div>

      {/* ── Primary Action ── */}
      <section className="dash-actions">
        <Link to="/chapters" className="btn btn--primary btn--block">
          Continue Quran Journey
        </Link>
        <Link to="/guidance" className="btn btn--ghost btn--block">
          Daily Guidance
        </Link>
      </section>

      {/* ── Progress Summary ── */}
      <div className="dash-progress-subtle">
        <p className="dash-progress-subtle__text">
          {journeyCount} surahs explored · {journeyProgress}% complete
        </p>
        <div className="meter meter--subtle">
          <div className="meter__fill" style={{ width: `${journeyProgress}%` }} />
        </div>
      </div>
    </div>
  )
}
