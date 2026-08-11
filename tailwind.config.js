/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066CC',
        dark: '#1a1a2e',
        accent: '#00d4ff',
      },
    },
  },
  plugins: [],
}
