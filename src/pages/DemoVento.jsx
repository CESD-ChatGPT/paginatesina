import { useEffect, useState } from 'react'

/* Demo del ChatBot Stock para publicar en un servicio separado.
   Solo lectura, sin login y con datos ficticios. Los datos son los mismos
   de las bases solvus_demo_inventario y solvus_demo_movimientos de Vento. */

const INVENTARIO = [
  { sku: 'INF-MONI-001', producto: 'Monitor 24 pulgadas Nova', categoria: 'Informática', subcategoria: 'Monitores', cantidad: 3, stockMinimo: 5 },
  { sku: 'OFI-PAPE-001', producto: 'Resma de papel A4', categoria: 'Oficina', subcategoria: 'Papelería', cantidad: 22, stockMinimo: 8 },
  { sku: 'INF-AUDI-001', producto: 'Auriculares inalámbricos Sol', categoria: 'Informática', subcategoria: 'Audio', cantidad: 9, stockMinimo: 3 },
  { sku: 'INF-TECL-001', producto: 'Teclado mecánico Aurora', categoria: 'Informática', subcategoria: 'Teclados', cantidad: 18, stockMinimo: 6 },
  { sku: 'INF-CABL-001', producto: 'Cable HDMI 2 metros', categoria: 'Informática', subcategoria: 'Cables', cantidad: 0, stockMinimo: 3 },
  { sku: 'INS-TINT-001', producto: 'Cartucho negro de prueba', categoria: 'Insumos', subcategoria: 'Impresión', cantidad: 2, stockMinimo: 4 },
  { sku: 'MOB-SILL-001', producto: 'Silla ergonómica Lumen', categoria: 'Mobiliario', subcategoria: 'Sillas', cantidad: 7, stockMinimo: 2 },
  { sku: 'INF-MOUS-001', producto: 'Mouse inalámbrico Brisa', categoria: 'Informática', subcategoria: 'Mouse', cantidad: 12, stockMinimo: 4 },
]

const MOVIMIENTOS = [
  { id: 'demo-mov-001', fecha: '2026-10-20 09:15', sku: 'INF-TECL-001', producto: 'Teclado mecánico Aurora', tipo: 'entrada' },
  { id: 'demo-mov-002', fecha: '2026-10-21 11:40', sku: 'INF-TECL-001', producto: 'Teclado mecánico Aurora', tipo: 'salida' },
  { id: 'demo-mov-003', fecha: '2026-10-21 14:10', sku: 'INF-MONI-001', producto: 'Monitor 24 pulgadas Nova', tipo: 'entrada' },
  { id: 'demo-mov-004', fecha: '2026-10-22 10:05', sku: 'INF-CABL-001', producto: 'Cable HDMI 2 metros', tipo: 'salida' },
  { id: 'demo-mov-005', fecha: '2026-10-23 16:20', sku: 'OFI-PAPE-001', producto: 'Resma de papel A4', tipo: 'entrada' },
  { id: 'demo-mov-006', fecha: '2026-10-24 12:30', sku: 'INS-TINT-001', producto: 'Cartucho negro de prueba', tipo: 'salida' },
  { id: 'demo-mov-007', fecha: '2026-10-25 09:50', sku: 'INF-MOUS-001', producto: 'Mouse inalámbrico Brisa', tipo: 'ajuste' },
  { id: 'demo-mov-008', fecha: '2026-10-26 15:45', sku: 'MOB-SILL-001', producto: 'Silla ergonómica Lumen', tipo: 'entrada' },
]

const VISTAS = [
  { id: 'inventario', titulo: 'solvus_demo_inventario' },
  { id: 'movimientos', titulo: 'solvus_demo_movimientos' },
]

function Tabla({ columnas, filas }) {
  return (
    <div className="w-full max-w-full overflow-x-auto border border-rule" style={{ borderRadius: '3px' }}>
      <table className="w-full text-[14px] text-left">
        <thead className="bg-[var(--surface-sunken)] text-muted">
          <tr>
            {columnas.map((c) => (
              <th key={c} className="px-4 py-3 font-medium t-mono text-[11px] uppercase tracking-wide">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => (
            <tr key={i} className="border-t border-rule">
              {fila.map((celda, j) => (
                <td key={j} className="px-4 py-3">{celda}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function DemoVento() {
  const [vista, setVista] = useState('inventario')

  useEffect(() => {
    document.title = 'Demo ChatBot Stock · SOLVUS'
  }, [])

  return (
    <main className="mx-auto w-full max-w-[1040px] min-w-0 px-4 md:px-8 pt-10 pb-24">
      <div className="mb-8 px-4 py-3 text-[14px] border border-rule" style={{ borderRadius: '3px', background: 'var(--accent-wash)' }}>
        <strong>Demo con datos ficticios.</strong> Solo lectura: no se guarda ningún cambio.
      </div>

      <p className="t-label mb-3">ChatBot Stock</p>
      <h1 className="t-h2 mb-8">Inventario de la demo</h1>

      <div role="tablist" className="flex flex-wrap gap-2 mb-6">
        {VISTAS.map((v) => (
          <button
            key={v.id}
            role="tab"
            aria-selected={vista === v.id}
            onClick={() => setVista(v.id)}
            className="min-h-[44px] px-4 t-mono text-[12px] border"
            style={{
              borderRadius: '2px',
              borderColor: vista === v.id ? 'var(--accent)' : 'var(--rule-strong)',
              background: vista === v.id ? 'var(--accent)' : 'var(--surface)',
              color: vista === v.id ? 'var(--accent-ink)' : 'var(--ink)',
            }}
          >
            {v.titulo}
          </button>
        ))}
      </div>

      {vista === 'inventario' ? (
        <Tabla
          columnas={['sku', 'producto', 'categoria', 'subcategoria', 'cantidad', 'stock_minimo']}
          filas={INVENTARIO.map((p) => [
            p.sku,
            p.producto,
            p.categoria,
            p.subcategoria,
            <span key="c" className={p.cantidad < p.stockMinimo ? 'font-medium' : ''} style={p.cantidad < p.stockMinimo ? { color: 'var(--accent)' } : undefined}>
              {p.cantidad}
            </span>,
            p.stockMinimo,
          ])}
        />
      ) : (
        <Tabla
          columnas={['id', 'fecha', 'sku', 'producto', 'tipo']}
          filas={MOVIMIENTOS.map((m) => [m.id, m.fecha, m.sku, m.producto, m.tipo])}
        />
      )}
    </main>
  )
}
