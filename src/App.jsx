import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import CTA from './components/CTA'
import Footer from './components/Footer'
import LoadingScreen from './components/LoadingScreen'
import { ThemeProvider } from './contexts/ThemeContext'

function AppContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black">
      <LoadingScreen />
      <Header />
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
