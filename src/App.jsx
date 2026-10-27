import { Suspense, lazy } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import AutomationStory from './components/AutomationStory'
import Features from './components/Features'
import LiveDemo from './components/LiveDemo'
import CTA from './components/CTA'
import Footer from './components/Footer'
import LoadingScreen from './components/LoadingScreen'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'

/* El panel se carga bajo demanda: usa Framer Motion, y un visitante que
   solo ve la landing no debería pagar ese peso. */
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
        <AutomationStory />
        <Features />
        <LiveDemo />
        <CTA />
      </main>
      <Footer />
    </>
  )
}

/* Fallback mínimo mientras baja el chunk de Login/Dashboard — en una
   conexión normal no llega a verse; en una lenta, es más honesto que una
   pantalla en blanco. */
function RouteFallback() {
  return <div className="min-h-screen" style={{ background: 'var(--paper)' }} />
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/panel" element={<Dashboard />} />
        {/* Enlaces viejos al login: van directo al panel, que ya no pide sesión. */}
        <Route path="/login" element={<Navigate to="/panel" replace />} />
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
