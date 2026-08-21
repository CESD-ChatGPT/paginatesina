import { Suspense, lazy } from 'react'
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import CTA from './components/CTA'
import Footer from './components/Footer'
import LoadingScreen from './components/LoadingScreen'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'

/* Login y Dashboard se cargan bajo demanda: son las únicas dos pantallas
   que usan Framer Motion, y un visitante anónimo que solo ve la landing
   no debería pagar ese peso. Sin esto, el bundle único subía de 352 KB
   a 484 KB (verificado con el build) solo por el import estático. */
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

/* HashRouter y no BrowserRouter: el sitio se sirve en GitHub Pages, que
   no permite configurar un fallback a index.html. Con rutas de historial
   un refresh en /panel devolvería 404. */

function Landing() {
  return (
    <>
      <LoadingScreen />
      <Header />
      <main>
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
    </>
  )
}

function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}

/* Fallback mínimo mientras baja el chunk de Login/Dashboard — en una
   conexión normal no llega a verse; en una lenta, es más honesto que una
   pantalla en blanco. */
function RouteFallback() {
  return <div className="min-h-screen" style={{ background: 'var(--paper)' }} />
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/panel" replace /> : <Login />}
        />
        <Route
          path="/panel"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <div className="min-h-screen">
            <AppRoutes />
          </div>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
