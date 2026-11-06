# SOLVUS

Control de inventario automatizado: detecta condiciones de stock,
analiza consumo y precio de mercado, recomienda una acción concreta y
ayuda a ejecutarla. Landing pública + panel autenticado que funciona
como centro operativo (valorización, recomendaciones, alertas,
multidepósito, proveedores, inventario físico, auditoría, roles).

---

## Estado de la checklist

| Tarea | Estado | Detalle |
|---|---|---|
| Aplicar paleta de colores | ✅ Completa | Paleta de marca como tokens CSS; sin colores sueltos por componente |
| Hacer Login | ✅ Completa | Auth real con Supabase, proyecto ya conectado |
| Registro de usuarios | ✅ Completa | Alta con verificación por correo; las cuentas viven en Supabase, no en el navegador |
| Implementar datos reales | ⚠️ Arquitectura completa, **datos aún mock** | No existe fuente real en el proyecto; hay un punto único de conexión |
| Agregar gráficos y animaciones | ✅ Completa | Gráficos con hover, estados y motion con propósito, incluido scroll-storytelling |
| Imágenes y logo SOLVUS | ⚠️ Completa **con logo reconstruido** | Falta el SVG oficial — ver abajo |
| Valorización estimada del depósito | ⚠️ Motor completo, **fuentes de precio mock** | Arquitectura de providers real; nunca presenta el número como exacto |
| Recomendaciones y alertas | ✅ Completa | Reglas explícitas sobre datos reales del mock, nunca genéricas |
| Multidepósito, proveedores, inventario físico, auditoría | ✅ Completa | Mutan el estado en memoria de la sesión — ver nota de `inventory.js` |
| Roles y permisos | ⚠️ Completa **con selector de demostración** | El modelo de permisos es real; el selector de rol simula, no autentica |
| Búsqueda global, notificaciones, personalización | ✅ Completa | Persistencia liviana en `localStorage`, sin backend |

Los ⚠️ **no son tareas a medias**: son los límites reales del proyecto hoy.
Están marcados para que nadie asuma que hay un backend, un asset oficial
o una fuente de precios real que en realidad no existen.

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

### 2. Autenticación (Supabase — ya conectado)

El proyecto Supabase `sncbnwuwjrdkvzuyenue` está conectado y el registro
real funciona: alta con nombre + correo + contraseña (mínimo 8 caracteres,
con confirmación), verificación por correo antes del primer acceso, login,
cierre de sesión y sesión persistente que se renueva sola y sobrevive a
cerrar el navegador.

También está la **recuperación de contraseña**: "¿Olvidaste tu
contraseña?" en el login manda un enlace, y ese enlace lleva a elegir
una nueva. El aviso de envío es siempre el mismo exista o no la cuenta —
decir "ese correo no está registrado" le confirma a cualquiera quién
tiene cuenta acá.

> Para que los enlaces de confirmación y de recuperación funcionen,
> **Authentication → URL Configuration → Site URL** tiene que apuntar al
> sitio publicado, no a `localhost`.

> ### ⚠️ El correo integrado de Supabase casi no envía
> El SMTP que viene por defecto es **solo para pruebas**: permite unos
> pocos mails por hora y después deja de enviar sin aviso. Si el correo
> "dejó de llegar", es casi siempre esto.
>
> Dos salidas, según para qué sea el proyecto:
> - **Demo / portfolio:** apagá la confirmación por correo en
>   **Authentication → Providers → Email → Confirm email**. El registro
>   pasa a ser instantáneo y desaparece toda la dependencia del mail. La
>   app ya contempla este caso: si Supabase devuelve sesión en el alta,
>   entra derecho al panel sin pedir confirmación.
> - **Producción:** configurá un SMTP propio en **Authentication → Emails
>   → SMTP Settings** (Resend, Brevo, SendGrid; todos tienen plan gratis).
>
> Para desbloquear una cuenta puntual sin correo: **Authentication →
> Users**, abrir el usuario y confirmarlo a mano.

> ### ⚠️ Configurá las URLs en Supabase
> **Authentication → URL Configuration**, en el panel de Supabase:
> - **Site URL**: `https://cesd-chatgpt.github.io/paginatesina/`
> - **Redirect URLs**: agregá esa misma URL.
>
> Si no están, Supabase ignora el `redirect_to` que manda la app y usa su
> valor por defecto (`http://localhost:3000`): el enlace del correo lleva a
> una página muerta y el usuario nunca queda logueado, aunque la cuenta sí
> se haya creado.

**El fragmento de la URL y HashRouter.** Supabase devuelve los tokens de
sesión en el `#` de la URL, que esta app ya usa para rutear. Los dos se
pisan. Por eso `main.jsx` consume el callback **antes** de montar React —
es el único momento en que el router todavía no tocó la URL— y
`lib/supabase.js` además tolera la forma vieja (`#/login#access_token=…`)
para que los correos ya enviados sigan funcionando. Está verificado en
navegador con las dos formas; si algún día se cambia el ruteo o el
`emailRedirectTo`, hay que volver a probarlo.

> ### ⚠️ Las credenciales de demo ya no funcionan
> `demo@solvus.io` / `solvus2026` solo existían en el modo mock. Ahora que
> hay auth real, esa cuenta **no existe en Supabase** y el login la
> rechaza. Para volver a tener un acceso de demostración, registrala como
> cuenta real desde el propio formulario, o creala desde el panel de
> Supabase (Authentication → Users → Add user, con *Auto Confirm User*
> activado para saltear la verificación por correo).

**Dónde viven las claves.** En `src/lib/supabase.js` como valores de
respaldo, y opcionalmente en `.env` (que tiene prioridad) si se quiere
apuntar a otro proyecto sin tocar código — ver `.env.example`.

Están en el repo a propósito: `.env` está gitignoreado, así que un build
desde otra máquina no lo tendría y la app caería a modo demo en silencio,
haciendo desaparecer el registro del sitio publicado sin ningún error
visible. La anon key es **pública por diseño** — ya viaja dentro del bundle
que sirve GitHub Pages y cualquiera puede leerla desde el navegador.

> ⚠️ Lo que **nunca** puede entrar acá es la `service_role` key: esa
> bypassea todas las reglas de seguridad. Y en cuanto se creen tablas de
> negocio en Supabase, hay que activarles **Row Level Security**: con la
> anon key pública, RLS es lo único que separa "cualquiera puede leer sus
> propios datos" de "cualquiera puede leer los de todos".

**Rol de las cuentas nuevas:** `operador`, no `administrador`. Quien se
registra solo no debería auto-asignarse el rol con más permisos; puede
transferir stock y ajustar conteos, pero no generar órdenes de compra ni
ver la auditoría. Elevar un usuario es, hoy, una edición manual de su
`user_metadata` desde el panel de Supabase.

**Lo que sigue faltando para producción:** las cifras del inventario
siguen siendo mock (punto 3), así que todos los usuarios reales verían los
mismos datos inventados. Row Level Security todavía no está configurado
del lado de Supabase, porque no hay tablas de negocio que proteger.

### 3. Fuente de datos — inventario propio

`src/data/inventory.js` expone `inventoryService` y elige entre tres
fuentes, en este orden:

| Fuente | Cuándo | Qué sirve |
|---|---|---|
| `ventoAdapter` | Hay `public/inventario.json` | El inventario real del ChatBot Stock |
| `supabaseAdapter` | Supabase configurado **y** esquema corrido | Inventario propio, aislado por RLS |
| `mockAdapter` | Ninguna de las dos | El depósito de ejemplo, rotulado como tal |

## El software de prueba

El producto que la gente prueba desde la landing es el **ChatBot Stock**,
que corre en Vento sobre el inventario real de la red `cesd`:

<https://cloud.vento.build/networks/cesd/chatbot-stock.html>

La dirección vive en un solo lugar, `src/lib/app.js`. Pide usuario y PIN
propios, que no son los de la cuenta de SOLVUS: son dos sistemas
distintos y la landing lo aclara.

## Publicar el inventario real

El ChatBot lee su API con la cookie de sesión de su propio dominio.
SOLVUS vive en otro origen, así que el navegador exigiría que Vento
respondiera con `Access-Control-Allow-Origin` apuntando acá y
`Access-Control-Allow-Credentials: true`. Eso lo decide el servidor de
Vento y hoy no lo hace: pedirle a la API desde esta app da error de
CORS siempre, con sesión abierta o sin ella.

La salida es publicar una copia:

1. Abrí el ChatBot Stock y entrá con tu usuario.
2. **F12 → Console**, pegá todo `scripts/exportar-inventario.js` y Enter.
3. Se descarga `inventario.json`.
4. Copialo a `public/inventario.json`.
5. `npm run build` y publicá.

Desde ahí el panel muestra tu depósito. El archivo está en `.gitignore`
a propósito: cada quien publica el suyo. El formato está en
`public/inventario.ejemplo.json`.

### Qué cubre y qué no el inventario del ChatBot

Su esquema es `sku · producto · cantidad · stock_minimo · unidad ·
ubicacion · proveedor · notas`. **No tiene costo unitario ni historial
de ventas.** Con eso:

| Función | Con datos del ChatBot |
|---|---|
| Stock, faltantes, sobrestock | ✅ completo |
| Ubicaciones y proveedores | ✅ completo |
| Alertas y órdenes sugeridas | ✅ completo |
| Capital inmovilizado · valorización | ❌ falta el costo unitario |
| Pronóstico de demanda | ❌ falta el historial de ventas |

Lo que no se puede calcular se muestra como «—» con el motivo, y no se
rellena con ceros ni con estimaciones. Un costo falso contamina el
capital, la valorización y las recomendaciones de compra a la vez.

Para tener esas dos funciones hace falta agregar `costo_unitario` al
inventario del ChatBot y registrar las salidas — o usar el camino de
Supabase, que sí modela ambas cosas.

#### Sobre el rol y la seguridad

El rol vive en la tabla `profiles`, **no** en `user_metadata`. La
diferencia no es cosmética: `user_metadata` lo reescribe el propio
usuario con una línea desde la consola del navegador —

```js
supabase.auth.updateUser({ data: { role: 'administrador' } })
```

— o sea que cualquiera con cuenta podía darse el rol más alto. En
`profiles` el candado está en los permisos de columna: el cliente puede
actualizar su nombre y su puesto, nunca su rol. Cambiar un rol se hace
desde el panel de Supabase.

`can()` en `src/lib/permissions.js` decide **qué mostrar** y nada más.
Corre en el navegador, así que no es ni puede ser una barrera de
seguridad: quién puede escribir qué lo deciden las políticas de RLS.

El selector de rol del panel es un simulador de demostración y solo
afecta a `can()`: cambiar de rol ahí no cambia lo que el servidor
permite.

---

## Stack

- React 18 + Vite
- React Router 6 (**HashRouter**, porque GitHub Pages no permite fallback a `index.html`)
- Tailwind CSS sobre tokens CSS propios
- IBM Plex Sans / Mono **autoalojadas** (`public/fonts`, 8 archivos, 180 KB)
- lucide-react para iconografía
- Gráficos en SVG propio — sin librería de charts
- jsPDF + autotable para el export PDF, **detrás de un `import()` dinámico**
- Playwright para los tests end-to-end

## Rutas

| Ruta | Acceso | Contenido |
|---|---|---|
| `#/` | Pública | Landing |
| `#/login` | Pública | Login (redirige a `#/panel` si ya hay sesión) |
| `#/panel` | Protegida | Panel de inventario |

## Desarrollo

```bash
./scripts/setup.sh   # dependencias + navegador de Playwright
npm run dev          # desarrollo
npm run build        # compila a docs/ (GitHub Pages sirve desde ahí)
npm run preview
npm run lint
npm test             # suite end-to-end
```

### Tests

63 tests de Playwright contra el **build real** servido por `vite
preview`, no contra el dev server: el base path, el code splitting y el
orden de los chunks solo fallan en producción. Corren en escritorio y
en 375 px.

| Archivo | Cubre |
|---|---|
| `tests/panel.spec.js` | Las ocho pestañas, el detalle por SKU, transferencias, la línea de base de los KPI |
| `tests/auth.spec.js` | Carga diferida del SDK, sesión persistente, cuenta sin confirmar, tope de correos, enlace vencido |
| `tests/recuperacion.spec.js` | Pedido del enlace, pantalla de contraseña nueva, validaciones |
| `tests/datos.spec.js` | Elección de fuente, esquema faltante, el rol que manda |
| `tests/grafico.spec.js` | Tamaño **efectivo** del texto del gráfico, trazado tras un resize |
| `tests/exportar.spec.js` | CSV, PDF real (magic number) y que jsPDF no entre al bundle |
| `tests/a11y-responsive.spec.js` | Foco y Escape en drawers, nombres accesibles, overflow, área táctil |

Las fixtures interceptan Supabase y devuelven una sesión válida: el
panel recorre el mismo camino de código que con auth real, sin salir de
la máquina. Cualquier error de consola o excepción no atrapada rompe el
test — sin eso, una promesa rechazada pasa por verde mientras la
pantalla se ve bien.

`scripts/setup.sh` deja la sesión lista y lo corre solo el hook
`SessionStart` de `.claude/settings.json` al abrir una sesión en la web.

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
| **GSAP + ScrollTrigger** | Timeline secuenciada del Hero al montar; reveal por scroll de Features/CTA (`ScrollTrigger.batch`, una vez, sin scrub/pin); count-up de las cifras del Hero; trazo del gráfico de demanda; timeline de automatización con scroll pinneado + scrub en desktop (único lugar del sitio donde eso se justifica — ver más abajo) | `Hero.jsx`, `Features.jsx`, `CTA.jsx`, `DemandChart.jsx`, `AutomationStory.jsx` |
| **Framer Motion** | Transiciones ligadas a estado de React: `AnimatePresence` en drawers, command palette, centro de notificaciones y el swap botón→confirmación; `whileInView` en el llenado de las barras de categoría | Todo dentro de `Dashboard.jsx` y sus componentes — **solo el panel autenticado**, con code-splitting para que un visitante anónimo nunca la descargue |
| **Web Animation API nativa** | Trazo de la línea observada del gráfico (`stroke-dashoffset`); indicador de pestaña activa del panel; transición de pasos de la demo interactiva de la landing (`LiveDemo.jsx` usa CSS simple a propósito, no Framer, para no arrastrarlo al bundle público) | `DemandChart.jsx`, `Tabs.jsx`, `LiveDemo.jsx` |

Registro único de plugins GSAP en `src/lib/motion.js`. Todo respeta
`prefers-reduced-motion` — GSAP vía chequeo explícito + estado final
inmediato, Framer vía `<MotionConfig reducedMotion="user">`.

**Bug real encontrado y corregido en el propio proceso:** animar el `width`
de un `<rect>` dentro de un `<clipPath>` vía WAAPI no surte efecto en este
motor — la animación termina en estado `"finished"` pero el valor
computado nunca cambia, porque ese nodo vive fuera del árbol de pintado
normal. Esa pieza puntual usa GSAP (que hace `setAttribute` directo en
cada frame) en vez de WAAPI.

**Decisión sobre 3D (revisada tras sumar el ciclo de automatización):**
sigue sin implementarse, pero por una razón distinta a la original.

La primera vez, el argumento era que niveles de stock y demanda son
información 1D/2D. Ese argumento ya no alcanza solo: ahora el producto
tiene un concepto nuevo que sí podría tentar a alguien a pensar en 3D —
un **proceso secuencial** (Datos → Analiza → Detecta → Recomienda →
Acción) y **multidepósito** (dos ubicaciones físicas reales). Se
reevaluó cada uno con el mismo criterio forma/comportamiento/interacción:

- El ciclo de automatización es una relación **causal y temporal** — cada
  etapa alimenta a la siguiente — no espacial. Su forma nativa es una
  línea de tiempo o un diagrama de flujo, no una escena; profundidad (Z)
  no aporta nada a "esto pasa, y después esto otro". Por eso la sección
  `AutomationStory.jsx` es un timeline 2D con scroll pinneado, no una
  escena 3D: el scroll ya representa el avance del proceso sin necesitar
  una tercera dimensión para hacerlo.
- Multidepósito con dos nodos reales (Central, Córdoba) no tiene la
  densidad de datos que justificaría un mapa o una escena 3D — dos
  números lado a lado en una tabla comunican la comparación más rápido
  que una cámara para orbitar alrededor de dos marcadores.

En ningún caso un objeto 3D sería más que decoración: no hay geometría,
rotación ni manipulación que el dominio pida genuinamente. Forzarlo acá
sería el mismo "objeto flotante genérico" que la identidad "Ledger" —
explícitamente plana, de hairlines y grilla— existe para evitar.

## Verificado

- Sin overflow horizontal en 375 / 390 / 768 / 1024 / 1440, en landing,
  login y las 8 secciones del panel, en ambos temas.
- Contraste medido en navegador: 0 fallos AA.
- 0 errores de consola en ningún flujo probado.
- Flujo de auth end-to-end: guarda de ruta, error de credenciales,
  login, persistencia y logout.
- Flujos operativos probados de punta a punta contra el motor real (no
  solo que la UI renderiza): generar orden, transferir stock entre
  depósitos, cargar un conteo físico y aplicar el ajuste, exportar CSV,
  buscar y saltar de sección con Cmd/Ctrl+K, marcar notificaciones
  leídas, ocultar/reordenar KPIs — cada uno confirmado por su efecto real
  en los datos, no por el clic en sí.
- Áreas táctiles ≥44px; drawers y command palette con foco atrapado y
  cierre por Escape.
- Motion probado en navegador real: timeline del Hero, storytelling de
  automatización con scroll pinneado (estado intermedio del scrub
  verificado, no solo inicio/fin), reveal de Features/CTA, trazo del
  gráfico, `AnimatePresence` en los cuatro overlays del panel,
  `prefers-reduced-motion` en los tres sistemas, cleanup de
  `ScrollTrigger`/pin-spacer tras 5 ciclos de navegación repetida (sin
  crecimiento de nodos en el DOM).
- Bundle: framer-motion sigue aislado al chunk del panel (`Dashboard-*.js`,
  ~62 KB gzip); el chunk principal (landing pública, ahora con
  storytelling y demo interactiva) no lo incluye.
- Bug real encontrado y corregido en este pase: `<html>` no tenía
  `overflow-x: hidden` (solo `<body>`), así que un descendiente con su
  propio scroll horizontal —la barra de pestañas del panel— ensanchaba
  el `scrollWidth` del documento a pesar de recortarse visualmente. No
  aparecía en ninguna ruta anterior porque ninguna tenía un elemento con
  scroll horizontal propio hasta ahora.

---

© 2026 SOLVUS
