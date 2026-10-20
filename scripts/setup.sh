#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Deja la sesión lista para correr build, lint y tests.
#
# Lo corre el hook SessionStart (.claude/settings.json) cuando se
# abre una sesión de Claude Code en la web, donde el contenedor
# arranca limpio. En una máquina local se puede correr a mano.
#
# Es idempotente: si ya está todo, no hace nada y sale rápido.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d node_modules ] || [ package-lock.json -nt node_modules ]; then
  echo "→ instalando dependencias"
  npm ci --no-audit --no-fund 2>&1 | tail -3
else
  echo "→ dependencias ya instaladas"
fi

# El contenedor de Claude Code en la web trae Chromium preinstalado y
# playwright.config.js lo usa por ruta directa. Fuera de ahí hay que
# bajarlo una vez.
if [ -x /opt/pw-browsers/chromium ]; then
  echo "→ Chromium del entorno: /opt/pw-browsers/chromium"
elif npx playwright install --dry-run chromium >/dev/null 2>&1; then
  echo "→ bajando Chromium para Playwright"
  npx playwright install chromium 2>&1 | tail -2
fi

echo "✓ listo — npm run dev · npm run build · npm test"
