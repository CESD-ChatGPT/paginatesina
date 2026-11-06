import { test, expect, entrarAlPanel, interceptarSupabase } from './fixtures.js'

/* El inventario real del ChatBot Stock, publicado como copia en
   public/inventario.json. Su esquema no trae costo unitario ni
   historial de ventas, y lo que importa probar es que eso se diga en
   vez de rellenarse. */

const INVENTARIO = [
  { sku: '1', producto: 'Monitor 24" IPS', cantidad: 18, stock_minimo: 45, unidad: 'Unidad', ubicacion: 'A4', proveedor: 'TecnoDistribuidora SA', notas: '' },
  { sku: '2', producto: 'Cable HDMI 2.1', cantidad: 0, stock_minimo: 20, unidad: 'Unidad', ubicacion: 'B1', proveedor: 'Componentes del Sur', notas: 'reponer' },
  { sku: '3', producto: 'Teclado TKL', cantidad: 142, stock_minimo: 60, unidad: 'Unidad', ubicacion: 'C2', proveedor: 'TecnoDistribuidora SA', notas: '' },
]

async function conInventarioReal(page, filas = INVENTARIO) {
  await page.route('**/inventario.json', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(filas) })
  )
}

test.describe('Inventario real', () => {
  test('manda sobre la demo y lo dice en pantalla', async ({ page }) => {
    await conInventarioReal(page)
    await entrarAlPanel(page)

    await expect(page.getByText('Inventario real del ChatBot Stock.')).toBeVisible()
    await expect(page.getByText('Datos de demostración.')).toHaveCount(0)
    /* Tres SKU reales, no los once del depósito de ejemplo. */
    await expect(
      page.getByRole('region', { name: 'Indicadores' }).getByText('SKU activos').locator('..')
    ).toContainText('3')
  })

  test('el capital dice que falta el costo en vez de mostrar cero', async ({ page }) => {
    /* USD 0.0k se leería como «este depósito no vale nada», que es una
       afirmación, no un dato faltante. */
    await conInventarioReal(page)
    await entrarAlPanel(page)

    /* La etiqueta también existe dentro del personalizador de KPIs, así
       que hay que acotar a la fila de indicadores. */
    const capital = page.getByRole('region', { name: 'Indicadores' })
      .getByText('Capital inmovilizado').locator('..')
    await expect(capital).toContainText('—')
    await expect(capital).toContainText('falta el costo unitario')
    await expect(capital).not.toContainText('USD')
  })

  test('el reparto se etiqueta en unidades, no en dólares', async ({ page }) => {
    /* Mostraba «USD 160» sobre 160 unidades: el número correcto con la
       etiqueta equivocada, que es peor que no mostrarlo. */
    await conInventarioReal(page)
    await entrarAlPanel(page)

    const panel = page.getByRole('region', { name: 'Reparto por categoría' })
    await expect(panel).toContainText('Stock por proveedor')
    await expect(panel).toContainText('u.')
    await expect(panel).not.toContainText('USD')
  })

  test('sin historial de ventas no se dibuja una curva', async ({ page }) => {
    await conInventarioReal(page)
    await entrarAlPanel(page)
    await expect(page.getByText(/no hay demanda que proyectar/i)).toBeVisible()
    await expect(
      page.getByRole('region', { name: 'Indicadores' }).getByText('Sin movimiento').locator('..')
    ).toContainText('falta el historial')
  })

  test('los faltantes se calculan contra el mínimo real', async ({ page }) => {
    await conInventarioReal(page)
    await entrarAlPanel(page)
    /* Monitor 18 < 45 y Cable 0 < 20 están bajo el punto; Teclado 142 > 60 no. */
    await expect(
      page.getByRole('region', { name: 'Indicadores' }).getByText('Bajo punto de reposición').locator('..')
    ).toContainText('2')
  })

  test('sin copia publicada cae a la demo sin romperse', async ({ page }) => {
    await page.route('**/inventario.json', (route) => route.fulfill({ status: 404, body: '' }))
    await interceptarSupabase(page)
    await entrarAlPanel(page)

    await expect(page.getByText('Datos de demostración.')).toBeVisible()
    await expect(page.getByText('SKU activos')).toBeVisible()
  })
})

test.describe('App de prueba', () => {
  test('el botón principal lleva al ChatBot Stock', async ({ page }) => {
    await interceptarSupabase(page)
    await page.goto('./')

    const boton = page.getByRole('link', { name: /Abrir ChatBot Stock/ }).first()
    await expect(boton).toBeVisible()
    await expect(boton).toHaveAttribute('href', 'https://cloud.vento.build/networks/cesd/chatbot-stock.html')
    /* Se abre afuera: la landing no es la app. */
    await expect(boton).toHaveAttribute('target', '_blank')
    await expect(boton).toHaveAttribute('rel', /noopener/)
  })
})
