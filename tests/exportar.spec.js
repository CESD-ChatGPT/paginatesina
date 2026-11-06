import { test, expect, entrarAlPanel } from './fixtures.js'
import { readFileSync } from 'node:fs'

/* El CSV sirve para seguir trabajando los datos; el PDF para mandar,
   imprimir y archivar. La spec original pedía los dos. */

test.describe('Exportar', () => {
  test('el CSV sale con las columnas y escapa las fórmulas', async ({ page }) => {
    await entrarAlPanel(page)
    const descarga = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Exportar CSV' }).click()
    const archivo = await descarga

    expect(archivo.suggestedFilename()).toMatch(/^solvus-inventario-\d{4}-\d{2}-\d{2}\.csv$/)
    const texto = readFileSync(await archivo.path(), 'utf8')
    expect(texto).toContain('SKU')
    expect(texto).toContain('Punto de reposición')
    /* El guardia contra inyección de fórmulas no debe convertir los
       números negativos en texto: romperían cualquier SUM de Excel. */
    expect(texto).not.toMatch(/,'-?\d+(\.\d+)?(,|\r|$)/)
  })

  test('el PDF se genera y es un PDF de verdad', async ({ page }) => {
    await entrarAlPanel(page)
    const descarga = page.waitForEvent('download', { timeout: 30_000 })
    await page.getByRole('button', { name: 'Exportar PDF' }).click()
    const archivo = await descarga

    expect(archivo.suggestedFilename()).toMatch(/^solvus-inventario-\d{4}-\d{2}-\d{2}\.pdf$/)
    const bytes = readFileSync(await archivo.path())
    /* Magic number: los PDF empiezan con %PDF-. Un archivo vacío o un
       error serializado pasaría cualquier chequeo de tamaño. */
    expect(bytes.subarray(0, 5).toString()).toBe('%PDF-')
    expect(bytes.length).toBeGreaterThan(2000)
  })

  test('jsPDF no viaja en el bundle de nadie que no exporte', async ({ page }) => {
    /* Pesa más que todo el panel junto: va detrás de un import()
       dinámico y solo baja cuando alguien aprieta el botón. */
    const pedidos = []
    page.on('request', (r) => pedidos.push(r.url()))

    await entrarAlPanel(page)
    await page.waitForTimeout(800)

    const chunks = pedidos.filter((u) => /\/assets\/.*\.js$/.test(u))
    const cuerpos = await Promise.all(
      chunks.map(async (u) => ({ u, texto: await (await page.request.get(u)).text() }))
    )
    const pdf = cuerpos.find((c) => /jsPDF|jspdf/i.test(c.texto) && c.texto.includes('%PDF'))
    expect(pdf, `jsPDF se descargó sin exportar, en ${pdf?.u}`).toBeUndefined()
  })
})
