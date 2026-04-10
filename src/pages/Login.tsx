import { type FormEvent, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AVATAR_COLORS } from '../lib/auth'

export function Login() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const [name, setName] = useState('')
  const [color, setColor] = useState<string>(AVATAR_COLORS[0]!.value)
  const [error, setError] = useState('')

  if (isAuthenticated) return <Navigate to={from} replace />

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Please enter your name to continue.')
      return
    }
    if (trimmed.length > 40) {
      setError('Name must be 40 characters or fewer.')
      return
    }
    login(trimmed, color)
    navigate(from, { replace: true })
  }

  const initial = name.trim()[0]?.toUpperCase() ?? '?'

  return (
    <div className="login-shell">
      <div className="login-glow" aria-hidden />

      <div className="login-card" role="main">
        {/* Brand */}
        <div className="login-brand">
          <span className="login-brand__dot" style={{ background: color }} aria-hidden />
          <span className="login-brand__name">Quran Companion AI</span>
        </div>

        {/* Arabic greeting */}
        <p className="login-arabic" lang="ar" dir="rtl">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>

        <h1 className="login-title">Welcome</h1>
        <p className="login-sub">
          Choose a name and avatar to begin your personal Quran journey. Everything stays
          private on this device — no account required.
        </p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Avatar preview */}
          <div className="avatar-preview" style={{ background: color }} aria-hidden>
            {initial}
          </div>

          {/* Name field */}
          <div className="field-group">
            <label className="field-label" htmlFor="login-name">
              Your name
            </label>
            <input
              id="login-name"
              type="text"
              className={`field-input${error ? ' field-input--err' : ''}`}
              placeholder="e.g. Abdullah, Fatima…"
              value={name}
              autoComplete="given-name"
              autoFocus
              maxLength={40}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError('')
              }}
            />
            {error && <p className="field-err" role="alert">{error}</p>}
          </div>

          {/* Color picker */}
          <div className="field-group">
            <span className="field-label">Avatar colour</span>
            <div className="color-picker" role="radiogroup" aria-label="Choose avatar colour">
              {AVATAR_COLORS.map(({ value, label }) => (
                <label key={value} className="color-swatch-label" title={label}>
                  <input
                    type="radio"
                    name="avatar-color"
                    value={value}
                    checked={color === value}
                    onChange={() => setColor(value)}
                    className="sr-only"
                  />
                  <span
                    className={`color-swatch${color === value ? ' color-swatch--selected' : ''}`}
                    style={{ background: value }}
                    aria-label={label}
                  />
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn--primary btn--login">
            Begin your journey
          </button>
        </form>

        <p className="login-note">
          Your progress, reflections, and bookmarks are saved locally on this device and never
          sent to a server.
        </p>
      </div>
    </div>
  )
}
