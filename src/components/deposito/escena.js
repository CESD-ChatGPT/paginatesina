import React from 'react'

/* Escena isométrica del depósito para la animación "Así cambia un depósito".
   Es un dibujo SVG que se calcula por cuadro a partir de un parámetro p
   (0 a 4): cada entero es un estado fijo y entre dos enteros hay una
   transición. Estados:
     0  depósito desordenado: cajas abiertas, en el piso y sin ubicación
     1  entra el camión con la mercadería
     2  Stockus ordena: cada caja va a su lugar
     3  se pregunta por un producto y la tira LED marca dónde está
     4  resultado: cada producto, a un LED de distancia

   Tiene una paleta para el tema claro y otra para el oscuro (ver PALETAS);
   quien la dibuja elige cuál con el parámetro `tema`. */

const h = React.createElement

const U = 38
const CS = 0.8660254
const iso = (x, y, z) => [(x - y) * CS * U, (x + y) * 0.5 * U - z * U]
const P = (a) =>
  a
    .map((q) => {
      const s = iso(q[0], q[1], q[2])
      return s[0].toFixed(1) + ',' + s[1].toFixed(1)
    })
    .join(' ')
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v))
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const prog = (t, d, dur) => ease(clamp((t - d) / dur))
export const win = (p, a, b) => ease(clamp((p - a) / (b - a)))
const lerp = (a, b, e) => a + (b - a) * e

const RY = [2, 5, 8]
const PL = [0.05, 1.0, 1.95, 2.9]
const BS = 0.5
const slot = (r, l, row, col) => [2.1 + col * 0.58, RY[r] + 0.08 + row * 0.55, PL[l] + 0.06]

const SANS = "'IBM Plex Sans', system-ui, sans-serif"
const MONO = "'IBM Plex Mono', ui-monospace, monospace"

const LED = '#5fd4f0'

/* Paleta por tema. Los neutros van de claro (n100) a oscuro (n900) en el
   tema claro, y al revés en el oscuro, para que los contrastes entre piso,
   estantes y cajas se mantengan en los dos. */
const PALETAS = {
  claro: {
    n100: '#f6f8f9', n200: '#edf1f3', n300: '#dde4e8', n400: '#c2ced4', n500: '#93a7b1',
    n600: '#6c7f89', n700: '#485a64', n800: '#2c3d47', n900: '#14232c',
    a100: '#eaf2f5', a200: '#cfe3ea', a300: '#9cc4d2', a400: '#6aa5ba', a500: '#4a8ca3',
    a600: '#2f7b94', a700: '#1f6c82', a800: '#154b5b', a900: '#0b2c40',
    alerta: '#b8460e',
    etqFondo: '#14232c',
    etqTexto: '#ffffff',
    hubTexto: '#154b5b',
    bannerFondo: '#154b5b',
    leche: { t: '#ffffff', f: '#f6f8f9', s: '#edf1f3', line: '#93a7b1', lab: '#4a8ca3' },
  },
  oscuro: {
    n100: '#0b1b26', n200: '#10293a', n300: '#17364a', n400: '#24495f', n500: '#3f6479',
    n600: '#6c8ea1', n700: '#9fbccb', n800: '#cfe1ea', n900: '#eef6fa',
    a100: '#0f3a4f', a200: '#b4d3dd', a300: '#7fb0c1', a400: '#5aa0b8', a500: '#4fb3ce',
    a600: '#4fb3ce', a700: '#2f7b94', a800: '#1b5a73', a900: '#123f52',
    alerta: '#e0793a',
    etqFondo: '#1f5a73',
    etqTexto: '#ffffff',
    hubTexto: '#b4d3dd',
    bannerFondo: '#1b5a73',
    leche: { t: '#e8f6fa', f: '#cfe1ea', s: '#9fbccb', line: '#6c8ea1', lab: '#2f7b94' },
  },
}
export const FONDOS = { claro: '#f2f6f8', oscuro: '#071a26' }

/* La paleta activa se fija al empezar cada dibujo (el render es síncrono). */
let C = PALETAS.claro
let ALERTA = C.alerta

/* Recorrido del operario entre estados, y duración relativa de cada transición. */
const OPK = [
  [3.0, 10.9],
  [8.9, 10.85],
  [9.3, 10.4],
  [9.3, 10.4],
  [7.55, 10.0],
]
const OPT = [[0.05, 0.5], [0.25, 0.6], null, [0, 0.5]]
export const TW = [1, 1.6, 0.5, 0.9]

function rng(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function cub(x, y, z, w, d, hh, m, key, layer, kids, op) {
  const st = { stroke: m.line, strokeWidth: 0.7, strokeLinejoin: 'round' }
  return h(
    'g',
    { key, 'data-layer': layer, opacity: op == null ? undefined : op },
    h('polygon', { key: 't', points: P([[x, y, z + hh], [x + w, y, z + hh], [x + w, y + d, z + hh], [x, y + d, z + hh]]), fill: m.t, ...st }),
    h('polygon', { key: 'f', points: P([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + hh], [x, y + d, z + hh]]), fill: m.f, ...st }),
    h('polygon', { key: 's', points: P([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + hh], [x + w, y, z + hh]]), fill: m.s, ...st }),
    ...(kids || []),
  )
}

/* Cajas y su posición en cada estado: [desordenado, desordenado, en estante, en estante, en estante]. */
export function buildData() {
  const R = rng(11)
  const all = []
  for (let r = 0; r < 3; r++)
    for (let l = 0; l < 3; l++)
      for (let row = 0; row < 2; row++)
        for (let col = 0; col < 10; col++) {
          if (!(r === 2 && l === 1)) all.push(slot(r, l, row, col))
        }
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(R() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  const J = () => (R() - 0.5) * 0.12
  const pileAt = (bx, by) =>
    [[0, 0, 0], [0.56, 0, 0], [0, 0.56, 0], [0.56, 0.56, 0], [0.22, 0.06, 0.5], [0.3, 0.6, 0.5], [0.26, 0.3, 1]].map(([dx, dy, dz]) => [bx + dx + J(), by + dy + J(), dz, 0])
  const singles = [[4.6, 4.2, 0, 1], [6.4, 7.1, 0, 1], [3.6, 9.95, 0, 1], [10.4, 3.4, 0, 1]]
  const floor = pileAt(0.35, 0.4).concat(pileAt(12.4, 0.5), singles)
  const messy = all
    .slice(0, 14)
    .map((s) => [s[0] + (R() - 0.5) * 0.08, s[1] + (R() - 0.5) * 0.04, s[2], R() < 0.3 ? 1 : 0])
    .concat(floor)
  const perm = messy.map((_, i) => i)
  for (let i = perm.length - 1; i > 0; i--) {
    const j = Math.floor(R() * (i + 1))
    ;[perm[i], perm[j]] = [perm[j], perm[i]]
  }
  const boxes = []
  for (let i = 0; i < 32; i++) {
    const pi = Math.floor(i / 8)
    const m = messy[perm[i]]
    const o = slot(pi < 2 ? 0 : 1, pi % 2, 1, i % 8)
    boxes.push({ prod: pi, K: [m, m, o, o, o], op: [1, 1, 1, 1, 1], rank: m[2] > 0 ? 0 : 1 + R(), open: m[3] === 1, fl: R() })
  }
  const ranked = boxes.slice().sort((a, b) => a.rank - b.rank)
  ranked.forEach((b, i) => {
    b.d1 = 0.24 + (i / 32) * 0.36
  })
  const pile = []
  for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) pile.push([9.65 + i * 0.56 + (R() - 0.5) * 0.1, 6.2 + j * 0.62 + (R() - 0.5) * 0.1, 0])
  for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) pile.push([9.9 + i * 0.56 + (R() - 0.5) * 0.12, 6.5 + j * 0.62 + (R() - 0.5) * 0.1, 0.5])
  for (let i = 0; i < 2; i++) pile.push([10.2 + i * 0.56 + (R() - 0.5) * 0.12, 6.8 + (R() - 0.5) * 0.1, 1.0])
  const hands = [OPK[4][0] + 0.3, OPK[4][1] - 0.25, 0.55]
  for (let k = 0; k < 20; k++) {
    const o = slot(2, 1, Math.floor(k / 10), k % 10)
    const tr = [12.4 + (k % 5) * 0.5, 6.3 + (k % 2) * 0.6, 0.4]
    boxes.push({ prod: 4, K: [tr, pile[k], o, o, k === 19 ? hands : o], op: [0, 1, 1, 1, 1], k, picked: k === 19, open: false, dirty: true, fl: R() })
  }
  return { boxes }
}

function banner(p) {
  if (p < 1.0 || p > 1.95) return null
  const out = win(p, 1.72, 1.9)
  const o = 1 - out
  const cx = 40
  const cy = -150 - out * 30
  const bar = win(p, 1.0, 1.06)
  const wipe = win(p, 1.03, 1.13)
  const sub = win(p, 1.13, 1.22)
  const ln = win(p, 1.16, 1.3)
  const word = 'ENTRA STOCKUS'.split('')
  const hc = iso(7.4, 0, 1.75)
  const dx = cx + 218
  const dy = cy + 40
  return h(
    'g',
    { key: 'ban', 'data-layer': 'etiquetas', opacity: o },
    h('line', { x1: dx, y1: dy, x2: hc[0], y2: hc[1] - 46, stroke: LED, strokeWidth: 2, strokeDasharray: '6 5', opacity: ln }),
    h(
      'g',
      { transform: `translate(${cx} ${cy})` },
      h('rect', { x: -250, y: -46, width: 500 * wipe, height: 92, fill: C.bannerFondo }),
      h('rect', { x: -250, y: -46, width: 10, height: 92 * bar, fill: LED }),
      ...word.map((ch, i) => {
        const e = win(p, 1.06 + i * 0.008, 1.12 + i * 0.008)
        return h('text', { key: 'c' + i, x: -222 + i * 25.4, y: 6 + (1 - e) * 14, opacity: e, fill: '#ffffff', fontFamily: MONO, fontWeight: 600, fontSize: 42 }, ch)
      }),
      h('text', { x: -222, y: 34 + (1 - sub) * 8, opacity: sub, fill: C.a200, fontFamily: SANS, fontWeight: 500, fontSize: 20 }, 'Se ordena el depósito. Red local.'),
      h('circle', { cx: 218, cy: 0, r: 12 * wipe, fill: LED }),
      h('circle', { cx: 218, cy: 0, r: 12 + 18 * sub, fill: 'none', stroke: LED, strokeWidth: 2, opacity: (1 - sub * 0.6) * wipe }),
    ),
  )
}

const _suciedad = {}
function suciedad(tema) {
  if (_suciedad[tema]) return _suciedad[tema]
  const r = rng(5)
  const out = []
  const ST = '#9a8f80'
  ;[[3.4, 4.3, 0.9], [6.0, 7.4, 1.1], [9.5, 9.4, 1.3], [4.8, 10.5, 0.8], [11, 3.2, 1.2], [1.2, 7.8, 0.7], [7.6, 1.3, 0.8]].forEach(([x, y, s], i) => {
    const c = iso(x, y, 0)
    out.push(h('ellipse', { key: 's' + i, cx: c[0], cy: c[1], rx: s * U * 1.0, ry: s * U * 0.42, fill: ST, opacity: 0.28 }))
    out.push(h('ellipse', { key: 't' + i, cx: c[0] + s * 12, cy: c[1] + s * 4, rx: s * U * 0.5, ry: s * U * 0.22, fill: ST, opacity: 0.3 }))
  })
  for (let i = 0; i < 14; i++) {
    const x = 1 + r() * 12
    const y = 0.8 + r() * 10.4
    const a = r() * Math.PI
    const d = 0.18 + r() * 0.12
    out.push(
      h('polygon', {
        key: 'p' + i,
        points: P([[x, y, 0], [x + Math.cos(a) * d, y + Math.sin(a) * d, 0], [x + Math.cos(a) * d - Math.sin(a) * d * 0.75, y + Math.sin(a) * d + Math.cos(a) * d * 0.75, 0], [x - Math.sin(a) * d * 0.75, y + Math.cos(a) * d * 0.75, 0]]),
        fill: '#ffffff',
        stroke: C.n500,
        strokeWidth: 0.6,
      }),
    )
  }
  for (let i = 0; i < 40; i++) {
    const c = iso(1 + r() * 12.5, 0.6 + r() * 10.6, 0)
    out.push(h('circle', { key: 'd' + i, cx: c[0], cy: c[1], r: 0.8 + r() * 1.4, fill: C.n600, opacity: 0.55 }))
  }
  for (let i = 0; i < 5; i++) {
    const x = 1.5 + r() * 11
    const y = 1 + r() * 9.5
    const c = iso(x, y, 0)
    const e = iso(x + 0.6, y + 0.15, 0)
    out.push(h('line', { key: 'c' + i, x1: c[0], y1: c[1], x2: e[0], y2: e[1], stroke: '#b3a58f', strokeWidth: 2.2, strokeLinecap: 'round' }))
  }
  _suciedad[tema] = out
  return out
}

function tiempoCaja(b, seg) {
  if (b.prod < 4) return seg === 1 ? [b.d1, 0.36, 0.6] : null
  if (seg === 0) return [0.45 + (b.k / 20) * 0.35, 0.18, 0.4]
  if (seg === 1) return [0.26 + ((19 - b.k) / 20) * 0.34, 0.36, 0.8]
  if (seg === 3 && b.picked) return [0.55, 0.3, 0.35]
  return null
}

const ICONOS = {
  clock: () => [h('circle', { key: 1, cx: 12, cy: 12, r: 10 }), h('polyline', { key: 2, points: '12 6 12 12 16 14' })],
  alert: () => [
    h('path', { key: 1, d: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' }),
    h('line', { key: 2, x1: 12, y1: 9, x2: 12, y2: 13 }),
    h('line', { key: 3, x1: 12, y1: 17, x2: 12.01, y2: 17 }),
  ],
  copy: () => [h('rect', { key: 1, x: 9, y: 9, width: 13, height: 13, rx: 2 }), h('path', { key: 2, d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' })],
}

export function dibujarEscena(p, D, tema = 'claro') {
  C = PALETAS[tema] || PALETAS.claro
  ALERTA = C.alerta
  const seg = Math.min(3, Math.floor(p))
  const t = p - seg
  const items = []
  const add = (k, el) => items.push({ k, el })
  const rackM = { t: C.n600, f: C.n700, s: C.n800, line: C.n800 }
  const plankM = { t: C.n400, f: C.n600, s: C.n600, line: C.n700 }
  const mats = [
    { t: C.n200, f: C.n300, s: C.n400, line: C.n600, lab: C.n700 },
    { t: C.n300, f: C.n400, s: C.n500, line: C.n700, lab: C.n800 },
    { t: C.n100, f: C.n200, s: C.n300, line: C.n500, lab: C.n600 },
    { t: C.n200, f: C.n400, s: C.n500, line: C.n700, lab: C.n100 },
    { ...C.leche },
  ]
  const mess = 1 - win(p, 1.08, 1.4)
  const HUB = [7, 0.2]
  const wr = clamp((p - 1.0) / 0.42) * 16
  const wOn = p > 1.0 && p < 1.45
  const led = win(p, 2.35, 2.7) * (1 - win(p, 3.45, 3.65))
  const spot = win(p, 2.6, 2.9) * (1 - win(p, 3.45, 3.6))

  RY.forEach((ry, r) => {
    ;[[2, ry], [7.92, ry], [2, ry + 1.12], [7.92, ry + 1.12]].forEach(([px, py], pi) => {
      ;[[0, 1], [1, 1], [2, 0.96]].forEach(([z0, hh], si) =>
        add(px + py + 0.08 + 2 * (z0 + hh / 2), cub(px, py, z0, 0.08, 0.08, hh, rackM, `p${r}${pi}${si}`, 'estantes')),
      )
    })
    PL.forEach((z, l) => {
      for (let i = 0; i < 6; i++) {
        const k = 2.5 + i + ry + 0.6 + 2 * (z + 0.03)
        add(k, cub(2 + i, ry, z, 1, 1.2, 0.06, plankM, `k${r}${l}${i}`, 'estantes'))
        if (l < 3) {
          const a = iso(2 + i + 0.04, ry + 1.2, z + 0.03)
          const b = iso(3 + i - 0.04, ry + 1.2, z + 0.03)
          const dd = Math.hypot(2.5 + i - HUB[0], ry + 1.2 - HUB[1])
          const fl = wOn ? clamp(1 - Math.abs(dd - wr) / 1.4) : 0
          const on = Math.max(r === 2 && l === 1 ? led * 0.7 : 0, fl)
          add(
            k + 0.01,
            h(
              'g',
              { key: `l${r}${l}${i}`, 'data-layer': 'leds' },
              h('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: C.n400, strokeWidth: 2, strokeLinecap: 'round' }),
              on > 0 ? h('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: LED, strokeWidth: 2.4, strokeLinecap: 'round', opacity: on }) : null,
            ),
          )
        }
      }
    })
  })

  const tm0 = OPT[seg]
  const A0 = OPK[seg]
  const B0 = OPK[seg + 1]
  const e0 = tm0 ? prog(t, tm0[0], tm0[1]) : 0
  const len0 = Math.hypot(B0[0] - A0[0], B0[1] - A0[1])
  const op = {
    x: lerp(A0[0], B0[0], e0),
    y: lerp(A0[1], B0[1], e0),
    sw: Math.sin(e0 * len0 * 5.5) * 6 * Math.min(1, Math.sin(Math.PI * e0) * 4),
  }

  let carry = false
  D.boxes.forEach((b, i) => {
    const tm = tiempoCaja(b, seg)
    const A = b.K[seg]
    const B = b.K[seg + 1]
    const e = tm ? prog(t, tm[0], tm[1]) : 0
    const moving = Math.abs(A[0] - B[0]) + Math.abs(A[1] - B[1]) + Math.abs(A[2] - B[2]) > 0.01
    const x = lerp(A[0], B[0], e)
    const y = lerp(A[1], B[1], e)
    const z = lerp(A[2], B[2], e) + (moving && tm ? tm[2] * Math.sin(Math.PI * e) : 0)
    const o = b.op[seg] === b.op[seg + 1] ? b.op[seg] : e > 0.001 ? b.op[seg + 1] : b.op[seg]
    if (o <= 0) return
    if (b.picked && seg === 3 && e > 0.5) carry = true
    const m = mats[b.prod]
    const w = BS
    const kids = [
      h('polygon', { key: 'lb', points: P([[x + w * 0.28, y + w, z + w * 0.42], [x + w * 0.72, y + w, z + w * 0.42], [x + w * 0.72, y + w, z + w * 0.68], [x + w * 0.28, y + w, z + w * 0.68]]), fill: m.lab }),
      h('polyline', { key: 'tp', points: P([[x + w / 2, y, z + w], [x + w / 2, y + w, z + w]]), stroke: m.line, strokeWidth: 0.8, fill: 'none' }),
    ]
    if (b.open && mess > 0) {
      const fa = 0.14 + b.fl * 0.12
      const fh = 0.18 + b.fl * 0.1
      kids.push(
        h(
          'g',
          { key: 'op', opacity: mess },
          h('polygon', { points: P([[x + 0.03, y + 0.03, z + w], [x + w - 0.03, y + 0.03, z + w], [x + w - 0.03, y + w - 0.03, z + w], [x + 0.03, y + w - 0.03, z + w]]), fill: C.n700 }),
          h('polygon', { points: P([[x, y, z + w], [x, y + w, z + w], [x - fa, y + w, z + w + fh], [x - fa, y, z + w + fh]]), fill: m.t, stroke: m.line, strokeWidth: 0.7, strokeLinejoin: 'round' }),
          h('polygon', { points: P([[x + w, y, z + w], [x + w, y + w, z + w], [x + w + fa * 0.8, y + w, z + w + fh * 1.2], [x + w + fa * 0.8, y, z + w + fh * 1.2]]), fill: m.f, stroke: m.line, strokeWidth: 0.7, strokeLinejoin: 'round' }),
          b.fl > 0.5
            ? h('polygon', { points: P([[x, y + w, z + w], [x + w, y + w, z + w], [x + w, y + w + fa, z + w + fh * 0.6], [x, y + w + fa, z + w + fh * 0.6]]), fill: m.s, stroke: m.line, strokeWidth: 0.7, strokeLinejoin: 'round' })
            : null,
        ),
      )
    }
    if (b.dirty && mess > 0) {
      const ST = '#8f8473'
      kids.push(
        h(
          'g',
          { key: 'dt', opacity: mess },
          h('polygon', { points: P([[x + w * 0.05, y + w, z + w * (0.1 + b.fl * 0.2)], [x + w * (0.45 + b.fl * 0.3), y + w, z + w * 0.05], [x + w * (0.6 + b.fl * 0.2), y + w, z + w * 0.35], [x + w * 0.15, y + w, z + w * 0.5]]), fill: ST, opacity: 0.45 }),
          h('polygon', { points: P([[x + w * 0.55, y + w * 0.1, z + w], [x + w * 0.92, y + w * 0.2, z + w], [x + w * 0.8, y + w * (0.5 + b.fl * 0.3), z + w], [x + w * 0.5, y + w * 0.45, z + w]]), fill: ST, opacity: 0.35 }),
          h('polyline', { points: P([[x + w, y + w * 0.2, z + w * 0.9], [x + w, y + w * 0.5, z + w * 0.7], [x + w, y + w * 0.35, z + w * 0.4]]), stroke: ST, strokeWidth: 1.2, fill: 'none', opacity: 0.7 }),
        ),
      )
    }
    if (b.picked && spot > 0)
      kids.push(h('polygon', { key: 'hl', points: P([[x, y + w, z], [x + w, y + w, z], [x + w, y + w, z + w], [x, y + w, z + w]]), fill: LED, fillOpacity: 0.22 * spot, stroke: LED, strokeWidth: 2, strokeOpacity: spot }))
    add(x + y + 0.5 + 2 * (z + 0.25) + (b.picked && seg === 3 && e > 0.5 ? 1 : 0), cub(x, y, z, w, w, w, m, 'b' + i, 'cajas', kids))
  })

  const [sx, sy] = iso(op.x, op.y, 0)
  const ph = win(p, 1.05, 1.25) * (1 - win(p, 3.0, 3.2))
  add(
    op.x + op.y + 1.6,
    h(
      'g',
      { key: 'op', 'data-layer': 'operario' },
      h('ellipse', { cx: sx, cy: sy, rx: 11, ry: 5, fill: C.n300 }),
      h('line', { x1: sx - 3.5, y1: sy - 20, x2: sx - 3.5 + op.sw, y2: sy - 1, stroke: C.n800, strokeWidth: 5, strokeLinecap: 'round' }),
      h('line', { x1: sx + 3.5, y1: sy - 20, x2: sx + 3.5 - op.sw, y2: sy - 1, stroke: C.n800, strokeWidth: 5, strokeLinecap: 'round' }),
      h('line', { x1: sx - 8, y1: sy - 40, x2: sx - 10 - op.sw * 0.4, y2: sy - 24, stroke: C.n700, strokeWidth: 4, strokeLinecap: 'round' }),
      carry
        ? h('line', { x1: sx + 8, y1: sy - 40, x2: sx + 15, y2: sy - 31, stroke: C.n700, strokeWidth: 4, strokeLinecap: 'round' })
        : ph > 0.5
          ? h('line', { x1: sx + 8, y1: sy - 40, x2: sx + 11, y2: sy - 33, stroke: C.n700, strokeWidth: 4, strokeLinecap: 'round' })
          : h('line', { x1: sx + 8, y1: sy - 40, x2: sx + 10 + op.sw * 0.4, y2: sy - 24, stroke: C.n700, strokeWidth: 4, strokeLinecap: 'round' }),
      h('rect', { x: sx - 9, y: sy - 45, width: 18, height: 27, rx: 5, fill: C.n700 }),
      h('rect', { x: sx - 9, y: sy - 35, width: 18, height: 3, fill: C.n500 }),
      h('circle', { cx: sx, cy: sy - 53, r: 7, fill: C.n300, stroke: C.n800, strokeWidth: 1.5 }),
      h('path', { d: `M${sx - 7.5} ${sy - 54} a7.5 7.5 0 0 1 15 0 z`, fill: C.n800 }),
      h('rect', { x: sx + 9, y: sy - 41, width: 6, height: 10, rx: 1, fill: C.a700, stroke: C.n900, strokeWidth: 0.8, opacity: ph }),
    ),
  )

  const ttm = seg === 0 ? prog(t, 0, 0.45) : seg === 1 ? prog(t, 0.45, 0.4) : 0
  const ox = seg === 0 ? lerp(12, 0, ttm) : seg === 1 ? lerp(0, 12, ttm) : 12
  if (ox < 11.8) {
    const X = 12.1 + ox
    const dark = { t: C.n800, f: C.n900, s: C.n900, line: C.n900 }
    const cargo = { t: C.n100, f: C.n200, s: C.n300, line: C.n600 }
    const cab = { t: C.n600, f: C.n700, s: C.n800, line: C.n900 }
    add(
      20.5,
      h(
        'g',
        { key: 'truck', 'data-layer': 'camion' },
        cub(X, 6.1, 0.25, 4.9, 1.7, 0.12, dark, 'ch', 'camion'),
        cub(X + 0.5, 7.75, 0, 0.55, 0.2, 0.4, dark, 'w1', 'camion'),
        cub(X + 2.5, 7.75, 0, 0.55, 0.2, 0.4, dark, 'w2', 'camion'),
        cub(X + 3.9, 7.75, 0, 0.55, 0.2, 0.4, dark, 'w3', 'camion'),
        cub(X, 6.0, 0.37, 3.6, 1.9, 1.9, cargo, 'cg', 'camion', [h('polyline', { key: 'st', points: P([[X, 7.9, 0.75], [X + 3.6, 7.9, 0.75], [X + 3.6, 6.0, 0.75]]), stroke: C.n400, strokeWidth: 1, fill: 'none' })]),
        cub(X + 3.7, 6.1, 0.37, 1.2, 1.7, 1.25, cab, 'cb', 'camion', [h('polygon', { key: 'wn', points: P([[X + 4.9, 6.3, 1.0], [X + 4.9, 7.6, 1.0], [X + 4.9, 7.6, 1.45], [X + 4.9, 6.3, 1.45]]), fill: C.a200, stroke: C.n900, strokeWidth: 0.7 })]),
      ),
    )
  }

  const nb = 1 - win(p, 1.1, 1.4)
  const lp = win(p, 1.4, 1.7)
  const tM = { t: C.n300, f: C.n500, s: C.n600, line: C.n700 }
  const nl = [0, 1, 2, 3].map((j) => {
    const a = iso(11.82, 10.08 + j * 0.12, 0.8)
    const b = iso(12.28, 10.08 + j * 0.12, 0.8)
    return h('line', { key: 'n' + j, x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: C.n400, strokeWidth: 0.8 })
  })
  const pl = [0, 1, 2, 3].map((j) => {
    const a = iso(12.58, 10.1 + j * 0.12, 0.8)
    const b = iso(12.98, 10.1 + j * 0.12, 0.8)
    return h('line', { key: 'q' + j, x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: C.n400, strokeWidth: 0.8 })
  })
  const zz = []
  for (let j = 0; j < 3; j++) {
    const pts = []
    for (let s = 0; s < 7; s++) pts.push([12.6 + s * 0.06, 10.08 + j * 0.12 + (s % 2 ? 0.07 : 0), 0.8])
    zz.push(h('polyline', { key: 'z' + j, points: P(pts), stroke: C.n800, strokeWidth: 1.2, fill: 'none' }))
  }
  add(
    23,
    h(
      'g',
      { key: 'mesa', 'data-layer': 'mesa' },
      ...[[11.65, 9.85], [13.1, 9.85], [11.65, 10.7], [13.1, 10.7]].map(([lx, ly], j) => cub(lx, ly, 0, 0.06, 0.06, 0.72, tM, 'tl' + j, 'mesa')),
      cub(11.6, 9.8, 0.72, 1.6, 1.0, 0.07, tM, 'tt', 'mesa'),
      h(
        'g',
        { key: 'nb', opacity: nb },
        h('polygon', { points: P([[11.75, 9.95, 0.8], [12.35, 9.95, 0.8], [12.35, 10.5, 0.8], [11.75, 10.5, 0.8]]), fill: C.n100, stroke: C.n600, strokeWidth: 0.8 }),
        ...nl,
        h('polygon', { points: P([[12.5, 9.98, 0.8], [13.08, 9.98, 0.8], [13.08, 10.6, 0.8], [12.5, 10.6, 0.8]]), fill: '#ffffff', stroke: C.n500, strokeWidth: 0.8 }),
        ...pl,
        ...zz,
      ),
      h(
        'g',
        { key: 'lp', opacity: lp },
        h('polygon', { points: P([[11.8, 10.05, 0.8], [12.55, 10.05, 0.8], [12.55, 10.55, 0.8], [11.8, 10.55, 0.8]]), fill: C.n700, stroke: C.n900, strokeWidth: 0.7 }),
        h('polygon', { points: P([[11.8, 10.05, 0.8], [12.55, 10.05, 0.8], [12.55, 10.05, 1.28], [11.8, 10.05, 1.28]]), fill: C.a700, stroke: C.n900, strokeWidth: 0.7 }),
        ...[0, 1, 2].map((j) => {
          const a = iso(11.9, 10.05, 1.18 - j * 0.1)
          const b = iso(12.2 + j * 0.08, 10.05, 1.18 - j * 0.1)
          return h('line', { key: 'u' + j, x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: C.a300, strokeWidth: 1.2 })
        }),
      ),
    ),
  )
  items.sort((a, b) => a.k - b.k)

  const al = win(p, 1.6, 1.95)
  const wallM = { t: C.n300, f: C.n200, s: C.n300, line: C.n400 }
  const grid = []
  for (let x = 1; x < 14; x++) {
    const a = iso(x, 0, 0)
    const b = iso(x, 11.5, 0)
    grid.push(h('line', { key: 'gx' + x, x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: C.n300, strokeWidth: 0.6 }))
  }
  for (let y = 1; y < 12; y++) {
    const a = iso(0, y, 0)
    const b = iso(14, y, 0)
    grid.push(h('line', { key: 'gy' + y, x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: C.n300, strokeWidth: 0.6 }))
  }
  const aisles = [4.1, 7.1, 10.2].map((y, j) => {
    const a = iso(1.2, y, 0)
    const b = iso(9, y, 0)
    return h('line', { key: 'a' + j, x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: C.a500, strokeWidth: 1.6, strokeDasharray: '8 6' })
  })
  const ad = iso(14, 7, 0)
  const ae = iso(24, 7, 0)
  const fondo = h(
    'g',
    { key: 'fondo', 'data-layer': 'fondo' },
    h('polygon', { points: P([[14, 5.6, 0], [24, 5.6, 0], [24, 8.4, 0], [14, 8.4, 0]]), fill: C.n300 }),
    h('line', { x1: ad[0], y1: ad[1], x2: ae[0], y2: ae[1], stroke: C.n100, strokeWidth: 1.5, strokeDasharray: '10 8' }),
    h('polygon', { points: P([[0, 0, 0], [14, 0, 0], [14, 11.5, 0], [0, 11.5, 0]]), fill: C.n200, stroke: C.n400, strokeWidth: 1 }),
    h('polygon', { key: 'tint', points: P([[0, 0, 0], [14, 0, 0], [14, 11.5, 0], [0, 11.5, 0]]), fill: C.a100, opacity: win(p, 1.05, 1.4) }),
    ...grid,
    h('g', { key: 'al', opacity: al }, ...aisles),
    h('g', { key: 'dirt', opacity: mess }, ...suciedad(tema)),
    cub(-0.15, 0, 0, 0.15, 11.5, 2.2, wallM, 'wx', 'fondo'),
    cub(0, -0.15, 0, 14, 0.15, 2.2, wallM, 'wy', 'fondo'),
  )

  const hubO = win(p, 0.92, 1.02)
  const hc = iso(HUB[0], HUB[1], 0)
  const hl = iso(HUB[0] + 0.4, 0, 1.75)
  const hub = h(
    'g',
    { key: 'hub', 'data-layer': 'leds', opacity: hubO },
    cub(HUB[0] - 0.1, 0, 1.3, 1.0, 0.22, 0.7, { t: C.a700, f: C.a800, s: C.a900, line: C.a900 }, 'hb', 'leds', [
      h('line', { key: 'hl', x1: iso(HUB[0], 0.22, 1.45)[0], y1: iso(HUB[0], 0.22, 1.45)[1], x2: iso(HUB[0] + 0.8, 0.22, 1.45)[0], y2: iso(HUB[0] + 0.8, 0.22, 1.45)[1], stroke: LED, strokeWidth: 3, strokeLinecap: 'round' }),
    ]),
    h('text', { x: hl[0] + 4, y: hl[1] - 24, textAnchor: 'middle', fill: C.hubTexto, fontFamily: MONO, fontWeight: 600, fontSize: 15, letterSpacing: '0.04em' }, 'STOCKUS'),
  )
  const wave = wOn
    ? h(
        'g',
        { key: 'wave', 'data-layer': 'leds', clipPath: 'url(#floorclip)' },
        ...[0, 2.2, 4.4].map((off, j) => {
          const rr = Math.max(0, wr - off)
          return h('ellipse', { key: 'w' + j, cx: hc[0], cy: hc[1], rx: rr * U * 1.22, ry: rr * U * 0.61, fill: j === 0 ? LED : 'none', fillOpacity: 0.1, stroke: LED, strokeWidth: j === 0 ? 4 : 2, opacity: (1 - clamp((p - 1.0) / 0.45)) * (j === 0 ? 1 : 0.6) })
        }),
      )
    : null

  const ov = []
  const g1 = iso(2, 9.2, 1.03)
  const g2 = iso(8, 9.2, 1.03)
  const bx0 = slot(2, 1, 1, 9)[0]
  const s1 = iso(bx0 + 0.02, 9.2, 1.03)
  const s2 = iso(bx0 + BS - 0.02, 9.2, 1.03)
  ov.push(
    h(
      'g',
      { key: 'glow', 'data-layer': 'leds' },
      h('line', { x1: g1[0], y1: g1[1], x2: g2[0], y2: g2[1], stroke: LED, strokeWidth: 6, strokeLinecap: 'round', filter: 'url(#sglow)', opacity: led * 0.55 }),
      h(
        'g',
        { opacity: spot },
        h(
          'g',
          { className: 'deposito-pulso' },
          h('line', { x1: s1[0], y1: s1[1], x2: s2[0], y2: s2[1], stroke: LED, strokeWidth: 16, strokeLinecap: 'round', filter: 'url(#sglow)' }),
          h('line', { x1: s1[0], y1: s1[1], x2: s2[0], y2: s2[1], stroke: '#ffffff', strokeWidth: 2, strokeLinecap: 'round' }),
        ),
      ),
    ),
  )
  const tg = iso(bx0 + BS / 2, 9.2, 3.35)
  ov.push(
    h(
      'g',
      { key: 'tag', 'data-layer': 'etiquetas', opacity: spot },
      h('line', { x1: tg[0], y1: tg[1] + 10, x2: tg[0], y2: tg[1] + 52, stroke: C.a600, strokeWidth: 1, strokeDasharray: '3 3' }),
      h('rect', { x: tg[0] - 88, y: tg[1] - 22, width: 176, height: 38, fill: C.a700 }),
      h('text', { x: tg[0], y: tg[1] + 3, textAnchor: 'middle', fill: '#ffffff', fontFamily: MONO, fontWeight: 600, fontSize: 20, letterSpacing: '0.02em' }, 'LECHE · C2'),
    ),
  )
  ;['A', 'B', 'C'].forEach((L, r) => {
    const q = iso(1.85, RY[r] + 1.25, 3.0)
    ov.push(
      h(
        'g',
        { key: 'r' + L, 'data-layer': 'etiquetas' },
        h('line', { x1: q[0], y1: q[1] + 18, x2: q[0], y2: q[1] + 34, stroke: C.etqFondo, strokeWidth: 2 }),
        h('rect', { x: q[0] - 38, y: q[1] - 18, width: 76, height: 36, fill: C.etqFondo }),
        h('text', { x: q[0], y: q[1] + 6, textAnchor: 'middle', fill: C.etqTexto, fontFamily: MONO, fontWeight: 600, fontSize: 18, letterSpacing: '0.04em' }, 'FILA ' + L),
      ),
    )
  })

  const qO = 1 - win(p, 0.2, 0.42)
  if (qO > 0) {
    const bx = sx + 120
    const by = sy - 115
    const bubs = [[-46, 4, 20], [-22, -12, 26], [8, -16, 28], [38, -8, 24], [56, 8, 18], [30, 18, 22], [-4, 20, 24], [-34, 18, 18]]
    const qs = [[-40, 8, 22, -14], [-16, -2, 30, 8], [10, -6, 26, -6], [36, 4, 24, 14], [-2, 18, 18, -20], [22, 20, 16, 10], [52, 12, 15, -12]]
    ov.push(
      h(
        'g',
        { key: 'q', 'data-layer': 'iconos', opacity: qO },
        h('circle', { cx: sx + 12, cy: sy - 70, r: 3.5, fill: '#ffffff', stroke: C.n700, strokeWidth: 1.5 }),
        h('circle', { cx: sx + 26, cy: sy - 82, r: 6, fill: '#ffffff', stroke: C.n700, strokeWidth: 1.5 }),
        h('circle', { cx: sx + 44, cy: sy - 96, r: 9, fill: '#ffffff', stroke: C.n700, strokeWidth: 1.5 }),
        ...bubs.map(([dx, dy, r], i) => h('circle', { key: 'o' + i, cx: bx + dx, cy: by + dy, r, fill: '#ffffff', stroke: C.n700, strokeWidth: 3 })),
        ...bubs.map(([dx, dy, r], i) => h('circle', { key: 'i' + i, cx: bx + dx, cy: by + dy, r: r - 1.5, fill: '#ffffff' })),
        ...qs.map(([dx, dy, s, rot], i) =>
          h('text', { key: 't' + i, x: bx + dx, y: by + dy + s * 0.35, textAnchor: 'middle', transform: `rotate(${rot} ${bx + dx} ${by + dy})`, fill: ALERTA, fontFamily: SANS, fontWeight: 700, fontSize: s }, '?'),
        ),
      ),
    )
  }

  const badges = [
    { ic: 'clock', lab: 'Tiempo perdido', bx: iso(8.9, 10.85, 1.75), dx: -120, dy: -70 },
    { ic: 'alert', lab: 'Producto no encontrado', bx: iso(4.6, 6.2, 1.3), dx: 90, dy: -100 },
    { ic: 'copy', lab: 'Stock duplicado', bx: iso(10.5, 7.0, 1.5), dx: 70, dy: -110 },
  ]
  badges.forEach((b, i) => {
    const o = win(p, 0.55 + i * 0.1, 0.72 + i * 0.1) * (1 - win(p, 1.0, 1.18))
    if (o <= 0) return
    const cx = b.bx[0] + b.dx
    const cy = b.bx[1] + b.dy
    const sc = 0.7 + 0.3 * o
    const tw = b.lab.length * 10.6 + 28
    ov.push(
      h(
        'g',
        { key: 'bd' + i, 'data-layer': 'iconos', opacity: o },
        h('line', { x1: b.bx[0], y1: b.bx[1], x2: cx, y2: cy, stroke: ALERTA, strokeWidth: 1.2 }),
        h('circle', { cx: b.bx[0], cy: b.bx[1], r: 3, fill: ALERTA }),
        h(
          'g',
          { transform: `translate(${cx} ${cy}) scale(${sc})` },
          h('circle', { r: 24, fill: ALERTA, stroke: '#ffffff', strokeWidth: 2.5 }),
          h('g', { transform: 'translate(-14.4 -14.4) scale(1.2)', fill: 'none', stroke: '#ffffff', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }, ...ICONOS[b.ic]()),
          h('rect', { x: -tw / 2, y: 30, width: tw, height: 34, fill: '#ffffff', stroke: ALERTA, strokeWidth: 1.5 }),
          h('text', { x: 0, y: 53, textAnchor: 'middle', fill: C.n900, fontFamily: SANS, fontWeight: 600, fontSize: 18 }, b.lab),
        ),
      ),
    )
  })

  return h(
    'svg',
    { viewBox: '-400 -215 930 715', width: '100%', height: '100%', preserveAspectRatio: 'xMidYMid meet', style: { display: 'block', overflow: 'visible' }, role: 'img', 'aria-label': 'Un depósito desordenado que Stockus ordena: la tira LED marca dónde está cada producto' },
    h('defs', { key: 'defs' }, h('clipPath', { id: 'floorclip' }, h('polygon', { points: P([[0, 0, 0], [14, 0, 0], [14, 11.5, 0], [0, 11.5, 0]]) })), h('filter', { id: 'sglow', x: '-20%', y: '-300%', width: '140%', height: '700%' }, h('feGaussianBlur', { stdDeviation: 5 }))),
    fondo,
    wave,
    hub,
    ...items.map((it) => it.el),
    ...ov,
    banner(p),
  )
}
