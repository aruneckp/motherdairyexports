import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, RouterProvider, useLocation } from 'react-router-dom'
import Layout, { Wordmark } from './components/Layout'
import { useAuth } from './lib/auth'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

// Secondary pages load on demand so the dashboard ships first
const TradeMap = lazy(() => import('./pages/TradeMap'))
const Catalog = lazy(() => import('./pages/Catalog'))
const Compliance = lazy(() => import('./pages/Compliance'))
const CRM = lazy(() => import('./pages/CRM'))
const Partners = lazy(() => import('./pages/Partners'))
const Shipments = lazy(() => import('./pages/Shipments'))
const Network = lazy(() => import('./pages/Network'))
const Calculator = lazy(() => import('./pages/Calculator'))
const Opportunities = lazy(() => import('./pages/Opportunities'))
const Showcase = lazy(() => import('./pages/Showcase'))
const PitchStudio = lazy(() => import('./pages/PitchStudio'))

const page = (el: React.ReactNode) => <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-slate-100" />}>{el}</Suspense>

/** Sends signed-out visitors to /login and brings them back afterwards. */
function RequireAuth({ children }: { children: ReactNode }) {
  const { status, check } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (status === 'checking') check()
  }, [status, check])

  // re-check when the tab regains focus so an expired session drops back to the login page
  useEffect(() => {
    const onFocus = () => check()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [check])

  if (status === 'checking')
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-md-sky to-md-navy">
        <div className="animate-pulse">
          <Wordmark />
        </div>
      </div>
    )
  if (status === 'signed-out') {
    const here = location.pathname + location.search
    return <Navigate to={here === '/' ? '/login' : `/login?next=${encodeURIComponent(here)}`} replace />
  }
  return children
}

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/opportunities', element: page(<Opportunities />) },
      { path: '/showcase', element: page(<Showcase />) },
      { path: '/pitch', element: page(<PitchStudio />) },
      { path: '/map', element: page(<TradeMap />) },
      { path: '/catalog', element: page(<Catalog />) },
      { path: '/compliance', element: page(<Compliance />) },
      { path: '/crm', element: page(<CRM />) },
      { path: '/partners', element: page(<Partners />) },
      { path: '/shipments', element: page(<Shipments />) },
      { path: '/network', element: page(<Network />) },
      { path: '/calculator', element: page(<Calculator />) },
      { path: '*', element: <Dashboard /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
