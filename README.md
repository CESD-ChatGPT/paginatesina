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

## Componentes de base externa

Cuatro piezas parten de código de [Uiverse.io](https://uiverse.io) y están
adaptadas al sistema. Cada archivo documenta en su cabecera qué se conservó
del original y qué se cambió, y por qué.

| Componente | Origen | Dónde se usa |
|---|---|---|
| `ThemeToggle.jsx` | Yaya12085 | Navbar — conectado al `ThemeContext` |
| `Header.jsx` (`.menu`) | mymiamo | Navbar pública, 4 destinos reales |
| `ActionButton.jsx` | Creatlydev | Panel — generar orden de reposición |
| `BarsLoader.jsx` | Nawsome | Intro + carga del gráfico de demanda |

`CtaButton.jsx` también desciende del componente de Creatlydev, pero cumple
otro rol (llamada a la acción de la landing) y se mantiene aparte de
`ActionButton`. No coinciden nunca en pantalla.

Dos defectos del CSS original quedaron corregidos: `transform: rotate(2.2)`
en la navbar no tenía unidad (era inválido y no hacía nada), y el blanco
fijo sobre el azul daba 2.42:1 al pasar al teal claro del modo oscuro.

## Sistema de motion

Tres herramientas, tres trabajos distintos — no se usan dos para resolver lo mismo:

| Herramienta | Para qué | Dónde |
|---|---|---|
| **GSAP + ScrollTrigger** | Timeline secuenciada del Hero al montar; reveal por scroll de Features/CTA (`ScrollTrigger.batch`, una vez, sin scrub/pin); count-up de las cifras del Hero; trazo del gráfico de demanda | `Hero.jsx`, `Features.jsx`, `CTA.jsx`, `DemandChart.jsx` |
| **Framer Motion** | Transiciones ligadas a estado de React: `AnimatePresence` en el swap botón→confirmación del panel; `whileInView` en el llenado de las barras de categoría | `Dashboard.jsx`, `CategoryBars.jsx` — **solo el panel autenticado**, con code-splitting para que un visitante anónimo nunca la descargue |
| **Web Animation API nativa** | Trazo de la línea observada del gráfico (`stroke-dashoffset`) | `DemandChart.jsx` |

Registro único de plugins GSAP en `src/lib/motion.js`. Todo respeta
`prefers-reduced-motion` — GSAP vía chequeo explícito + estado final
inmediato, Framer vía `<MotionConfig reducedMotion="user">`.

**Bug real encontrado y corregido en el propio proceso:** animar el `width`
de un `<rect>` dentro de un `<clipPath>` vía WAAPI no surte efecto en este
motor — la animación termina en estado `"finished"` pero el valor
computado nunca cambia, porque ese nodo vive fuera del árbol de pintado
normal. Esa pieza puntual usa GSAP (que hace `setAttribute` directo en
cada frame) en vez de WAAPI.

**Decisión sobre 3D:** no se implementó. El dominio de SOLVUS (niveles de
stock, demanda, SKUs) es información 1D/2D; forzar un elemento 3D acá
sería el "objeto flotante genérico" que la identidad "Ledger" —
explícitamente plana, de hairlines y grilla— existe para evitar.

## Verificado

- Sin overflow horizontal en 375 / 390 / 768 / 1024 / 1440, en las 3 rutas
  y en ambos temas.
- Contraste medido en navegador: 0 fallos AA.
- 0 errores de consola.
- Flujo de auth end-to-end: guarda de ruta, error de credenciales,
  login, persistencia y logout.
- Áreas táctiles ≥44px.
- Motion nuevo probado en navegador real (no solo "compila"): timeline del
  Hero, reveal progresivo de Features/CTA, trazo del gráfico en sus dos
  usos (preview y dashboard), swap con `AnimatePresence`, `prefers-reduced-
  motion` en los tres sistemas, cleanup de `ScrollTrigger` tras navegación
  repetida.
- Bundle: framer-motion aislado al chunk del panel (`Dashboard-*.js`,
  ~49 KB gzip); el chunk principal (landing pública) no lo incluye.

---

© 2026 SOLVUS
