import { test, expect, entrarAlPanel, interceptarSupabase } from './fixtures.js'

/* Lo que se rompe callado: foco atrapado en los drawers, nombres
   accesibles que desaparecen con el texto que los daba, controles
   que quedan fuera de pantalla en teléfono. */

test.describe('Accesibilidad', () => {
  test('los drawers atrapan el foco y cierran con Escape', async ({ page }) => {
    await entrarAlPanel(page)
    await page.getByRole('tab', { name: 'Valorización' }).click()
    await page.getByText('Ver').first().click()

    const drawer = page.getByRole('dialog')
    await expect(drawer).toBeVisible()

    const dentro = async () =>
      drawer.evaluate((d) => d.contains(document.activeElement))
    expect(await dentro()).toBe(true)

    /* Varios tabulados seguidos no deben poder salirse del diálogo. */
    for (let i = 0; i < 12; i++) await page.keyboard.press('Tab')
    expect(await dentro()).toBe(true)

    await page.keyboard.press('Escape')
    await expect(drawer).toHaveCount(0)
  })

  test('el centro de notificaciones cierra con Escape', async ({ page }) => {
    await entrarAlPanel(page)
    await page.getByRole('button', { name: /Notificaciones/ }).click()
    const panel = page.getByRole('dialog', { name: 'Centro de notificaciones' })
    await expect(panel).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(panel).toHaveCount(0)
  })

  test('todo control que es solo ícono tiene nombre accesible', async ({ page }) => {
    /* El botón de salir esconde su texto con display:none abajo de
       420 px, y eso también lo saca del árbol de accesibilidad. */
    await entrarAlPanel(page)
    const sinNombre = await page.evaluate(() =>
      [...document.querySelectorAll('header button, header a')]
        .filter((el) => {
          const texto = [...el.childNodes]
            .map((n) => (n.nodeType === 3 ? n.textContent : n.offsetParent === null ? '' : n.textContent))
            .join('')
            .trim()
          return !texto && !el.getAttribute('aria-label') && !el.getAttribute('title')
        })
        .map((el) => el.outerHTML.slice(0, 90))
    )
    expect(sinNombre, `controles sin nombre: ${sinNombre.join(' | ')}`).toEqual([])
  })

  test('la paleta de comandos abre con el atajo y navega', async ({ page }) => {
    await entrarAlPanel(page)
    await page.keyboard.press('ControlOrMeta+k')

    const paleta = page.getByRole('dialog', { name: 'Búsqueda global' })
    await expect(paleta).toBeVisible()
    await page.keyboard.type('Monitor')
    await expect(paleta.getByText(/Monitor 24/)).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(paleta).toHaveCount(0)
  })

  test('el modo oscuro alterna y persiste', async ({ page }) => {
    await entrarAlPanel(page)
    const html = page.locator('html')

    await page.getByRole('button', { name: /Cambiar a modo/ }).click()
    await expect(html).toHaveAttribute('data-theme', 'dark')

    await page.reload()
    await expect(html).toHaveAttribute('data-theme', 'dark')

    await page.getByRole('button', { name: /Cambiar a modo/ }).click()
    await expect(html).toHaveAttribute('data-theme', 'light')
  })
})

test.describe('Responsive', () => {
  test('ninguna vista scrollea en horizontal', async ({ page }) => {
    await interceptarSupabase(page)
    await page.goto('./')
    await page.waitForTimeout(800)
    const landing = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(landing, 'la landing se pasa del ancho').toBeLessThanOrEqual(1)

    await entrarAlPanel(page)
    const pestanas = ['Resumen', 'Valorización', 'Recomienda', 'Alertas',
      'Depósitos', 'Proveedores', 'Inventario físico', 'Auditoría']
    for (const p of pestanas) {
      await page.getByRole('tab', { name: p }).click()
      await page.waitForTimeout(400)
      const sobra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      expect(sobra, `la pestaña ${p} se pasa del ancho`).toBeLessThanOrEqual(1)
    }
  })

  test('salir es alcanzable en cualquier tamaño', async ({ page }) => {
    /* En 375 px la fila de la barra se pasaba 125 px y "Salir"
       quedaba recortado: en teléfono no había forma visible de
       cerrar la sesión. */
    await entrarAlPanel(page)
    const salir = page.getByRole('button', { name: 'Salir' })
    await expect(salir).toBeVisible()

    const caja = await salir.boundingBox()
    const ancho = page.viewportSize().width
    expect(caja.x, 'Salir arranca fuera del viewport').toBeGreaterThanOrEqual(0)
    expect(caja.x + caja.width, 'Salir termina fuera del viewport').toBeLessThanOrEqual(ancho + 1)
    /* Área táctil mínima. */
    expect(caja.height).toBeGreaterThanOrEqual(44)
  })
})
