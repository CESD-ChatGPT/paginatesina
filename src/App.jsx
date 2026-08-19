import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import CTA from './components/CTA'
import Footer from './components/Footer'
import LoadingScreen from './components/LoadingScreen'
import { ThemeProvider } from './contexts/ThemeContext'

function AppContent() {
  return (
    <div className="min-h-screen">
      <LoadingScreen />
      <Header />
      <main>
        <Hero />
        <Features />
        <CTA />
      </main>
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
