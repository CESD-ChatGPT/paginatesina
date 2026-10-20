import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, AlertTriangle, Check } from 'lucide-react'
import { inventoryService } from '../../data/inventory'
import { analizarCatalogo, PLANTILLA_CSV } from '../../lib/importarCatalogo'

/* ═══════════════════════════════════════════════════════════════
   IMPORTAR CATÁLOGO

   Dos pasos a propósito: primero se lee el archivo y se muestra qué
   va a pasar, y recién si el usuario confirma se escribe. Un import
   a medias —200 productos cargados y 200 no, sin saber cuáles— es
   peor que uno que no arrancó.

   Las filas con problema no frenan al resto: se cargan las buenas y
   se listan las otras con su número de línea, para poder arreglar
   la planilla y volver a intentar solo con esas.
   ═══════════════════════════════════════════════════════════════ */

export default function ImportPanel({ onImportado }) {
  const inputRef = useRef(null)
  const [analisis, setAnalisis] = useState(null)
  const [nombreArchivo, setNombreArchivo] = useState('')
  const [estado, setEstado] = useState('idle') // idle | leyendo | escribiendo | listo
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')
  const [arrastrando, setArrastrando] = useState(false)

  async function leerArchivo(file) {
    if (!file) return
    setError(''); setResultado(null); setEstado('leyendo')
    setNombreArchivo(file.name)
    try {
      const texto = await file.text()
      const filas = await inventoryService.getStockRows().catch(() => [])
      setAnalisis(analizarCatalogo(texto, { skusExistentes: new Set(filas.map((f) => f.sku)) }))
    } catch (e) {
      setError(`No pude leer el archivo: ${e.message}`)
      setAnalisis(null)
    } finally {
      setEstado('idle')
    }
  }

  async function confirmar() {
    if (!analisis?.listos.length) return
    setEstado('escribiendo')
    const cargados = []
    const fallados = []

    for (const p of analisis.listos) {
      try {
        await inventoryService.createProduct(p)
        cargados.push(p.sku)
      } catch (e) {
        fallados.push({ sku: p.sku, motivo: e.message })
      }
    }

    setResultado({ cargados, fallados })
    setAnalisis(null)
    setEstado('listo')
    onImportado?.()
  }

  function descargarPlantilla() {
    const blob = new Blob(['\uFEFF' + PLANTILLA_CSV], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'solvus-plantilla-catalogo.csv'
    document.body.appendChild(a); a.click(); a.remove()
    URL.revokeObjectURL(a.href)
  }

  return (
    <section className="panel p-6">
      <h2 className="t-h3 mb-1.5 flex items-center gap-2">
        <FileSpreadsheet className="w-4 h-4" style={{ color: 'var(--accent)' }} aria-hidden="true" />
        Importar desde planilla
      </h2>
      <p className="text-[13px] text-graphite mb-5 max-w-[62ch]">
        Exportá tu planilla como CSV y soltala acá. Reconoce las columnas por su
        nombre —SKU o código, producto o descripción, stock mínimo o
        mínimo— y acepta el punto y coma que usa Excel en español.
      </p>

      <div
        onDragOver={(e) => { e.preventDefault(); setArrastrando(true) }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => { e.preventDefault(); setArrastrando(false); leerArchivo(e.dataTransfer.files?.[0]) }}
        className="flex flex-col items-center justify-center gap-3 p-8 border border-dashed text-center transition-colors"
        style={{
          borderRadius: '3px',
          borderColor: arrastrando ? 'var(--accent)' : 'var(--rule-strong)',
          background: arrastrando ? 'var(--accent-wash)' : 'transparent',
        }}
      >
        <Upload className="w-5 h-5 text-muted" aria-hidden="true" />
        <p className="text-[13.5px] text-graphite">
          Arrastrá el CSV acá, o
        </p>
        <input
          ref={inputRef}
          id="import-file"
          type="file"
          accept=".csv,text/csv,text/plain"
          className="sr-only"
          onChange={(e) => leerArchivo(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center justify-center min-h-[40px] px-4 text-[13px] font-medium border"
          style={{ borderColor: 'var(--rule-strong)', borderRadius: '2px' }}
        >
          Elegir archivo
        </button>
        {nombreArchivo && (
          <p className="t-mono text-[11px] text-muted">{nombreArchivo}</p>
        )}
        <button
          type="button"
          onClick={descargarPlantilla}
          className="t-mono text-[11px] underline underline-offset-4 text-muted hover:text-[var(--accent)]"
        >
          Descargar plantilla de ejemplo
        </button>
      </div>

      {estado === 'leyendo' && (
        <p className="t-mono text-[11px] text-muted mt-4">Leyendo el archivo…</p>
      )}

      {error && (
        <p className="text-[13px] mt-4" style={{ color: 'var(--alert)' }}>{error}</p>
      )}

      {/* Paso 2: qué va a pasar, antes de escribir nada */}
      {analisis && (
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <div>
              <p className="t-label">Se van a cargar</p>
              <p className="t-figure text-[22px]" style={{ color: 'var(--positive)' }}>
                {analisis.listos.length}
              </p>
            </div>
            <div>
              <p className="t-label">Con problemas</p>
              <p className="t-figure text-[22px]"
                style={{ color: analisis.problemas.length ? 'var(--alert)' : 'var(--ink)' }}>
                {analisis.problemas.length}
              </p>
            </div>
            <div>
              <p className="t-label">Filas en el archivo</p>
              <p className="t-figure text-[22px]">{analisis.total}</p>
            </div>
          </div>

          {analisis.problemas.length > 0 && (
            <div className="border-l-2 pl-4 py-1" style={{ borderColor: 'var(--alert)' }}>
              <p className="text-[12.5px] font-medium mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--alert)' }} aria-hidden="true" />
                Estas filas se saltean
              </p>
              <ul className="flex flex-col gap-1 max-h-[180px] overflow-y-auto">
                {analisis.problemas.slice(0, 50).map((p, i) => (
                  <li key={i} className="t-mono text-[11px] text-graphite">
                    Línea {p.fila}: {p.motivo}
                  </li>
                ))}
              </ul>
              {analisis.problemas.length > 50 && (
                <p className="t-mono text-[10px] text-muted mt-1">
                  y {analisis.problemas.length - 50} más
                </p>
              )}
            </div>
          )}

          {analisis.listos.length > 0 && (
            <div className="overflow-x-auto border border-rule" style={{ borderRadius: '2px' }}>
              <table className="w-full" style={{ minWidth: '540px' }}>
                <thead>
                  <tr className="border-b border-rule">
                    <th className="t-label text-left px-3 py-2">SKU</th>
                    <th className="t-label text-left px-3 py-2">Producto</th>
                    <th className="t-label text-right px-3 py-2">Costo</th>
                    <th className="t-label text-right px-3 py-2">Mínimo</th>
                    <th className="t-label text-right px-3 py-2">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {analisis.listos.slice(0, 8).map((p) => (
                    <tr key={p.sku} className="border-b border-rule last:border-b-0">
                      <td className="t-mono text-[12px] px-3 py-2">{p.sku}</td>
                      <td className="text-[12.5px] px-3 py-2">{p.name}</td>
                      <td className="t-figure text-[12px] text-right px-3 py-2">
                        {p.unitCost === null ? '—' : p.unitCost}
                      </td>
                      <td className="t-figure text-[12px] text-right px-3 py-2">{p.reorderPoint}</td>
                      <td className="t-figure text-[12px] text-right px-3 py-2">{p.initialQty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {analisis.listos.length > 8 && (
                <p className="t-mono text-[10px] text-muted px-3 py-2">
                  y {analisis.listos.length - 8} productos más
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3 items-center">
            <button
              type="button"
              onClick={confirmar}
              disabled={!analisis.listos.length || estado === 'escribiendo'}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 text-[14px] font-medium disabled:opacity-45"
              style={{ background: 'var(--accent)', color: 'var(--accent-ink)', borderRadius: '2px' }}
            >
              {estado === 'escribiendo'
                ? 'Cargando…'
                : `Cargar ${analisis.listos.length} producto${analisis.listos.length === 1 ? '' : 's'}`}
            </button>
            <button
              type="button"
              onClick={() => { setAnalisis(null); setNombreArchivo('') }}
              className="t-mono text-[11px] underline underline-offset-4 text-muted hover:text-[var(--accent)]"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {resultado && (
        <div className="mt-6 border-l-2 pl-4 py-1"
          style={{ borderColor: resultado.fallados.length ? 'var(--warning)' : 'var(--positive)' }}>
          <p className="text-[13px] font-medium flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" style={{ color: 'var(--positive)' }} aria-hidden="true" />
            {resultado.cargados.length} producto{resultado.cargados.length === 1 ? '' : 's'} cargado
            {resultado.cargados.length === 1 ? '' : 's'}.
          </p>
          {resultado.fallados.length > 0 && (
            <ul className="flex flex-col gap-1 mt-2">
              {resultado.fallados.map((f, i) => (
                <li key={i} className="t-mono text-[11px]" style={{ color: 'var(--alert)' }}>
                  {f.sku}: {f.motivo}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}
