/* ═══════════════════════════════════════════════════════════════
   IMPORTAR CATÁLOGO DESDE PLANILLA

   Nadie carga 400 productos a mano. Esto es la diferencia entre
   "lo pruebo algún día" y "lo estoy usando hoy".

   Lee CSV, que es lo que exporta cualquier planilla —Excel, Sheets,
   LibreOffice— sin pedirle al usuario que instale nada ni que suba
   un .xlsx que habría que parsear con una librería de 300 KB.

   Lo que hace y no es obvio:

   · Detecta el separador. Excel en español exporta con punto y coma
     porque la coma es el separador decimal. Asumir coma rompe el
     archivo de la mitad del mundo.

   · Acepta nombres de columna en varios idiomas y variantes. La
     planilla real nunca dice `reorder_point`; dice "Stock mínimo",
     "minimo", "punto de reposicion".

   · Separa validar de escribir. Primero se lee todo el archivo y se
     muestra qué va a pasar; recién si el usuario confirma se
     escribe. Un import a medias es peor que uno que no arrancó.
   ═══════════════════════════════════════════════════════════════ */

/* Excel en español usa punto y coma; el resto, coma. Se elige el que
   aparezca más veces en el encabezado, que es la heurística que usan
   las propias planillas al abrir un archivo. */
function detectarSeparador(primeraLinea) {
  const candidatos = [';', ',', '\t', '|']
  let mejor = ','
  let max = 0
  for (const c of candidatos) {
    const n = primeraLinea.split(c).length - 1
    if (n > max) { max = n; mejor = c }
  }
  return mejor
}

/* Parser propio en vez de una librería: son unas pocas reglas y
   evita 40 KB. Soporta comillas, comillas escapadas y saltos de
   línea dentro de una celda entrecomillada, que es donde fallan los
   split(',') caseros. */
export function parsearCsv(texto) {
  const limpio = texto.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')
  const primeraLinea = limpio.slice(0, limpio.indexOf('\n') === -1 ? undefined : limpio.indexOf('\n'))
  const sep = detectarSeparador(primeraLinea)

  const filas = []
  let fila = []
  let celda = ''
  let enComillas = false

  for (let i = 0; i < limpio.length; i++) {
    const ch = limpio[i]
    if (enComillas) {
      if (ch === '"') {
        if (limpio[i + 1] === '"') { celda += '"'; i++ }
        else enComillas = false
      } else celda += ch
    } else if (ch === '"' && celda === '') {
      /* Solo abre comillas al PRINCIPIO de la celda. Una comilla
         suelta en el medio —`Monitor 24" IPS` sin entrecomillar, que
         es lo que escribe una planilla hecha a mano— es un carácter
         más. Tratarla como apertura se tragaba el resto del archivo. */
      enComillas = true
    } else if (ch === sep) {
      fila.push(celda); celda = ''
    } else if (ch === '\n') {
      fila.push(celda); filas.push(fila); fila = []; celda = ''
    } else {
      celda += ch
    }
  }
  if (celda !== '' || fila.length) { fila.push(celda); filas.push(fila) }

  return filas.filter((f) => f.some((c) => c.trim() !== ''))
}

function normalizarClave(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

/* Las planillas reales no usan nombres canónicos. Cada campo acepta
   varios alias, en español y en inglés. */
const ALIAS = {
  sku: ['sku', 'codigo', 'cod', 'articulo', 'item', 'code', 'referencia'],
  name: ['producto', 'nombre', 'descripcion', 'detalle', 'name', 'description'],
  category: ['categoria', 'rubro', 'familia', 'category'],
  unitCost: ['costo', 'costounitario', 'preciocosto', 'costo_unitario', 'unitcost', 'cost', 'precio'],
  reorderPoint: ['stockminimo', 'minimo', 'puntodereposicion', 'puntoreposicion', 'reorder', 'reorderpoint', 'min'],
  initialQty: ['cantidad', 'stock', 'existencia', 'qty', 'quantity', 'cant'],
  ean: ['ean', 'codigodebarras', 'barcode', 'gtin', 'upc'],
  unidad: ['unidad', 'um', 'unit', 'medida'],
  warehouseCode: ['deposito', 'ubicacion', 'almacen', 'warehouse', 'location'],
  supplier: ['proveedor', 'supplier', 'vendor'],
}

export function mapearColumnas(encabezado) {
  const norm = encabezado.map(normalizarClave)
  const mapa = {}
  for (const [campo, alias] of Object.entries(ALIAS)) {
    const i = norm.findIndex((h) => alias.includes(h))
    if (i !== -1) mapa[campo] = i
  }
  return mapa
}

/* "1.234,56" (es) y "1,234.56" (en) son el mismo número escrito de dos
   formas, y una planilla real trae cualquiera de las dos.

   Reglas, en orden:
     1. Están los dos separadores → el último es el decimal.
     2. Hay uno solo y aparece varias veces → es de miles.
     3. Hay uno solo, una vez, seguido de exactamente 3 dígitos → es
        de miles. Acá se decide un caso genuinamente ambiguo:
        "1.500" se lee 1500 y no 1,5. En datos de inventario y precios
        los grupos de 3 son miles mucho más seguido de lo que son
        decimales, y leer 1,5 donde dice mil quinientos es el error
        más caro de los dos.
     4. Cualquier otra cosa → es decimal. */
export function aNumero(valor) {
  const s = String(valor ?? '').trim().replace(/\s/g, '').replace(/[^0-9.,-]/g, '')
  if (!s) return null

  const comas = (s.match(/,/g) || []).length
  const puntos = (s.match(/\./g) || []).length
  let limpio

  if (comas && puntos) {
    limpio = s.lastIndexOf(',') > s.lastIndexOf('.')
      ? s.replace(/\./g, '').replace(',', '.')
      : s.replace(/,/g, '')
  } else if (comas || puntos) {
    const sep = comas ? ',' : '.'
    const veces = comas || puntos
    const despues = s.length - s.lastIndexOf(sep) - 1
    const esDeMiles = veces > 1 || despues === 3
    limpio = esDeMiles
      ? s.split(sep).join('')
      : s.replace(sep, '.')
  } else {
    limpio = s
  }

  const n = Number(limpio)
  return Number.isFinite(n) ? n : null
}

/**
 * Lee el archivo y dice qué va a pasar, sin escribir nada.
 * @returns {{ columnas: object, listos: Array, problemas: Array, total: number }}
 */
export function analizarCatalogo(texto, { skusExistentes = new Set() } = {}) {
  const filas = parsearCsv(texto)
  if (filas.length < 2) {
    return { columnas: {}, listos: [], problemas: [{ fila: 0, motivo: 'El archivo está vacío o no tiene encabezado.' }], total: 0 }
  }

  const columnas = mapearColumnas(filas[0])
  if (columnas.sku === undefined || columnas.name === undefined) {
    return {
      columnas,
      listos: [],
      problemas: [{
        fila: 1,
        motivo: 'Faltan columnas obligatorias. Se necesita uno de (SKU, código) y uno de (producto, nombre).',
      }],
      total: filas.length - 1,
    }
  }

  const listos = []
  const problemas = []
  const vistos = new Set()

  filas.slice(1).forEach((f, i) => {
    const nro = i + 2 // número de línea en el archivo, contando el encabezado
    const val = (campo) => (columnas[campo] === undefined ? '' : (f[columnas[campo]] ?? '').trim())

    const sku = val('sku')
    const name = val('name')
    if (!sku) return problemas.push({ fila: nro, motivo: 'Sin SKU.' })
    if (!name) return problemas.push({ fila: nro, motivo: `${sku}: sin nombre de producto.` })

    if (vistos.has(sku)) return problemas.push({ fila: nro, motivo: `${sku}: repetido dentro del archivo.` })
    if (skusExistentes.has(sku)) return problemas.push({ fila: nro, motivo: `${sku}: ya existe en el inventario.` })
    vistos.add(sku)

    const costo = aNumero(val('unitCost'))
    const minimo = aNumero(val('reorderPoint'))
    const cantidad = aNumero(val('initialQty'))

    if (costo !== null && costo < 0) return problemas.push({ fila: nro, motivo: `${sku}: costo negativo.` })
    if (cantidad !== null && cantidad < 0) return problemas.push({ fila: nro, motivo: `${sku}: cantidad negativa.` })

    listos.push({
      sku,
      name,
      category: val('category') || 'Sin categoría',
      unitCost: costo,
      reorderPoint: minimo ?? 0,
      initialQty: cantidad ?? 0,
      ean: val('ean') || null,
      unidad: val('unidad') || 'Unidad',
      warehouseCode: val('warehouseCode') || null,
      supplier: val('supplier') || null,
    })
  })

  return { columnas, listos, problemas, total: filas.length - 1 }
}

export const PLANTILLA_CSV = [
  'SKU;Producto;Categoria;Costo;Stock minimo;Cantidad;EAN;Unidad;Deposito',
  'MB-1180;Monitor 24" IPS;Pantallas;190;45;60;8806091234567;Unidad;DC',
  'AC-5510;Cable HDMI 2.1 2m;Accesorios;11;80;240;6957303885510;Unidad;DC',
].join('\r\n')
