/* Personalización ligera del panel: qué KPI se muestran y en qué orden.
   Persistido en localStorage — no hay cuenta de usuario en un backend
   donde guardarlo, así que vive por navegador, no por persona. */
const KEY = 'solvus-kpi-prefs'

export function loadKpiPrefs(defaultOrder) {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { order: defaultOrder, hidden: [] }
    const parsed = JSON.parse(raw)
    const order = Array.isArray(parsed.order) ? parsed.order.filter((id) => defaultOrder.includes(id)) : []
    // por si se agrega un KPI nuevo después de que alguien ya guardó preferencias
    const missing = defaultOrder.filter((id) => !order.includes(id))
    const hidden = Array.isArray(parsed.hidden) ? parsed.hidden.filter((id) => defaultOrder.includes(id)) : []
    return { order: [...order, ...missing], hidden }
  } catch {
    return { order: defaultOrder, hidden: [] }
  }
}

export function saveKpiPrefs(prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs))
  } catch {
    // cuota agotada o localStorage inhabilitado (modo privado): la
    // personalización es una comodidad, no algo crítico — se ignora.
  }
}
