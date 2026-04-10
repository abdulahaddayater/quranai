import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  clearProfile,
  createProfile,
  loadProfile,
  saveProfile,
  type UserProfile,
} from '../lib/auth'

interface AuthContextValue {
  user: UserProfile | null
  isAuthenticated: boolean
  /** True while the initial profile is being read from storage. */
  isLoading: boolean
  login: (displayName: string, avatarColor: string) => UserProfile
  logout: () => void
  updateProfile: (updates: Partial<Pick<UserProfile, 'displayName' | 'avatarColor'>>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const mounted = useRef(true)

  // Load profile on mount (useEffect keeps the pattern async-safe for
  // future migrations to real network auth without code restructure)
  useEffect(() => {
    mounted.current = true
    try {
      const profile = loadProfile()
      if (mounted.current) {
        setUser(profile)
        if (import.meta.env.DEV) {
          console.debug('[Auth] Session loaded:', profile ? `"${profile.displayName}"` : 'none')
        }
      }
    } catch (err) {
      console.error('[Auth] Failed to load session:', err)
      if (mounted.current) setUser(null)
    } finally {
      if (mounted.current) setIsLoading(false)
    }
    return () => { mounted.current = false }
  }, [])

  const login = useCallback((displayName: string, avatarColor: string): UserProfile => {
    const profile = createProfile(displayName, avatarColor)
    setUser(profile)
    if (import.meta.env.DEV) {
      console.debug('[Auth] Logged in:', profile.displayName)
    }
    return profile
  }, [])

  const logout = useCallback(() => {
    clearProfile()
    setUser(null)
    if (import.meta.env.DEV) {
      console.debug('[Auth] Logged out')
    }
  }, [])

  const updateProfile = useCallback(
    (updates: Partial<Pick<UserProfile, 'displayName' | 'avatarColor'>>) => {
      setUser((prev) => {
        if (!prev) return prev
        const next = { ...prev, ...updates }
        saveProfile(next)
        if (import.meta.env.DEV) {
          console.debug('[Auth] Profile updated:', next)
        }
        return next
      })
    },
    [],
  )

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, isLoading, login, logout, updateProfile }),
    [user, isLoading, login, logout, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
