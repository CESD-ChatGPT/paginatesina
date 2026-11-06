/* Índice de búsqueda global — se arma en el momento de cada consulta, no
   se persiste: el volumen de datos (11 productos, 3 proveedores, 2
   depósitos, un puñado de eventos de auditoría) no justifica un índice
   invertido ni una librería de búsqueda. Un filtro por substring alcanza. */
import { PRODUCTS } from '../data/inventory'
import { SUPPLIERS } from '../data/suppliers'
import { WAREHOUSES } from '../data/warehouses'
import { getAuditLog } from '../data/audit'

export const TAB_COMMANDS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'valorizacion', label: 'Valorización' },
  { id: 'recomendaciones', label: 'Recomienda' },
  { id: 'alertas', label: 'Alertas' },
  { id: 'depositos', label: 'Depósitos' },
  { id: 'proveedores', label: 'Proveedores' },
  { id: 'fisico', label: 'Inventario físico' },
  { id: 'auditoria', label: 'Auditoría' },
]

function buildEntries() {
  return [
    ...TAB_COMMANDS.map((t) => ({
      kind: 'tab',
      key: `tab-${t.id}`,
      title: `Ir a ${t.label}`,
      subtitle: 'Sección del panel',
      searchText: `ir a ${t.label} ${t.id}`,
      tabId: t.id,
    })),
    ...PRODUCTS.map((p) => ({
      kind: 'product',
      key: `product-${p.sku}`,
      title: `${p.sku} — ${p.name}`,
      subtitle: `${p.category} · ${p.brand}`,
      searchText: `${p.sku} ${p.name} ${p.brand} ${p.model} ${p.category} ${p.ean}`,
      sku: p.sku,
    })),
    ...SUPPLIERS.map((s) => ({
      kind: 'supplier',
      key: `supplier-${s.id}`,
      title: s.name,
      subtitle: `Proveedor · ${s.leadTimeDays} días de entrega`,
      searchText: `${s.name} proveedor`,
      supplierId: s.id,
    })),
    ...WAREHOUSES.map((w) => ({
      kind: 'warehouse',
      key: `warehouse-${w.id}`,
      title: w.name,
      subtitle: `Depósito · ${w.city}`,
      searchText: `${w.name} ${w.city} depósito`,
      warehouseId: w.id,
    })),
    ...getAuditLog()
      .slice(0, 30)
      .map((ev) => ({
        kind: 'audit',
        key: `audit-${ev.id}`,
        title: ev.action,
        subtitle: `${ev.target} · ${ev.user}`,
        searchText: `${ev.action} ${ev.target} ${ev.detail} ${ev.user}`,
      })),
  ]
}

export function searchAll(query, limit = 8) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return buildEntries()
    .filter((e) => e.searchText.toLowerCase().includes(q))
    .slice(0, limit)
}
