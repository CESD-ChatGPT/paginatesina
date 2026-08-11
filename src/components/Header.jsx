import { Menu, X } from 'lucide-react'
import { useState, useContext } from 'react'
import { ThemeContext } from '../contexts/ThemeContext'
import { ThemeToggleButton } from './ThemeToggle'
import CtaButton from './CtaButton'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme } = useContext(ThemeContext)

  const navLinks = [
    { name: 'Inicio', href: '#' },
    { name: 'Características', href: '#features' },
    { name: 'Contacto', href: '#contact' },
  ]

  return (
    <>
      <style>{`
        .navbar-container {
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 50;
          padding: 1rem 1rem;
          background: ${theme === 'dark'
            ? 'rgba(10, 14, 39, 0.7)'
            : 'rgba(255, 255, 255, 0.7)'};
          backdrop-filter: blur(20px);
          border-bottom: 1px solid ${theme === 'dark'
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.1)'};
          transition: all 0.3s ease;
        }

        .navbar {
          max-width: 80rem;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          padding: 0 1rem;
        }

        .navbar-logo {
          font-size: 1.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, #00d4ff 0%, #0066CC 50%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .navbar-logo:hover {
          transform: scale(1.05);
        }

        .nav-links {
          display: none;
          gap: 2rem;
          list-style: none;
        }

        @media (min-width: 768px) {
          .nav-links {
            display: flex;
          }
        }

        .nav-link {
          color: ${theme === 'dark' ? '#e0e0e0' : '#333'};
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          position: relative;
          transition: color 0.3s ease;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(135deg, #00d4ff, #a855f7);
          transition: width 0.3s cubic-bezier(0.23, 1, 0.320, 1);
        }

        .nav-link:hover {
          color: #00d4ff;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .mobile-menu-btn {
          display: block;
          background: none;
          border: none;
          cursor: pointer;
          color: ${theme === 'dark' ? '#e0e0e0' : '#333'};
          transition: color 0.3s ease;
        }

        @media (min-width: 768px) {
          .mobile-menu-btn {
            display: none;
          }
        }

        .mobile-menu {
          position: absolute;
          top: 100%;
          left: 1rem;
          right: 1rem;
          margin-top: 1rem;
          background: ${theme === 'dark'
            ? 'rgba(10, 14, 39, 0.95)'
            : 'rgba(255, 255, 255, 0.95)'};
          backdrop-filter: blur(20px);
          border: 1px solid ${theme === 'dark'
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.1)'};
          border-radius: 16px;
          padding: 1.5rem;
          display: ${isMenuOpen ? 'flex' : 'none'};
          flex-direction: column;
          gap: 1rem;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mobile-link {
          color: ${theme === 'dark' ? '#e0e0e0' : '#333'};
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .mobile-link:hover {
          color: #00d4ff;
        }
      `}</style>

      <header className="navbar-container">
        <div className="navbar">
          {/* Logo */}
          <div className="navbar-logo">
            Stock<span style={{color: '#00d4ff'}}>AI</span>
          </div>

          {/* Desktop Navigation */}
          <ul className="nav-links">
            {navLinks.map(link => (
              <li key={link.name}>
                <a href={link.href} className="nav-link">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>

          {/* Right side - Theme Toggle and CTA */}
          <div className="nav-right">
            <ThemeToggleButton />
            <div className="hidden md:block">
              <CtaButton />
            </div>

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div className="mobile-menu">
            {navLinks.map(link => (
              <a
                key={link.name}
                href={link.href}
                className="mobile-link"
              >
                {link.name}
              </a>
            ))}
            <CtaButton />
          </div>
        </div>
      </header>
    </>
  )
}
