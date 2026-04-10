import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { ReactNode } from 'react'
import { AppLoader } from './AppLoader'

/**
 * Wraps a route and:
 *  1. Shows a full-page spinner while auth state is initialising
 *  2. Redirects to /login (with a `from` state) if the user is not authenticated
 *  3. Renders children when authenticated
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Wait for the session to be read from storage before deciding
  if (isLoading) {
    return <AppLoader />
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  return <>{children}</>
}
