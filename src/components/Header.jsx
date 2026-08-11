import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = [
    { name: 'Inicio', href: '#' },
    { name: 'Características', href: '#features' },
    { name: 'Contacto', href: '#contact' },
  ]

  return (
    <header className="fixed top-0 w-full z-50">
      <nav className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center glass-lg mx-4 mt-4 rounded-2xl">
        {/* Logo */}
        <div className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
          Stock<span className="text-cyan-400">AI</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          {navLinks.map(link => (
            <a
              key={link.name}
              href={link.href}
              className="text-gray-300 hover:gradient-text transition-colors font-medium text-sm"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <button className="hidden md:block px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all text-sm">
          Comenzar
        </button>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-300"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-4 mx-4 glass rounded-2xl md:hidden backdrop-blur-md">
            <div className="flex flex-col space-y-4 p-6">
              {navLinks.map(link => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-300 hover:text-cyan-400 transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <button className="w-full px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                Comenzar
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
