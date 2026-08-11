import { ArrowRight } from 'lucide-react'

export default function CtaButton() {
  return (
    <>
      <style>{`
        .cta-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: white;
          background: linear-gradient(135deg, #00d4ff 0%, #0066CC 50%, #a855f7 100%);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1);
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4);
        }

        .cta-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .cta-button:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 212, 255, 0.6);
        }

        .cta-button:hover::before {
          opacity: 1;
        }

        .cta-button:active {
          transform: translateY(-2px);
        }

        .cta-button svg {
          transition: transform 0.3s cubic-bezier(0.23, 1, 0.320, 1);
        }

        .cta-button:hover svg {
          transform: translateX(4px);
        }
      `}</style>

      <button className="cta-button">
        Comenzar Ahora
        <ArrowRight size={20} strokeWidth={2.5} />
      </button>
    </>
  )
}
