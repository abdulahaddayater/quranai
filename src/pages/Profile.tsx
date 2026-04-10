import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AppLoader } from '../components/AppLoader'
import { AVATAR_COLORS, getInitials } from '../lib/auth'
import { readHabitState } from '../lib/habits'
import { getJourneyCount, loadBookmarks } from '../lib/chaptersStore'
import { loadReflections } from '../lib/reflections'
import { loadCollections } from '../lib/collections'

const ALL_KEYS = [
  'qca_profile_v1',
  'qca_habit_v1',
  'qca_bookmarks_v1',
  'qca_journey_v1',
  'qca_reflections_v1',
  'qca_collections_v1',
  'qca_lang_v1',
]

export function Profile() {
  const { user, isLoading, updateProfile, logout } = useAuth()
  const navigate = useNavigate()

  const [editName, setEditName] = useState(user?.displayName ?? '')
  const [editColor, setEditColor] = useState(user?.avatarColor ?? AVATAR_COLORS[0]!.value)
  const [saved, setSaved] = useState(false)
  const [nameErr, setNameErr] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)

  const habit = readHabitState()
  const journeyCount = getJourneyCount()
  const bookmarkCount = loadBookmarks().size
  const reflectionCount = loadReflections().length
  const collectionCount = loadCollections().length

  const handleSave = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = editName.trim()
    if (!trimmed) { setNameErr('Name cannot be empty.'); return }
    if (trimmed.length > 40) { setNameErr('Max 40 characters.'); return }
    updateProfile({ displayName: trimmed, avatarColor: editColor })
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleClearData = () => {
    ALL_KEYS.forEach((k) => localStorage.removeItem(k))
    logout()
    navigate('/login', { replace: true })
  }

  if (isLoading) return <AppLoader />
  if (!user) {
    return (
      <div className="page fade-in">
        <div className="auth-wall">
          <p className="auth-wall__msg">You need to be signed in to view your profile.</p>
          <Link to="/login" className="btn btn--primary">Continue with Quran</Link>
        </div>
      </div>
    )
  }

  const initials = getInitials(user.displayName)
  const joinDate = new Date(user.joinedAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="page fade-in">
      <div className="page__header">
        <h1 className="page__title">Profile</h1>
        <p className="page__subtitle">Manage your personal settings and view your journey summary.</p>
      </div>

      {/* ── Avatar + summary ── */}
      <div className="profile-hero card">
        <div className="profile-hero__avatar" style={{ background: user.avatarColor }}>
          {initials}
        </div>
        <div className="profile-hero__info">
          <h2 className="profile-hero__name">{user.displayName}</h2>
          <p className="profile-hero__since">Member since {joinDate}</p>
          <div className="profile-hero__stats">
            <span><strong>{habit.streak}</strong> day streak</span>
            <span><strong>{habit.totalActiveDays}</strong> total days</span>
            <span><strong>{journeyCount}</strong> surahs explored</span>
            <span><strong>{bookmarkCount}</strong> bookmarks</span>
            <span><strong>{reflectionCount}</strong> reflections</span>
            <span><strong>{collectionCount}</strong> collections</span>
          </div>
        </div>
      </div>

      {/* ── Edit profile ── */}
      <section className="card">
        <h2 className="card__title">Edit profile</h2>
        <form onSubmit={handleSave} noValidate className="profile-form">
          <div className="field-group">
            <label className="field-label" htmlFor="profile-name">Display name</label>
            <input
              id="profile-name"
              type="text"
              className={`field-input${nameErr ? ' field-input--err' : ''}`}
              value={editName}
              maxLength={40}
              onChange={(e) => { setEditName(e.target.value); setNameErr('') }}
            />
            {nameErr && <p className="field-err" role="alert">{nameErr}</p>}
          </div>

          <div className="field-group">
            <span className="field-label">Avatar colour</span>
            <div className="color-picker" role="radiogroup" aria-label="Choose avatar colour">
              {AVATAR_COLORS.map(({ value, label }) => (
                <label key={value} className="color-swatch-label" title={label}>
                  <input
                    type="radio"
                    name="profile-color"
                    value={value}
                    checked={editColor === value}
                    onChange={() => setEditColor(value)}
                    className="sr-only"
                  />
                  <span
                    className={`color-swatch${editColor === value ? ' color-swatch--selected' : ''}`}
                    style={{ background: value }}
                    aria-label={label}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="row-actions">
            <button type="submit" className="btn btn--primary">
              {saved ? '✓ Saved!' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>

      {/* ── Data ── */}
      <section className="card card--soft">
        <h2 className="card__title">Your data</h2>
        <p className="card__muted" style={{ marginBottom: '1rem' }}>
          All your data lives locally on this device. Nothing is sent to any server.
        </p>
        <div className="row-actions">
          <button type="button" className="btn btn--ghost" onClick={handleLogout}>
            Sign out
          </button>
          {!confirmClear ? (
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => setConfirmClear(true)}
            >
              Clear all data
            </button>
          ) : (
            <div className="confirm-block">
              <p className="confirm-block__msg">
                This will permanently delete all your progress, reflections, bookmarks, and profile. Are you sure?
              </p>
              <div className="row-actions">
                <button type="button" className="btn btn--danger" onClick={handleClearData}>
                  Yes, clear everything
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => setConfirmClear(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
