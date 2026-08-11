import { useEffect, useState } from 'react'

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[999] bg-gradient-to-b from-slate-950 via-slate-900 to-black flex items-center justify-center animate-fade-out">
      <style>{`
        @keyframes fadeOut {
          from {
            opacity: 1;
            visibility: visible;
          }
          to {
            opacity: 0;
            visibility: hidden;
          }
        }

        .animate-fade-out {
          animation: fadeOut 0.5s ease-out 2s forwards;
        }

        .loader {
          width: 80px;
          height: 80px;
          border: 8px solid rgba(255, 255, 255, 0.1);
          border-top-color: #00d4ff;
          border-right-color: #0066CC;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .loader-text {
          animation: pulse 1.5s ease-in-out infinite;
          margin-top: 20px;
          font-size: 18px;
          font-weight: 600;
          background: linear-gradient(135deg, #00d4ff 0%, #0066CC 50%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      <div className="text-center">
        <div className="loader"></div>
        <div className="loader-text">StockAI</div>
      </div>
    </div>
  )
}
