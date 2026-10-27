import { WHATSAPP_DEMO } from '../lib/app'

/* Botón flotante para escribir por WhatsApp desde cualquier sección. */
export default function WhatsAppFloat() {
  return (
    <a
      href={WHATSAPP_DEMO}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp para pedir una demo"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 min-h-[48px] px-4 text-[14px] font-medium shadow-sm"
      style={{ background: 'var(--accent)', color: 'var(--accent-ink)', borderRadius: '2px' }}
    >
      Pedí tu demo
    </a>
  )
}
