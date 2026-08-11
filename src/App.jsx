import { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import CodeExamples from './components/CodeExamples'
import HowItWorks from './components/HowItWorks'
import Pricing from './components/Pricing'
import Testimonials from './components/Testimonials'
import CTA from './components/CTA'
import Footer from './components/Footer'

function App() {
  const [scrolled, setScrolled] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Features />
      <CodeExamples />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}

export default App
