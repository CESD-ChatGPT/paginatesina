/* Depósitos. Mock — no hay backend logístico conectado todavía;
   ver inventory.js para el criterio general de qué es real vs. simulado. */
export const WAREHOUSES = [
  { id: 'central', name: 'Depósito Central', city: 'Buenos Aires' },
  { id: 'cordoba', name: 'Depósito Córdoba', city: 'Córdoba' },
]

export const warehouseName = (id) => WAREHOUSES.find((w) => w.id === id)?.name ?? id
