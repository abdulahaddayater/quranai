import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getInitials } from '../lib/auth'

const NAV_LINKS = [
  { to: '/quran', label: 'Read' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/chapters', label: 'Chapters' },
  { to: '/guidance', label: 'Guidance' },
  { to: '/reflection', label: 'Reflections' },
  { to: '/collections', label: 'Collections' },
]

export function Nav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobMenuOpen, setMobMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // User dropdown
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    };
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const handleLogout = () => {
    setMenuOpen(false)
    setMobMenuOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  const initials = user ? getInitials(user.displayName) : '?'
  const avatarColor = user?.avatarColor ?? '#2F5D50'

  return (
    <header className="nav">
      <div className="nav__left">
        <button 
          className="nav__toggle" 
          aria-label="Toggle menu"
          onClick={() => setMobMenuOpen(!mobMenuOpen)}
        >
          <div className={`nav__toggle-icon ${mobMenuOpen ? 'nav__toggle-icon--open' : ''}`} />
        </button>
        <NavLink to="/dashboard" className="nav__brand" onClick={() => setMobMenuOpen(false)}>
          <span className="nav__mark" aria-hidden />
          <span className="nav__title">Hidayah AI</span>
        </NavLink>
      </div>

      <nav className={`nav__links ${mobMenuOpen ? 'nav__links--open' : ''}`} aria-label="Primary">
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav__link${isActive ? ' nav__link--active' : ''}`}
            onClick={() => setMobMenuOpen(false)}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User avatar + dropdown */}
      {user && (
        <div className="nav__user" ref={menuRef}>
          <button
            type="button"
            className="nav__avatar"
            style={{ background: avatarColor }}
            aria-label="User menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {initials}
          </button>

          {menuOpen && (
            <div className="nav__dropdown" role="menu">
              <div className="nav__dropdown-head">
                <span
                  className="nav__dropdown-avatar"
                  style={{ background: avatarColor }}
                >
                  {initials}
                </span>
                <div>
                  <p className="nav__dropdown-name">{user.displayName}</p>
                  <p className="nav__dropdown-sub">Personal profile</p>
                </div>
              </div>
              <div className="nav__dropdown-divider" />
              <Link
                to="/profile"
                className="nav__dropdown-item"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </Link>
              <Link
                to="/collections"
                className="nav__dropdown-item"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                My collections
              </Link>
              <div className="nav__dropdown-divider" />
              <button
                type="button"
                className="nav__dropdown-item nav__dropdown-item--danger"
                role="menuitem"
                onClick={handleLogout}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
