/* ═══════════════════════════════════════════════════════════════
   EXPORT PDF

   El CSV sirve para seguir trabajando los datos; el PDF sirve para
   mandar, imprimir y archivar — una foto fechada del depósito que no
   se edita por accidente.

   jsPDF pesa ~100 KB gzip, más que todo el panel. Va detrás de un
   import() dinámico y solo baja cuando alguien aprieta "Exportar PDF":
   quien nunca exporta no lo paga. Mismo patrón que el SDK de Supabase
   en lib/supabase.js.
   ═══════════════════════════════════════════════════════════════ */

/* La paleta del documento es la de marca, pero resuelta a valores
   fijos: el PDF no tiene tokens CSS ni modo oscuro — es tinta sobre
   papel blanco, siempre. */
const TINTA = [10, 10, 10]
const GRAFITO = [72, 90, 100]
const APAGADO = [90, 107, 117]
const ACENTO = [31, 108, 130]
const REGLA = [221, 228, 232]

let modulos = null
function cargar() {
  if (!modulos) {
    modulos = Promise.all([
      import('jspdf').then((m) => m.jsPDF),
      import('jspdf-autotable').then((m) => m.default ?? m.autoTable),
    ]).then(([jsPDF, autoTable]) => ({ jsPDF, autoTable }))
  }
  return modulos
}

function hoyLegible() {
  return new Date().toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

/* El pie va en todas las páginas y se numera al final, cuando ya se
   sabe cuántas hay. */
function pie(doc, subtitulo) {
  const total = doc.internal.getNumberOfPages()
  const { width, height } = doc.internal.pageSize
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...APAGADO)
    doc.text(subtitulo, 40, height - 24)
    doc.text(`${i} / ${total}`, width - 40, height - 24, { align: 'right' })
  }
}

function encabezado(doc, titulo, bajada) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...TINTA)
  doc.text('SOLVUS', 40, 52)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...ACENTO)
  doc.text('CONTROL DE INVENTARIO', 40, 66)

  doc.setFontSize(9)
  doc.setTextColor(...APAGADO)
  doc.text(hoyLegible(), doc.internal.pageSize.width - 40, 52, { align: 'right' })

  doc.setDrawColor(...REGLA)
  doc.setLineWidth(0.5)
  doc.line(40, 80, doc.internal.pageSize.width - 40, 80)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...TINTA)
  doc.text(titulo, 40, 104)

  if (bajada) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(...GRAFITO)
    doc.text(bajada, 40, 120, { maxWidth: doc.internal.pageSize.width - 80 })
  }
  return bajada ? 136 : 120
}

/* Una fila de cifras sueltas antes de la tabla, como el panel. */
function resumen(doc, y, items) {
  const { width } = doc.internal.pageSize
  const ancho = (width - 80) / items.length
  items.forEach((item, i) => {
    const x = 40 + i * ancho
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...APAGADO)
    doc.text(item.label.toUpperCase(), x, y)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...(item.tono || TINTA))
    doc.text(String(item.value), x, y + 18)
  })
  return y + 34
}

/**
 * @param {object}   opciones
 * @param {string}   opciones.titulo
 * @param {string}  [opciones.bajada]
 * @param {Array}   [opciones.resumen]  [{label, value, tono}]
 * @param {string[]} opciones.columnas
 * @param {Array[]}  opciones.filas
 * @param {string}   opciones.archivo
 */
export async function exportarPdf({ titulo, bajada, resumen: cifras, columnas, filas, archivo }) {
  const { jsPDF, autoTable } = await cargar()
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })

  let y = encabezado(doc, titulo, bajada)
  if (cifras?.length) y = resumen(doc, y + 6, cifras)

  autoTable(doc, {
    startY: y + 8,
    head: [columnas],
    body: filas,
    margin: { left: 40, right: 40, bottom: 48 },
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 6,
      textColor: GRAFITO,
      lineColor: REGLA,
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: false,
      textColor: APAGADO,
      fontStyle: 'bold',
      fontSize: 7.5,
      lineWidth: { bottom: 1 },
    },
    /* Sin cebra: el sistema divide con reglas finas, como un libro
       contable, no con bandas de color. */
    alternateRowStyles: { fillColor: false },
    theme: 'plain',
  })

  pie(doc, `${titulo} · generado por SOLVUS`)
  doc.save(archivo)
}

export function nombreDeArchivo(base) {
  return `solvus-${base}-${new Date().toISOString().slice(0, 10)}.pdf`
}
