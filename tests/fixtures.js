import { test as base, expect } from '@playwright/test'

/* ═══════════════════════════════════════════════════════════════
   FIXTURES COMPARTIDAS

   Supabase real está configurado en el bundle, pero los tests no
   deben pegarle: dependerían de la red, de una cuenta viva y del
   límite de envíos del correo integrado. Se interceptan todas las
   llamadas al proyecto y se responde con una sesión válida, así el
   panel se ejercita igual que con auth real —el mismo camino de
   código, los mismos eventos de onAuthStateChange— sin salir de la
   máquina.
   ═══════════════════════════════════════════════════════════════ */

export const SUPABASE_GLOB = '**/*.supabase.co/**'

export const USUARIO_DEMO = {
  email: 'demo@solvus.io',
  password: 'solvus2026',
  nombre: 'Paula Ferrari',
  puesto: 'Jefa de operaciones',
  rol: 'administrador',
  deposito: 'Depósito central',
}

function sesionValida(overrides = {}) {
  const ahora = Math.floor(Date.now() / 1000)
  return {
    access_token: 'test.jwt.token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: ahora + 3600,
    refresh_token: 'test-refresh',
    user: {
      id: 'usuario-de-prueba',
      aud: 'authenticated',
      role: 'authenticated',
      email: USUARIO_DEMO.email,
      email_confirmed_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {
        name: USUARIO_DEMO.nombre,
        jobTitle: USUARIO_DEMO.puesto,
        role: USUARIO_DEMO.rol,
        warehouse: USUARIO_DEMO.deposito,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    },
  }
}

/* Cada test puede pedir respuestas distintas para un endpoint
   concreto sin reescribir toda la intercepción. */
export async function interceptarSupabase(page, handlers = {}) {
  await page.route(SUPABASE_GLOB, async (route) => {
    const url = route.request().url()
    for (const [fragmento, responder] of Object.entries(handlers)) {
      if (url.includes(fragmento)) return responder(route, url)
    }
    if (url.includes('/auth/v1/token')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(sesionValida()),
      })
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })
}

export function json(status, body) {
  return (route) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
}

export async function entrarAlPanel(page, { handlers } = {}) {
  await interceptarSupabase(page, handlers)
  await page.goto('#/login')
  await page.fill('#email', USUARIO_DEMO.email)
  await page.fill('#password', USUARIO_DEMO.password)
  await page.click('button[type=submit]')
  await expect(page.getByRole('tab', { name: 'Resumen' })).toBeVisible()
}

/* Cualquier error de consola o excepción no atrapada rompe el test.
   Sin esto, un fallo silencioso —una promesa rechazada, un acceso a
   undefined dentro de un efecto— pasa por verde mientras la pantalla
   se vea bien.

   Se exceptúa "Failed to load resource": el navegador lo escribe por
   cada respuesta no-2xx, y varios tests simulan fallos de Supabase a
   propósito. Lo que importa es que la app no tire errores propios al
   manejarlos. */
const RUIDO = /favicon|ERR_CONNECTION|net::|Failed to load resource/

export const test = base.extend({
  page: async ({ page }, use) => {
    const problemas = []
    page.on('console', (m) => {
      if (m.type() === 'error') problemas.push(`console.error: ${m.text()}`)
    })
    page.on('pageerror', (e) => problemas.push(`excepción: ${e.message}`))
    await use(page)
    const reales = problemas.filter((p) => !RUIDO.test(p))
    expect(reales, `errores en la consola del navegador:\n${reales.join('\n')}`).toEqual([])
  },
})

export { expect }
