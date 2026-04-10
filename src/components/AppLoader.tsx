/** Full-page loading screen shown while auth state is being resolved. */
export function AppLoader({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="app-loader" role="status" aria-live="polite">
      <div className="app-loader__ring" aria-hidden />
      <p className="app-loader__msg">{message}</p>
    </div>
  )
}
