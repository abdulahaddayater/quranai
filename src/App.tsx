import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/Layout'
import { AuthGuard } from './components/AuthGuard'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Login } from './pages/Login'
import { Landing } from './pages/Landing'
import { Dashboard } from './pages/Dashboard'
import { Guidance } from './pages/Guidance'
import { Reflection } from './pages/Reflection'
import { Chapters } from './pages/Chapters'
import { ChapterDetail } from './pages/ChapterDetail'
import { SurahReading } from './pages/SurahReading'
import { VerseDetail } from './pages/VerseDetail'
import { Profile } from './pages/Profile'
import { Collections } from './pages/Collections'

/** Wraps a page in both an AuthGuard and its own ErrorBoundary. */
function Protected({ children, scope }: { children: React.ReactNode; scope: string }) {
  return (
    <AuthGuard>
      <ErrorBoundary scope={scope}>{children}</ErrorBoundary>
    </AuthGuard>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary scope="App">
          <Routes>
            <Route element={<Layout />}>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route
                path="/login"
                element={
                  <ErrorBoundary scope="Login">
                    <Login />
                  </ErrorBoundary>
                }
              />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={<Protected scope="Dashboard"><Dashboard /></Protected>}
              />
              <Route
                path="/guidance"
                element={<Protected scope="Daily Guidance"><Guidance /></Protected>}
              />
              <Route
                path="/reflection"
                element={<Protected scope="Reflections"><Reflection /></Protected>}
              />
              <Route
                path="/chapters"
                element={<Protected scope="Chapters"><Chapters /></Protected>}
              />
              <Route
                path="/chapters/:id"
                element={<Protected scope="Chapter Detail"><ChapterDetail /></Protected>}
              />
              <Route
                path="/chapters/:id/read"
                element={<Protected scope="Surah Reading"><SurahReading /></Protected>}
              />
              <Route
                path="/verse/:key"
                element={<Protected scope="Verse Detail"><VerseDetail /></Protected>}
              />
              <Route
                path="/collections"
                element={<Protected scope="Collections"><Collections /></Protected>}
              />
              <Route
                path="/profile"
                element={<Protected scope="Profile"><Profile /></Protected>}
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  )
}
