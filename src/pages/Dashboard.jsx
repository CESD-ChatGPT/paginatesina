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

const TABS = [
  { id: 'resumen', label: 'Resumen', Panel: OverviewPanel },
  { id: 'valorizacion', label: 'Valorización', Panel: ValorizationPanel },
  { id: 'recomendaciones', label: 'Recomienda', Panel: RecommendationsPanel },
  { id: 'alertas', label: 'Alertas', Panel: AlertsPanel },
  { id: 'depositos', label: 'Depósitos', Panel: WarehousesPanel },
  { id: 'proveedores', label: 'Proveedores', Panel: SuppliersPanel },
  { id: 'fisico', label: 'Inventario físico', Panel: PhysicalCountPanel },
  { id: 'auditoria', label: 'Auditoría', Panel: AuditTrailPanel },
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

  const ActivePanel = TABS.find((t) => t.id === tab)?.Panel ?? OverviewPanel

  return (
    // reducedMotion="user": scopeado acá porque Framer Motion solo se usa
    // en el panel autenticado — ver App.jsx sobre el code-splitting.
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen">
      {/* Barra del panel — distinta de la navbar pública: acá el usuario
          ya está adentro, así que manda la identidad de sesión. */}
      <header className="rule-bottom sticky top-0 z-40" style={{ background: 'var(--surface)' }}>
        <div className="shell py-3 flex items-center justify-between gap-4">
          <span className="text-ink">
            <Isologotipo size={24} />
          </span>

          <div className="flex items-center gap-4">
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
              className="inline-flex items-center gap-2 min-h-[44px] px-3 text-[13px] font-medium text-graphite hover:text-[var(--accent)] transition-colors"
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
          <h1 className="t-h2 text-[1.75rem]">Panel de inventario</h1>
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
