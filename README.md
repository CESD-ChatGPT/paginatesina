# SOLVUS

Control de inventario con pronóstico de demanda por SKU.
Landing pública + acceso autenticado a un panel de inventario.

---

## Estado de la checklist

| Tarea | Estado | Detalle |
|---|---|---|
| Aplicar paleta de colores | ✅ Completa | Paleta de marca como tokens CSS; sin colores sueltos por componente |
| Hacer Login | ⚠️ Completa **con auth mock** | Flujo, rutas y guardas reales; **no hay backend** contra el cual autenticar |
| Implementar datos reales | ⚠️ Arquitectura completa, **datos aún mock** | No existe fuente real en el proyecto; hay un punto único de conexión |
| Agregar gráficos y animaciones | ✅ Completa | 2 gráficos con hover, estados y motion con propósito |
| Imágenes y logo SOLVUS | ⚠️ Completa **con logo reconstruido** | Falta el SVG oficial — ver abajo |

Los ⚠️ **no son tareas a medias**: son los límites reales del proyecto hoy.
Están marcados para que nadie asuma que hay un backend o un asset oficial
que en realidad no existe.

---

## Lo que falta para cerrar los ⚠️

### 1. Archivo oficial del logo
El repo no contiene ningún asset de marca. El isotipo actual es una
**reconstrucción vectorial** hecha a partir de una captura de baja
resolución: es fiel en forma y proporción, pero no es el original.

**Para reemplazarlo:** sustituí los `<path>` dentro de `<Isotipo/>` en
`src/components/brand/Logo.jsx`. Nada más necesita cambiar — navbar,
login, footer y favicon consumen ese componente.

También conviene reemplazar `public/favicon.svg`, que replica el mismo
trazado a mano.

### 2. Backend de autenticación
`src/contexts/AuthContext.jsx` tiene un `mockAuthProvider` con
credenciales fijas. La sesión vive en `sessionStorage`, lo cual sirve para
una demo pero **no es una barrera de seguridad**: es navegación, no
protección. Un backend real debe emitir un token httpOnly y validarlo del
lado del servidor.

**Para conectarlo:** reemplazá el cuerpo de `signIn`/`signOut`. El resto de
la app consume `useAuth()` y no sabe nada del origen.

Credenciales de la demo: `demo@solvus.io` / `solvus2026`

### 3. Fuente de datos
`src/data/inventory.js` expone `inventoryService`, que hoy resuelve contra
`mockAdapter`. Las cifras son inventadas y están rotuladas como tales en la
propia interfaz del panel.

**Para conectarlo:** poné `USE_MOCK = false` y completá `apiAdapter`
respetando las firmas existentes. Ningún componente cambia.

---

## Stack

- React 18 + Vite
- React Router 6 (**HashRouter**, porque GitHub Pages no permite fallback a `index.html`)
- Tailwind CSS sobre tokens CSS propios
- IBM Plex Sans / Mono **autoalojadas** (`public/fonts`, 8 archivos, 180 KB)
- lucide-react para iconografía
- Gráficos en SVG propio — sin librería de charts

## Rutas

| Ruta | Acceso | Contenido |
|---|---|---|
| `#/` | Pública | Landing |
| `#/login` | Pública | Login (redirige a `#/panel` si ya hay sesión) |
| `#/panel` | Protegida | Panel de inventario |

## Desarrollo

```bash
npm install
npm run dev       # desarrollo
npm run build     # compila a docs/ (GitHub Pages sirve desde ahí)
npm run preview
```

---

## Sistema de diseño

Dirección: **"Ledger / precisión operativa"**. El objeto físico del negocio
—estanterías, racks, el libro de inventario— ya es una grilla, así que la
disciplina modular no es un estilo prestado: es el producto.

**Paleta de marca**

| Rol | Claro | Oscuro |
|---|---|---|
| Acento (único) | `#1F6C82` teal | `#4FB3CE` |
| Superficie profunda | `#0B2C40` petróleo | — |
| Superficie | `#FFFFFF` | `#0B2C40` |
| Tinta | `#0A0A0A` | `#F2F6F7` |

El teal de marca da **2.43:1 sobre el petróleo** y fallaría en modo oscuro;
por eso ahí se usa un escalón más claro del mismo tono. Todos los tokens
están en `src/index.css` y sus contrastes fueron medidos en navegador.

**Reglas del sistema**

- Un solo acento. Verde/ámbar/rojo quedan reservados a estados de datos y
  nunca aparecen sin su etiqueta de texto al lado.
- Mono (`IBM Plex Mono`) exclusivo para datos: SKU, cantidades, deltas, índices.
- Radio 0–4px. Hairlines estructurales en vez de sombras.
- Gráficos: rampa secuencial de un tono para magnitud; énfasis (1 tono +
  gris) para observado vs proyectado. Nada categórico, nada de arcoíris.
- Motion con función: revelado único, hover y transiciones de estado.
  Todo bajo `prefers-reduced-motion`.

## Verificado

- Sin overflow horizontal en 375 / 390 / 768 / 1024 / 1440, en las 3 rutas
  y en ambos temas.
- Contraste medido en navegador: 0 fallos AA.
- 0 errores de consola.
- Flujo de auth end-to-end: guarda de ruta, error de credenciales,
  login, persistencia y logout.
- Áreas táctiles ≥44px.

---

© 2026 SOLVUS
