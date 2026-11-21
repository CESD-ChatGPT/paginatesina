/* Proveedores. Mock. */
export const SUPPLIERS = [
  {
    id: 'sup-tecno',
    name: 'TecnoDistribuidora SA',
    leadTimeDays: 6,
    frequency: 'Quincenal',
    lastPurchaseAt: '2026-01-28',
  },
  {
    id: 'sup-andina',
    name: 'Import Andina',
    leadTimeDays: 12,
    frequency: 'Mensual',
    lastPurchaseAt: '2026-01-15',
  },
  {
    id: 'sup-sur',
    name: 'Componentes del Sur',
    leadTimeDays: 4,
    frequency: 'Semanal',
    lastPurchaseAt: '2026-02-02',
  },
]

export const supplierName = (id) => SUPPLIERS.find((s) => s.id === id)?.name ?? id
export const supplierById = (id) => SUPPLIERS.find((s) => s.id === id) ?? null
