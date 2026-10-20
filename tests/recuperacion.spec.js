import { test, expect, interceptarSupabase, json } from './fixtures.js'

/* Recuperación de contraseña. Sin esto, quien se olvida queda afuera
   para siempre: no puede entrar, y registrarse de nuevo tampoco porque
   el correo ya existe. */

test.describe('Recuperar contraseña', () => {
  test('pide el enlace y confirma sin revelar si la cuenta existe', async ({ page }) => {
    let pidio = null
    await interceptarSupabase(page, {
      '/auth/v1/recover': (route) => {
        pidio = JSON.parse(route.request().postData() || '{}')
        return json(200, {})(route)
      },
    })

    await page.goto('#/login')
    await page.getByRole('button', { name: /olvidaste tu contraseña/i }).click()

    await expect(page.getByRole('heading', { name: /Recuperar el acceso/i })).toBeVisible()
    /* En este modo la contraseña no pinta: solo hace falta el correo. */
    await expect(page.locator('#password')).toHaveCount(0)

    await page.fill('#email', 'alguien@solvus.io')
    await page.getByRole('button', { name: 'Enviar enlace' }).click()

    await expect(page.getByText('Revisá tu correo.')).toBeVisible()
    await expect.poll(() => pidio?.email).toBe('alguien@solvus.io')

    /* El mensaje es condicional a propósito: afirmar que la cuenta
       existe le confirma a cualquiera quién está registrado acá. */
    await expect(page.getByText(/Si hay una cuenta con esa dirección/i)).toBeVisible()
  })

  test('el enlace del correo lleva a elegir contraseña, no al panel', async ({ page }) => {
    /* Con sesión y type=recovery: entrar al panel sería dejar a la
       persona adentro sin haber cambiado nada, y la contraseña vieja
       seguiría siendo la única que conoce. */
    await interceptarSupabase(page)
    await page.goto('./#access_token=t&refresh_token=r&type=recovery&expires_in=3600&token_type=bearer')

    await expect(page.getByRole('heading', { name: /contraseña nueva/i })).toBeVisible()
    await expect(page.locator('#email')).toHaveCount(0)
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('#confirm')).toBeVisible()
  })

  test('exige que la contraseña nueva coincida y tenga largo mínimo', async ({ page }) => {
    let guardo = false
    await interceptarSupabase(page, {
      '/auth/v1/user': (route) => {
        if (route.request().method() === 'PUT') guardo = true
        return json(200, { id: 'u1', email: 'demo@solvus.io' })(route)
      },
    })
    await page.goto('./#access_token=t&refresh_token=r&type=recovery&expires_in=3600&token_type=bearer')
    await expect(page.locator('#password')).toBeVisible()

    await page.fill('#password', 'corta')
    await page.fill('#confirm', 'corta')
    await page.getByRole('button', { name: 'Guardar contraseña' }).click()
    expect(guardo, 'guardó una contraseña más corta que el mínimo').toBe(false)

    await page.fill('#password', 'solvus2026')
    await page.fill('#confirm', 'otracosa99')
    await page.getByRole('button', { name: 'Guardar contraseña' }).click()
    expect(guardo, 'guardó con las contraseñas sin coincidir').toBe(false)
  })
})
