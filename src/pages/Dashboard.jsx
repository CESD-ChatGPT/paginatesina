import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { LogOut, AlertTriangle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { IS_MOCK_DATA } from '../data/inventory'
import { Isologotipo } from '../components/brand/Logo'
import { ThemeToggleButton } from '../components/ThemeToggle'
import Tabs from '../components/dashboard/Tabs'
import RoleSwitcher from '../components/dashboard/RoleSwitcher'
import CommandPalette from '../components/dashboard/CommandPalette'
import NotificationsCenter from '../components/dashboard/NotificationsCenter'
import OverviewPanel from '../components/dashboard/OverviewPanel'
import ValorizationPanel from '../components/dashboard/ValorizationPanel'
import RecommendationsPanel from '../components/dashboard/RecommendationsPanel'
import AlertsPanel from '../components/dashboard/AlertsPanel'
import WarehousesPanel from '../components/dashboard/WarehousesPanel'
import SuppliersPanel from '../components/dashboard/SuppliersPanel'
import PhysicalCountPanel from '../components/dashboard/PhysicalCountPanel'
import AuditTrailPanel from '../components/dashboard/AuditTrailPanel'

/* `title` es el encabezado de la vista y `label` el de la pestaña: el
   título más largo no entra en la barra, y la barra sola no alcanza como
   encabezado. Antes el H1 decía "Panel de inventario" en las ocho
   pestañas: el tipo más grande de la página gastado en algo que nunca
   cambia, mientras lo que sí cambiaba quedaba en la etiqueta más chica. */
const TABS = [
  { id: 'resumen', label: 'Resumen', title: 'Resumen operativo', Panel: OverviewPanel },
  { id: 'valorizacion', label: 'Valorización', title: 'Valorización del depósito', Panel: ValorizationPanel },
  { id: 'recomendaciones', label: 'Recomienda', title: 'Acciones recomendadas', Panel: RecommendationsPanel },
  { id: 'alertas', label: 'Alertas', title: 'Alertas de stock', Panel: AlertsPanel },
  { id: 'depositos', label: 'Depósitos', title: 'Depósitos y transferencias', Panel: WarehousesPanel },
  { id: 'proveedores', label: 'Proveedores', title: 'Proveedores y órdenes', Panel: SuppliersPanel },
  { id: 'fisico', label: 'Inventario físico', title: 'Conteo físico', Panel: PhysicalCountPanel },
  { id: 'auditoria', label: 'Auditoría', title: 'Registro de auditoría', Panel: AuditTrailPanel },
]

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('resumen')
  const [focusSku, setFocusSku] = useState(null)

  async function handleSignOut() {
    await signOut()
    navigate('/', { replace: true })
  }

  // La búsqueda global no sabe de tabs de React: solo describe qué
  // encontró (producto, proveedor, depósito, sección, evento). Acá se
  // traduce ese resultado a "cambiar de pestaña" y, para un producto, a
  // "abrir directamente su detalle de valorización".
  function handleSearchSelect(item) {
    if (item.kind === 'tab') setTab(item.tabId)
    else if (item.kind === 'product') {
      setTab('valorizacion')
      setFocusSku(item.sku)
    } else if (item.kind === 'supplier') setTab('proveedores')
    else if (item.kind === 'warehouse') setTab('depositos')
    else if (item.kind === 'audit') setTab('auditoria')
  }

  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0]
  const ActivePanel = activeTab.Panel

  return (
    // reducedMotion="user": scopeado acá porque Framer Motion solo se usa
    // en el panel autenticado — ver App.jsx sobre el code-splitting.
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen">
      {/* Barra del panel — distinta de la navbar pública: acá el usuario
          ya está adentro, así que manda la identidad de sesión. */}
      <header className="rule-bottom sticky top-0 z-40" style={{ background: 'var(--surface)' }}>
        <div className="shell py-3 flex items-center justify-between gap-3 md:gap-4">
          <span className="text-ink shrink-0">
            <Isologotipo size={24} />
          </span>

          {/* min-w-0 + shrink-0 en el botón de salida: sin esto, en 375 px
              la fila se pasaba del ancho y "Salir" quedaba recortado fuera
              de pantalla, sin ninguna forma visible de cerrar sesión. */}
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <CommandPalette onSelect={handleSearchSelect} />
            <NotificationsCenter onNavigate={setTab} />
            <ThemeToggleButton />
            <RoleSwitcher />
            <div className="text-right hidden lg:block">
              <p className="text-[13px] font-medium leading-tight">{user?.name}</p>
              <p className="t-mono text-[11px] text-muted">{user?.warehouse}</p>
            </div>
            <button
              onClick={handleSignOut}
              /* Abajo de xs el texto se oculta con display:none, que también
                 lo saca del árbol de accesibilidad: sin este aria-label el
                 botón quedaba sin nombre para un lector de pantalla justo
                 en el tamaño donde es solo un ícono. */
              aria-label="Salir"
              className="inline-flex shrink-0 items-center gap-2 min-h-[44px] px-2 md:px-3 text-[13px] font-medium text-graphite hover:text-[var(--accent)] transition-colors"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span className="hidden xs:inline">Salir</span>
            </button>
          </div>
        </div>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </header>

      <main className="shell py-8 md:py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 mb-8">
          <div>
            <p className="t-mono text-[11px] text-muted uppercase tracking-[0.14em] mb-1">Panel de inventario</p>
            <h1 className="t-h2 text-[1.75rem]">{activeTab.title}</h1>
          </div>
          <p className="t-mono text-[11px] text-muted">{user?.jobTitle}</p>
        </div>

        {/* Aviso honesto: no hay backend conectado todavía */}
        {IS_MOCK_DATA && (
          <div
            className="flex gap-2.5 items-start p-3 mb-8 border"
            style={{ borderColor: 'var(--rule-strong)', borderRadius: '2px' }}
          >
            <AlertTriangle
              className="w-4 h-4 shrink-0 mt-0.5"
              style={{ color: 'var(--warning)' }}
              aria-hidden="true"
            />
            <p className="text-[13px] text-graphite leading-snug">
              <span className="font-medium text-ink">Datos de demostración.</span> El
              proyecto todavía no tiene un backend conectado; estas cifras provienen
              del adaptador mock en <span className="t-mono text-[12px]">src/data/inventory.js</span>.
            </p>
          </div>
        )}

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          <ActivePanel focusSku={focusSku} onFocusHandled={() => setFocusSku(null)} />
        </div>
      </main>
    </div>
    </MotionConfig>
  )
}
