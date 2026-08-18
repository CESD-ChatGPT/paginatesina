import { useState, useContext } from 'react'
import { ThemeContext } from '../contexts/ThemeContext'
import { ThemeToggleButton } from './ThemeToggle'
import CtaButton from './CtaButton'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme } = useContext(ThemeContext)

  return (
    <>
      <style>{`
        /* From Uiverse.io by mymiamo */
        :root {
          --glass-border: rgba(255, 255, 255, 0.2);
          --ease-spring: cubic-bezier(0.23, 1, 0.320, 1);
        }

        .menu {
          position: fixed;
          left: 50%;
          top: 20px;
          transform: translateX(-50%);
          width: calc(100% - 20px);
          max-width: 520px;
          backdrop-filter: blur(12px) saturate(180%) contrast(200%);
          -webkit-backdrop-filter: blur(12px) saturate(180%) contrast(200%);
          background: rgba(0, 122, 255, 0.404);
          border: 1px solid var(--glass-border);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
          padding: 8px;
          border-radius: 99rem;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          z-index: 50;
        }

        .menu::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          box-shadow:
            inset 2px 2px 5px -2px rgba(255, 255, 255, 0.4),
            inset -2px -2px 5px 2px rgba(255, 255, 255, 0.4),
            inset 0 -2px 0 rgba(255, 255, 255, 0.2);
          pointer-events: none;
          z-index: -1;
        }

        .menu a {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 0 1 auto;
          min-width: 0;
          color: rgba(255, 255, 255, 90%);
          text-decoration: none;
          padding: 10px 6px;
          border-radius: 999rem;
          -webkit-tap-highlight-color: transparent;
          transition:
            background 0.18s var(--ease-spring),
            color 0.18s var(--ease-spring),
            transform 0.18s var(--ease-spring),
            box-shadow 0.3s ease-in-out;
        }

        .menu a:hover {
          transition:
            background 0.18s var(--ease-spring),
            color 0.18s var(--ease-spring),
            transform 0.18s var(--ease-spring),
            box-shadow 0.3s ease-in-out;
          background-color: rgba(255, 255, 255, 30%);
          box-shadow:
            inset 2px 2px 5px -2px rgba(255, 255, 255, 0.4),
            inset -2px -1px 5px 0 rgba(255, 255, 255, 0.4),
            inset 0 -2px 0 rgba(255, 255, 255, 0.2);
          transform: rotate(2.2deg);
          color: rgba(0, 122, 255, 90%);
        }

        .menu a svg {
          width: 1.4rem;
          font-size: 1.4rem;
        }

        .menu a span {
          font-size: 0.8rem;
          font-weight: 600;
          line-height: 1;
          margin-top: 4px;
        }

        .menu a.active {
          background: rgb(237, 237, 237, 60%);
          color: rgba(0, 122, 255, 90%);
        }

        .menu a:active {
          transform: scale(0.98);
        }

        .theme-toggle-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px 6px;
          margin-left: auto;
          margin-right: 8px;
        }

        .logo {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          font-size: 1.2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #00d4ff 0%, #0066CC 50%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          white-space: nowrap;
        }
      `}</style>

      <div className="menu">
        <div className="logo">Stock<span style={{color: '#00d4ff'}}>AI</span></div>

        <a href="#" className="active">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z"></path>
            <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z"></path>
          </svg>
          <span>Inicio</span>
        </a>

        <a href="#features">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z"></path>
          </svg>
          <span>Características</span>
        </a>

        <a href="#contact">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd"></path>
          </svg>
          <span>Contacto</span>
        </a>

        <div className="theme-toggle-wrapper">
          <ThemeToggleButton />
        </div>
      </div>
    </>
  )
}
