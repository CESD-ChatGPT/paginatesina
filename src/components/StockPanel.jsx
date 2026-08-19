/* Panel de producto real para el hero.
   Reemplaza la caja de vidrio decorativa: muestra qué hace StockAI
   (filas de inventario + una recomendación de reposición de la IA)
   en lugar de insinuarlo con un ícono. */

const ROWS = [
  { sku: 'MB-2041', name: 'Teclado mecánico TKL', stock: 142, reorder: 60, state: 'ok' },
  { sku: 'MB-1180', name: 'Monitor 24" IPS', stock: 18, reorder: 45, state: 'low' },
  { sku: 'AC-3392', name: 'Hub USB-C 7 puertos', stock: 87, reorder: 40, state: 'ok' },
  { sku: 'MB-0774', name: 'Webcam 1080p', stock: 31, reorder: 35, state: 'watch' },
]

const STATE_LABEL = {
  ok: 'En rango',
  low: 'Bajo',
  watch: 'Por quebrar',
}

export default function StockPanel() {
  return (
    <div className="panel overflow-hidden">
      {/* Encabezado del panel */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-rule">
        <span className="t-label">Depósito central</span>
        <span className="inline-flex items-center gap-1.5 t-mono text-[11px] text-graphite">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--positive)' }}
            aria-hidden="true"
          />
          Sincronizado
        </span>
      </div>

      {/* Tabla de inventario.
          En pantallas angostas la columna Producto se pliega bajo el SKU
          en vez de recortarse, para no ocultar el estado de stock. */}
      <table className="w-full border-collapse">
        <caption className="sr-only">
          Muestra del inventario en tiempo real con niveles de stock y punto de reposición
        </caption>
        <thead>
          <tr className="border-b border-rule">
            <th scope="col" className="t-label text-left px-4 py-2 font-medium">SKU</th>
            <th scope="col" className="t-label text-left px-2 py-2 font-medium hidden sm:table-cell">
              Producto
            </th>
            <th scope="col" className="t-label text-right px-2 py-2 font-medium">Stock</th>
            <th scope="col" className="t-label text-right px-4 py-2 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr
              key={row.sku}
              className="border-b border-rule last:border-b-0 transition-colors hover:bg-[var(--surface-sunken)]"
            >
              <td className="px-4 py-2.5 align-top">
                <span className="t-mono text-[13px] whitespace-nowrap">{row.sku}</span>
                <span className="block sm:hidden text-[12px] text-muted leading-tight mt-0.5">
                  {row.name}
                </span>
              </td>
              <td className="text-[13px] px-2 py-2.5 text-graphite hidden sm:table-cell">
                {row.name}
              </td>
              <td className="t-figure text-[13px] px-2 py-2.5 text-right tabular-nums align-top whitespace-nowrap">
                {row.stock}
                <span className="text-muted"> / {row.reorder}</span>
              </td>
              <td className="px-4 py-2.5 text-right whitespace-nowrap align-top">
                <span
                  className="t-mono text-[11px]"
                  style={{
                    color:
                      row.state === 'ok'
                        ? 'var(--positive)'
                        : row.state === 'low'
                        ? 'var(--alert)'
                        : 'var(--graphite)',
                  }}
                >
                  {STATE_LABEL[row.state]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Recomendación de la IA — el único lugar del panel con acento */}
      <div
        className="px-4 py-3 border-t"
        style={{ background: 'var(--accent-wash)', borderColor: 'var(--rule)' }}
      >
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <span className="t-label" style={{ color: 'var(--accent)' }}>
            Sugerencia de reposición
          </span>
          <span className="t-mono text-[11px] text-graphite">confianza 94%</span>
        </div>
        <p className="text-[13px] leading-snug">
          Reponer <span className="t-mono">MB-1180</span> —{' '}
          <span className="t-figure">240 u.</span>{' '}
          <span className="text-graphite">antes del 12/03 para evitar quiebre.</span>
        </p>
      </div>
    </div>
  )
}
