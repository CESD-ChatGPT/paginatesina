import { test, expect, interceptarSupabase, json, entrarAlPanel, USUARIO_DEMO } from './fixtures.js'

/* Auth real contra Supabase. Lo que se prueba acá no es el SDK —eso
   ya está probado río arriba— sino las decisiones propias: qué ve el
   usuario cuando algo falla, y que el SDK no se baje si no hace falta. */

test.describe('Autenticación', () => {
  test('un visitante anónimo no descarga el SDK de Supabase', async ({ page }) => {
    /* El SDK pesa 59 KB gzip. La landing es pública: quien nunca
       inició sesión no tiene por qué pagarlo. Va en su propio chunk
       detrás de un import() dinámico, salteado además por el
       atajo de localStorage cuando no hay sesión guardada. */
    const pedidos = []
    page.on('request', (r) => pedidos.push(r.url()))

    await page.goto('./')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.waitForTimeout(1200)

    const chunks = pedidos.filter((u) => /\/assets\/.*\.js$/.test(u))
    const cuerpos = await Promise.all(
      chunks.map(async (u) => ({ u, texto: await (await page.request.get(u)).text() }))
    )
    /* GoTrueClient es la clase de auth del SDK y no aparece en ningún
       otro chunk. Buscar "supabase" o "refresh_token" no sirve: el
       chunk principal incluye src/lib/supabase.js, que los nombra sin
       traerse el SDK. */
    const sdk = cuerpos.find((c) => c.texto.includes('GoTrueClient'))
    expect(sdk, `el SDK de Supabase se descargó en ${sdk?.u}`).toBeUndefined()
  })

  test('entra con credenciales válidas y la sesión sobrevive al refresh', async ({ page }, testInfo) => {
    await entrarAlPanel(page)
    /* El bloque con nombre y depósito es `hidden lg:block`: en la barra
       de un teléfono compite con la salida de sesión y pierde. */
    const identidadVisible = testInfo.project.name === 'escritorio'
    if (identidadVisible) await expect(page.getByText(USUARIO_DEMO.nombre)).toBeVisible()

    await page.reload()
    await expect(page.getByRole('tab', { name: 'Resumen' })).toBeVisible()
    if (identidadVisible) await expect(page.getByText(USUARIO_DEMO.nombre)).toBeVisible()
  })

  test('avisa cuando la cuenta no está confirmada y ofrece reenviar', async ({ page }) => {
    let pidioReenvio = false
    await interceptarSupabase(page, {
      '/auth/v1/resend': (route) => {
        pidioReenvio = true
        return json(200, {})(route)
      },
      '/auth/v1/token': json(400, {
        code: 400,
        error_code: 'email_not_confirmed',
        msg: 'Email not confirmed',
      }),
    })

    await page.goto('#/login')
    await page.fill('#email', USUARIO_DEMO.email)
    await page.fill('#password', USUARIO_DEMO.password)
    await page.click('button[type=submit]')

    await expect(page.getByText(/no confirmaste/i)).toBeVisible()
    const reenviar = page.getByRole('button', { name: /enlace nuevo/i })
    await expect(reenviar).toBeVisible()

    await reenviar.click()
    await expect.poll(() => pidioReenvio).toBe(true)
  })

  test('el tope de envíos de correo se nombra por lo que es', async ({ page }) => {
    /* El correo integrado de Supabase corta por hora. Decir "esperá un
       minuto" manda a reintentar en vano: el mensaje tiene que nombrar
       la causa real. */
    await interceptarSupabase(page, {
      '/auth/v1/signup': json(429, {
        error_code: 'over_email_send_rate_limit',
        msg: 'email rate limit exceeded',
      }),
    })

    await page.goto('#/login')
    await page.getByRole('button', { name: /Crear una/ }).click()
    await page.fill('#name', 'Prueba Automática')
    await page.fill('#email', 'nueva@solvus.io')
    await page.fill('#password', 'solvus2026')
    await page.fill('#confirm', 'solvus2026')
    await page.click('button[type=submit]')

    await expect(page.getByText(/límite|envíos|correos/i).first()).toBeVisible()
    await expect(page.getByText(/esperá un minuto/i)).toHaveCount(0)
  })

  test('el registro exige que las contraseñas coincidan', async ({ page }) => {
    await interceptarSupabase(page)
    await page.goto('#/login')
    await page.getByRole('button', { name: /Crear una/ }).click()

    await page.fill('#name', 'Prueba Automática')
    await page.fill('#email', 'nueva@solvus.io')
    await page.fill('#password', 'solvus2026')
    await page.fill('#confirm', 'otracosa123')
    await page.click('button[type=submit]')

    await expect(page.getByText(/no coinciden/i)).toBeVisible()
  })

  test('un enlace de confirmación vencido explica qué pasó', async ({ page }) => {
    /* Supabase devuelve el error en el fragmento, que es justo donde
       HashRouter guarda la ruta. Si no se consume antes de montar
       React, el usuario termina en una pantalla muda. */
    await interceptarSupabase(page)
    await page.goto('./#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired')

    await expect(page.getByText(/venció|expiró|vencido/i).first()).toBeVisible()
  })
})
