import { test, expect, entrarAlPanel, json } from './fixtures.js'

/* La migración a datos reales. Lo que importa probar no es que
   PostgREST funcione, sino las decisiones propias: que una cuenta sin
   esquema no rompa el panel, que el aviso diga qué falta, y que el rol
   que manda sea el de la tabla y no el que el navegador pretenda. */

/* PostgREST responde 404 con este cuerpo cuando la tabla no existe. */
const SIN_TABLA = json(404, {
  code: '42P01',
  message: 'relation "public.products" does not exist',
})

test.describe('Fuente de datos', () => {
  test('sin esquema corrido cae a la demo y dice qué falta', async ({ page }) => {
    await entrarAlPanel(page, { handlers: { '/rest/v1/': SIN_TABLA } })

    await expect(page.getByText('Datos de demostración.')).toBeVisible()
    await expect(page.getByText(/schema\.sql/)).toBeVisible()
    /* Y aun así el panel funciona: cae al depósito de ejemplo en vez
       de quedar en blanco. */
    await expect(page.getByText('SKU activos')).toBeVisible()
  })

  test('el alta avisa que la demo no acepta cargas', async ({ page }) => {
    await entrarAlPanel(page, { handlers: { '/rest/v1/': SIN_TABLA } })
    await page.getByRole('tab', { name: 'Cargar' }).click()

    await expect(page.getByRole('heading', { name: 'Alta de productos' })).toBeVisible()
    await expect(page.getByText(/depósito de ejemplo/i)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cargar producto' })).toBeDisabled()
  })

  test('el formulario de alta valida antes de tocar la base', async ({ page }) => {
    /* Con tablas presentes pero vacías: una cuenta nueva real. */
    await entrarAlPanel(page, { handlers: { '/rest/v1/': json(200, []) } })
    await page.getByRole('tab', { name: 'Cargar' }).click()

    await page.fill('#np-sku', 'MB-9001')
    await page.fill('#np-name', 'Monitor de prueba')
    await page.fill('#np-cost', '100')
    await page.fill('#np-reorder', '10')
    await page.fill('#np-qty', '5')
    /* Hay stock inicial pero ningún depósito elegido: el alta quedaría
       a medias, con mercadería sin dónde apoyarse. */
    await page.getByRole('button', { name: 'Cargar producto' }).click()

    await expect(page.getByText(/en qué depósito/i)).toBeVisible()
  })

  test('el rol que vale es el de la tabla profiles, no el de user_metadata', async ({ page }) => {
    /* El navegador pretende ser administrador —user_metadata es
       escribible por el propio usuario— pero profiles dice consulta.
       Tiene que ganar la tabla. */
    await entrarAlPanel(page, {
      handlers: {
        '/rest/v1/profiles': json(200, {
          name: 'Paula Ferrari', job_title: 'Depósito', role: 'consulta',
        }),
        '/rest/v1/': json(200, []),
      },
    })

    await page.getByRole('tab', { name: 'Cargar' }).click()
    await expect(page.getByText(/rol es de consulta/i)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cargar producto' })).toHaveCount(0)
  })
})
