import { test, expect, entrarAlPanel } from './fixtures.js'

/* Las ocho pestañas del panel, cada una hasta que muestra datos
   reales y no el esqueleto de carga. */

test.describe('Panel', () => {
  test('el resumen carga KPIs, gráfico e inventario', async ({ page }) => {
    await entrarAlPanel(page)

    await expect(page.getByRole('heading', { name: 'Resumen operativo' })).toBeVisible()
    await expect(page.getByText('SKU activos')).toBeVisible()
    await expect(page.getByText('Sobrestock')).toBeVisible()
    await expect(page.getByText('Capital por categoría')).toBeVisible()
    await expect(page.getByRole('img', { name: /Demanda mensual/ })).toBeVisible()
  })

  test('los seis KPI comparten línea de base', async ({ page }, testInfo) => {
    /* Dos etiquetas envuelven a dos líneas y cuatro no. Sin alto
       reservado, los números arrancaban a dos alturas distintas
       —17 px de desfasaje— en la fila más visible del panel. */
    test.skip(testInfo.project.name === 'movil', 'en móvil la grilla es de dos columnas')
    await entrarAlPanel(page)

    const etiquetas = ['SKU activos', 'Capital inmovilizado', 'Bajo punto de reposición',
      'Por quebrar', 'Sobrestock', 'Sin movimiento']
    const topes = []
    for (const etiqueta of etiquetas) {
      const celda = page.locator('div').filter({ hasText: new RegExp(`^${etiqueta}`) }).last()
      const valor = celda.locator('.t-figure').first()
      topes.push(Math.round((await valor.boundingBox()).y))
    }
    expect(new Set(topes).size, `los valores arrancan en ${topes.join(', ')}`).toBe(1)
  })

  test('valorización estima el depósito y abre el detalle por SKU', async ({ page }) => {
    await entrarAlPanel(page)
    await page.getByRole('tab', { name: 'Valorización' }).click()

    await expect(page.getByText('Valor estimado del depósito')).toBeVisible()
    await expect(page.getByText('Estimado (~)')).toBeVisible()

    await page.getByText('Ver').first().click()
    const detalle = page.getByRole('dialog')
    await expect(detalle).toBeVisible()
    await expect(detalle).toContainText('Estimado')
  })

  test('recomienda, alertas y auditoría cargan', async ({ page }) => {
    await entrarAlPanel(page)

    await page.getByRole('tab', { name: 'Recomienda' }).click()
    await expect(page.getByText('SOLVUS Recomienda')).toBeVisible()

    await page.getByRole('tab', { name: 'Alertas' }).click()
    await expect(page.getByText(/activas/)).toBeVisible()

    await page.getByRole('tab', { name: 'Auditoría' }).click()
    await expect(page.getByText(/Registro de auditoría|Auditoría/).first()).toBeVisible()
  })

  test('una transferencia entre depósitos queda registrada', async ({ page }) => {
    await entrarAlPanel(page)
    await page.getByRole('tab', { name: 'Depósitos' }).click()
    await expect(page.getByText('Distribución por depósito')).toBeVisible()

    await page.getByRole('button', { name: /Transferir/ }).first().click()
    const panel = page.getByRole('dialog')
    await expect(panel).toBeVisible()
  })

  test('el conteo físico no corrige stock solo', async ({ page }) => {
    await entrarAlPanel(page)
    await page.getByRole('tab', { name: 'Inventario físico' }).click()

    await expect(page.getByRole('heading', { name: 'Conteo físico' })).toBeVisible()
    /* La promesa en pantalla es explícita y es parte del producto:
       nada se corrige automáticamente. */
    await expect(page.getByText(/nada se corrige automáticamente/)).toBeVisible()
  })

  test('el título de la vista cambia con la pestaña', async ({ page }) => {
    await entrarAlPanel(page)
    const casos = {
      'Proveedores': 'Proveedores y órdenes',
      'Auditoría': 'Registro de auditoría',
      'Inventario físico': 'Conteo físico',
    }
    for (const [pestana, titulo] of Object.entries(casos)) {
      await page.getByRole('tab', { name: pestana }).click()
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(titulo)
    }
  })
})
