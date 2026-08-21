import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search as SearchIcon, Package, Truck, Warehouse, History, ArrowRight } from 'lucide-react'
import { searchAll } from '../../lib/search'
import { useEscapeClose } from '../../hooks/useEscapeClose'
import { useFocusTrap } from '../../hooks/useFocusTrap'

const KIND_ICON = { tab: ArrowRight, product: Package, supplier: Truck, warehouse: Warehouse, audit: History }

/* Búsqueda global + command palette. Vive fuera de las pestañas porque
   su atajo (Cmd/Ctrl+K) tiene que funcionar sin importar cuál esté
   activa — es la única pieza del panel que escucha el teclado global. */
export default function CommandPalette({ onSelect }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)
  const dialogRef = useRef(null)

  const results = searchAll(query)

  useEscapeClose(open, () => setOpen(false))
  useFocusTrap(dialogRef, open)

  useEffect(() => {
    function handleGlobalKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', handleGlobalKey)
    return () => window.removeEventListener('keydown', handleGlobalKey)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  function handlePick(item) {
    onSelect(item)
    setOpen(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = results[activeIndex]
      if (item) handlePick(item)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 min-h-[36px] px-3 t-mono text-[11px] text-muted border transition-colors hover:text-[var(--accent)]"
        style={{ borderColor: 'var(--rule-strong)', borderRadius: '2px' }}
      >
        <SearchIcon className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Buscar</span>
        <kbd className="hidden sm:inline t-mono text-[10px] text-muted">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[60]"
              style={{ background: 'rgba(10,10,10,0.4)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Búsqueda global"
              className="fixed top-[12vh] left-1/2 w-[92vw] max-w-[560px] z-[60]"
              style={{ background: 'var(--surface)', border: '1px solid var(--rule-strong)', borderRadius: '3px' }}
              initial={{ opacity: 0, y: -10, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -10, x: '-50%' }}
              transition={{ duration: 0.18 }}
            >
              <div className="flex items-center gap-2.5 px-4 border-b border-rule">
                <SearchIcon className="w-4 h-4 text-muted shrink-0" aria-hidden="true" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Buscar productos, proveedores, depósitos, secciones…"
                  className="w-full min-h-[52px] bg-transparent outline-none text-[14px]"
                  aria-label="Buscar"
                  aria-activedescendant={results[activeIndex] ? `cmd-${results[activeIndex].key}` : undefined}
                  role="combobox"
                  aria-expanded={results.length > 0}
                  aria-controls="cmd-results"
                />
              </div>

              <ul id="cmd-results" role="listbox" className="max-h-[50vh] overflow-y-auto py-1.5">
                {query.trim() === '' && (
                  <li className="px-4 py-6 text-center t-small text-muted">Empezá a escribir para buscar.</li>
                )}
                {query.trim() !== '' && results.length === 0 && (
                  <li className="px-4 py-6 text-center t-small text-muted">Sin resultados para "{query}".</li>
                )}
                {results.map((r, i) => {
                  const Icon = KIND_ICON[r.kind] ?? ArrowRight
                  return (
                    <li key={r.key} id={`cmd-${r.key}`} role="option" aria-selected={i === activeIndex}>
                      <button
                        onClick={() => handlePick(r)}
                        onMouseEnter={() => setActiveIndex(i)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left min-h-[44px]"
                        style={{ background: i === activeIndex ? 'var(--surface-sunken)' : 'transparent' }}
                      >
                        <Icon className="w-4 h-4 shrink-0 text-muted" aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] truncate">{r.title}</span>
                          <span className="block t-mono text-[11px] text-muted truncate">{r.subtitle}</span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
