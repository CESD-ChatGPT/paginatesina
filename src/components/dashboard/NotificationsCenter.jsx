import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../lib/notifications'
import { LoadingBlock, EmptyBlock } from '../States'
import { useEscapeClose } from '../../hooks/useEscapeClose'
import { useFocusTrap } from '../../hooks/useFocusTrap'

const LEVEL_TOKEN = { alta: 'var(--alert)', media: 'var(--warning)', baja: 'var(--muted)', info: 'var(--muted)' }

export default function NotificationsCenter({ onNavigate }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState(null)
  const rootRef = useRef(null)

  async function load() {
    /* Sin catch, un rechazo dejaba items en null y el panel colgado en el
       skeleton para siempre. Es el único consumidor de datos de acá que
       no pasa por useAsync, así que el manejo va a mano. */
    try {
      setItems(await getNotifications())
    } catch {
      setItems([])
    }
  }

  useEffect(() => {
    if (open) load()
  }, [open])

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEscapeClose(open, () => setOpen(false))
  useFocusTrap(rootRef, open)

  const unreadCount = items ? items.filter((n) => !n.read).length : 0

  function handlePick(n) {
    markNotificationRead(n.id)
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
    onNavigate?.(n.kind === 'alert' ? 'alertas' : 'auditoria')
    setOpen(false)
  }

  function handleMarkAll() {
    if (!items) return
    markAllNotificationsRead(items.map((n) => n.id))
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notificaciones${unreadCount > 0 ? ` · ${unreadCount} sin leer` : ''}`}
        aria-expanded={open}
        className="relative inline-flex items-center justify-center min-h-[36px] min-w-[36px] border transition-colors hover:text-[var(--accent)]"
        style={{ borderColor: 'var(--rule-strong)', borderRadius: '2px' }}
      >
        <Bell className="w-4 h-4" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center t-mono text-[9px] font-medium"
            style={{ background: 'var(--alert)', color: '#fff', borderRadius: '8px' }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Centro de notificaciones"
            className="absolute right-0 top-[calc(100%+8px)] w-[320px] max-w-[85vw] z-50 overflow-hidden"
            style={{ background: 'var(--surface)', border: '1px solid var(--rule-strong)', borderRadius: '3px' }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-rule">
              <h3 className="text-[13px] font-medium">Notificaciones</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="t-mono text-[11px] underline underline-offset-4 hover:text-[var(--accent)]"
                >
                  Marcar todas leídas
                </button>
              )}
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {items === null && (
                <div className="p-4">
                  <LoadingBlock label="Cargando notificaciones" rows={3} />
                </div>
              )}
              {items !== null && items.length === 0 && (
                <div className="p-4">
                  <EmptyBlock title="Sin novedades" hint="Las alertas y los últimos eventos de auditoría aparecen acá." />
                </div>
              )}
              {items !== null && items.length > 0 && (
                <ul>
                  {items.map((n) => (
                    <li key={n.id} className="border-b border-rule last:border-b-0">
                      <button
                        onClick={() => handlePick(n)}
                        className="w-full flex gap-2.5 items-start text-left px-4 py-2.5 min-h-[44px] hover:bg-[var(--surface-sunken)] transition-colors"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                          style={{ background: n.read ? 'transparent' : LEVEL_TOKEN[n.level] }}
                          aria-hidden="true"
                        />
                        <span className="min-w-0">
                          <span className="block text-[12.5px] leading-snug" style={{ opacity: n.read ? 0.6 : 1 }}>
                            {n.title}
                          </span>
                          <span className="block t-mono text-[10px] text-muted mt-0.5 truncate">{n.subtitle}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
