import { test, expect, entrarAlPanel } from './fixtures.js'

/* El gráfico de demanda. Lo que se mide acá es el tamaño EFECTIVO del
   texto —declarado × escala del SVG—, que es lo que termina viendo
   quien mira la pantalla. Con un viewBox fijo escalado a 0,46, un
   fontSize de 10 se renderizaba a 4,6 px. */

const PISO_LEGIBLE = 10

test.describe('Gráfico de demanda', () => {
  test('el texto del gráfico es legible en cualquier ancho', async ({ page }) => {
    await entrarAlPanel(page)
    /* La serie carga asincrónica y el gráfico aparece después de que la
       pestaña ya es visible: medir antes da null. */
    const svgGrafico = page.locator('svg[role="img"]').filter({ has: page.locator('polyline') })
    await expect(svgGrafico).toBeVisible()

    const medidas = await page.evaluate(() => {
      const svg = [...document.querySelectorAll('svg')].find((s) =>
        s.getAttribute('role') === 'img' && /Demanda mensual/.test(s.getAttribute('aria-label') || '')
      )
      if (!svg) return null
      const caja = svg.getBoundingClientRect()
      const [, , vbW] = svg.getAttribute('viewBox').split(' ').map(Number)
      const escala = caja.width / vbW
      return {
        escala,
        textos: [...svg.querySelectorAll('text')].map((t) => ({
          texto: t.textContent,
          efectivo: +(parseFloat(getComputedStyle(t).fontSize) * escala).toFixed(2),
        })),
        trazo: +(parseFloat(getComputedStyle(svg.querySelector('polyline')).strokeWidth) * escala).toFixed(2),
      }
    })

    expect(medidas, 'no se encontró el gráfico').not.toBeNull()
    /* La escala tiene que ser ~1: el dibujo se adapta cambiando su
       geometría, no encogiéndose. */
    expect(medidas.escala).toBeGreaterThan(0.95)
    expect(medidas.escala).toBeLessThanOrEqual(1.01)

    for (const t of medidas.textos) {
      expect(t.efectivo, `"${t.texto}" se renderiza a ${t.efectivo}px`).toBeGreaterThanOrEqual(PISO_LEGIBLE)
    }
    expect(medidas.trazo, 'el trazo quedó por debajo de 1px').toBeGreaterThanOrEqual(1.5)
  })

  test('la línea observada se dibuja y sobrevive a un cambio de ancho', async ({ page }) => {
    await entrarAlPanel(page)

    const linea = page.locator('svg[role="img"] polyline').first()
    await linea.scrollIntoViewIfNeeded()
    await expect
      .poll(async () => linea.evaluate((el) => getComputedStyle(el).strokeDashoffset), { timeout: 8000 })
      .toBe('0px')

    /* Redimensionar vuelve a correr el efecto de trazado porque la
       geometría depende del ancho. Sin la guarda de "ya trazado", la
       línea se escondía de nuevo en cada resize. */
    const { width, height } = page.viewportSize()
    await page.setViewportSize({ width: Math.round(width * 0.7), height })
    await page.waitForTimeout(600)

    const offset = await linea.evaluate((el) => getComputedStyle(el).strokeDashoffset)
    expect(offset, 'la línea se volvió a esconder al cambiar el ancho').toBe('0px')
  })
})
