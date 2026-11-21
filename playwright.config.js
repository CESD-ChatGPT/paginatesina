import { defineConfig, devices } from '@playwright/test'
import { existsSync } from 'node:fs'

/* ═══════════════════════════════════════════════════════════════
   Los tests corren contra el build real servido por `vite preview`,
   no contra el dev server: lo que se rompe en producción suele ser
   justamente lo que el dev server disimula (base path, code
   splitting, orden de chunks).

   Sobre el navegador: el contenedor de Claude Code en la web ya trae
   un Chromium en /opt/pw-browsers, pero no necesariamente el de la
   revisión que pide esta versión del runner. Si está, se usa ese por
   ruta directa —es la salida que documenta el propio entorno— y si
   no, Playwright usa el suyo, que en una máquina local se baja con
   `npx playwright install chromium`.
   ═══════════════════════════════════════════════════════════════ */

const PORT = 4173
const BASE = `http://127.0.0.1:${PORT}/paginatesina/`

const CHROMIUM_DEL_ENTORNO = '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM_DEL_ENTORNO)
  ? { executablePath: CHROMIUM_DEL_ENTORNO }
  : {}

export default defineConfig({
  testDir: './tests',
  /* Un fallo acá casi siempre es un fallo real, no un flake: los
     datos son deterministas y la red está interceptada. */
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  timeout: 45_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 }, launchOptions } },
    { name: 'movil', use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 }, isMobile: false, launchOptions } },
  ],

  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
