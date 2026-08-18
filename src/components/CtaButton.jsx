import { TrendingUp } from 'lucide-react'

/* From Uiverse.io by Creatlydev — adaptado: gradiente de marca en vez de
   verde plano, icono de negocio/IA en vez del icono de pagos, tamaños
   responsive (sm/md/lg) y contraste correcto en ambos temas. */
export default function CtaButton({ label = 'Comenzar Ahora', size = 'md', onClick }) {
  return (
    <>
      <style>{`
        .cta-btn {
          --icon-size: 48px;
          text-decoration: none;
          line-height: 1;
          border-radius: 1.5rem;
          overflow: hidden;
          position: relative;
          box-shadow: 0 10px 25px rgba(0, 102, 204, 0.25), var(--card-shadow);
          background-color: #ffffff;
          border: 1px solid var(--glass-border);
          color: #121212;
          cursor: pointer;
          display: inline-flex;
          align-items: stretch;
          flex-shrink: 0;
          max-width: 100%;
        }

        .cta-btn-decor {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 55%, var(--accent-3) 100%);
          transform: translateX(-100%);
          transition: transform 0.35s cubic-bezier(0.23, 1, 0.320, 1);
          z-index: 0;
        }

        .cta-btn-content {
          display: flex;
          align-items: center;
          font-weight: 700;
          position: relative;
          overflow: hidden;
          min-width: 0;
        }

        .cta-btn-icon {
          width: var(--icon-size);
          height: var(--icon-size);
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 55%, var(--accent-3) 100%);
          display: grid;
          place-items: center;
          flex-shrink: 0;
          color: #fff;
        }

        .cta-btn-text {
          display: inline-block;
          transition: color 0.25s ease;
          padding: 2px 1.5rem 2px 0.9rem;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .cta-btn:hover .cta-btn-text {
          color: #fff;
        }

        .cta-btn:hover .cta-btn-decor {
          transform: translate(0);
        }

        .cta-btn:active {
          transform: scale(0.98);
        }

        /* Tamaños */
        .cta-btn.size-sm { --icon-size: 38px; }
        .cta-btn.size-sm .cta-btn-text { font-size: 0.85rem; padding: 2px 1.1rem 2px 0.7rem; }
        .cta-btn.size-sm svg { width: 16px; height: 16px; }

        .cta-btn.size-md { --icon-size: 48px; }
        .cta-btn.size-md .cta-btn-text { font-size: 1rem; }
        .cta-btn.size-md svg { width: 20px; height: 20px; }

        .cta-btn.size-lg { --icon-size: 56px; }
        .cta-btn.size-lg .cta-btn-text { font-size: 1.05rem; padding: 2px 2rem 2px 1rem; }
        .cta-btn.size-lg svg { width: 22px; height: 22px; }

        @media (max-width: 480px) {
          .cta-btn.size-lg { --icon-size: 46px; }
          .cta-btn.size-lg .cta-btn-text { font-size: 0.95rem; padding: 2px 1.4rem 2px 0.8rem; }
        }
      `}</style>

      <button className={`cta-btn size-${size}`} onClick={onClick}>
        <span className="cta-btn-decor"></span>
        <div className="cta-btn-content">
          <div className="cta-btn-icon">
            <TrendingUp strokeWidth={2.5} />
          </div>
          <span className="cta-btn-text">{label}</span>
        </div>
      </button>
    </>
  )
}
