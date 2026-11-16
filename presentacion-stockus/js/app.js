/* STOCKUS · presentación "La luz encuentra"
   Sin dependencias, sin red. Navegación por clicker, vista del presentador y coreografía por diapositiva. */
(() => {
  'use strict';
  const W = 1920, H = 1080;
  const EI = 'cubic-bezier(.2,.7,.2,1)';
  const EO = 'cubic-bezier(.4,0,.2,1)';
  const stage = document.getElementById('stage');
  /* Lista única de diapositivas (js/orden.js): se quitan del documento las que no figuran y se ordenan las demás.
     Todo lo que depende de la posición (número, barra del pie, hash, cortes, cronómetro, notas) sale de acá. */
  const ORDEN = window.ORDEN || [...stage.querySelectorAll('.slide')].map((s) => s.id);
  const todas = Object.fromEntries([...stage.querySelectorAll('.slide')].map((s) => [s.id, s]));
  Object.keys(todas).forEach((id) => { if (!ORDEN.includes(id)) todas[id].remove(); });
  const slides = ORDEN.map((id) => todas[id]).filter(Boolean);
  const overlay0 = document.getElementById('foot');
  slides.forEach((s, i) => { stage.insertBefore(s, overlay0); s.setAttribute('aria-label', 'Diapositiva ' + (i + 1) + ': ' + (s.dataset.title || s.id)); });
  const N = slides.length;
  const params = new URLSearchParams(location.search);
  const LITE = params.has('lite');
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const idxs = (f) => slides.map((s, i) => (f(s) ? i : -1)).filter((i) => i >= 0);
  const VIDEO_SLIDES = idxs((s) => s.querySelector('video'));                         // los videos
  const NO_FOOT = [0, N - 1, ...VIDEO_SLIDES, ...idxs((s) => s.hasAttribute('data-nofoot'))];
  const COLD_CUTS = new Set(VIDEO_SLIDES);    // alrededor de los videos no hay transición de luz
  const SVGNS = 'http://www.w3.org/2000/svg';
  if (LITE) stage.classList.add('lite');
  if (LITE) document.documentElement.classList.add('lite');
  if (REDUCE) stage.classList.add('calm');

  /* ---------- Escala del escenario ---------- */
  let scale = 1;
  function fit() {
    scale = Math.min(innerWidth / W, innerHeight / H);
    stage.style.setProperty('--s', scale);
  }
  addEventListener('resize', fit);
  fit();

  /* ---------- Constructores: tiras de LED y cajoneras ---------- */
  function buildStrips() {
    stage.querySelectorAll('.strip[data-n]').forEach((s) => {
      const n = +s.dataset.n, w = s.dataset.w ? +s.dataset.w : null;
      const on = new Set((s.dataset.on || '').split(',').filter(Boolean).map(Number));
      const groups = (s.dataset.groups || '').split(',').filter(Boolean).map(Number);
      const starts = new Set(); let acc = 0;
      groups.forEach((g) => { starts.add(acc); acc += g; });
      for (let i = 0; i < n; i++) {
        const seg = document.createElement('i');
        seg.className = 'seg' + (on.has(i) ? ' on' : '') + (starts.has(i) && i > 0 ? ' sp' : '');
        if (w) seg.style.width = w + 'px';
        seg.appendChild(document.createElement('b'));
        s.appendChild(seg);
      }
    });
  }
  function buildCajoneras() {
    stage.querySelectorAll('.cajonera').forEach((c) => {
      const [cw, ch] = c.dataset.cell.split(',').map(Number);
      const [cols, rows] = c.dataset.grid.split(',').map(Number);
      const lit = (c.dataset.lit || '').split(',').filter(Boolean).map((s) => s.split(':').map(Number));
      c.style.left = c.dataset.x + 'px'; c.style.top = c.dataset.y + 'px';
      c.style.width = cols * cw + 'px'; c.style.height = rows * ch + 'px';
      const svg = document.createElementNS(SVGNS, 'svg');
      svg.setAttribute('width', cols * cw); svg.setAttribute('height', rows * ch);
      for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
        const rc = document.createElementNS(SVGNS, 'rect');
        rc.setAttribute('class', 'cell');
        rc.setAttribute('x', k * cw + .75); rc.setAttribute('y', r * ch + .75);
        rc.setAttribute('width', cw - 1.5); rc.setAttribute('height', ch - 1.5);
        svg.appendChild(rc);
        const h = document.createElementNS(SVGNS, 'line');
        h.setAttribute('class', 'hand');
        h.setAttribute('x1', k * cw + cw * .36); h.setAttribute('x2', k * cw + cw * .64);
        h.setAttribute('y1', r * ch + ch * .78); h.setAttribute('y2', r * ch + ch * .78);
        svg.appendChild(h);
      }
      c.appendChild(svg);
      lit.forEach(([r, k], i) => {
        const inset = Math.max(4, Math.round(cw * .05));
        const x = k * cw + inset, y = r * ch + inset, w = cw - inset * 2, h = ch - inset * 2;
        const halo = document.createElement('div');
        halo.className = 'halo';
        const hw = w * 2.6, hh = h * 2.6;
        halo.style.cssText = `left:${x + w / 2 - hw / 2}px;top:${y + h / 2 - hh / 2}px;width:${hw}px;height:${hh}px`;
        const el = document.createElement('div');
        el.className = 'lit';
        el.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
        el.innerHTML = '<i class="fill"></i>';
        c.appendChild(halo); c.appendChild(el);
      });
    });
  }
  buildStrips();
  buildCajoneras();
  stage.querySelectorAll('#equipo .dw').forEach((d) => d.appendChild(document.createElement('b')));   // luz del cajón de cada tarjeta

  /* ---------- Coreografía: helpers ---------- */
  const ease = (p) => 1 - Math.pow(1 - p, 3);
  function makeCtx(slide, instant, base) {
    const anims = [], cancels = [];
    const q = (s) => (typeof s === 'string' ? [...slide.querySelectorAll(s)] : Array.isArray(s) ? s : [s]);
    function A(el, kf, o = {}) {
      const a = el.animate(kf, { duration: (o.dur ?? .6) * 1000, delay: (base + (o.delay || 0)) * 1000, easing: o.ease || EI, fill: 'both' });
      anims.push(a);
      if (instant) a.finish();
      return a;
    }
    function T(fn, o = {}) {
      if (instant) { fn(1); return; }
      const start = performance.now() + (base + (o.delay || 0)) * 1000, dur = (o.dur ?? 1) * 1000;
      const ef = o.linear ? (p) => p : ease;
      let id = 0;
      const step = (now) => {
        if (now < start) { id = requestAnimationFrame(step); return; }
        const p = Math.min(1, (now - start) / dur);
        fn(ef(p));
        if (p < 1) id = requestAnimationFrame(step);
      };
      id = requestAnimationFrame(step);
      cancels.push(() => cancelAnimationFrame(id));
    }
    const api = {
      q, A, T, instant,
      typeC(el, o = {}) {                     // escritura letra por letra con cursor que parpadea solo mientras escribe
        const text = el.dataset.full || (el.dataset.full = el.textContent);
        const dur = text.length * (o.ms ?? 35) / 1000;
        if (!instant) el.textContent = '';
        const cur = document.createElement('i'); cur.className = 'cur';
        T((p) => {
          el.textContent = text.slice(0, Math.round(p * text.length));
          if (p < 1) el.appendChild(cur);
        }, { delay: o.delay, dur, linear: true });
        return dur;
      },
      cancel() { anims.forEach((a) => { try { a.cancel(); } catch (e) { /* ya cancelada */ } }); cancels.forEach((c) => c()); },
      loop(fn, o = {}) {                      // bucle continuo con rAF; se corta al salir de la diapositiva
        if (REDUCE) return;
        let id = 0, t0 = 0;
        const startAt = performance.now() + (instant ? 0 : (base + (o.delay || 0)) * 1000);
        const step = (now) => {
          if (now >= startAt) { if (!t0) { t0 = now; if (o.init) o.init(); } fn((now - t0) / 1000); }
          id = requestAnimationFrame(step);
        };
        id = requestAnimationFrame(step);
        cancels.push(() => { cancelAnimationFrame(id); if (o.reset) o.reset(); });
      },
      rise(sel, o = {}) {
        q(sel).forEach((e, i) => A(e, [{ opacity: 0, translate: `0 ${o.dist ?? 24}px` }, { opacity: 1, translate: '0 0' }], { delay: (o.delay || 0) + i * (o.stagger ?? .07), dur: o.dur ?? .6 }));
      },
      fade(sel, o = {}) {
        q(sel).forEach((e, i) => A(e, [{ opacity: 0 }, { opacity: o.to ?? 1 }], { delay: (o.delay || 0) + i * (o.stagger ?? 0), dur: o.dur ?? .6, ease: o.ease }));
      },
      draw(sel, o = {}) {
        q(sel).forEach((e, i) => {
          const len = e.getTotalLength ? e.getTotalLength() : 100;
          e.style.strokeDasharray = len;
          A(e, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { delay: (o.delay || 0) + i * (o.stagger ?? 0), dur: o.dur ?? .6, ease: EO });
        });
      },
      segs(sel, o = {}) {
        const list = typeof sel === 'string' ? q(sel + ' .seg') : sel;
        list.forEach((s, i) => {
          if (s.classList.contains('on') && !o.force) return;
          const b = s.firstElementChild;
          A(b, [{ opacity: 0, scale: '1.5 2.4' }, { opacity: 1, scale: '1.15 1.6', offset: .35 }, { opacity: 1, scale: '1 1' }], { delay: (o.delay || 0) + i * (o.gap ?? .04), dur: .28 });
        });
      },
      type(el, text, o = {}) {
        const cur = '_';
        text = el.dataset.full || (el.dataset.full = text);
        if (!instant) { el.style.minWidth = el.offsetWidth + 'px'; el.textContent = ''; }
        else el.textContent = text;
        T((p) => {
          const n = Math.round(p * text.length);
          el.textContent = text.slice(0, n) + (p < 1 ? cur : '');
        }, { delay: o.delay, dur: o.dur ?? text.length * .03, linear: true });
      },
      count(el, to, o = {}) {
        const from = o.from ?? 0, pad = o.pad ?? 0;
        const fmt = (v) => String(Math.round(v)).padStart(pad, '0');
        if (!instant) el.textContent = fmt(from);
        T((p) => { el.textContent = fmt(from + (to - from) * p); }, { delay: o.delay, dur: o.dur ?? 1 });
      },
      drawer(cj, o = {}) {
        const c = typeof cj === 'string' ? slide.querySelector(cj) : cj;
        if (!c) return;
        const lits = [...c.querySelectorAll('.lit')], halos = [...c.querySelectorAll('.halo')];
        lits.forEach((l, i) => {
          A(l, [{ opacity: 0 }, { opacity: 1 }], { delay: (o.delay || 0) + i * (o.stagger ?? .08), dur: .35 });
          if (halos[i]) A(halos[i], [{ opacity: 0 }, { opacity: 1 }], { delay: (o.delay || 0) + i * (o.stagger ?? .08), dur: .6 });
        });
        if (!REDUCE && !LITE) lits.forEach((l) => l.firstElementChild.classList.add('breathe'));
      },
      cajoneraIn(cj, o = {}) {
        const c = typeof cj === 'string' ? slide.querySelector(cj) : cj;
        if (!c) return;
        const svg = c.querySelector('svg');
        svg.style.transformOrigin = o.origin || '0 100%';
        A(svg, [{ opacity: 0, scale: o.from || '.92' }, { opacity: 1, scale: '1' }], { delay: o.delay, dur: o.dur ?? .9 });
        c.querySelectorAll('.lit,.halo').forEach((e) => { A(e, [{ opacity: 0 }, { opacity: 0 }], { delay: 0, dur: .01 }); });
      }
    };
    return api;
  }

  /* ---------- Coreografía por diapositiva (por id, ver js/orden.js) ---------- */
  // Tira de la 3: recorrido de luz continuo, de izquierda a derecha, con pausa corta.
  const RUN_SEG = .11, RUN_CYCLE = 2.3, RUN_BASE = .22, RUN_DRAWER_SEG = 6;
  function runLevel(h, i) {
    const d = h - i;
    if (d < -1) return 0;
    if (d < 0) return 1 + d;                       // entra la luz
    return Math.exp(-d / 2.2);                     // estela que se apaga
  }
  const ENTER = {
    'stockus'(c, s) {
      const dot = s.querySelector('.dot'), halo = s.querySelector('.center .halo'), logo = s.querySelector('.logo');
      c.A(dot, [{ opacity: 0, scale: '.2' }, { opacity: 1, scale: '1' }], { dur: .5 });
      c.A(halo, [{ opacity: 0, scale: '.12' }, { opacity: 1, scale: '1' }], { delay: .2, dur: 1.3 });
      // la máscara abre más allá del texto: nunca recorta las letras
      c.A(logo, [{ clipPath: 'inset(-25% 100% -25% -10%)' }, { clipPath: 'inset(-25% -10% -25% -10%)' }], { delay: .9, dur: 1.2, ease: EO });
      c.A(dot, [{ opacity: 1 }, { opacity: 0 }], { delay: 2.1, dur: .5 });
      c.segs('.strip', { delay: 2.0, gap: .033 });
      c.A(s.querySelector('.strip'), [{ opacity: 0 }, { opacity: 1 }], { delay: 1.9, dur: .2 });
      const sub = s.querySelector('.sub');
      c.type(sub, sub.dataset.text, { delay: 2.9, dur: 1.0 });
    },
    'leds'(c, s) {
      c.fade('.cajonera svg', { dur: .8 });
      c.rise('.title');
      c.draw('.c1', { delay: .6, dur: .5 });
      c.draw('.c2', { delay: 1.1, dur: .5 });
      c.rise('.node', { delay: .25, stagger: .3 });
      c.rise('.wifi', { delay: 1.1, dur: .5, dist: 8 });
      c.segs('.n3 .strip', { delay: 1.5, gap: .09 });
      c.rise('.pill', { delay: .9 });
      c.rise('.phrases p', { delay: .9, stagger: .22 });
      c.drawer('.cajonera', { delay: 1.7 });
      // bucle: la luz recorre la tira y el cajón iluminado se enciende cuando pasa por su segmento
      const bs = [...s.querySelectorAll('.n3 .seg b')];
      const lit = s.querySelector('.cajonera .lit'), lhalo = s.querySelector('.cajonera .halo');
      const own = [...bs, lit, lhalo];
      c.loop((t) => {
        const h = (t % RUN_CYCLE) / RUN_SEG - 1;
        bs.forEach((b, i) => { b.style.opacity = (RUN_BASE + (1 - RUN_BASE) * runLevel(h, i)).toFixed(3); });
        const v = runLevel(h, RUN_DRAWER_SEG);
        lit.style.opacity = (.3 + .7 * v).toFixed(3);
        lhalo.style.opacity = (.15 + .85 * v).toFixed(3);
      }, {
        delay: 2.7,
        init: () => own.forEach((e) => e.getAnimations().forEach((a) => a.cancel())),
        reset: () => own.forEach((e) => { e.style.opacity = ''; })
      });
    },
    'equipo'(c, s) {
      c.rise('.title');
      c.rise('.logo', { delay: .1, dist: 12 });
      // cascada pareja: todas las tarjetas igual, ninguna destacada
      s.querySelectorAll('.card').forEach((card, i) => {
        const t = .25 + i * .1;
        c.rise(card, { delay: t, dur: .6 });
        c.A(card.querySelector('.dw b'), [{ opacity: 0 }, { opacity: 1 }], { delay: t + .35, dur: .4 });
      });
    },
    'identidad'(c, s) {
      c.rise('.title');
      // Las flechas se dibujan: la de arriba avanza hacia su punta (sale), la de abajo en sentido contrario (entra).
      const glow = [...s.querySelectorAll('.iso .glow circle')];
      const flecha = (g, desdeElFinal, t0) => {
        const path = g.querySelector('.st'), tri = g.querySelector('.tri');
        const L = path.getTotalLength();
        const hist = [];
        if (!c.instant) { path.style.strokeDasharray = L + ' ' + L; path.style.strokeDashoffset = desdeElFinal ? -L : L; }
        c.A(tri, [{ opacity: 0 }, { opacity: 1 }], { delay: t0 + .9, dur: .15 });
        c.T((p) => {
          const hecho = L * p;
          if (p >= 1) {                     // final: trazo completo, sin rastro de la animación
            path.style.strokeDasharray = 'none'; path.style.strokeDashoffset = '';
            glow.forEach((e) => { e.style.opacity = 0; });
            return;
          }
          path.style.strokeDashoffset = desdeElFinal ? -(L - hecho) : (L - hecho);
          const pt = path.getPointAtLength(desdeElFinal ? L - hecho : hecho);
          hist.unshift(pt); if (hist.length > 16) hist.pop();
          glow.forEach((e, i) => {
            const q = hist[Math.min(hist.length - 1, i * 3)];
            e.setAttribute('cx', q.x); e.setAttribute('cy', q.y);
            e.style.opacity = (i ? .55 - i * .1 : 1) * Math.min(1, p * 8);
          });
        }, { delay: t0, dur: 1.0 });
      };
      flecha(s.querySelector('.fa'), true, .35);
      flecha(s.querySelector('.fb'), false, 1.45);
      c.A(s.querySelector('.word'), [{ opacity: 0 }, { opacity: 1 }], { delay: 2.55, dur: .6, ease: EO });
      c.A(s.querySelector('.isoline'), [{ opacity: 0 }, { opacity: 1 }], { delay: 2.75, dur: .45, ease: EO });
      s.querySelectorAll('.bar .sw').forEach((sw, i) => c.A(sw, [{ scale: '1 0' }, { scale: '1 1' }], { delay: .25 + i * .12, dur: .8 }));
      s.querySelectorAll('.bar .nm').forEach((e, i) => c.rise(e, { delay: .9 + i * .1, dur: .4, dist: 10 }));
      s.querySelectorAll('.bar .hx').forEach((e, i) => c.type(e, e.textContent, { delay: 1.0 + i * .12, dur: .35 }));
      c.rise('.samples > div', { delay: 1.5, stagger: .15 });
    },
    'vento'(c, s) {
      c.rise('.title');
      c.rise('.def', { delay: .15, dist: 12 });
      c.fade('.frame', { dur: .5 });
      c.A(s.querySelector('.shot'), [{ opacity: 0, scale: '1.02' }, { opacity: 1, scale: '1' }], { dur: 1.4 });
      c.draw('.h0', { delay: .6, dur: .5 });
      c.A(s.querySelector('.halo.hub'), [{ opacity: 0 }, { opacity: .5 }], { delay: .6, dur: .9 });
      const groups = [[['.h1'], ['.l1'], '.d1'], [['.h2'], ['.l2'], '.d2'], [['.h3', '.h4', '.h5'], ['.l3'], '.d3']];
      groups.forEach(([hs, ls, d], i) => {
        const t = 1.1 + i * .35;
        hs.forEach((h) => c.draw(h, { delay: t, dur: .5 }));
        ls.forEach((l) => c.draw(l, { delay: t + .15, dur: .5 }));
        c.rise(d, { delay: t + .3, dur: .4, dist: 8 });
      });
    },
    'metodologia'(c, s) {
      c.rise('.title');
      c.fade('.ghost', { dur: 1.2, to: .055 });
      c.count(s.querySelector('.cnt'), 3, { dur: .9, delay: .2 });
      c.rise('.bigl', { delay: .5 });
      c.rise('.bigl2', { delay: .8, dist: 10 });
      c.A(s.querySelector('.tl .line'), [{ opacity: 0 }, { opacity: 1 }], { delay: .3, dur: .4 });
      c.A(s.querySelector('.tl .fill'), [{ scale: '0 1' }, { scale: '1 1' }], { delay: .7, dur: 1.2, ease: EO });
      s.querySelectorAll('.tl .nd').forEach((nd, i) => {
        const t = .7 + i * .5;
        c.rise([nd.querySelector('.tag'), nd.querySelector('p')], { delay: t, dur: .5, dist: 14 });
        c.A(nd.querySelector('.dotn b'), [{ opacity: 0, scale: '.3' }, { opacity: 1, scale: '1' }], { delay: t, dur: .35 });
      });
      c.A(s.querySelector('.tl .halo'), [{ opacity: 0 }, { opacity: 1 }], { delay: 1.7, dur: .8 });
    },
    'escala'(c, s) {
      c.rise('.title');
      s.querySelectorAll('.cajonera').forEach((cj, i) => {
        const t = .2 + i * .35;
        c.cajoneraIn(cj, { delay: t, from: '.2' });
        c.drawer(cj, { delay: t + .5, stagger: .07 });
      });
      c.rise('.caps', { delay: .5, stagger: .35, dur: .5, dist: 10 });
      c.rise('.keys .k', { delay: .6, stagger: .3, dist: 16 });
      c.segs('.steps .strip', { delay: 1.6, gap: .016 });
      s.querySelectorAll('.steps .st').forEach((e, i) => c.rise(e, { delay: 1.6 + [0, 19, 38][i] * .016, dur: .5, dist: 14 }));
    },
    'presupuesto'(c, s) {
      c.fade('.cajonera svg', { dur: .8 });
      c.rise('.title');
      const pcs = s.querySelectorAll('.pc');
      pcs.forEach((p, i) => c.rise(p, { delay: .2 + i * .45, dur: .6, dist: 20 }));
      const plus = s.querySelectorAll('.plus path');
      plus.forEach((p, i) => c.draw(p, { delay: .55 + Math.floor(i / 2) * .45, dur: .35 }));
      c.drawer('.cajonera', { delay: 1.2 });
    },
    'equilibrio'(c, s) {
      c.fade('.cajonera svg', { dur: .8 });
      c.rise('.title');
      const fm = [...s.querySelectorAll('.formula .t')], ops = [...s.querySelectorAll('.formula .op')];
      fm.forEach((t, i) => {
        const txt = t.dataset.full || t.textContent;
        const d = .2 + i * .6;
        c.type(t, txt, { delay: d, dur: .5 });
        if (ops[i]) c.fade(ops[i], { delay: d + .5, dur: .2 });
      });
      c.A(s.querySelector('.num1'), [{ opacity: 0 }, { opacity: 1 }], { delay: 1.0, dur: .3 });
      c.count(s.querySelector('.num1 .a'), 2, { delay: 1.0, dur: 1.2 });
      c.count(s.querySelector('.num1 .b'), 3, { delay: 1.0, dur: 1.2 });
      c.rise('.lab1', { delay: 1.2, dur: .5, dist: 12 });
      c.drawer('.cajonera', { delay: 1.9 });
      c.fade('.num2', { delay: 2.0, dur: .6 });
      c.rise('.lab2', { delay: 2.1, dur: .5, dist: 12 });
      c.rise('.frase', { delay: 2.2, dur: .5, dist: 12 });
    },
    'pago'(c, s) {
      c.fade('.cajonera svg', { dur: .8 });
      c.rise('.title');
      c.rise('.hds', { delay: .2, dur: .6 });
      c.fade('.hds .big', { delay: .4, dur: .3 });
      c.count(s.querySelector('.hds .a'), 2, { delay: .5, dur: .9 });
      c.count(s.querySelector('.hds .b'), 3, { delay: .5, dur: .9 });
      c.rise('.hds .lb,.hds p,.hds .fases', { delay: .9, stagger: .12, dist: 14 });
      c.rise('.pay .head', { delay: .3, dist: 12 });
      c.A(s.querySelector('.pay .rule'), [{ scale: '0 1' }, { scale: '1 1' }], { delay: .5, dur: .6, ease: EO });
      const segs = [...s.querySelectorAll('.pay .seg')];
      const ts = [.8, 1.5, 2.1];
      c.segs(segs.slice(0, 10), { delay: ts[0], gap: .06 });
      c.segs(segs.slice(10, 16), { delay: ts[1], gap: .08 });
      c.segs(segs.slice(16), { delay: ts[2], gap: .1 });
      const vs = [...s.querySelectorAll('.pay .v')], tos = [50, 30, 20], durs = [.7, .55, .45];
      s.querySelectorAll('.pay .pc').forEach((p, i) => c.rise(p, { delay: ts[i], dur: .5, dist: 16 }));
      vs.forEach((v, i) => c.count(v, tos[i], { delay: ts[i], dur: durs[i] }));
      s.querySelectorAll('.pay .lb').forEach((e, i) => c.rise(e, { delay: ts[i] + .2, dur: .5, dist: 12 }));
      c.drawer('.cajonera', { delay: .4 });
    },
    'conclusiones-a'(c, s) {
      // El estante que se abre: la luz encuentra cada conclusión y el cajón se abre (unos 6 s)
      const cj = s.querySelector('.estante');
      c.fade(cj.querySelector('svg'), { dur: .9 });
      if (!REDUCE && !LITE) cj.classList.add('respira');
      s.querySelectorAll('.dr').forEach((d, i) => {
        const t = .35 + i * 1.2;
        c.A(d.querySelector('.front'), [
          { opacity: 0, translate: '0 0' }, { opacity: 1, translate: '0 0', offset: .3 },
          { opacity: 1, translate: '0 0', offset: .5 }, { opacity: 0, translate: '0 -55%' }], { delay: t, dur: 1.1, ease: 'ease-in-out' });
        c.A(d.querySelector('.halo'), [{ opacity: 0 }, { opacity: 1, offset: .35 }, { opacity: .55 }], { delay: t, dur: 1.6 });
        c.A(d.querySelector('.in'), [{ opacity: 0 }, { opacity: 1 }], { delay: t + .6, dur: .45 });
        c.rise([...d.querySelectorAll('.in > *')], { delay: t + .65, stagger: .15, dist: 10, dur: .5 });
      });
      c.fade('.vento', { delay: 5.6, dur: .6 });
    },
    'conclusiones-b'(c, s) {
      // La conversación con Stockus: pregunta, LED, respuesta escrita letra por letra (unos 8,5 s)
      c.fade(s.querySelector('.tenue svg'), { dur: .8 });
      const led = s.querySelector('.led');
      let t = .15;
      c.fade('.q1', { delay: t, dur: .4 });
      t += .3;
      t += c.typeC(s.querySelector('.q1 .tx'), { delay: t, ms: 35 }) + .25;
      c.A(led.querySelector('i'), [{ opacity: 0, scale: '.4' }, { opacity: 1, scale: '1' }], { delay: t, dur: .35 });
      c.A(led.querySelector('.halo'), [{ opacity: 0 }, { opacity: 1 }], { delay: t, dur: .6 });
      t += .3;
      s.querySelectorAll('.a1 .tx').forEach((e) => { t += c.typeC(e, { delay: t, ms: 28 }) + .12; });
      t += .15;
      c.fade('.q2', { delay: t, dur: .4 });
      t += .2;
      t += c.typeC(s.querySelector('.q2 .tx'), { delay: t, ms: 35 }) + .2;
      c.A(led, [{ translate: '0 0' }, { translate: '0 452px' }], { delay: t, dur: .45, ease: EO });
      t += .45;
      c.A(led, [{ scale: '1' }, { scale: '1.4' }, { scale: '1' }], { delay: t, dur: .5 });
      t += .15;
      t += c.typeC(s.querySelector('.a2 .big'), { delay: t, ms: 35 }) + .15;
      t += c.typeC(s.querySelector('.a2 .sub'), { delay: t, ms: 22 }) + .1;
      c.fade('.vento', { delay: t, dur: .5 });
    },
    'cierre'(c, s) {
      c.A(s.querySelector('.halo'), [{ opacity: 0 }, { opacity: 1 }], { dur: 1.4 });
      c.segs('.strip', { delay: .1, gap: .04 });
      c.A(s.querySelector('.gr'), [{ opacity: 0 }, { opacity: 1 }], { delay: .3, dur: 1.4, ease: EO });
      c.rise('.q', { delay: 1.1, dur: .6, dist: 14 });
      c.rise('.iso', { delay: 1.0, dur: .6, dist: 14 });
      if (!REDUCE && !LITE) setTimeout(() => s.querySelector('.halo').classList.add('breathe'), 1600);
    }
  };

  /* ---------- Partículas (máx. 30 puntos, solo diapositivas 2 y 15) ---------- */
  const sprite = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 32;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, 'rgba(79,179,206,1)'); gr.addColorStop(.25, 'rgba(79,179,206,.55)'); gr.addColorStop(1, 'rgba(79,179,206,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
    return c;
  })();
  const particles = {
    raf: 0, canvas: null, pts: [],
    start(canvas) {
      this.stop();
      if (LITE || REDUCE) return;
      this.canvas = canvas;
      const ctx = canvas.getContext('2d');
      this.pts = Array.from({ length: 28 }, () => ({
        x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * 10, vy: -4 - Math.random() * 10,
        r: 5 + Math.random() * 8, a: .12 + Math.random() * .22
      }));
      let last = performance.now();
      const step = (now) => {
        const dt = Math.min(.05, (now - last) / 1000); last = now;
        ctx.clearRect(0, 0, W, H);
        for (const p of this.pts) {
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.y < -20) { p.y = H + 20; p.x = Math.random() * W; }
          if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
          ctx.globalAlpha = p.a;
          ctx.drawImage(sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
        }
        this.raf = requestAnimationFrame(step);
      };
      this.raf = requestAnimationFrame(step);
    },
    stop() { cancelAnimationFrame(this.raf); this.raf = 0; if (this.canvas) this.canvas.getContext('2d').clearRect(0, 0, W, H); }
  };

  /* ---------- Pie ---------- */
  const foot = document.getElementById('foot');
  const bar = foot.querySelector('.bar');
  for (let i = 0; i < N; i++) bar.appendChild(document.createElement('i'));
  function updateFoot(idx) {                  // solo la barra de LEDs: sin texto ni contador
    foot.classList.toggle('on', !NO_FOOT.includes(idx));
    [...bar.children].forEach((b, i) => b.classList.toggle('on', i <= idx));
  }

  /* ---------- La luz viaja ---------- */
  const travel = document.getElementById('travel');
  const dotMain = travel.querySelector('.d');
  const ghosts = Array.from({ length: 7 }, () => { const g = dotMain.cloneNode(); g.removeAttribute('class'); g.className = 'd'; travel.appendChild(g); return g; });
  const ring = document.createElement('div'); ring.className = 'ring'; travel.appendChild(ring);
  let travelRaf = 0, travelRingAnim = null;
  function anchorOf(slide, role) {
    let el = (role && slide.querySelector('[data-key-' + role + ']')) || slide.querySelector('[data-key]');
    if (el && el.classList.contains('cajonera')) el = el.querySelector('.lit');
    if (!el) el = slide.querySelector('.lit');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) return null;
    const sr = stage.getBoundingClientRect();
    return { x: (r.left + r.width / 2 - sr.left) / scale, y: (r.top + r.height / 2 - sr.top) / scale };
  }
  function stopTravel() {
    cancelAnimationFrame(travelRaf); travelRaf = 0;
    [dotMain, ...ghosts].forEach((d) => { d.style.opacity = 0; });
    if (travelRingAnim) { travelRingAnim.cancel(); travelRingAnim = null; }
    ring.style.opacity = 0;
  }
  function runTravel(a, b, dur) {
    stopTravel();
    const start = performance.now();
    const all = [dotMain, ...ghosts];
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      all.forEach((d, i) => {
        const q = Math.max(0, p - i * .035);
        const e = 1 - Math.pow(1 - q, 3);
        const x = a.x + (b.x - a.x) * e, y = a.y + (b.y - a.y) * e;
        d.style.transform = `translate(${x}px,${y}px) scale(${i ? 1 - i * .1 : 1.2})`;
        d.style.opacity = p >= 1 ? 0 : (i ? Math.max(0, .5 - i * .07) : 1) * (q > 0 ? 1 : 0);
      });
      if (p < 1) travelRaf = requestAnimationFrame(step);
      else {
        ring.style.transform = `translate(${b.x}px,${b.y}px)`;
        travelRingAnim = ring.animate([{ opacity: .9, scale: '.3' }, { opacity: 0, scale: '1.6' }], { duration: 420, easing: EI, fill: 'forwards' });
      }
    };
    travelRaf = requestAnimationFrame(step);
  }

  /* ---------- Estado de la presentación ---------- */
  let cur = -1;
  let lockUntil = 0;
  let timerStart = 0;
  let enterAt = Date.now();
  let blackout = false;
  let finishPending = null;
  const black = document.getElementById('blackout');
  const videos = VIDEO_SLIDES.map((i) => slides[i].querySelector('video'));
  videos.forEach((v) => { v.muted = true; v.preload = 'auto'; try { v.load(); } catch (e) { /* sin acción */ } });

  function finishTransition() {
    if (finishPending) { finishPending(); finishPending = null; }
  }

  function go(n, opts = {}) {
    n = Math.max(0, Math.min(N - 1, n));
    if (n === cur) return;
    finishTransition();
    const prev = cur;
    const back = prev >= 0 && n < prev;
    const cut = prev < 0 || opts.cut || (prev === 0 && n === 1) || COLD_CUTS.has(n) || COLD_CUTS.has(prev) || REDUCE;
    const instant = prev < 0 || back || REDUCE || opts.instant;
    cur = n;
    const to = slides[n], from = prev >= 0 ? slides[prev] : null;

    // anclas (antes de ocultar la saliente)
    let a = null, b = null;
    if (!cut) {
      a = anchorOf(from, 'out');
      to.classList.add('active'); to.style.opacity = 0;
      b = anchorOf(to, 'in');
    }
    to.classList.add('active');

    // videos de la diapositiva que sale
    if (prev >= 0 && VIDEO_SLIDES.includes(prev)) {
      const v = slides[prev].querySelector('video'); v.pause(); try { v.currentTime = 0; } catch (e) { /* sin acción */ }
    }

    // coreografía de la entrante
    if (to._ctx) to._ctx.cancel();
    const base = cut ? 0 : .3;
    const ctx = makeCtx(to, instant, base);
    to._ctx = ctx;
    const fn = ENTER[to.id];
    if (fn) fn(ctx, to);
    particles.stop();
    if (to.querySelector('canvas.particles')) particles.start(to.querySelector('canvas.particles'));

    // videos de la entrante
    if (VIDEO_SLIDES.includes(n)) {
      const v = to.querySelector('video');
      try { v.currentTime = 0; } catch (e) { /* sin acción */ }
      if (!blackout) v.play().catch(() => {});
    }

    if (cut || !from) {
      to.style.opacity = '';
      if (from) { from.classList.remove('active', 'leaving'); if (from._ctx) from._ctx.cancel(); }
      slides.forEach((s) => { if (s !== to) { s.classList.remove('active', 'leaving'); } });
    } else {
      from.classList.remove('active'); from.classList.add('leaving');
      const fo = from.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: EO, fill: 'forwards' });
      const fi = to.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 90, easing: EO, fill: 'both' });
      to.style.opacity = '';
      if (a && b) runTravel(a, b, 360);
      const timer = setTimeout(() => finishPending && finishTransition(), 460);
      finishPending = () => {
        clearTimeout(timer);
        fo.cancel(); fi.cancel(); from.classList.remove('leaving');
        if (from._ctx) from._ctx.cancel();
        stopTravel();
      };
    }

    updateFoot(n);
    if (prev === 0 && n === 1 && !timerStart) timerStart = Date.now();
    enterAt = Date.now();
    if (history.replaceState) history.replaceState(null, '', '#' + (n + 1));
    broadcast();
    lockUntil = performance.now() + 350;
  }

  const next = () => go(cur + 1);
  const prevS = () => go(cur - 1);

  function setBlackout(on) {
    blackout = on;
    black.classList.toggle('on', on);
    if (VIDEO_SLIDES.includes(cur)) {
      const v = slides[cur].querySelector('video');
      if (on) v.pause(); else v.play().catch(() => {});
    }
  }

  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {});
  }

  /* ---------- Vista del presentador ---------- */
  let bc = null;
  try { bc = new BroadcastChannel('stockus-presentacion'); } catch (e) { bc = null; }
  function state() { return { type: 'state', idx: cur, n: N, timerStart, enterAt, now: Date.now() }; }
  function broadcast() {
    const s = state();
    if (bc) bc.postMessage(s);
    try { localStorage.setItem('stockus-estado', JSON.stringify(s)); } catch (e) { /* sin acción */ }
  }
  function onMessage(m) {
    if (!m) return;
    if (m.type === 'hello') broadcast();
    else if (m.type === 'key') handleKey(m.key, true);
  }
  if (bc) bc.onmessage = (e) => onMessage(e.data);
  addEventListener('storage', (e) => { if (e.key === 'stockus-comando' && e.newValue) { try { onMessage(JSON.parse(e.newValue)); } catch (err) { /* sin acción */ } } });
  setInterval(broadcast, 1000);
  function openPresenter() {
    const w = window.open('presenter.html', 'stockus-presentador', 'width=1100,height=760');
    if (w) setTimeout(broadcast, 500);
  }

  /* ---------- Teclado y mouse ---------- */
  const NEXT = ['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'];
  const PREV = ['ArrowLeft', 'ArrowUp', 'PageUp'];
  function handleKey(key, remote) {
    if (key === 'Escape') return;
    const isNav = NEXT.includes(key) || PREV.includes(key) || key === 'Home' || key === 'End';
    if (key === '.' || key === 'b' || key === 'B') { setBlackout(!blackout); return; }
    if (key === 'f' || key === 'F') { if (!remote) fullscreen(); return; }
    if (key === 'p' || key === 'P') { if (!remote) openPresenter(); return; }
    if (key === 'r' || key === 'R') { timerStart = cur >= 1 ? Date.now() : 0; broadcast(); return; }
    if (!isNav) return;
    if (performance.now() < lockUntil) return;
    if (blackout) setBlackout(false);
    if (NEXT.includes(key)) next();
    else if (PREV.includes(key)) prevS();
    else if (key === 'Home') go(0);
    else if (key === 'End') go(N - 1);
  }
  addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'F5' || e.key === 'F11' || e.key === 'F12') return;
    if (e.repeat) { e.preventDefault(); return; }
    e.preventDefault();
    handleKey(e.key, false);
  });
  addEventListener('contextmenu', (e) => { e.preventDefault(); if (performance.now() >= lockUntil) { if (blackout) setBlackout(false); prevS(); } });
  addEventListener('mousedown', (e) => { if (e.target.closest && e.target.closest('#fsbtn')) return; });
  addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('#fsbtn')) { fullscreen(); return; }
    if (e.button !== 0) return;
    if (performance.now() < lockUntil) return;
    if (blackout) setBlackout(false);
    next();
  });
  addEventListener('auxclick', (e) => e.preventDefault());
  addEventListener('hashchange', () => {
    const n = parseInt(location.hash.slice(1), 10) - 1;
    if (!isNaN(n) && n !== cur) go(n, { cut: true });
  });

  /* Cursor oculto tras 2 s sin movimiento; botón de pantalla completa solo antes de empezar */
  let idleT = 0;
  addEventListener('mousemove', () => {
    document.body.classList.add('show-cursor');
    document.body.classList.toggle('show-ui', cur === 0);
    clearTimeout(idleT);
    idleT = setTimeout(() => document.body.classList.remove('show-cursor', 'show-ui'), 2000);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && VIDEO_SLIDES.includes(cur)) slides[cur].querySelector('video').pause();
    else if (VIDEO_SLIDES.includes(cur) && !blackout) slides[cur].querySelector('video').play().catch(() => {});
  });

  /* ---------- Arranque ---------- */
  function boot() {
    const n = parseInt(location.hash.slice(1), 10) - 1;
    go(isNaN(n) ? 0 : n, { cut: true, instant: !isNaN(n) && n > 0 });
    if (cur === 0 || isNaN(n)) lockUntil = 0;
    window.STOCKUS = { go, next, prev: prevS, get cur() { return cur; }, lite: LITE };
    document.documentElement.setAttribute('data-listo', '1');
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot); else boot();
})();
