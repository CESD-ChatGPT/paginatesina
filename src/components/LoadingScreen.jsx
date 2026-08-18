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
    <>
      <style>{`
        /* From Uiverse.io by Nawsome */
        .loader {
          position: relative;
          width: 75px;
          height: 100px;
        }

        .loader {
          transform: scale(0.85);
        }

        @media (min-width: 480px) {
          .loader {
            transform: scale(1);
          }
        }

        .loader__bar {
          position: absolute;
          bottom: 0;
          width: 10px;
          height: 50%;
          background: var(--loader-bar);
          transform-origin: center bottom;
          box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
          transition: background 0.4s ease;
        }

        .loader__bar:nth-child(1) {
          left: 0px;
          transform: scale(1, 0.2);
          -webkit-animation: barUp1 4s infinite;
          animation: barUp1 4s infinite;
        }

        .loader__bar:nth-child(2) {
          left: 15px;
          transform: scale(1, 0.4);
          -webkit-animation: barUp2 4s infinite;
          animation: barUp2 4s infinite;
        }

        .loader__bar:nth-child(3) {
          left: 30px;
          transform: scale(1, 0.6);
          -webkit-animation: barUp3 4s infinite;
          animation: barUp3 4s infinite;
        }

        .loader__bar:nth-child(4) {
          left: 45px;
          transform: scale(1, 0.8);
          -webkit-animation: barUp4 4s infinite;
          animation: barUp4 4s infinite;
        }

        .loader__bar:nth-child(5) {
          left: 60px;
          transform: scale(1, 1);
          -webkit-animation: barUp5 4s infinite;
          animation: barUp5 4s infinite;
        }

        .loader__ball {
          position: absolute;
          bottom: 10px;
          left: 0;
          width: 10px;
          height: 10px;
          background: var(--loader-ball);
          border-radius: 50%;
          -webkit-animation: ball624 4s infinite;
          animation: ball624 4s infinite;
          transition: background 0.4s ease;
        }

        @keyframes ball624 {
          0% {
            transform: translate(0, 0);
          }

          5% {
            transform: translate(8px, -14px);
          }

          10% {
            transform: translate(15px, -10px);
          }

          17% {
            transform: translate(23px, -24px);
          }

          20% {
            transform: translate(30px, -20px);
          }

          27% {
            transform: translate(38px, -34px);
          }

          30% {
            transform: translate(45px, -30px);
          }

          37% {
            transform: translate(53px, -44px);
          }

          40% {
            transform: translate(60px, -40px);
          }

          50% {
            transform: translate(60px, 0);
          }

          57% {
            transform: translate(53px, -14px);
          }

          60% {
            transform: translate(45px, -10px);
          }

          67% {
            transform: translate(37px, -24px);
          }

          70% {
            transform: translate(30px, -20px);
          }

          77% {
            transform: translate(22px, -34px);
          }

          80% {
            transform: translate(15px, -30px);
          }

          87% {
            transform: translate(7px, -44px);
          }

          90% {
            transform: translate(0, -40px);
          }

          100% {
            transform: translate(0, 0);
          }
        }

        @-webkit-keyframes barUp1 {
          0% {
            transform: scale(1, 0.2);
          }

          40% {
            transform: scale(1, 0.2);
          }

          50% {
            transform: scale(1, 1);
          }

          90% {
            transform: scale(1, 1);
          }

          100% {
            transform: scale(1, 0.2);
          }
        }

        @keyframes barUp1 {
          0% {
            transform: scale(1, 0.2);
          }

          40% {
            transform: scale(1, 0.2);
          }

          50% {
            transform: scale(1, 1);
          }

          90% {
            transform: scale(1, 1);
          }

          100% {
            transform: scale(1, 0.2);
          }
        }

        @-webkit-keyframes barUp2 {
          0% {
            transform: scale(1, 0.4);
          }

          40% {
            transform: scale(1, 0.4);
          }

          50% {
            transform: scale(1, 0.8);
          }

          90% {
            transform: scale(1, 0.8);
          }

          100% {
            transform: scale(1, 0.4);
          }
        }

        @keyframes barUp2 {
          0% {
            transform: scale(1, 0.4);
          }

          40% {
            transform: scale(1, 0.4);
          }

          50% {
            transform: scale(1, 0.8);
          }

          90% {
            transform: scale(1, 0.8);
          }

          100% {
            transform: scale(1, 0.4);
          }
        }

        @-webkit-keyframes barUp3 {
          0% {
            transform: scale(1, 0.6);
          }

          100% {
            transform: scale(1, 0.6);
          }
        }

        @keyframes barUp3 {
          0% {
            transform: scale(1, 0.6);
          }

          100% {
            transform: scale(1, 0.6);
          }
        }

        @-webkit-keyframes barUp4 {
          0% {
            transform: scale(1, 0.8);
          }

          40% {
            transform: scale(1, 0.8);
          }

          50% {
            transform: scale(1, 0.4);
          }

          90% {
            transform: scale(1, 0.4);
          }

          100% {
            transform: scale(1, 0.8);
          }
        }

        @keyframes barUp4 {
          0% {
            transform: scale(1, 0.8);
          }

          40% {
            transform: scale(1, 0.8);
          }

          50% {
            transform: scale(1, 0.4);
          }

          90% {
            transform: scale(1, 0.4);
          }

          100% {
            transform: scale(1, 0.8);
          }
        }

        @-webkit-keyframes barUp5 {
          0% {
            transform: scale(1, 1);
          }

          40% {
            transform: scale(1, 1);
          }

          50% {
            transform: scale(1, 0.2);
          }

          90% {
            transform: scale(1, 0.2);
          }

          100% {
            transform: scale(1, 1);
          }
        }

        @keyframes barUp5 {
          0% {
            transform: scale(1, 1);
          }

          40% {
            transform: scale(1, 1);
          }

          50% {
            transform: scale(1, 0.2);
          }

          90% {
            transform: scale(1, 0.2);
          }

          100% {
            transform: scale(1, 1);
          }
        }

        .loading-container {
          position: fixed;
          inset: 0;
          z-index: 999;
          background: var(--loader-bg);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: clamp(16px, 5vw, 30px);
          padding: 20px;
          animation: fadeOutLoading 0.5s ease-out 2s forwards;
        }

        @keyframes fadeOutLoading {
          from {
            opacity: 1;
            visibility: visible;
          }
          to {
            opacity: 0;
            visibility: hidden;
          }
        }

        .loader-text {
          font-size: clamp(18px, 5vw, 24px);
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 50%, var(--accent-3) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <div className="loading-container" role="status" aria-label="Cargando StockAI">
        <div className="loader">
          <div className="loader__bar"></div>
          <div className="loader__bar"></div>
          <div className="loader__bar"></div>
          <div className="loader__bar"></div>
          <div className="loader__bar"></div>
          <div className="loader__ball"></div>
        </div>
        <div className="loader-text">StockAI</div>
      </div>
    </>
  )
}
