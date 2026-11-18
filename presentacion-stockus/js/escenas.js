/* ESCENAS DIBUJADAS POR TIEMPO
   Diapositivas 2 (Thomas), 3 (Pedro) y 13 (conversación con Stockus).
   Cada escena se arma una sola vez y se dibuja como función del tiempo t (segundos a velocidad 100 %).
   Por eso reiniciar (R), retroceder (se muestra el estado final) o avanzar a mitad nunca deja estados a medias:
   el motor de js/app.js solo decide qué t mostrar. Los tiempos salen de js/beats.js.
   Todo es vectorial: líneas finas celestes y blancas sobre Petróleo. Errores con una ✕ blanca. */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CEL = '#4FB3CE', PET = '#0B2C40', WHITE = '#fff';

  /* ---------- utilidades ---------- */
  function S(tag, a, p) {
    const e = document.createElementNS(NS, tag);
    if (a) for (const k in a) e.setAttribute(k, a[k]);
    if (p) p.appendChild(e);
    return e;
  }
  function H(tag, cls, p, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    if (p) p.appendChild(e);
    return e;
  }
  const cl = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const eo = (p) => 1 - Math.pow(1 - p, 3);
  const eio = (p) => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const lin = (t, a, d) => cl((t - a) / d);
  const pr = (t, a, d) => eo(lin(t, a, d));                                   // fundidos: siempre
  const mv = (t, a, d) => (RM ? (t >= a ? 1 : 0) : eo(lin(t, a, d)));         // movimiento: con movimiento reducido, salta
  const mvl = (t, a, d) => (RM ? (t >= a ? 1 : 0) : lin(t, a, d));
  const op = (e, v) => { e.style.opacity = v < .002 ? '0' : v > .998 ? '1' : v.toFixed(3); };
  const tiempos = (def) => { const m = {}; def.beats.forEach((b) => { m[b.escena] = b.t; }); return m; };
  function draw(el, p) {                                                       // trazo que se dibuja (0 → 1)
    if (el._L == null) { el._L = el.getTotalLength(); el.style.strokeDasharray = el._L + ' ' + el._L; }
    el.style.strokeDashoffset = (el._L * (1 - (RM ? (p > 0 ? 1 : 0) : p))).toFixed(1);
  }
  function cruz(p, cx, cy, r, cls) {                                          // ✕ blanca vectorial
    const g = S('g', { class: cls || 'cruz' }, p);
    S('path', { d: `M${cx - r} ${cy - r} L${cx + r} ${cy + r}` }, g);
    S('path', { d: `M${cx + r} ${cy - r} L${cx - r} ${cy + r}` }, g);
    return g;
  }
  function persona(p, x, y, sc) {                                             // círculo y trazos
    const g = S('g', { class: 'per', transform: `translate(${x} ${y}) scale(${sc})` }, p);
    S('circle', { cx: 0, cy: -58, r: 10 }, g);
    S('path', { d: 'M0 -46 V-16 M0 -38 L-11 -24 M0 -38 L11 -24' }, g);
    const legs = S('path', { d: 'M0 -16 L-8 0 M0 -16 L8 0' }, g);
    g._legs = legs;
    return g;
  }
  function halo(p, id) {                                                       // degradé radial celeste para halos SVG
    const d = S('defs', null, p);
    const rg = S('radialGradient', { id }, d);
    S('stop', { offset: '0', 'stop-color': CEL, 'stop-opacity': '.55' }, rg);
    S('stop', { offset: '.45', 'stop-color': CEL, 'stop-opacity': '.18' }, rg);
    S('stop', { offset: '1', 'stop-color': CEL, 'stop-opacity': '0' }, rg);
  }
  // Nivel de luz de un segmento cuando la cabeza del recorrido está en h (estela que se apaga)
  function nivel(h, i) { const d = h - i; if (d < -1) return 0; if (d < 0) return 1 + d; return Math.exp(-d / 2.2); }

  /* ---------- Subtítulos bilingües (banda inferior, sobre la barra de LEDs) ---------- */
  function subtitulos(slide, def) {
    const band = H('div', 'subband', slide);
    const box = H('div', 'subs', band);
    const en = H('p', 'en', box), es = H('p', 'es', box);
    const cues = def.beats.filter((b) => b.en);
    let cur = -1;
    return (t) => {
      op(band, pr(t, 0, .4));
      let i = -1;
      for (let k = 0; k < cues.length; k++) if (cues[k].t <= t + 1e-6) i = k;
      if (i < 0) { op(box, 0); return; }
      if (i !== cur) { cur = i; en.textContent = cues[i].en; es.textContent = cues[i].es; }
      const nx = cues[i + 1];
      op(box, Math.min(pr(t, cues[i].t, .35), nx ? 1 - lin(t, nx.t - .25, .25) : 1));
    };
  }

  /* =====================================================================
     DIAPOSITIVA 2 · LA HISTORIA DE THOMAS
     ===================================================================== */
  function thomas(slide, def) {
    const T = tiempos(def);
    const svg = S('svg', { class: 'dib', viewBox: '0 0 1920 1080' }, slide);
    halo(svg, 'thHalo');
    const subs = subtitulos(slide, def);

    // --- Depósito isométrico (estilo de la animación de la landing) ---
    const K = .777, X0 = 1098, Y0 = 303, C = .866;
    const P = (x, y, z) => [X0 + (x - y) * C * K, Y0 + ((x + y) * .5 - z) * K];
    const pts = (a) => a.map((q) => P(q[0], q[1], q[2]).map((n) => n.toFixed(1)).join(',')).join(' ');
    const wh = S('g', { class: 'wh' }, svg);
    const piso = S('g', { class: 'piso' }, wh);
    for (let x = -80; x <= 960; x += 80) S('polyline', { points: pts([[x, -60, 0], [x, 330, 0]]) }, piso);
    for (let y = -60; y <= 330; y += 65) S('polyline', { points: pts([[-80, y, 0], [960, y, 0]]) }, piso);
    const W = 210, D = 70, Hh = 300, GAP = 120;
    const cajones = [];
    for (let k = 0; k < 3; k++) {
      const x0 = k * (W + GAP);
      const g = S('g', { class: 'rack' }, wh);
      S('polygon', { class: 'cara top', points: pts([[x0, 0, Hh], [x0 + W, 0, Hh], [x0 + W, D, Hh], [x0, D, Hh]]) }, g);
      S('polygon', { class: 'cara lado', points: pts([[x0 + W, 0, 0], [x0 + W, D, 0], [x0 + W, D, Hh], [x0 + W, 0, Hh]]) }, g);
      S('polygon', { class: 'cara frente', points: pts([[x0, D, 0], [x0 + W, D, 0], [x0 + W, D, Hh], [x0, D, Hh]]) }, g);
      const cw = (W - 16) / 3, ch = (Hh - 24) / 4;
      for (let j = 3; j >= 0; j--) for (let i = 0; i < 3; i++) {
        const xa = x0 + 8 + i * cw + 5, xb = xa + cw - 10, za = 14 + j * ch + 5, zb = za + ch - 10;
        const cg = S('g', { class: 'cajon' }, g);
        S('polygon', { points: pts([[xa, D, za], [xb, D, za], [xb, D, zb], [xa, D, zb]]) }, cg);
        const zm = za + (zb - za) * .3, xm = (xa + xb) / 2;
        S('polyline', { class: 'manija', points: pts([[xm - cw * .16, D, zm], [xm + cw * .16, D, zm]]) }, cg);
        const c = P((xa + xb) / 2, D, (za + zb) / 2);
        cajones.push({ g: cg, k, i, j, cx: c[0], cy: c[1], jx: 0, jy: 0, jr: 0 });
      }
    }
    // orden de aparición de los "?" y desalineado leve, fijo (sin azar entre corridas)
    cajones.forEach((c, n) => { c.jx = ((n * 37) % 11) - 5; c.jy = ((n * 23) % 9) - 4; c.jr = ((n * 17) % 7) - 3; });
    const marcas = S('g', null, wh);
    const preg = cajones.map((c) => { const e = S('text', { class: 'preg', x: c.cx, y: c.cy + 11 }, marcas); e.textContent = '?'; return e; });
    const errIdx = [4, 15, 19, 28, 33];
    const errores = errIdx.map((n) => cruz(marcas, cajones[n].cx, cajones[n].cy, 15));

    // --- Personas y globos de diálogo ---
    const gente = S('g', null, wh);
    const pa = P(110, 225, 0), pb = P(560, 270, 0);
    const perA = persona(gente, pa[0], pa[1], 2);
    const perB = persona(gente, pb[0], pb[1], 2);
    function globo(x, y, w, haciaIzq) {
      const g = S('g', { class: 'globo' }, gente);
      S('rect', { x: x - w / 2, y: y - 40, width: w, height: 80, rx: 2 }, g);
      const tx = haciaIzq ? x + w / 2 - 50 : x - w / 2 + 50;
      S('path', { d: `M${tx - 14} ${y + 40} L${tx} ${y + 62} L${tx + 14} ${y + 40}` }, g);
      const t = S('text', { x, y: y + 15 }, g);
      g._t = t;
      return g;
    }
    const gA = globo(pa[0] - 40, pa[1] - 230, 230, true);
    const gB = globo(pb[0] + 70, pb[1] - 230, 300, false);
    const decA = ['5?', '4?', '6?', '5?'], decB = ['4?', 'creo que 3…', '7?', '2?'];

    // --- Recorrido en zigzag con rastro punteado ---
    const ruta = [[-40, 260], [120, 140], [270, 30], [300, 240], [450, 130], [600, 25], [640, 260], [800, 140], [930, 250]].map((q) => P(q[0], q[1], 0));
    const seg = []; let tot = 0;
    for (let i = 1; i < ruta.length; i++) { const L = Math.hypot(ruta[i][0] - ruta[i - 1][0], ruta[i][1] - ruta[i - 1][1]); seg.push(L); tot += L; }
    const enRuta = (s) => {
      let r = s;
      for (let i = 0; i < seg.length; i++) {
        if (r <= seg[i] || i === seg.length - 1) { const u = cl(r / seg[i]); return [ruta[i][0] + (ruta[i + 1][0] - ruta[i][0]) * u, ruta[i][1] + (ruta[i + 1][1] - ruta[i][1]) * u]; }
        r -= seg[i];
      }
      return ruta[ruta.length - 1];
    };
    const rastro = S('g', { class: 'rastro' }, wh);
    const puntos = [];
    for (let s = 0; s <= tot; s += 16) { const q = enRuta(s); puntos.push({ s, e: S('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 3 }, rastro) }); }
    const walker = persona(wh, 0, 0, 2);

    // --- Columna izquierda: rótulos y reloj ---
    const rot = H('div', 'th-rot', slide);
    H('div', 'k', rot, 'Pasantía');
    H('div', 'n', rot, 'HDS TECHNOLOGY');
    H('div', 'd', rot, 'Logística y depósitos');
    const nost = H('div', 'th-nost', slide);
    nost.innerHTML = 'NO STOCK<br>SYSTEM';
    const reloj = S('g', { class: 'reloj' }, svg);
    const RC = [420, 440];
    S('circle', { cx: RC[0], cy: RC[1], r: 160 }, reloj);
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6, r1 = i % 3 ? 140 : 128;
      S('line', { x1: RC[0] + Math.sin(a) * r1, y1: RC[1] - Math.cos(a) * r1, x2: RC[0] + Math.sin(a) * 152, y2: RC[1] - Math.cos(a) * 152 }, reloj);
    }
    const hHora = S('line', { class: 'aguja h', x1: RC[0], y1: RC[1], x2: RC[0], y2: RC[1] - 78 }, reloj);
    const hMin = S('line', { class: 'aguja m', x1: RC[0], y1: RC[1], x2: RC[0], y2: RC[1] - 122 }, reloj);
    S('circle', { class: 'eje', cx: RC[0], cy: RC[1], r: 7 }, reloj);

    // --- Revelación: STOCKUS + tira de LED ---
    const rv = H('div', 'th-rev', slide);
    const rvHalo = H('div', 'halo', rv);
    const rvDot = H('div', 'dot', rv);
    const word = H('div', 'word', rv, 'STOCKUS');
    const tira = H('div', 'strip th-strip', slide);
    const tsegs = [];
    for (let i = 0; i < 30; i++) { const s = H('i', 'seg', tira); tsegs.push(H('b', null, s)); }

    // --- Los cuatro pasos ---
    const pasos = S('g', { class: 'pasos' }, svg);
    const PW = 360, PH = 300, PY = 300;
    const etiquetas = ['Iniciás sesión', 'Productos', 'Movimientos', 'Inventario en vivo'];
    const pasoEls = [0, 1, 2, 3].map((i) => {
      const x = 120 + i * (PW + 80);
      const g = S('g', { class: 'paso', transform: `translate(${x} ${PY})` }, pasos);
      const hl = S('ellipse', { cx: PW / 2, cy: PH / 2, rx: PW * .85, ry: PH * .8, fill: 'url(#thHalo)', class: 'phalo' }, g);
      const fr = S('rect', { class: 'pfr', x: 0, y: 0, width: PW, height: PH }, g);
      const led = S('rect', { class: 'pled', x: PW - 54, y: 22, width: 30, height: 9 }, g);
      const num = S('text', { class: 'pnum', x: 24, y: 44 }, g); num.textContent = '0' + (i + 1);
      const sk = S('g', { class: 'esq' }, g);
      if (i === 0) {                         // formulario de ingreso
        S('rect', { x: 90, y: 70, width: 180, height: 190 }, sk);
        S('circle', { cx: 180, cy: 108, r: 16 }, sk);
        S('rect', { x: 112, y: 144, width: 136, height: 26 }, sk);
        S('rect', { x: 112, y: 182, width: 136, height: 26 }, sk);
        S('rect', { class: 'lleno', x: 140, y: 222, width: 80, height: 22 }, sk);
      } else if (i === 1) {                  // producto con un lápiz
        S('polygon', { points: '110,150 175,118 240,150 175,182' }, sk);
        S('polyline', { points: '110,150 110,230 175,262 240,230 240,150' }, sk);
        S('line', { x1: 175, y1: 182, x2: 175, y2: 262 }, sk);
        S('polygon', { class: 'lapiz', points: '230,92 262,60 280,78 248,110' }, sk);
        S('polygon', { class: 'lapiz', points: '230,92 248,110 222,118' }, sk);
      } else if (i === 2) {                  // lista de movimientos
        for (let r = 0; r < 4; r++) {
          const y = 92 + r * 46, ing = r % 2 === 0;
          S('path', { d: ing ? `M82 ${y + 10} L96 ${y - 6} L110 ${y + 10} M96 ${y - 6} V${y + 22}` : `M82 ${y + 6} L96 ${y + 22} L110 ${y + 6} M96 ${y + 22} V${y - 6}` }, sk);
          S('line', { x1: 130, y1: y + 8, x2: 250 - (r % 3) * 30, y2: y + 8 }, sk);
          S('line', { class: 'tenue', x1: 254, y1: y + 8, x2: 284, y2: y + 8 }, sk);
        }
      } else {                               // tablero con números
        S('rect', { x: 64, y: 70, width: 232, height: 190 }, sk);
        const n = S('text', { class: 'tnum', x: 84, y: 120 }, sk); n.textContent = '128';
        [[96, 70], [136, 110], [176, 50], [216, 90]].forEach(([bx, bh]) => S('rect', { class: 'lleno', x: bx, y: 240 - bh, width: 26, height: bh }, sk));
        S('polyline', { points: '200,104 226,118 252,96 276,108' }, sk);
      }
      const lb = S('text', { class: 'plab', x: 0, y: PH + 52 }, g); lb.textContent = etiquetas[i].toUpperCase();
      return { g, hl, fr, led, sk, lb, num };
    });

    let wordW = 0;
    return {
      render(t) {
        subs(t);
        const t9 = T['sin-sistema'], t19 = T['de-palabra'], t24 = T['desalineado'], t28 = T.tiempo, t38 = T.stockus, t48 = T['paso-1'];
        const apaga = 1 - pr(t, t38, 1.2);                                   // todo se apaga hacia el punto de luz
        // depósito
        op(wh, pr(t, .1, .9) * apaga);
        piso.style.opacity = .12;
        // "?" sobre cada cajón (9 s), se desvanecen al aparecer las figuras
        preg.forEach((e, n) => op(e, pr(t, t9 + .4 + n * .035, .3) * (1 - pr(t, t28, .5))));
        // desalineado leve (24 s)
        const dz = mv(t, t24, 1.2);
        cajones.forEach((c) => {
          c.g.setAttribute('transform', dz ? `translate(${(c.jx * dz).toFixed(2)} ${(c.jy * dz).toFixed(2)}) rotate(${(c.jr * dz).toFixed(2)} ${c.cx.toFixed(1)} ${c.cy.toFixed(1)})` : '');
        });
        // personas y globos (19 s)
        const gv = pr(t, t19, .5) * (1 - pr(t, t28, .5));
        op(perB, gv);
        op(gA, gv); op(gB, gv);
        if (gv > 0) {
          const rapido = t >= t24;
          const per = rapido ? .45 : 1.3;
          const ia = Math.floor(Math.max(0, t - t19) / per), ib = Math.floor(Math.max(0, t - t19 - per * .5) / per);
          gA._t.textContent = decA[ia % decA.length];
          gB._t.textContent = decB[ib % decB.length];
          const parp = rapido && !RM ? (.55 + .45 * Math.abs(Math.cos((t - t24) * 7))) : 1;
          gA._t.style.opacity = parp.toFixed(3); gB._t.style.opacity = (rapido && !RM ? .55 + .45 * Math.abs(Math.sin((t - t24) * 6)) : 1).toFixed(3);
        }
        // la persona A: quieta mientras habla, después recorre en zigzag (28 s)
        const wv = pr(t, t19, .5);
        op(perA, t < t28 ? wv : 0);
        const sW = mvl(t, t28 + .4, 8.2) * tot;
        const q = t < t28 ? null : enRuta(sW);
        op(walker, t < t28 ? 0 : pr(t, t28, .3));
        if (q) {
          walker.setAttribute('transform', `translate(${q[0].toFixed(1)} ${q[1].toFixed(1)}) scale(2)`);
          const ph = RM ? 0 : Math.sin((t - t28) * 9) * 7 * (sW < tot ? 1 : 0);
          walker._legs.setAttribute('d', `M0 -16 L${(-8 + ph).toFixed(1)} 0 M0 -16 L${(8 - ph).toFixed(1)} 0`);
        }
        puntos.forEach((d) => op(d.e, t >= t28 && d.s <= sW ? .9 : 0));
        // ✕ sobre los cajones
        errores.forEach((g, n) => {
          const a = t28 + 1.6 + n * 1.3;
          op(g, pr(t, a, .25));
          g.querySelectorAll('path').forEach((pth) => draw(pth, mv(t, a, .35)));
        });
        // columna izquierda
        op(rot, pr(t, .4, .7) * (1 - pr(t, t9, .5)));
        const nv = pr(t, t9 + .2, .4) * (1 - .78 * pr(t, t19, .6)) * (1 - pr(t, t28, .5));
        op(nost, nv);
        const m = mv(t, t9 + .2, 1.1);
        nost.style.clipPath = m >= 1 ? 'none' : `inset(-10% ${((1 - m) * 100).toFixed(1)}% -10% 0)`;
        op(reloj, pr(t, t28 + .2, .6) * apaga);
        const ang = RM ? 300 : (t - t28) * 144, angH = RM ? 60 : 30 + (t - t28) * 12;
        hMin.setAttribute('transform', `rotate(${ang.toFixed(1)} ${RC[0]} ${RC[1]})`);
        hHora.setAttribute('transform', `rotate(${angH.toFixed(1)} ${RC[0]} ${RC[1]})`);
        // revelación STOCKUS (38 s)
        op(rv, t >= t38 ? 1 : 0);
        op(rvDot, pr(t, t38 + .5, .5) * (1 - pr(t, t38 + 1.8, .4)));   // se apaga antes de que aparezca la palabra
        rvDot.style.scale = (.2 + .8 * mv(t, t38 + .5, .5)).toFixed(3);
        op(rvHalo, pr(t, t38 + 1.3, 1.3) * (1 - pr(t, t48, .8)));
        rvHalo.style.scale = (.12 + .88 * mv(t, t38 + 1.3, 1.3)).toFixed(3);
        const mk = mv(t, t38 + 2, 1.3);
        word.style.clipPath = mk >= 1 ? 'none' : `inset(-25% ${((1 - mk) * 110 - 10).toFixed(1)}% -25% -10%)`;
        op(word, t >= t38 + 2 ? 1 : 0);
        // STOCKUS sube y se achica arriba a la izquierda (48 s)
        if (!wordW && word.offsetWidth) wordW = word.offsetWidth;
        const up = mv(t, t48, 1.1);
        if (up > 0 && wordW) {
          const sc = 1 - .66 * up;
          const dx = (120 + wordW * .34 / 2 - 960) * up, dy = (150 - 380) * up;
          word.style.transform = `translate(-50%, -50%) translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${sc.toFixed(3)})`;
        } else word.style.transform = '';
        op(tira, pr(t, t38 + 3, .3) * (1 - pr(t, t48, .6)));
        tsegs.forEach((b, i) => op(b, pr(t, t38 + 3.2 + i * .05, .18)));
        // pasos (48 s): aparecen tenues y se encienden de a uno
        const ts = [T['paso-1'], T['paso-2'], T['paso-3'], T['paso-4']];
        pasoEls.forEach((p, i) => {
          op(p.g, pr(t, t48 + .5 + i * .15, .5));
          const on = pr(t, ts[i], .45);
          op(p.hl, on * .9);
          p.fr.style.strokeOpacity = (.25 + .75 * on).toFixed(3);
          op(p.sk, .28 + .72 * on);
          op(p.led, .15 + .85 * on);
          p.lb.style.fillOpacity = (.4 + .6 * on).toFixed(3);
        });
      }
    };
  }

  /* =====================================================================
     DIAPOSITIVA 3 · LA EXPLICACIÓN DE PEDRO
     ===================================================================== */
  function pedro(slide, def) {
    const T = tiempos(def);
    const svg = S('svg', { class: 'dib', viewBox: '0 0 1920 1080' }, slide);
    halo(svg, 'peHalo');
    const subs = subtitulos(slide, def);
    const tit = H('div', 'pe-tit', slide, 'Stockus · Lo que lo hace diferente');

    // --- Escena 1: cajonera, chat y LED (0–26 s) ---
    const e1 = S('g', null, svg);
    const CX = 1160, CY = 210, CW = 150, CH = 136, COLS = 4, ROWS = 4;
    const caj = S('g', { class: 'pe-caj' }, e1);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      S('rect', { x: CX + c * CW + 3, y: CY + r * CH + 3, width: CW - 6, height: CH - 6 }, caj);
      S('line', { class: 'manija', x1: CX + c * CW + CW * .36, x2: CX + c * CW + CW * .64, y1: CY + r * CH + CH * .76, y2: CY + r * CH + CH * .76 }, caj);
    }
    const NS_ = 24, SW = 21, SG = 4;
    const tira = S('g', { class: 'pe-tira' }, e1);
    const segs = [];
    for (let i = 0; i < NS_; i++) {
      const x = CX + i * (SW + SG);
      S('rect', { class: 'base', x, y: CY - 36, width: SW, height: 9 }, tira);
      segs.push(S('rect', { class: 'luz', x, y: CY - 36, width: SW, height: 9 }, tira));
    }
    const objR = 2, objC = 2, objSeg = 14;
    const ox = CX + objC * CW + 3, oy = CY + objR * CH + 3;
    const objHalo = S('ellipse', { cx: ox + (CW - 6) / 2, cy: oy + (CH - 6) / 2, rx: CW * 1.3, ry: CH * 1.3, fill: 'url(#peHalo)' }, e1);
    const obj = S('rect', { class: 'obj', x: ox + 5, y: oy + 5, width: CW - 16, height: CH - 16 }, e1);
    // recorrido estante por estante (punteado) y su tachado
    const snake = [];
    for (let r = 0; r < ROWS; r++) for (let k = 0; k < COLS; k++) { const c = r % 2 ? COLS - 1 - k : k; snake.push([CX + c * CW + CW / 2, CY + r * CH + CH / 2]); }
    const sseg = []; let stot = 0;
    for (let i = 1; i < snake.length; i++) { const L = Math.hypot(snake[i][0] - snake[i - 1][0], snake[i][1] - snake[i - 1][1]); sseg.push(L); stot += L; }
    const pe = S('g', { class: 'pe-snake' }, e1);
    const sdots = [];
    { let acc = 0; for (let i = 0; i < sseg.length; i++) { for (let s = 0; s < sseg[i]; s += 18) { const u = s / sseg[i]; sdots.push({ s: acc + s, e: S('circle', { cx: (snake[i][0] + (snake[i + 1][0] - snake[i][0]) * u).toFixed(1), cy: (snake[i][1] + (snake[i + 1][1] - snake[i][1]) * u).toFixed(1), r: 3.2 }, pe) }); } acc += sseg[i]; } }
    const tacha = cruz(e1, CX + COLS * CW / 2, CY + ROWS * CH / 2, 150, 'cruz grande');
    // chat
    const chat = H('div', 'pe-chat', slide);
    H('div', 'lab', chat, 'Pregunta');
    const campo = H('div', 'campo', chat);
    const ctx = H('span', 'tx', campo);
    const caret = H('i', 'caret', campo);
    const PREG = 'Where is the screw?';

    // --- Escena 2: red local (26–40 s) ---
    const e2 = S('g', { class: 'pe-red' }, svg);
    const RX = 560, RY = 440;
    const anillo = S('circle', { class: 'anillo', cx: RX, cy: RY, r: 250 }, e2);
    const rlab = S('text', { class: 'rlab', x: RX, y: RY - 170 }, e2); rlab.textContent = 'RED LOCAL';
    const disp = S('g', { class: 'disp' }, e2);
    const dRpi = S('g', null, disp);
    S('rect', { x: RX - 170, y: RY - 120, width: 150, height: 96 }, dRpi);
    S('rect', { x: RX - 128, y: RY - 92, width: 40, height: 40 }, dRpi);
    S('path', { d: `M${RX - 160} ${RY - 112} H${RX - 30}` , class: 'pins' }, dRpi);
    const tRpi = S('text', { class: 'dlab', x: RX - 95, y: RY - 2 }, dRpi); tRpi.textContent = 'RASPBERRY PI';
    const dEsp = S('g', null, disp);
    S('rect', { x: RX + 50, y: RY - 106, width: 104, height: 66 }, dEsp);
    S('path', { d: `M${RX + 66} ${RY - 92} h12 v12 h12 v-12 h12 v12 h12`, class: 'pins' }, dEsp);
    const tEsp = S('text', { class: 'dlab', x: RX + 102, y: RY - 2 }, dEsp); tEsp.textContent = 'ESP8266';
    const dLap = S('g', null, disp);
    S('rect', { x: RX - 160, y: RY + 50, width: 130, height: 82 }, dLap);
    S('path', { d: `M${RX - 182} ${RY + 146} H${RX - 8} L${RX - 22} ${RY + 132} H${RX - 168} Z` }, dLap);
    const dTel = S('g', null, disp);
    S('rect', { x: RX + 74, y: RY + 40, width: 58, height: 104 }, dTel);
    S('line', { x1: RX + 94, y1: RY + 132, x2: RX + 112, y2: RY + 132 }, dTel);
    const enlaces = S('g', { class: 'enl' }, e2);
    [[RX - 95, RY - 24, RX - 95, RY + 50], [RX - 20, RY - 72, RX + 50, RY - 72], [RX - 20, RY - 40, RX + 74, RY + 60]].forEach(([a, b, c, d]) => S('line', { x1: a, y1: b, x2: c, y2: d }, enlaces));
    const devs = [dRpi, dEsp, dLap, dTel];
    // wifi que se tacha + cartel NO INTERNET
    const WX = 1280, WY = 500;
    const wifi = S('g', { class: 'wifi' }, e2);
    const arcos = [70, 125, 180].map((r) => S('path', { d: `M${(WX - r * .7071).toFixed(1)} ${(WY - r * .7071).toFixed(1)} A${r} ${r} 0 0 1 ${(WX + r * .7071).toFixed(1)} ${(WY - r * .7071).toFixed(1)}` }, wifi));
    const wdot = S('circle', { class: 'lleno', cx: WX, cy: WY - 8, r: 14 }, wifi);
    const strike = S('path', { class: 'tacha', d: `M${WX - 170} ${WY - 210} L${WX + 170} ${WY + 40}` }, e2);
    const cartel = S('g', { class: 'cartel' }, e2);
    S('rect', { x: WX - 175, y: WY + 70, width: 350, height: 76 }, cartel);
    const ct = S('text', { x: WX, y: WY + 121 }, cartel); ct.textContent = 'NO INTERNET';
    // señal débil con tilde
    const BX = 1610, BY = 560;
    const senal = S('g', { class: 'senal' }, e2);
    [30, 58, 86, 114].forEach((h, i) => S('rect', { class: i < 2 ? 'lleno' : 'vacio', x: BX + i * 40, y: BY - h, width: 26, height: h }, senal));
    const tilde = S('path', { class: 'tilde', d: `M${BX + 14} ${BY - 200} L${BX + 50} ${BY - 166} L${BX + 128} ${BY - 252}` }, e2);
    const slab = S('text', { class: 'rlab', x: BX + 73, y: BY + 50 }, e2); slab.textContent = 'SEÑAL DÉBIL';

    // --- Escena 3: cadena Raspberry Pi → ESP8266 → tira (40–54 s) ---
    const e3 = S('g', { class: 'pe-cad' }, svg);
    function nodo(x, w, titulo, sub) {
      const g = S('g', { transform: `translate(${x} 270)` }, e3);
      const hl = S('ellipse', { cx: w / 2, cy: 130, rx: w * .8, ry: 230, fill: 'url(#peHalo)' }, g);
      const fr = S('rect', { class: 'nfr', x: 0, y: 0, width: w, height: 270 }, g);
      const a = S('text', { class: 'ntit', x: 32, y: 66 }, g); a.textContent = titulo;
      const b = S('text', { class: 'nsub', x: 32, y: 104 }, g); b.textContent = sub;
      const dib = S('g', { class: 'ndib' }, g);
      return { g, hl, fr, dib };
    }
    const n1 = nodo(120, 440, 'RASPBERRY PI', 'COMPUTADORA PRINCIPAL');
    S('rect', { x: 40, y: 140, width: 220, height: 96 }, n1.dib);
    S('rect', { x: 92, y: 164, width: 48, height: 48 }, n1.dib);
    S('rect', { x: 170, y: 164, width: 66, height: 26 }, n1.dib);
    S('path', { d: 'M52 150 H248', class: 'pins' }, n1.dib);
    S('rect', { x: 290, y: 150, width: 110, height: 76 }, n1.dib);
    const n2 = nodo(760, 380, 'ESP8266', 'CONTROLA LA TIRA');
    S('rect', { x: 40, y: 146, width: 150, height: 90 }, n2.dib);
    S('path', { d: 'M58 166 h14 v14 h14 v-14 h14 v14 h14 v-14 h14', class: 'pins' }, n2.dib);
    S('rect', { x: 66, y: 196, width: 40, height: 28 }, n2.dib);
    const n3 = nodo(1340, 460, 'TIRA DE LED', 'LEDS INTELIGENTES');
    const csegs = [];
    for (let i = 0; i < 12; i++) {
      S('rect', { class: 'base', x: 32 + i * 33, y: 176, width: 25, height: 14 }, n3.dib);
      csegs.push(S('rect', { class: 'luz', x: 32 + i * 33, y: 176, width: 25, height: 14 }, n3.dib));
    }
    const fl1 = S('path', { class: 'flecha', d: 'M572 405 H748 M732 393 L748 405 L732 417' }, e3);
    const fl2 = S('path', { class: 'flecha', d: 'M1152 405 H1328 M1312 393 L1328 405 L1312 417' }, e3);

    // --- Escena 4: maqueta en vivo (54 s en adelante, en bucle) ---
    const e4 = S('g', { class: 'pe-maq' }, svg);
    const MX = 560, MY = 150, MW = 800, TIER = 205, MC = 4;
    S('rect', { class: 'mueble', x: MX, y: MY, width: MW, height: TIER * 3 + 10 }, e4);
    const mseg = [];               // 3 tiras de 20 segmentos, recorrido en serpentina
    const mcaj = [];
    for (let r = 0; r < 3; r++) {
      const y0 = MY + r * TIER;
      S('line', { class: 'estante', x1: MX, x2: MX + MW, y1: y0 + TIER + 4, y2: y0 + TIER + 4 }, e4);
      const fila = [];
      for (let i = 0; i < 20; i++) {
        const x = MX + 20 + i * 38.2;
        S('rect', { class: 'base', x, y: y0 + 16, width: 30, height: 9 }, e4);
        fila.push(S('rect', { class: 'luz', x, y: y0 + 16, width: 30, height: 9 }, e4));
      }
      mseg.push(...(r % 2 ? fila.reverse() : fila));
      for (let c = 0; c < MC; c++) {
        const x = MX + 20 + c * 192, y = y0 + 44;
        S('rect', { class: 'mc', x, y, width: 176, height: 146 }, e4);
        S('line', { class: 'manija', x1: x + 66, x2: x + 110, y1: y + 112, y2: y + 112 }, e4);
        mcaj.push({ r, c, x, y });
      }
    }
    const mObj = mcaj.find((m) => m.r === 2 && m.c === 2);
    const mHalo = S('ellipse', { cx: mObj.x + 88, cy: mObj.y + 73, rx: 260, ry: 210, fill: 'url(#peHalo)' }, e4);
    const mLit = S('rect', { class: 'obj', x: mObj.x + 6, y: mObj.y + 6, width: 164, height: 134 }, e4);
    const mObjSeg = 40 + (19 - 9);   // segmento de la tercera tira que queda sobre el cajón objetivo
    const mlab = H('div', 'pe-maqlab', slide);
    const mled = H('i', null, mlab);
    H('span', null, mlab, 'Maqueta · en vivo');

    return {
      render(t) {
        subs(t);
        const t6 = T.chat, t14 = T.led, t20 = T['sin-buscar'], t26 = T['red-local'], t33 = T['senal-debil'];
        const t40 = T.raspberry, t47 = T.esp, t54 = T.maqueta;
        op(tit, pr(t, .2, .6));
        // escena 1
        const v1 = pr(t, .3, .8) * (1 - pr(t, t26, .6));
        op(e1, v1);
        op(caj, 1);
        op(chat, pr(t, t6, .5) * (1 - pr(t, t26, .6)) * (1 - .45 * pr(t, t14, .5)));
        const nc = Math.round(cl((t - t6 - .6) / (PREG.length * .07)) * PREG.length);
        ctx.textContent = t < t6 + .6 ? '' : PREG.slice(0, nc);
        caret.style.opacity = t >= t6 && t < t14 && (RM || Math.floor(t * 2) % 2 === 0 || nc < PREG.length) ? '1' : '0';
        // LED que recorre la tira y se detiene (14 s)
        const run = mv(t, t14 + .3, 2);
        const h = run * objSeg;
        segs.forEach((s, i) => {
          let v = t < t14 + .3 ? 0 : nivel(h, i) * (run < 1 ? 1 : 0);
          if (run >= 1 && i === objSeg) v = 1;
          op(s, v);
        });
        const on = pr(t, t14 + 2.3, .5);
        op(obj, on); op(objHalo, on);
        // recorrido estante por estante y tachado (20 s)
        const sd = mvl(t, t20 + .3, 2.3) * stot;
        sdots.forEach((d) => op(d.e, t >= t20 + .3 && d.s <= sd ? (1 - .6 * pr(t, t20 + 2.9, .4)) : 0));
        op(tacha, pr(t, t20 + 2.9, .2));
        tacha.querySelectorAll('path').forEach((p, i) => draw(p, mv(t, t20 + 2.9 + i * .2, .35)));
        // escena 2: red local
        op(e2, pr(t, t26 + .3, .6) * (1 - pr(t, t40, .6)));
        draw(anillo, mv(t, t26 + .4, 1.2));
        op(rlab, pr(t, t26 + 1, .5));
        devs.forEach((d, i) => op(d, pr(t, t26 + .9 + i * .2, .4)));
        op(enlaces, pr(t, t26 + 1.8, .5));
        const wv = 1 - .55 * pr(t, t33, .5);
        op(wifi, wv);
        arcos.forEach((a, i) => draw(a, mv(t, t26 + 1.6 + i * .3, .5)));
        op(wdot, pr(t, t26 + 1.5, .3) * wv);
        op(strike, wv); draw(strike, mv(t, t26 + 3.2, .45));
        op(cartel, pr(t, t26 + 3.6, .4) * wv);
        op(senal, pr(t, t33 + .2, .5));
        op(slab, pr(t, t33 + .4, .5));
        op(tilde, pr(t, t33 + 1, .2)); draw(tilde, mv(t, t33 + 1, .5));
        // escena 3: cadena
        op(e3, pr(t, t40 + .2, .6) * (1 - pr(t, t54, .6)));
        [n1, n2, n3].forEach((n, i) => op(n.g, pr(t, t40 + .3 + i * .25, .5)));
        const hi1 = pr(t, t40 + .6, .5) * (1 - .6 * pr(t, t47, .5));
        const hi2 = pr(t, t47, .5) * (1 - .5 * pr(t, t47 + 4, .6));
        const hi3 = pr(t, t47 + 1.2, .6);
        [[n1, hi1], [n2, hi2], [n3, hi3]].forEach(([n, v]) => { op(n.hl, v); n.fr.style.strokeOpacity = (.3 + .7 * v).toFixed(3); op(n.dib, .35 + .65 * Math.max(v, .45)); });
        draw(fl1, mv(t, t40 + 1.2, .8));
        draw(fl2, mv(t, t47 + .2, .8));
        csegs.forEach((s, i) => op(s, pr(t, t47 + 1.1 + i * .12, .2)));
        // escena 4: maqueta en bucle
        op(e4, pr(t, t54 + .2, .7));
        op(mlab, pr(t, t54 + .5, .5));
        if (RM) {
          mseg.forEach((s, i) => op(s, i === mObjSeg ? 1 : .3));
          op(mLit, t >= t54 ? 1 : 0); op(mHalo, t >= t54 ? 1 : 0);
          mled.style.opacity = '1';
        } else {
          const tt = Math.max(0, t - t54 - .6), CYC = 3.4, n = mseg.length;
          const hh = (tt % CYC) / CYC * (n + 8) - 1;
          mseg.forEach((s, i) => op(s, t < t54 + .6 ? .3 : .28 + .72 * nivel(hh, i)));
          const v = t < t54 + .6 ? 0 : nivel(hh, mObjSeg);
          op(mLit, .35 + .65 * v); op(mHalo, .2 + .8 * v);
          mled.style.opacity = t < t54 + .6 ? '1' : (.4 + .6 * Math.abs(Math.cos(tt * 2.2))).toFixed(3);
        }
      }
    };
  }

  /* =====================================================================
     DIAPOSITIVA 13 · CONVERSACIÓN CON STOCKUS (dura unos 10 s y queda quieta)
     Layout fijo: el lugar de cada mensaje está reservado desde el principio.
     ===================================================================== */
  const CHAT = [
    { t: .45, tipo: 'q', texto: 'Stockus, ¿qué dejó este proyecto?' },
    { t: 1.6, tipo: 'a', lineas: ['Un problema real, resuelto con luz.', 'Funciona sin internet.', 'Ubica cada producto con LEDs inteligentes.'] },
    { t: 5.75, tipo: 'q', texto: '¿Y ahora?' },
    { t: 7.25, tipo: 'f', grande: 'Primeros clientes.', sub: 'Relevamiento a relevamiento. Cada instalación, acompañada.' }
  ];
  const MS = .03, PUNTOS = .8, SCROLL_T = 6.35, SCROLL_D = .7, CHAT_FIN = 10.4;
  function conversacion(slide) {
    const box = H('div', 'chat', slide);
    const head = H('div', 'chead', box);
    const hl = H('div', 'hl', head);
    H('i', 'ledp', hl); H('span', 'nm', hl, 'STOCKUS');
    H('div', 'est', head, 'En línea · sin internet');
    const body = H('div', 'cbody', box);
    const col = H('div', 'col', body);
    const vento = H('div', 'cvento', box, 'Construido sobre Vento');
    const msgs = CHAT.map((m, i) => {
      const el = H('div', 'msg m' + (i + 1) + ' ' + (m.tipo === 'q' ? 'q' : 'a'), col);
      H('div', 'lab', el, m.tipo === 'q' ? 'Pregunta' : 'Stockus');
      const row = H('div', 'row', el);
      let av = null;
      if (m.tipo !== 'q') av = H('i', 'av', row);
      const bub = H('div', 'bub' + (m.tipo === 'f' ? ' fin' : ''), row);
      const o = { m, el, av, bub, parts: [] };
      if (m.tipo !== 'q') { o.dots = H('div', 'dots', bub); for (let k = 0; k < 3; k++) H('i', null, o.dots); }
      // cada texto ocupa desde el principio su tamaño final (un "fantasma" invisible): nada se mueve al escribir
      const hueco = (parent, s) => { const h = H('span', 'hold', parent); H('span', 'ghost2', h, s); return H('span', 'tx', h); };
      if (m.tipo === 'q') o.parts.push({ e: hueco(bub, m.texto), s: m.texto });
      else if (m.tipo === 'a') m.lineas.forEach((s) => { const p = H('p', 'ln', bub); const led = H('i', 'l', p); o.parts.push({ e: hueco(p, s), s, led }); });
      else { o.parts.push({ e: hueco(H('p', 'big', bub), m.grande), s: m.grande }); o.parts.push({ e: hueco(H('p', 'sub', bub), m.sub), s: m.sub, ms: .022 }); }
      // tiempos de escritura de cada parte
      let tt = m.t + (m.tipo === 'q' ? .2 : PUNTOS);
      o.parts.forEach((p) => { p.t0 = tt; p.d = p.s.length * (p.ms || MS); tt += p.d + .12; });
      o.fin = tt;
      return o;
    });
    return {
      dur: CHAT_FIN,
      render(t) {
        op(box, pr(t, 0, .4));
        const sc = mv(t, SCROLL_T, SCROLL_D);
        col.style.transform = sc > 0 ? `translateY(${(-564 * sc).toFixed(1)}px)` : '';   // 564 = posición fija de la 3.ª fila (css)
        msgs.forEach((o, i) => {
          const nx = msgs[i + 1];
          let v = pr(t, o.m.t, .25);
          if (nx) v *= 1 - .45 * pr(t, nx.m.t, .3);                           // el anterior queda al 55 %
          if (i < 2) v *= 1 - pr(t, SCROLL_T, .3);                             // los dos primeros se van hacia arriba
          op(o.el, v);
          if (o.dots) {
            op(o.dots, t >= o.m.t && t < o.m.t + PUNTOS ? 1 : 0);
            if (!RM) [...o.dots.children].forEach((d, k) => op(d, .35 + .65 * Math.abs(Math.sin((t - o.m.t) * 6 - k * .7))));
          }
          if (o.av) o.av.style.opacity = t >= o.m.t ? '1' : '0';
          o.parts.forEach((p) => {
            const n = Math.round(cl((t - p.t0) / p.d) * p.s.length);
            const txt = t < p.t0 ? '' : p.s.slice(0, n);
            if (p.e.textContent !== txt) p.e.textContent = txt;
            if (p.led) op(p.led, pr(t, p.t0 - .05, .15));
          });
        });
        op(vento, pr(t, msgs[3].fin, .5));
      }
    };
  }

  window.ESCENAS = { thomas, pedro, conversacion };
})();
