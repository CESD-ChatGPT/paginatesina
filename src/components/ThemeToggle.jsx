import { useContext } from 'react'
import { ThemeContext } from '../contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useContext(ThemeContext)

  return (
    <>
      <style>{`
        .theme-toggle {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1);
          backdrop-filter: blur(10px);
        }

        .theme-toggle:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 212, 255, 0.2);
        }

        .theme-toggle svg {
          width: 24px;
          height: 24px;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1);
        }

        .sun-icon {
          position: absolute;
          animation: ${theme === 'dark' ? 'rotateIn' : 'rotateOut'} 0.4s ease-out forwards;
        }

        .moon-icon {
          position: absolute;
          animation: ${theme === 'light' ? 'rotateIn' : 'rotateOut'} 0.4s ease-out forwards;
        }

        @keyframes rotateIn {
          from {
            transform: rotate(-180deg);
            opacity: 0;
          }
          to {
            transform: rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes rotateOut {
          from {
            transform: rotate(0deg);
            opacity: 1;
          }
          to {
            transform: rotate(180deg);
            opacity: 0;
          }
        }
      `}</style>

      <button
        onClick={toggleTheme}
        className="theme-toggle"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          <Moon className="moon-icon text-cyan-400" />
        ) : (
          <Sun className="sun-icon text-yellow-400" />
        )}
      </button>
    </>
  )
}
