/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: '420px',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      // Tokens del sistema "Ledger" (definidos en index.css por tema)
      colors: {
        paper: 'var(--paper)',
        surface: 'var(--surface)',
        sunken: 'var(--surface-sunken)',
        ink: 'var(--ink)',
        graphite: 'var(--graphite)',
        muted: 'var(--muted)',
        rule: 'var(--rule)',
        'rule-strong': 'var(--rule-strong)',
        accent: 'var(--accent)',
        'accent-ink': 'var(--accent-ink)',
        'accent-wash': 'var(--accent-wash)',
        positive: 'var(--positive)',
        warning: 'var(--warning)',
        alert: 'var(--alert)',
      },
      borderRadius: {
        // Esquinas rectas: estantería, celda, libro contable
        DEFAULT: '2px',
        sm: '1px',
        md: '3px',
        lg: '4px',
      },
    },
  },
  plugins: [],
}
