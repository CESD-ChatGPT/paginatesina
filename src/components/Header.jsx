import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = [
    { name: 'Inicio', href: '#' },
    { name: 'Características', href: '#features' },
    { name: 'Ejemplos', href: '#code' },
    { name: 'Cómo Funciona', href: '#how' },
    { name: 'Precios', href: '#pricing' },
    { name: 'Contacto', href: '#contact' },
  ]

  return (
    <header className="fixed top-0 w-full bg-white shadow-md z-50">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">
          Stock<span className="text-cyan-500">AI</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          {navLinks.map(link => (
            <a
              key={link.name}
              href={link.href}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <button className="hidden md:block btn-primary">
          Comenzar
        </button>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg md:hidden">
            <div className="flex flex-col space-y-4 p-4">
              {navLinks.map(link => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-700 hover:text-blue-600"
                >
                  {link.name}
                </a>
              ))}
              <button className="btn-primary w-full">Comenzar</button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
