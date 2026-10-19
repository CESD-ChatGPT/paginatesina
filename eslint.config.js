import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

/* `npm run lint` apuntaba a un eslint que nunca estuvo instalado: el
   script existía y fallaba siempre. Ahora hay linter de verdad.

   La regla que más importa acá es exhaustive-deps: este proyecto tiene
   efectos con IntersectionObserver, ResizeObserver, suscripciones de
   Supabase y timers. Una dependencia faltante en uno de esos no se ve
   en pantalla — se manifiesta como un listener que no se limpia o un
   valor viejo capturado en un closure. */
export default [
  {
    ignores: ['docs/**', 'node_modules/**', 'test-results/**', 'playwright-report/**'],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      /* Sin esto, no-unused-vars no ve los componentes usados en JSX
         —`motion.div`, un `Icon` recibido por props— y los marca como
         muertos. El plugin de React enseña al linter a leer JSX. */
      'react/jsx-uses-vars': 'error',
      'react/jsx-uses-react': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      /* Las variables que arrancan en mayúscula son componentes usados
         en JSX, que este parser no ve como uso. El `_` al principio
         marca un descarte a propósito, como en el destructuring que
         saca una clave de un objeto. */
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    },
  },
  {
    /* Se pega en la consola del ChatBot Stock: corre en el navegador,
       no en Node, por más que viva en scripts/. */
    files: ['scripts/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...globals.browser },
    },
  },
  {
    files: ['tests/**/*.js', 'playwright.config.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
    },
  },
]
