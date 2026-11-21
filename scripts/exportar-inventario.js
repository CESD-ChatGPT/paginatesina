/* ═══════════════════════════════════════════════════════════════
   EXPORTAR EL INVENTARIO DEL CHATBOT STOCK

   Cómo usarlo:
     1. Abrí el ChatBot Stock y entrá con tu usuario.
     2. F12 → pestaña «Console».
     3. Pegá TODO este archivo y Enter.
     4. Se descarga `inventario.json`.
     5. Copiá ese archivo a `public/inventario.json` de este
        repositorio y volvé a publicar.

   Tiene que correrse DESDE la página del ChatBot: ahí la petición
   es del mismo origen y viaja la cookie de sesión. Desde afuera el
   navegador la bloquea por CORS, pase lo que pase.
   ═══════════════════════════════════════════════════════════════ */
(async () => {
  const red = location.pathname.split('/')[2] || 'cesd'
  const url = `/api/v1/networks/${encodeURIComponent(red)}/storages/inventario`

  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) {
    console.error(`No se pudo leer el inventario (HTTP ${res.status}). ¿Sesión iniciada?`)
    return
  }

  const datos = await res.json()
  const filas = Array.isArray(datos) ? datos : (datos.items || datos.data || [])
  if (!filas.length) {
    console.warn('El inventario vino vacío; no se descarga nada.')
    return
  }

  const blob = new Blob([JSON.stringify(filas, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'inventario.json'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(a.href)

  console.log(`✓ ${filas.length} productos exportados a inventario.json`)
})()
