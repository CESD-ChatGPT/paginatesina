/* Export CSV genérico: sin librería — son unas pocas columnas, no vale
   la pena la dependencia. BOM al inicio para que Excel abra los acentos
   bien en vez de mostrarlos rotos. */
/* Excel, LibreOffice y Sheets interpretan como fórmula cualquier celda
   que empiece con = + - @ (o tab/CR). Con datos cargados por usuarios,
   un nombre de producto como =HYPERLINK("http://…"&A1,"ver") se ejecuta
   al abrir el archivo y puede filtrar el resto de la planilla a un
   servidor ajeno. Entrecomillar no alcanza: la fórmula corre igual.

   La mitigación estándar es anteponer un apóstrofo, que esas planillas
   leen como "esto es texto" y no muestran como parte del contenido. */
const FORMULA_START = /^[=+\-@\t\r]/
/* Un número negativo empieza con "-" pero no es una fórmula. Sin esta
   excepción, un -13 se exportaría como texto y Excel lo dejaría afuera
   de cualquier SUM: el arreglo de seguridad rompería las cuentas. */
const PLAIN_NUMBER = /^-?\d+(\.\d+)?$/

function escapeCell(value) {
  const raw = String(value ?? '')
  const needsGuard = FORMULA_START.test(raw) && !PLAIN_NUMBER.test(raw)
  const s = needsGuard ? `'${raw}` : raw
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(rows, columns) {
  const header = columns.map((c) => escapeCell(c.label)).join(',')
  const lines = rows.map((row) => columns.map((c) => escapeCell(c.value(row))).join(','))
  return [header, ...lines].join('\r\n')
}

const BOM = '﻿'

export function downloadCsv(filename, csvString) {
  const blob = new Blob([BOM + csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
