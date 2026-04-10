import { Outlet, useLocation } from 'react-router-dom'
import { Nav } from './Nav'

const NO_NAV_PATHS = ['/', '/login']

export function Layout() {
  const { pathname } = useLocation()
  const showNav = !NO_NAV_PATHS.includes(pathname)

  return (
    <div className="app-shell">
      {showNav ? <Nav /> : null}
      <main className={`main ${showNav ? 'main--padded' : ''}`}>
        <Outlet />
      </main>
    </div>
  )
}
