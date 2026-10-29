import { useState } from 'react'
import { Bot, LayoutDashboard, Package, History, Send, Mic, Sun, Moon, Boxes } from 'lucide-react'

/* Demo del ChatBot Stock para publicar en un servicio separado. Solo lectura,
   sin login y con datos ficticios que coinciden con las bases
   solvus_demo_inventario y solvus_demo_movimientos de Vento. Replica la vista
   del ChatBot y del dashboard de Vento, con la misma paleta. */

const PRODUCTOS = [
  { sku: 'INF-MONI-001', producto: 'Monitor 24 pulgadas Nova', categoria: 'Informática', subcategoria: 'Monitores', cantidad: 3, minimo: 5, ubicacion: 'A2' },
  { sku: 'OFI-PAPE-001', producto: 'Resma de papel A4', categoria: 'Oficina', subcategoria: 'Papelería', cantidad: 22, minimo: 8, ubicacion: 'C1' },
  { sku: 'INF-AUDI-001', producto: 'Auriculares inalámbricos Sol', categoria: 'Informática', subcategoria: 'Audio', cantidad: 9, minimo: 3, ubicacion: 'A3' },
  { sku: 'INF-TECL-001', producto: 'Teclado mecánico Aurora', categoria: 'Informática', subcategoria: 'Teclados', cantidad: 18, minimo: 6, ubicacion: 'A1' },
  { sku: 'INF-CABL-001', producto: 'Cable HDMI 2 metros', categoria: 'Informática', subcategoria: 'Cables', cantidad: 0, minimo: 3, ubicacion: 'B2' },
  { sku: 'INS-TINT-001', producto: 'Cartucho negro de prueba', categoria: 'Insumos', subcategoria: 'Impresión', cantidad: 2, minimo: 4, ubicacion: 'C2' },
  { sku: 'MOB-SILL-001', producto: 'Silla ergonómica Lumen', categoria: 'Mobiliario', subcategoria: 'Sillas', cantidad: 7, minimo: 2, ubicacion: 'D1' },
  { sku: 'INF-MOUS-001', producto: 'Mouse inalámbrico Brisa', categoria: 'Informática', subcategoria: 'Mouse', cantidad: 12, minimo: 4, ubicacion: 'B1' },
]

const MOVIMIENTOS = [
  { id: 'demo-mov-008', fecha: '2026-10-26 15:45', sku: 'MOB-SILL-001', producto: 'Silla ergonómica Lumen', tipo: 'entrada' },
  { id: 'demo-mov-007', fecha: '2026-10-25 09:50', sku: 'INF-MOUS-001', producto: 'Mouse inalámbrico Brisa', tipo: 'ajuste' },
  { id: 'demo-mov-006', fecha: '2026-10-24 12:30', sku: 'INS-TINT-001', producto: 'Cartucho negro de prueba', tipo: 'salida' },
  { id: 'demo-mov-005', fecha: '2026-10-23 16:20', sku: 'OFI-PAPE-001', producto: 'Resma de papel A4', tipo: 'entrada' },
  { id: 'demo-mov-004', fecha: '2026-10-22 10:05', sku: 'INF-CABL-001', producto: 'Cable HDMI 2 metros', tipo: 'salida' },
  { id: 'demo-mov-003', fecha: '2026-10-21 14:10', sku: 'INF-MONI-001', producto: 'Monitor 24 pulgadas Nova', tipo: 'entrada' },
  { id: 'demo-mov-002', fecha: '2026-10-21 11:40', sku: 'INF-TECL-001', producto: 'Teclado mecánico Aurora', tipo: 'salida' },
  { id: 'demo-mov-001', fecha: '2026-10-20 09:15', sku: 'INF-TECL-001', producto: 'Teclado mecánico Aurora', tipo: 'entrada' },
]

const PALETA = {
  oscuro: { fondo: '#071a26', tarjeta: '#0b2c40', borde: '#16394d', texto: '#f2f6f7', suave: '#93a7b1', acento: '#4fb3ce', acentoTexto: '#0b2c40', alerta: '#e8a060', critico: '#f07a7a', ok: '#5fd39a' },
  claro: { fondo: '#f6f8f9', tarjeta: '#ffffff', borde: '#dde4e8', texto: '#0a0a0a', suave: '#5a6b75', acento: '#1f6c82', acentoTexto: '#ffffff', alerta: '#b5652a', critico: '#b8414b', ok: '#1f8a5b' },
}

function estado(p) {
  if (p.cantidad === 0) return 'sin'
  if (p.cantidad < p.minimo) return 'bajo'
  return 'ok'
}

const ALERTAS = PRODUCTOS.filter((p) => estado(p) !== 'ok')
const UBICACIONES = Object.entries(
  PRODUCTOS.reduce((acc, p) => ({ ...acc, [p.ubicacion]: (acc[p.ubicacion] || 0) + p.cantidad }), {})
).sort((a, b) => b[1] - a[1])
const TOTAL_UNIDADES = PRODUCTOS.reduce((s, p) => s + p.cantidad, 0)

const SALUDO = 'Hola Demo SOLVUS. Ya estoy conectado al inventario. Podés pedir: reducir 3 del SKU 2, sumar 5, consultar stock o escribir ayuda. Los cambios requieren confirmación.'

function respuestaDemo(texto) {
  const t = texto.toLowerCase()
  if (t.includes('alerta')) return `Hay ${ALERTAS.length} alertas: ${ALERTAS.map((p) => p.producto).join(', ')}.`
  if (t.includes('stock') || t.includes('consult')) return `Hay ${TOTAL_UNIDADES} unidades en ${PRODUCTOS.length} productos.`
  return 'Modo demo: en la versión real esta consulta se responde con el inventario del cliente. Acá no se guarda ningún cambio.'
}

export default function DemoVento() {
  const [tema, setTema] = useState('oscuro')
  const [vista, setVista] = useState('chat')
  const [mensajes, setMensajes] = useState([{ de: 'bot', texto: SALUDO }])
  const [borrador, setBorrador] = useState('')
  const c = PALETA[tema]

  function enviar(e) {
    e.preventDefault()
    const texto = borrador.trim()
    if (!texto) return
    setMensajes((m) => [...m, { de: 'yo', texto }, { de: 'bot', texto: respuestaDemo(texto) }])
    setBorrador('')
  }

  const tab = (id, etiqueta, Icono) => (
    <button
      key={id}
      type="button"
      onClick={() => setVista(id)}
      aria-current={vista === id ? 'page' : undefined}
      className="flex items-center gap-2 min-h-[44px] px-4 text-[14px] text-left"
      style={{
        background: vista === id ? c.tarjeta : 'transparent',
        color: vista === id ? c.acento : c.suave,
        borderRadius: '6px',
      }}
    >
      <Icono size={16} aria-hidden="true" />
      {etiqueta}
    </button>
  )

  return (
    <div className="min-h-screen" style={{ background: c.fondo, color: c.texto, fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="text-center text-[13px] py-2" style={{ background: c.tarjeta, color: c.acento }}>
        <strong>Demo SOLVUS</strong> · datos ficticios · modo solo lectura
      </div>

      <div className="flex flex-col md:flex-row min-h-[calc(100vh-36px)]">
        <nav aria-label="Secciones" className="flex md:flex-col gap-1 p-3 md:w-56 md:border-r" style={{ borderColor: c.borde }}>
          <p className="hidden md:flex items-center gap-2 px-4 py-3 text-[15px] font-semibold tracking-wide">
            <Boxes size={18} aria-hidden="true" /> SOLVUS
          </p>
          {tab('chat', 'ChatBot Stock', Bot)}
          {tab('dashboard', 'Dashboard', LayoutDashboard)}
          {tab('productos', 'Productos', Package)}
          {tab('movimientos', 'Movimientos', History)}
        </nav>

        <main className="flex-1 p-4 md:p-8 min-w-0">
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => setTema(tema === 'oscuro' ? 'claro' : 'oscuro')}
              className="flex items-center gap-2 min-h-[44px] px-4 text-[13px] border"
              style={{ borderColor: c.borde, borderRadius: '6px', background: c.tarjeta, color: c.texto }}
            >
              {tema === 'oscuro' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
              {tema === 'oscuro' ? 'Modo claro' : 'Modo oscuro'}
            </button>
          </div>

          {vista === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
              <section className="flex flex-col min-h-[560px] border" style={{ borderColor: c.borde, borderRadius: '8px', background: c.tarjeta }}>
                <header className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: c.borde }}>
                  <Bot size={20} style={{ color: c.acento }} aria-hidden="true" />
                  <h1 className="text-[16px] font-semibold">ChatBot Stock</h1>
                  <span className="ml-auto text-[12px]" style={{ color: c.suave }}>8 productos · {ALERTAS.length} alertas</span>
                </header>
                <div className="flex-1 p-5 space-y-3 overflow-y-auto" aria-live="polite">
                  {mensajes.map((m, i) => (
                    <div
                      key={i}
                      className={`max-w-[85%] px-4 py-3 text-[14px] leading-relaxed ${m.de === 'yo' ? 'ml-auto' : ''}`}
                      style={{
                        background: m.de === 'yo' ? c.acento : c.fondo,
                        color: m.de === 'yo' ? c.acentoTexto : c.texto,
                        border: m.de === 'yo' ? 'none' : `1px solid ${c.borde}`,
                        borderRadius: '8px',
                      }}
                    >
                      {m.texto}
                    </div>
                  ))}
                </div>
                <form onSubmit={enviar} className="flex items-center gap-2 p-4 border-t" style={{ borderColor: c.borde }}>
                  <label className="sr-only" htmlFor="mensaje-demo">Escribí un mensaje</label>
                  <input
                    id="mensaje-demo"
                    value={borrador}
                    onChange={(e) => setBorrador(e.target.value)}
                    placeholder="Escribí un mensaje"
                    className="flex-1 min-h-[44px] px-4 text-[14px] outline-none"
                    style={{ background: c.fondo, color: c.texto, border: `1px solid ${c.borde}`, borderRadius: '6px' }}
                  />
                  <button type="button" aria-label="Dictar (no disponible en la demo)" className="min-h-[44px] min-w-[44px] grid place-items-center" style={{ color: c.suave }}>
                    <Mic size={18} aria-hidden="true" />
                  </button>
                  <button type="submit" aria-label="Enviar" className="min-h-[44px] min-w-[44px] grid place-items-center" style={{ background: c.acento, color: c.acentoTexto, borderRadius: '6px' }}>
                    <Send size={18} aria-hidden="true" />
                  </button>
                </form>
              </section>

              <aside className="flex flex-col gap-4">
                <div className="p-4 border" style={{ borderColor: c.borde, borderRadius: '8px', background: c.tarjeta }}>
                  <h2 className="text-[14px] font-semibold mb-1">Alertas de stock</h2>
                  <p className="text-[12px] mb-3" style={{ color: c.suave }}>Productos en el mínimo o por debajo.</p>
                  <ul className="space-y-2">
                    {ALERTAS.map((p) => (
                      <li key={p.sku} className="p-3 text-[13px] border-l-4" style={{ borderColor: estado(p) === 'sin' ? c.critico : c.alerta, background: c.fondo, borderRadius: '4px' }}>
                        <span className="block font-medium">SKU {p.sku} · {p.producto}</span>
                        <span style={{ color: c.suave }}>Stock: {p.cantidad} unidad · mínimo: {p.minimo} · ubicación: {p.ubicacion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          )}

          {vista === 'dashboard' && (
            <div className="space-y-4">
              <h1 className="text-[22px] font-semibold">Dashboard analítico</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  ['Productos', PRODUCTOS.length, 'en inventario'],
                  ['Unidades', TOTAL_UNIDADES, 'stock total'],
                  ['Alertas', ALERTAS.length, 'sin stock o en el mínimo'],
                  ['Movimientos', MOVIMIENTOS.length, 'últimos 30 días'],
                ].map(([titulo, valor, nota]) => (
                  <div key={titulo} className="p-4 border" style={{ borderColor: c.borde, borderRadius: '8px', background: c.tarjeta }}>
                    <p className="text-[11px] uppercase tracking-wide" style={{ color: c.suave }}>{titulo}</p>
                    <p className="text-[28px] font-semibold" style={{ color: titulo === 'Alertas' ? c.alerta : c.texto }}>{valor}</p>
                    <p className="text-[12px]" style={{ color: c.suave }}>{nota}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <section className="p-4 border" style={{ borderColor: c.borde, borderRadius: '8px', background: c.tarjeta }}>
                  <h2 className="text-[14px] font-semibold mb-4">Stock por ubicación</h2>
                  <ul className="space-y-3">
                    {UBICACIONES.map(([ub, cant]) => (
                      <li key={ub} className="flex items-center gap-3 text-[13px]">
                        <span className="w-8" style={{ color: c.suave }}>{ub}</span>
                        <div className="flex-1 h-3" style={{ background: c.fondo, borderRadius: '2px' }}>
                          <div style={{ width: `${(cant / UBICACIONES[0][1]) * 100}%`, background: c.acento, height: '100%', borderRadius: '2px' }} />
                        </div>
                        <span className="w-8 text-right">{cant}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="p-4 border" style={{ borderColor: c.borde, borderRadius: '8px', background: c.tarjeta }}>
                  <h2 className="text-[14px] font-semibold mb-4">Estado del stock</h2>
                  <p className="text-[13px]">
                    <span style={{ color: c.ok }}>OK {PRODUCTOS.filter((p) => estado(p) === 'ok').length}</span>{' · '}
                    <span style={{ color: c.alerta }}>Bajo mínimo {PRODUCTOS.filter((p) => estado(p) === 'bajo').length}</span>{' · '}
                    <span style={{ color: c.critico }}>Sin stock {PRODUCTOS.filter((p) => estado(p) === 'sin').length}</span>
                  </p>
                  <h3 className="text-[13px] font-semibold mt-6 mb-2">Para reponer</h3>
                  <ul className="space-y-2 text-[13px]">
                    {ALERTAS.map((p) => (
                      <li key={p.sku} className="flex justify-between gap-2">
                        <span>{p.producto}</span>
                        <span style={{ color: estado(p) === 'sin' ? c.critico : c.alerta }}>
                          {estado(p) === 'sin' ? 'Sin stock' : 'Bajo mínimo'} · {p.cantidad}/{p.minimo}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          )}

          {vista === 'productos' && (
            <section>
              <h1 className="text-[22px] font-semibold mb-4">Productos</h1>
              <Tabla c={c} columnas={['SKU', 'Producto', 'Categoría', 'Subcategoría', 'Cantidad', 'Mínimo', 'Ubicación']}
                filas={PRODUCTOS.map((p) => [p.sku, p.producto, p.categoria, p.subcategoria, p.cantidad, p.minimo, p.ubicacion])} />
            </section>
          )}

          {vista === 'movimientos' && (
            <section>
              <h1 className="text-[22px] font-semibold mb-4">Movimientos</h1>
              <Tabla c={c} columnas={['ID', 'Fecha', 'SKU', 'Producto', 'Tipo']}
                filas={MOVIMIENTOS.map((m) => [m.id, m.fecha, m.sku, m.producto, m.tipo])} />
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

function Tabla({ c, columnas, filas }) {
  return (
    <div className="w-full overflow-x-auto border" style={{ borderColor: c.borde, borderRadius: '8px', background: c.tarjeta }}>
      <table className="w-full text-[14px] text-left">
        <thead style={{ color: c.suave }}>
          <tr>
            {columnas.map((col) => (
              <th key={col} className="px-4 py-3 font-medium text-[12px] uppercase tracking-wide whitespace-nowrap">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => (
            <tr key={i} className="border-t" style={{ borderColor: c.borde }}>
              {fila.map((celda, j) => (
                <td key={j} className="px-4 py-3 whitespace-nowrap">{celda}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
