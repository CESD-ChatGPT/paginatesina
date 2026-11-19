/* ESCENAS ANIMADAS DE ENTRADA (diapositivas 2 a 11 y 21 a 24)
   Cada diapositiva arma su propia escena y la dibuja como función del tiempo t desde que se llegó a ella.
   Los momentos y las duraciones salen de js/animaciones.js. Lo que ya pasó en diapositivas anteriores
   se muestra completo y quieto (para que el paso de una a otra sea continuo); lo que viene después no aparece.
   Por ser una función del tiempo, repetir (R), retroceder (estado final) o avanzar a mitad nunca deja residuos.
   Todo es vectorial: líneas finas celestes y blancas sobre Petróleo. Errores con una ✕ blanca. */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CEL = '#4FB3CE';
  const YA = -1e4, NUNCA = 1e9;            // momento ya ocurrido / que no ocurre en esta diapositiva

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
  const lin = (t, a, d) => cl((t - a) / (d || 1e-6));
  const pr = (t, a, d) => eo(lin(t, a, d));                              // fundidos
  const mv = (t, a, d) => (RM ? (t >= a ? 1 : 0) : eo(lin(t, a, d)));    // movimiento (con movimiento reducido, salta)
  const mvl = (t, a, d) => (RM ? (t >= a ? 1 : 0) : lin(t, a, d));
  const op = (e, v) => { e.style.opacity = v < .002 ? '0' : v > .998 ? '1' : v.toFixed(3); };
  function draw(el, p) {
    if (el._L == null) { el._L = el.getTotalLength(); el.style.strokeDasharray = el._L + ' ' + el._L; }
    el.style.strokeDashoffset = (el._L * (1 - (RM ? (p > 0 ? 1 : 0) : p))).toFixed(1);
  }
  function cruz(p, cx, cy, r, cls) {
    const g = S('g', { class: cls || 'cruz' }, p);
    S('path', { d: `M${cx - r} ${cy - r} L${cx + r} ${cy + r}` }, g);
    S('path', { d: `M${cx + r} ${cy - r} L${cx - r} ${cy + r}` }, g);
    return g;
  }
  function persona(p, x, y, sc) {
    const g = S('g', { class: 'per', transform: `translate(${x} ${y}) scale(${sc})` }, p);
    S('circle', { cx: 0, cy: -58, r: 10 }, g);
    S('path', { d: 'M0 -46 V-16 M0 -38 L-11 -24 M0 -38 L11 -24' }, g);
    g._legs = S('path', { d: 'M0 -16 L-8 0 M0 -16 L8 0' }, g);
    return g;
  }
  function halo(p, id) {
    const d = S('defs', null, p);
    const rg = S('radialGradient', { id }, d);
    S('stop', { offset: '0', 'stop-color': CEL, 'stop-opacity': '.55' }, rg);
    S('stop', { offset: '.45', 'stop-color': CEL, 'stop-opacity': '.18' }, rg);
    S('stop', { offset: '1', 'stop-color': CEL, 'stop-opacity': '0' }, rg);
  }
  function nivel(h, i) { const d = h - i; if (d < -1) return 0; if (d < 0) return 1 + d; return Math.exp(-d / 2.2); }
  // momentos de una diapositiva: los que no figuran no ocurren; "previos" ya ocurrieron
  function momentos(cfg, previos) {
    const m = Object.assign({}, cfg.m);
    previos.forEach((k) => { if (!(k in m)) m[k] = YA; });
    return new Proxy(m, { get: (o, k) => (k in o ? o[k] : (String(k).endsWith('Dur') ? 1 : NUNCA)) });
  }

  /* ---------- Subtítulos bilingües fijos, en la banda inferior ---------- */
  function subtitulos(slide, cfg) {
    const band = H('div', 'subband', slide);
    const box = H('div', 'subs', band);
    const en = H('p', 'en', box), es = H('p', 'es', box);
    const cues = cfg.subs || [];
    let cur = -1;
    return (t) => {
      let i = -1;
      for (let k = 0; k < cues.length; k++) if (cues[k].t <= t + 1e-6) i = k;
      if (i < 0) { op(box, 0); return; }
      if (i !== cur) { cur = i; en.textContent = cues[i].en; es.textContent = cues[i].es; }
      const nx = cues[i + 1];
      op(box, Math.min(i === 0 && cues[i].t === 0 ? 1 : pr(t, cues[i].t, .35), nx ? 1 - lin(t, nx.t - .25, .25) : 1));
    };
  }

  /* =====================================================================
     THOMAS (diapositivas 2 a 6): el depósito, el problema, Stockus y los pasos
     ===================================================================== */
  const TH_ORDEN = ['th-deposito', 'th-palabra', 'th-tiempo', 'th-stockus', 'th-pasos'];
  const TH_CLAVES = {
    'th-deposito': ['dibujo', 'rotulo', 'preguntas', 'nostock'],
    'th-palabra': ['voces', 'desalineado'],
    'th-tiempo': ['zigzag', 'reloj', 'cruces'],
    'th-stockus': ['apaga', 'revela', 'tira'],
    'th-pasos': ['sube']
  };
  function thomas(slide, cfg) {
    const idx = TH_ORDEN.indexOf(slide.id);
    const previos = TH_ORDEN.slice(0, idx).flatMap((k) => TH_CLAVES[k]);
    const M = momentos(cfg, previos);
    const pasosT = idx === 4 ? cfg.m.pasos : [NUNCA, NUNCA, NUNCA, NUNCA];
    const svg = S('svg', { class: 'dib', viewBox: '0 0 1920 1080' }, slide);
    halo(svg, 'h-' + slide.id);
    const subs = subtitulos(slide, cfg);

    // --- Depósito isométrico ---
    const K = .777, X0 = 1098, Y0 = 342, C = .866;
    const P = (x, y, z) => [X0 + (x - y) * C * K, Y0 + ((x + y) * .5 - z) * K];
    const pts = (a) => a.map((q) => P(q[0], q[1], q[2]).map((n) => n.toFixed(1)).join(',')).join(' ');
    const wh = S('g', { class: 'wh' }, svg);
    const piso = S('g', { class: 'piso' }, wh);
    for (let x = -80; x <= 960; x += 80) S('polyline', { points: pts([[x, -60, 0], [x, 330, 0]]) }, piso);
    for (let y = -60; y <= 330; y += 65) S('polyline', { points: pts([[-80, y, 0], [960, y, 0]]) }, piso);
    const W = 210, D = 70, Hh = 300, GAP = 120;
    const cajones = [], racks = [];
    for (let k = 0; k < 3; k++) {
      const x0 = k * (W + GAP);
      const g = S('g', { class: 'rack' }, wh);
      racks.push(g);
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
        cajones.push({ g: cg, cx: c[0], cy: c[1] });
      }
    }
    cajones.forEach((c, n) => { c.jx = ((n * 37) % 11) - 5; c.jy = ((n * 23) % 9) - 4; c.jr = ((n * 17) % 7) - 3; });
    const marcas = S('g', null, wh);
    const preg = cajones.map((c) => { const e = S('text', { class: 'preg', x: c.cx, y: c.cy + 11 }, marcas); e.textContent = '?'; return e; });
    const errores = [4, 15, 19, 28, 33].map((n) => cruz(marcas, cajones[n].cx, cajones[n].cy, 15));

    // --- Personas y globos ---
    const gente = S('g', null, wh);
    const pa = P(110, 225, 0), pb = P(560, 270, 0);
    const perA = persona(gente, pa[0], pa[1], 2);
    const perB = persona(gente, pb[0], pb[1], 2);
    function globo(x, y, w, haciaIzq) {
      const g = S('g', { class: 'globo' }, gente);
      S('rect', { x: x - w / 2, y: y - 40, width: w, height: 80, rx: 2 }, g);
      const tx = haciaIzq ? x + w / 2 - 50 : x - w / 2 + 50;
      S('path', { d: `M${tx - 14} ${y + 40} L${tx} ${y + 62} L${tx + 14} ${y + 40}` }, g);
      g._t = S('text', { x, y: y + 15 }, g);
      return g;
    }
    const gA = globo(pa[0] - 40, pa[1] - 230, 230, true);
    const gB = globo(pb[0] + 70, pb[1] - 230, 300, false);
    const decA = ['5?', '4?', '5?'], decB = ['4?', '5?', 'creo que 3…'];     // en la 3 el diálogo se repite en bucle
    const BUCLE_GLOBOS = slide.id === 'th-palabra' && !RM, CICLO = 4.5;

    // --- Zigzag con rastro punteado ---
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
    const reloj = S('g', { class: 'reloj', transform: 'translate(430 500) scale(1.5) translate(-430 -500)' }, svg);   // 1,5 veces
    const RC = [430, 500], RR = 160;
    S('circle', { cx: RC[0], cy: RC[1], r: RR }, reloj);
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
    const PW = 360, PH = 300, PY = 320;
    const etiquetas = ['Iniciás sesión', 'Productos', 'Movimientos', 'Inventario en vivo'];
    const pasoEls = [0, 1, 2, 3].map((i) => {
      const x = 120 + i * (PW + 80);
      const g = S('g', { class: 'paso', transform: `translate(${x} ${PY})` }, pasos);
      const hl = S('ellipse', { cx: PW / 2, cy: PH / 2, rx: PW * .85, ry: PH * .8, fill: `url(#h-${slide.id})` }, g);
      const fr = S('rect', { class: 'pfr', x: 0, y: 0, width: PW, height: PH }, g);
      const led = S('rect', { class: 'pled', x: PW - 54, y: 22, width: 30, height: 9 }, g);
      const num = S('text', { class: 'pnum', x: 24, y: 44 }, g); num.textContent = '0' + (i + 1);
      const sk = S('g', { class: 'esq' }, g);
      if (i === 0) {
        S('rect', { x: 90, y: 70, width: 180, height: 190 }, sk);
        S('circle', { cx: 180, cy: 108, r: 16 }, sk);
        S('rect', { x: 112, y: 144, width: 136, height: 26 }, sk);
        S('rect', { x: 112, y: 182, width: 136, height: 26 }, sk);
        S('rect', { class: 'lleno', x: 140, y: 222, width: 80, height: 22 }, sk);
      } else if (i === 1) {
        S('polygon', { points: '110,150 175,118 240,150 175,182' }, sk);
        S('polyline', { points: '110,150 110,230 175,262 240,230 240,150' }, sk);
        S('line', { x1: 175, y1: 182, x2: 175, y2: 262 }, sk);
        S('polygon', { class: 'lapiz', points: '230,92 262,60 280,78 248,110' }, sk);
        S('polygon', { class: 'lapiz', points: '230,92 248,110 222,118' }, sk);
      } else if (i === 2) {
        for (let r = 0; r < 4; r++) {
          const y = 92 + r * 46, ing = r % 2 === 0;
          S('path', { d: ing ? `M82 ${y + 10} L96 ${y - 6} L110 ${y + 10} M96 ${y - 6} V${y + 22}` : `M82 ${y + 6} L96 ${y + 22} L110 ${y + 6} M96 ${y + 22} V${y - 6}` }, sk);
          S('line', { x1: 130, y1: y + 8, x2: 250 - (r % 3) * 30, y2: y + 8 }, sk);
          S('line', { class: 'tenue', x1: 254, y1: y + 8, x2: 284, y2: y + 8 }, sk);
        }
      } else {
        S('rect', { x: 64, y: 70, width: 232, height: 190 }, sk);
        const n = S('text', { class: 'tnum', x: 84, y: 120 }, sk); n.textContent = '128';
        [[96, 70], [136, 110], [176, 50], [216, 90]].forEach(([bx, bh]) => S('rect', { class: 'lleno', x: bx, y: 240 - bh, width: 26, height: bh }, sk));
        S('polyline', { points: '200,104 226,118 252,96 276,108' }, sk);
      }
      const lb = S('text', { class: 'plab', x: PW / 2, y: PH + 52, 'text-anchor': 'middle' }, g); lb.textContent = etiquetas[i].toUpperCase();
      return { g, hl, fr, led, sk, lb };
    });

    const WCX = 960, WCY = 440;            // centro de STOCKUS revelado (eje de la diapositiva)
    let wordW = 0, wordH = 0, wordPad = 0;
    return {
      render(t) {
        subs(t);
        // depósito: se dibuja (2), se apaga hacia un punto de luz (5)
        const apaga = 1 - pr(t, M.apaga, M.apagaDur * .8);
        op(wh, apaga);
        piso.style.opacity = (.12 * pr(t, M.dibujo, M.dibujoDur * .5)).toFixed(3);
        racks.forEach((g, i) => op(g, pr(t, M.dibujo + i * M.dibujoDur * .22, M.dibujoDur * .45)));
        cajones.forEach((c, n) => op(c.g, pr(t, M.dibujo + M.dibujoDur * .35 + (n / cajones.length) * M.dibujoDur * .6, .5)));
        // "?" cajón por cajón (2); se van cuando aparece el zigzag (4)
        preg.forEach((e, n) => op(e, pr(t, M.preguntas + (n / preg.length) * M.preguntasDur, .25) * (1 - pr(t, M.zigzag, .5))));
        // los cajones quedan siempre en la misma grilla que en la 2 (sin giros ni desplazamientos)
        // personas y globos (3); los números cambian mientras aparecen y después quedan fijos
        const gv = pr(t, M.voces, .5) * (1 - pr(t, M.zigzag, .5));
        let gg = gv, tc = t - M.voces;
        if (BUCLE_GLOBOS && tc >= CICLO) {          // cada 4,5 s los globos se apagan y se vuelven a escribir
          tc = tc % CICLO;
          gg = gv * Math.min(lin(tc, 0, .3), 1 - lin(tc, CICLO - .3, .3));
        } else if (BUCLE_GLOBOS) gg = gv * (1 - lin(tc, CICLO - .3, .3));
        op(perB, gv); op(gA, RM && slide.id === 'th-palabra' ? 0 : gg); op(gB, gg);   // movimiento reducido: un solo globo fijo
        if (gg > 0) {
          const u = RM ? 1 : lin(tc + M.voces, M.voces, M.vocesDur);
          gA._t.textContent = decA[Math.min(decA.length - 1, Math.floor(u * decA.length))];
          gB._t.textContent = decB[Math.min(decB.length - 1, Math.floor(u * decB.length))];
        }
        op(perA, t < M.zigzag ? gv : 0);
        // zigzag con rastro (4)
        const sW = mvl(t, M.zigzag, M.zigzagDur) * tot;
        op(walker, t < M.zigzag ? 0 : pr(t, M.zigzag, .3));
        if (t >= M.zigzag) {
          const q = enRuta(sW);
          walker.setAttribute('transform', `translate(${q[0].toFixed(1)} ${q[1].toFixed(1)}) scale(1.55)`);
          const ph = RM || sW >= tot ? 0 : Math.sin((t - M.zigzag) * 9) * 7;
          walker._legs.setAttribute('d', `M0 -16 L${(-8 + ph).toFixed(1)} 0 M0 -16 L${(8 - ph).toFixed(1)} 0`);
        }
        puntos.forEach((d) => op(d.e, t >= M.zigzag && d.s <= sW ? .9 : 0));
        // ✕ sobre los cajones (4)
        errores.forEach((g, n) => {
          const a = M.cruces + n * (M.crucesDur / errores.length);
          op(g, pr(t, a, .2));
          g.querySelectorAll('path').forEach((p) => draw(p, mv(t, a, .3)));
        });
        // columna izquierda
        op(rot, pr(t, M.rotulo, .9) * (1 - pr(t, M.nostock - .5, .5)));
        const nv = pr(t, M.nostock, .4) * (1 - .78 * pr(t, M.voces, .6)) * (1 - pr(t, M.zigzag, .5));
        op(nost, nv);
        const nm = mv(t, M.nostock, M.nostockDur * .7);
        nost.style.clipPath = nm >= 1 ? 'none' : `inset(-10% ${((1 - nm) * 100).toFixed(1)}% -10% 0)`;
        op(reloj, (t >= M.reloj ? 1 : 0) * apaga);
        const gira = RM ? 1 : lin(t, M.reloj, M.relojDur);       // gira y se detiene
        hMin.setAttribute('transform', `rotate(${(gira * 720 + 60).toFixed(1)} ${RC[0]} ${RC[1]})`);
        hHora.setAttribute('transform', `rotate(${(gira * 60 + 300).toFixed(1)} ${RC[0]} ${RC[1]})`);
        // STOCKUS (5)
        op(rv, t >= M.apaga ? 1 : 0);
        op(rvDot, pr(t, M.apaga + M.apagaDur * .5, .5) * (1 - pr(t, M.revela, .4)));
        rvDot.style.scale = (.2 + .8 * mv(t, M.apaga + M.apagaDur * .5, .5)).toFixed(3);
        op(rvHalo, pr(t, M.revela - .3, 1.3) * (1 - pr(t, M.sube, .8)));
        rvHalo.style.scale = (.12 + .88 * mv(t, M.revela - .3, 1.3)).toFixed(3);
        const mk = mv(t, M.revela + .3, M.revelaDur - .6);
        word.style.clipPath = mk >= 1 ? 'none' : `inset(-25% ${((1 - mk) * 110 - 10).toFixed(1)}% -25% -10%)`;
        op(word, t >= M.revela + .3 ? 1 : 0);
        // STOCKUS sube y se achica arriba a la izquierda (6): su primera letra queda en x = 120
        // posición explícita (origen arriba a la izquierda): centrada en x = 960 → chica con la primera letra en x = 120
        if (!wordW && word.offsetWidth) {         // se mide el texto real (sin el espaciado que queda después de la última letra)
          word.style.transform = 'none';
          const st = slide.closest('#stage'), k = st.getBoundingClientRect().width / 1920;
          const er = word.getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(word);
          const tr = rg.getBoundingClientRect(), ls = parseFloat(getComputedStyle(word).letterSpacing) || 0;
          wordPad = (tr.left - er.left) / k; wordW = tr.width / k - ls; wordH = er.height / k;
        }
        if (wordW) {
          const up = mv(t, M.sube, M.subeDur), sc = 1 - .66 * up;
          const x0 = WCX - wordPad - wordW / 2, y0 = WCY - wordH / 2;
          const x1 = 120 - wordPad * .34, y1 = 150 - wordH * .34 / 2;
          word.style.transform = `translate(${(x0 + (x1 - x0) * up).toFixed(1)}px, ${(y0 + (y1 - y0) * up).toFixed(1)}px) scale(${sc.toFixed(3)})`;
        }
        op(tira, pr(t, M.tira, .3) * (1 - pr(t, M.sube, .6)));
        tsegs.forEach((b, i) => op(b, pr(t, M.tira + (i / tsegs.length) * (M.tiraDur - .4), .2)));
        // los cuatro pasos (6): entran de a uno y quedan encendidos
        pasoEls.forEach((p, i) => {
          const a = pasosT[i];
          op(p.g, pr(t, a, .5));
          p.g.style.translate = RM ? '' : `0 ${(16 * (1 - mv(t, a, .6))).toFixed(1)}px`;
          const on = pr(t, a + .3, .5);
          op(p.hl, on * .9);
          p.fr.style.strokeOpacity = (.25 + .75 * on).toFixed(3);
          op(p.sk, .28 + .72 * on);
          op(p.led, .15 + .85 * on);
        });
      }
    };
  }

  /* =====================================================================
     PEDRO (diapositivas 7 a 11)
     ===================================================================== */
  function pedro(slide, cfg) {
    const id = slide.id;
    const M = momentos(cfg, id === 'pe-leds' ? ['titulo', 'escribe'] : []);
    const svg = S('svg', { class: 'dib', viewBox: '0 0 1920 1080' }, slide);
    halo(svg, 'h-' + id);
    const subs = subtitulos(slide, cfg);
    const kick = H('div', 'pe-kick', slide, 'Stockus · lo que lo hace diferente');
    let tit = null;
    if (id === 'pe-diferencia') tit = H('h2', 'title pe-title', slide, 'What makes Stockus different');
    const piezas = [];

    // --- 7 y 8: cajonera, chat, LED, recorrido tachado ---
    if (id === 'pe-diferencia' || id === 'pe-leds') {
      const e1 = S('g', null, svg);
      const CX = 1160, CY = 330, CW = 160, CH = 136, COLS = 4, ROWS = 4;
      const caj = S('g', { class: 'pe-caj' }, e1);
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        S('rect', { x: CX + c * CW + 3, y: CY + r * CH + 22, width: CW - 6, height: CH - 25 }, caj);   // debajo de la tira de su fila
        S('line', { class: 'manija', x1: CX + c * CW + CW * .36, x2: CX + c * CW + CW * .64, y1: CY + r * CH + CH * .76, y2: CY + r * CH + CH * .76 }, caj);
      }
      // una tira de LED por fila, pegada al borde superior de la fila, del ancho de la fila; 5 segmentos por columna
      const SPC = 5, SG = 4, SW = (CW - 6 - (SPC - 1) * SG) / SPC, TIRA_Y = 6;
      const tira = S('g', { class: 'tiras' }, e1);
      const filas = [];
      for (let r = 0; r < ROWS; r++) {
        const fila = S('g', { class: 'tira-fila' }, tira), segsF = [];
        for (let c = 0; c < COLS; c++) for (let k = 0; k < SPC; k++) {
          const x = CX + c * CW + 3 + k * (SW + SG), y = CY + r * CH + TIRA_Y;
          S('rect', { class: 'base', x, y, width: SW, height: 9 }, fila);
          segsF.push(S('rect', { class: 'luz', x, y, width: SW, height: 9 }, fila));
        }
        filas.push(segsF);
      }
      const OBJ_R = 2, OBJ_C = 2, OBJ_K = OBJ_C * SPC + 2;     // LED del cajón buscado: fila 3, columna 3 (segmento central)
      const ox = CX + 2 * CW + 3, oy = CY + 2 * CH + 22;
      const objHalo = S('ellipse', { cx: ox + (CW - 6) / 2, cy: oy + (CH - 25) / 2, rx: CW * 1.3, ry: CH * 1.3, fill: `url(#h-${id})` }, e1);
      const obj = S('rect', { class: 'obj', x: ox + 5, y: oy + 5, width: CW - 16, height: CH - 35 }, e1);
      const snake = [];
      for (let r = 0; r < ROWS; r++) for (let k = 0; k < COLS; k++) { const c = r % 2 ? COLS - 1 - k : k; snake.push([CX + c * CW + CW / 2, CY + r * CH + CH / 2]); }
      const sdots = []; let stot = 0;
      const pe = S('g', { class: 'pe-snake' }, e1);
      for (let i = 1; i < snake.length; i++) {
        const L = Math.hypot(snake[i][0] - snake[i - 1][0], snake[i][1] - snake[i - 1][1]);
        for (let s = 0; s < L; s += 18) { const u = s / L; sdots.push({ s: stot + s, e: S('circle', { cx: (snake[i - 1][0] + (snake[i][0] - snake[i - 1][0]) * u).toFixed(1), cy: (snake[i - 1][1] + (snake[i][1] - snake[i - 1][1]) * u).toFixed(1), r: 3.2 }, pe) }); }
        stot += L;
      }
      const tacha = cruz(e1, CX + COLS * CW / 2, CY + ROWS * CH / 2, 150, 'cruz grande');
      const chat = H('div', 'pe-chat', slide);
      H('div', 'lab', chat, 'Pregunta');
      const campo = H('div', 'campo', chat);
      const ctx = H('span', 'tx', campo);
      const caret = H('i', 'caret', campo);
      const PREG = 'Where is the screw?';
      piezas.push((t) => {
        op(e1, pr(t, M.titulo, M.tituloDur));
        op(chat, pr(t, M.titulo + .5, .6) * (id === 'pe-leds' ? .45 : 1));
        const nc = Math.round(lin(t, M.escribe, M.escribeDur) * PREG.length);
        ctx.textContent = PREG.slice(0, nc);
        caret.style.opacity = id === 'pe-diferencia' && t >= M.escribe - .5 && nc < PREG.length ? '1' : '0';
        // el LED recorre las filas de arriba hacia abajo (0,5 s por fila) y queda fijo en la del producto
        const paso = t < M.led + .3 ? -1 : Math.min(OBJ_R, Math.floor((t - M.led - .3) / .5));
        filas.forEach((f, r) => f.forEach((sg, i) => op(sg, r === paso && i === OBJ_K ? 1 : 0)));
        const on = pr(t, M.led + M.ledDur * .8, M.ledDur * .2 + .2);
        op(obj, on); op(objHalo, on);
        const sd = mvl(t, M.recorrido, M.recorridoDur) * stot;
        sdots.forEach((d) => op(d.e, t >= M.recorrido && d.s <= sd ? (1 - .6 * pr(t, M.tacha, .4)) : 0));
        op(tacha, pr(t, M.tacha, .15));
        tacha.querySelectorAll('path').forEach((p, i) => draw(p, mv(t, M.tacha + i * M.tachaDur * .3, M.tachaDur * .5)));
      });
    }

    // --- 9: red local, wifi tachado, señal débil (grupo centrado en x = 960) ---
    if (id === 'pe-red') {
      const e2 = S('g', { class: 'pe-red' }, svg);
      // (centro del área útil, entre el rótulo superior y la banda de subtítulos).
      // Panel RED LOCAL: un único SVG de 640x480 con viewBox -320 -240 640 480 (origen en el centro), x de 120 a 760.
      // Paneles: 120 | red local 640 | 140 | wifi 400 | 140 | señal 360 | 120. Centro vertical común y = 523.
      const CY = 523;
      const red = S('svg', { class: 'red-local', x: 360, y: CY - 240, width: 640, height: 480, viewBox: '-320 -240 640 480', overflow: 'visible' }, e2);
      const anillo = S('rect', { class: 'red-marco', x: -319.25, y: -239.25, width: 638.5, height: 478.5, rx: 2 }, red);
      const rlab = S('text', { class: 'rlab rlab-red', x: 0, y: -190 + 8 }, red); rlab.style.textAnchor = 'middle'; rlab.textContent = 'RED LOCAL';   // centro en (0, −190)
      const grupo = S('g', { transform: 'translate(20 0)' }, red);   // dispositivos y líneas 20 px a la derecha: 56 px de margen a cada lado
      const lab = (g, x, yTop, txt) => { const t = S('text', { class: 'dlab', x, y: yTop + 11 }, g); t.textContent = txt; return t; };
      // ESP8266 150x98, centro (0,−90); rótulo a la derecha, a 14 px
      const dEsp = S('g', { class: 'disp' }, grupo);
      S('rect', { x: -75, y: -139, width: 150, height: 98 }, dEsp);
      S('path', { class: 'pins', d: 'M-52 -118 h15 v15 h15 v-15 h15 v15 h15 v-15 h15 v15 h15' }, dEsp);
      S('rect', { x: -46, y: -88, width: 46, height: 30 }, dEsp);
      S('rect', { x: 16, y: -84, width: 34, height: 20 }, dEsp);
      { const t = S('text', { class: 'dlab', x: 89, y: -85 }, dEsp); t.style.textAnchor = 'start'; t.textContent = 'ESP8266'; }
      // Raspberry Pi 200x130, centro (0,70)
      const dRpi = S('g', { class: 'disp' }, grupo);
      S('rect', { x: -100, y: 5, width: 200, height: 130 }, dRpi);
      S('path', { class: 'pins', d: 'M-84 20 H84' }, dRpi);
      S('rect', { x: -72, y: 42, width: 58, height: 58 }, dRpi);
      S('rect', { x: 8, y: 42, width: 64, height: 32 }, dRpi);
      S('rect', { x: 8, y: 86, width: 36, height: 20 }, dRpi);
      lab(dRpi, 0, 149, 'RASPBERRY PI');
      // Computadora 130x88, centro (−219,70)
      const dLap = S('g', { class: 'disp' }, grupo);
      S('rect', { x: -275, y: 26, width: 112, height: 70 }, dLap);
      S('rect', { x: -267, y: 34, width: 96, height: 54 }, dLap);
      S('path', { d: 'M-284 114 H-154 L-164 96 H-274 Z' }, dLap);
      S('line', { class: 'teclado', x1: -270, x2: -168, y1: 104, y2: 104 }, dLap);          // base del teclado
      S('path', { class: 'teclado', d: 'M-231 114 V109 H-207 V114' }, dLap);               // hueco del trackpad
      lab(dLap, -219, 128, 'COMPUTADORA');
      // Celular 90x170, centro (199,70)
      const dTel = S('g', { class: 'disp' }, grupo);
      const TX = 154, TY = -15, TW = 90, TH = 170, TC = 199;
      const marcoTel = S('rect', { x: TX, y: TY, width: TW, height: TH, rx: 10 }, dTel);
      const pantTel = S('rect', { x: TX + 7, y: TY + 20, width: TW - 14, height: TH - 40, rx: 2 }, dTel);
      S('line', { x1: TC - 12, x2: TC + 6, y1: TY + 10, y2: TY + 10 }, dTel);
      S('circle', { class: 'lleno', cx: TC + 14, cy: TY + 10, r: 2.6 }, dTel);
      S('line', { x1: TC - 14, x2: TC + 14, y1: TY + TH - 10, y2: TY + TH - 10 }, dTel);
      S('line', { x1: TX + TW + 3, x2: TX + TW + 3, y1: TY + 34, y2: TY + 58 }, dTel);
      S('line', { x1: TX + TW + 3, x2: TX + TW + 3, y1: TY + 66, y2: TY + 80 }, dTel);
      const burbujas = S('g', { class: 'tel-chat' }, dTel);
      S('rect', { x: TX + TW - 14 - 36, y: TY + 36, width: 36, height: 16 }, burbujas);
      S('rect', { x: TX + 14, y: TY + 62, width: 52, height: 28 }, burbujas);
      S('line', { x1: TX + 20, x2: TX + 60, y1: TY + 71, y2: TY + 71 }, burbujas);
      S('line', { x1: TX + 20, x2: TX + 48, y1: TY + 80, y2: TY + 80 }, burbujas);
      S('rect', { x: TX + TW - 14 - 28, y: TY + 100, width: 28, height: 14 }, burbujas);
      lab(dTel, 199, 169, 'CELULAR');
      // líneas punteadas: vertical (0,−41)→(0,5); horizontales de 54 px
      const enlaces = S('g', { class: 'enl enl9' }, grupo);
      S('line', { x1: 0, y1: -41, x2: 0, y2: 5 }, enlaces);
      S('line', { x1: -100, y1: 70, x2: -154, y2: 70 }, enlaces);
      S('line', { x1: 100, y1: 70, x2: 154, y2: 70 }, enlaces);
      const devs = [dRpi, dEsp, dLap, dTel];
      // panel 2 (880 a 1260): wifi tachado + cartel. Base de los gráficos en YB, rótulos en una misma línea debajo
      const YB = CY + 58, WX = 1360, WY = YB - 6;
      const wifi = S('g', { class: 'wifi' }, e2);
      const arcos = [88, 162, 236].map((r) => S('path', { d: `M${(WX - r * .7071).toFixed(1)} ${(WY - r * .7071).toFixed(1)} A${r} ${r} 0 0 1 ${(WX + r * .7071).toFixed(1)} ${(WY - r * .7071).toFixed(1)}` }, wifi));
      const wdot = S('circle', { class: 'lleno', cx: WX, cy: WY - 12, r: 18 }, wifi);
      const strike = S('path', { class: 'tacha', d: `M${WX - 180} ${WY - 250} L${WX + 180} ${WY + 6}` }, e2);
      const LBL = YB + 60;                                 // borde superior del cartel; los rótulos comparten línea base
      const cartel = S('g', { class: 'cartel' }, e2);
      S('rect', { x: WX - 175, y: LBL, width: 350, height: 76 }, cartel);
      const ct = S('text', { x: WX, y: LBL + 53 }, cartel); ct.textContent = 'NO INTERNET';
      const trazosTel = [marcoTel, pantTel];
      piezas.push((t) => {
        draw(anillo, mv(t, M.anillo, M.anilloDur * .5));
        op(rlab, pr(t, M.anillo + .8, .5));
        devs.forEach((d, i) => op(d, pr(t, M.anillo + M.anilloDur * .4 + i * M.anilloDur * .1, .4)));
        // el celular: primero se traza el marco, después aparecen las burbujas
        trazosTel.forEach((e, i) => draw(e, mv(t, M.anillo + M.anilloDur * .7 + i * .25, .5)));
        op(burbujas, pr(t, M.anillo + M.anilloDur * .9, .4));
        op(enlaces, pr(t, M.anillo + M.anilloDur * .85, .5));
        const wv = 1;
        arcos.forEach((a, i) => { op(a, t >= M.wifi ? wv : 0); draw(a, mv(t, M.wifi + i * M.wifiDur * .12, M.wifiDur * .2)); });
        op(wdot, pr(t, M.wifi, .3) * wv);
        op(strike, t >= M.wifi + M.wifiDur * .55 ? wv : 0); draw(strike, mv(t, M.wifi + M.wifiDur * .55, M.wifiDur * .15));
        op(cartel, pr(t, M.wifi + M.wifiDur * .75, .4) * wv);
      });
    }

    // --- 10: Raspberry Pi → ESP8266 → tira de LED (tres cajas iguales, grupo centrado en x = 960) ---
    if (id === 'pe-hardware') {
      const e3 = S('g', { class: 'pe-cad' }, svg);
      const BW = 400, BH = 270, BY0 = 330, GAP = 120;
      const X0 = 960 - (3 * BW + 2 * GAP) / 2;            // 240
      function nodo(i, titulo, sub) {
        const x = X0 + i * (BW + GAP);
        const g = S('g', { transform: `translate(${x} ${BY0})` }, e3);
        const hl = S('ellipse', { cx: BW / 2, cy: BH / 2, rx: BW * .8, ry: 230, fill: `url(#h-${id})` }, g);
        const fr = S('rect', { class: 'nfr', x: 0, y: 0, width: BW, height: BH }, g);
        const a = S('text', { class: 'ntit', x: BW / 2, y: 66 }, g); a.textContent = titulo;
        const dib = S('g', { class: 'ndib' }, g);
        const b = S('text', { class: 'nsub', x: BW / 2, y: BH + 52 }, g); b.textContent = sub;
        return { g, hl, fr, dib, b };
      }
      const n1 = nodo(0, 'RASPBERRY PI', 'COMPUTADORA PRINCIPAL');       // dibujo de 340 de ancho, centrado
      S('rect', { x: 30, y: 116, width: 220, height: 110 }, n1.dib);
      S('rect', { x: 82, y: 146, width: 48, height: 48 }, n1.dib);
      S('rect', { x: 160, y: 146, width: 66, height: 26 }, n1.dib);
      S('path', { d: 'M42 128 H238', class: 'pins' }, n1.dib);
      S('rect', { x: 270, y: 136, width: 100, height: 80 }, n1.dib);
      const n2 = nodo(1, 'ESP8266', 'CONTROLA LA TIRA');                 // placa de 160 de ancho, centrada
      S('rect', { x: 120, y: 120, width: 160, height: 104 }, n2.dib);
      S('path', { d: 'M150 142 h14 v14 h14 v-14 h14 v14 h14 v-14 h14 v14 h14', class: 'pins' }, n2.dib);
      S('rect', { x: 180, y: 180, width: 40, height: 28 }, n2.dib);
      const n3 = nodo(2, 'TIRA DE LED', 'LEDS INTELIGENTES');           // 12 segmentos, centrados
      const csegs = [], SGP = 8, SWD = (BW - 48 - 11 * SGP) / 12, SX = 24;     // 24 px de aire a cada lado
      for (let i = 0; i < 12; i++) {
        S('rect', { class: 'base', x: SX + i * (SWD + SGP), y: 162, width: SWD, height: 16 }, n3.dib);
        csegs.push(S('rect', { class: 'luz', x: SX + i * (SWD + SGP), y: 162, width: SWD, height: 16 }, n3.dib));
      }
      const MY = BY0 + BH / 2, A1 = X0 + BW, A2 = X0 + 2 * BW + GAP;
      const fl1 = S('path', { class: 'flecha', d: `M${A1 + 16} ${MY} H${A1 + GAP - 16} M${A1 + GAP - 30} ${MY - 12} L${A1 + GAP - 16} ${MY} L${A1 + GAP - 30} ${MY + 12}` }, e3);
      const fl2 = S('path', { class: 'flecha', d: `M${A2 + 16} ${MY} H${A2 + GAP - 16} M${A2 + GAP - 30} ${MY - 12} L${A2 + GAP - 16} ${MY} L${A2 + GAP - 30} ${MY + 12}` }, e3);
      piezas.push((t) => {
        const D = M.piezaDur;
        [[n1, M.raspberry], [n2, M.esp], [n3, M.tira]].forEach(([n, a], i) => {
          op(n.g, pr(t, a, .6));
          const v = pr(t, a + .3, .6) * (i === 2 ? 1 : 1 - .55 * pr(t, a + D, .6));
          op(n.hl, v);
          n.fr.style.strokeOpacity = (.35 + .65 * Math.max(v, .45)).toFixed(3);
          op(n.b, pr(t, a + .6, .5));
        });
        draw(fl1, mv(t, M.esp - .6, .8));
        draw(fl2, mv(t, M.tira - .6, .8));
        csegs.forEach((s, i) => op(s, pr(t, M.tira + .4 + (i / csegs.length) * (D - 1), .2)));
      });
    }

    // --- 11: maqueta en vivo (bucle) y los tres beneficios ---
    if (id === 'pe-maqueta') {
      const e4 = S('g', { class: 'pe-maq' }, svg);
      const MX = 560, MY = 270, MW = 800, TIER = 180, MC = 4;     // bloque (maqueta + LEDs) centrado: 144 px de aire arriba y abajo
      S('rect', { class: 'mueble', x: MX, y: MY, width: MW, height: TIER * 3 + 10 }, e4);
      const mseg = [], mcaj = [];
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
          const x = MX + 20 + c * 192, y = y0 + 40;
          S('rect', { class: 'mc', x, y, width: 176, height: 128 }, e4);
          S('line', { class: 'manija', x1: x + 66, x2: x + 110, y1: y + 102, y2: y + 102 }, e4);
          mcaj.push({ r, c, x, y });
        }
      }
      const mObj = mcaj.find((m) => m.r === 2 && m.c === 2);
      const mHalo = S('ellipse', { cx: mObj.x + 88, cy: mObj.y + 67, rx: 260, ry: 200, fill: `url(#h-${id})` }, e4);
      const mLit = S('rect', { class: 'obj', x: mObj.x + 6, y: mObj.y + 6, width: 164, height: 116 }, e4);
      const mObjSeg = 50;
      const mlab = H('div', 'pe-maqlab', slide);
      const mled = H('i', null, mlab);
      H('span', null, mlab, 'Maqueta · en vivo');
      const ben = H('div', 'pe-ben', slide);
      const benEls = [['Saves time', 'Ahorra tiempo'], ['Reduces mistakes', 'Reduce errores'], ['Keeps stock organized', 'Stock organizado']].map(([en, es]) => {
        const d = H('div', 'b', ben);
        const led = H('i', null, d);
        const tx = H('div', 'tx', d);
        H('div', 'en', tx, en); H('div', 'es', tx, es);
        return { d, led };
      });
      piezas.push((t) => {
        op(e4, pr(t, M.maqueta, M.maquetaDur * .5));
        op(mlab, pr(t, M.maqueta + 1, .5));
        const t0 = M.maqueta + M.maquetaDur * .6;
        if (RM) {
          mseg.forEach((s, i) => op(s, i === mObjSeg ? 1 : .3));
          op(mLit, t >= t0 ? 1 : 0); op(mHalo, t >= t0 ? 1 : 0);
          mled.style.opacity = '1';
        } else {
          const tt = Math.max(0, t - t0), CYC = 3.4, n = mseg.length;
          const hh = (tt % CYC) / CYC * (n + 8) - 1;
          mseg.forEach((s, i) => op(s, t < t0 ? .3 * pr(t, M.maqueta, 1) : .28 + .72 * nivel(hh, i)));
          const v = t < t0 ? 0 : nivel(hh, mObjSeg);
          op(mLit, (.35 + .65 * v) * pr(t, M.maqueta, 1)); op(mHalo, (.2 + .8 * v) * pr(t, M.maqueta, 1));
          mled.style.opacity = t < t0 ? '1' : (.4 + .6 * Math.abs(Math.cos(tt * 2.2))).toFixed(3);
        }
        op(ben, pr(t, M.maqueta + 1, .6));
        benEls.forEach((b, i) => { const on = pr(t, M.leds[i], .4); op(b.led, on); op(b.d, .4 + .6 * on); });
      });
    }

    return {
      render(t) {
        subs(t);
        if (tit) op(tit, pr(t, M.titulo, M.tituloDur * .5));
        piezas.forEach((f) => f(t));
      }
    };
  }

  /* =====================================================================
     DIAPOSITIVAS 21 A 24 · CONVERSACIÓN CON STOCKUS: un mensaje por diapositiva
     Siempre el mismo contenedor, en la misma posición. Arriba, atenuado al 55 %, el mensaje anterior;
     debajo, el actual. Nunca hay más de dos burbujas. Cada una tiene su lugar reservado (nada se mueve al escribir).
     ===================================================================== */
  const MSG = {
    q1: { tipo: 'q', texto: 'Stockus, ¿qué dejó este proyecto?' },
    a1: { tipo: 'a', lineas: ['Un problema real, resuelto con luz.', 'Funciona sin internet.', 'Ubica cada producto con LEDs inteligentes.'] },
    q2: { tipo: 'q', texto: '¿Y ahora?' },
    f:  { tipo: 'f', grande: 'Primeros clientes.', sub: 'Relevamiento a relevamiento. Cada instalación, acompañada.' }
  };
  const PASOS_CHAT = { 'conv-pregunta': [null, 'q1'], 'conv-respuesta': ['q1', 'a1'], 'conv-ahora': ['a1', 'q2'], 'conv-final': ['q2', 'f'] };
  const ALTO = { q: 132, a: 286, f: 250 }, SEP = 48;     // solo la burbuja (sin etiqueta ni avatar); interlineado 1,35
  function mensaje(col, key, top) {
    const m = MSG[key];
    const el = H('div', 'msg ' + (m.tipo === 'q' ? 'q' : 'a'), col);
    el.style.top = top + 'px';
    const row = H('div', 'row', el);
    const av = null;
    const unit = H('div', 'unit', row);                     // la etiqueta queda centrada sobre su burbuja
    const bub = H('div', 'bub' + (m.tipo === 'f' ? ' fin' : ''), unit);
    const o = { m, el, av, parts: [] };
    if (m.tipo !== 'q') { o.dots = H('div', 'dots', bub); for (let k = 0; k < 3; k++) H('i', null, o.dots); }
    const hueco = (parent, s) => { const h = H('span', 'hold', parent); H('span', 'ghost2', h, s); return H('span', 'tx', h); };
    if (m.tipo === 'q') o.parts.push({ e: hueco(bub, m.texto), s: m.texto });
    else if (m.tipo === 'a') m.lineas.forEach((s) => { const p = H('p', 'ln', bub); const led = H('i', 'l', p); o.parts.push({ e: hueco(p, s), s, led }); });
    else { o.parts.push({ e: hueco(H('p', 'big', bub), m.grande), s: m.grande }); o.parts.push({ e: hueco(H('p', 'sub', bub), m.sub), s: m.sub }); }
    return o;
  }
  function escribir(o, t, tiempos) {                         // tiempos: [inicio, duración] de cada parte
    o.parts.forEach((p, i) => {
      const [a, d] = tiempos ? tiempos[i] : [YA, 1];
      const n = Math.round(lin(t, a, d) * p.s.length);
      const txt = t < a ? '' : p.s.slice(0, n);
      if (p.e.textContent !== txt) p.e.textContent = txt;
      if (p.led) op(p.led, pr(t, a - .05, .15));
    });
  }
  function conversacion(slide, cfg) {
    const [prevK, curK] = PASOS_CHAT[slide.id];
    const M = cfg.m || {};
    const box = H('div', 'chat', slide);
    const head = H('div', 'chead', box);
    const hl = H('div', 'hl', head);
    H('span', 'nm', hl, 'STOCKUS');
    H('div', 'est', head, 'En línea · sin internet');
    const body = H('div', 'cbody', box);
    const col = H('div', 'col', body);
    const vento = H('div', 'cvento', box, 'Construido sobre Vento');
    const prev = prevK ? mensaje(col, prevK, 0) : null;
    const cur = mensaje(col, curK, prevK ? ALTO[MSG[prevK].tipo] + SEP : 0);
    if (prev) escribir(prev, 0, null);                       // el anterior ya está completo
    return {
      render(t) {
        op(box, slide.id === 'conv-pregunta' ? pr(t, 0, .4) : 1);
        if (prev) { op(prev.el, 1 - .45 * pr(t, 0, .35)); if (prev.av) prev.av.style.opacity = '1'; if (prev.dots) op(prev.dots, 0); }
        op(cur.el, pr(t, 0, .3));
        if (cur.av) cur.av.style.opacity = '1';
        if (cur.dots) {
          const fin = M.escribiendo || 1;
          op(cur.dots, t < fin ? 1 : 0);
          if (!RM) [...cur.dots.children].forEach((d, k) => op(d, .35 + .65 * Math.abs(Math.sin(t * 6 - k * .7))));
        }
        escribir(cur, t, M.partes);
        op(vento, curK === 'f' ? pr(t, M.vento, .6) : 0);
      }
    };
  }

  window.ESCENAS = {
    'th-deposito': thomas, 'th-palabra': thomas, 'th-tiempo': thomas, 'th-stockus': thomas, 'th-pasos': thomas,
    'pe-diferencia': pedro, 'pe-leds': pedro, 'pe-red': pedro, 'pe-hardware': pedro, 'pe-maqueta': pedro,
    'conv-pregunta': conversacion, 'conv-respuesta': conversacion, 'conv-ahora': conversacion, 'conv-final': conversacion
  };
})();
