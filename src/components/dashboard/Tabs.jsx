import { useLayoutEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../lib/motion'

/* Navegación entre secciones del panel. El indicador de pestaña activa
   se mueve con la Web Animation API nativa — un solo elemento, sin
   estado de React de por medio, es el caso de uso que esa herramienta
   hace bien (ver criterio de motion del proyecto). */
export default function Tabs({ tabs, active, onChange }) {
  const listRef = useRef(null)
  const indicatorRef = useRef(null)
  const btnRefs = useRef({})

  useLayoutEffect(() => {
    const list = listRef.current
    const indicator = indicatorRef.current
    const btn = btnRefs.current[active]
    if (!list || !indicator || !btn) return

    const left = btn.offsetLeft
    const width = btn.offsetWidth

    if (prefersReducedMotion()) {
      indicator.style.transform = `translateX(${left}px)`
      indicator.style.width = `${width}px`
      return
    }

    const fromTransform = indicator.style.transform || 'translateX(0px)'
    const fromWidth = indicator.style.width || '0px'
    indicator.style.transform = `translateX(${left}px)`
    indicator.style.width = `${width}px`

    indicator.animate(
      [
        { transform: fromTransform, width: fromWidth },
        { transform: `translateX(${left}px)`, width: `${width}px` },
      ],
      { duration: 220, easing: 'cubic-bezier(.22,.61,.36,1)' }
    )
  }, [active])

  function handleKeyDown(e) {
    const idx = tabs.findIndex((t) => t.id === active)
    let nextId = null
    if (e.key === 'ArrowRight') nextId = tabs[(idx + 1) % tabs.length].id
    if (e.key === 'ArrowLeft') nextId = tabs[(idx - 1 + tabs.length) % tabs.length].id
    if (nextId) {
      e.preventDefault()
      onChange(nextId)
      btnRefs.current[nextId]?.focus()
    }
  }

  return (
    <div className="rule-bottom overflow-x-auto">
      <div
        ref={listRef}
        role="tablist"
        aria-label="Secciones del panel"
        className="relative flex gap-1 min-w-max"
        onKeyDown={handleKeyDown}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            ref={(el) => {
              btnRefs.current[t.id] = el
            }}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => onChange(t.id)}
            className="px-3.5 py-3 text-[13px] font-medium whitespace-nowrap transition-colors min-h-[44px]"
            style={{ color: active === t.id ? 'var(--ink)' : 'var(--muted)' }}
          >
            {t.label}
          </button>
        ))}
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-[2px]"
          style={{ background: 'var(--accent)', width: 0 }}
        />
      </div>
    </div>
  )
}
