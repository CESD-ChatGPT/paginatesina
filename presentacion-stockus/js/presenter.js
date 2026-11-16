/* Vista del presentador: segunda ventana sincronizada con la principal (BroadcastChannel + localStorage). */
(() => {
  'use strict';
  // Las notas se ordenan y numeran con la lista única de js/orden.js
  const NOTAS = window.ORDEN.map((id, i) => Object.assign({ n: i + 1, id }, window.NOTAS[id] ||
    { titulo: id, bloques: [{ t0: 0, t1: 0, quien: '—', bloque: 'Sin notas', texto: '' }] }));
  const PLAN_T2 = window.PLAN_T2;
  let st = { idx: 0, timerStart: 0, enterAt: 0 };
  let bc = null;
  try { bc = new BroadcastChannel('stockus-presentacion'); } catch (e) { bc = null; }
  const $ = (id) => document.getElementById(id);
  const fmt = (s) => { const a = Math.abs(Math.round(s)); return (s < 0 ? '-' : '') + String(Math.floor(a / 60)).padStart(2, '0') + ':' + String(a % 60).padStart(2, '0'); };
  const mmss = (s) => Math.floor(s / 60) + ':' + String(Math.round(s % 60)).padStart(2, '0');

  function send(msg) {
    if (bc) bc.postMessage(msg);
    try { localStorage.setItem('stockus-comando', JSON.stringify(Object.assign({ ts: Date.now() }, msg))); } catch (e) { /* sin acción */ }
  }
  function apply(m) { if (m && m.type === 'state') { st = m; render(); } }
  if (bc) bc.onmessage = (e) => apply(e.data);
  addEventListener('storage', (e) => { if (e.key === 'stockus-estado' && e.newValue) { try { apply(JSON.parse(e.newValue)); } catch (err) { /* sin acción */ } } });
  try { const s = localStorage.getItem('stockus-estado'); if (s) apply(JSON.parse(s)); } catch (e) { /* sin acción */ }
  send({ type: 'hello' });

  // El cursor de este equipo puede quedar en esta ventana: las teclas del clicker se reenvían a la principal.
  addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (['F5', 'F11', 'F12'].includes(e.key)) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter', 'ArrowLeft', 'ArrowUp', 'PageUp', 'Home', 'End', '.', 'b', 'B', 'r', 'R'].includes(e.key)) {
      e.preventDefault(); send({ type: 'key', key: e.key });
    }
  });

  function render() {
    const nota = NOTAS[st.idx] || NOTAS[0];
    $('num').textContent = 'Diapositiva ' + nota.n + ' de ' + NOTAS.length;
    $('slideTitle').textContent = nota.titulo;
    const el = st.timerStart ? (Date.now() - st.timerStart) / 1000 : 0;
    const blocks = $('blocks');
    blocks.textContent = '';
    nota.bloques.forEach((b) => {
      const rel0 = Math.max(0, b.t0 - PLAN_T2), rel1 = Math.max(0, b.t1 - PLAN_T2);
      const now = st.timerStart && el >= rel0 && el < rel1;
      const d = document.createElement('div');
      d.className = 'bloque' + (now ? ' now' : '');
      const meta = document.createElement('div'); meta.className = 'meta';
      meta.textContent = 'Guion ' + mmss(b.t0) + ' – ' + mmss(b.t1) + ' · ' + b.bloque;
      const q = document.createElement('div'); q.className = 'quien'; q.textContent = b.quien;
      d.append(meta, q);
      if (b.ind) { const i = document.createElement('div'); i.className = 'ind'; i.textContent = '[' + b.ind + ']'; d.append(i); }
      const t = document.createElement('div'); t.className = 'txt' + (b.en ? ' en' : ''); t.textContent = b.texto; d.append(t);
      if (b.ind2) { const i = document.createElement('div'); i.className = 'ind'; i.textContent = '[' + b.ind2 + ']'; d.append(i); }
      blocks.append(d);
    });
    const nx = NOTAS[st.idx + 1];
    $('nextT').textContent = nx ? 'Sigue → ' + nx.n + '. ' + nx.titulo + ' · ' + nx.bloques[0].quien : 'Última diapositiva';
    tick();
  }
  function tick() {
    const nota = NOTAS[st.idx] || NOTAS[0];
    const clock = $('clock');
    if (!st.timerStart) {
      clock.textContent = '10:00'; clock.className = ''; $('elapsed').textContent = 'arranca al pasar de la 1 a la 2'; $('delta').textContent = '';
      return;
    }
    const el = (Date.now() - st.timerStart) / 1000;
    const rem = 600 - el;
    clock.textContent = fmt(rem);
    clock.className = rem < 0 ? 'over' : rem < 60 ? 'low' : '';
    $('elapsed').textContent = 'transcurrido ' + fmt(el);
    const plan = Math.max(0, nota.bloques[0].t0 - PLAN_T2);
    const enter = (st.enterAt - st.timerStart) / 1000;
    const diff = Math.round(enter - plan);
    const d = $('delta');
    if (st.idx <= 1) { d.textContent = ''; return; }
    d.textContent = '';
    const s = document.createElement('span');
    if (Math.abs(diff) <= 3) { s.className = 'ok'; s.textContent = 'EN HORA · entraste a ' + mmss(enter) + ', el guion marca ' + mmss(plan); }
    else if (diff < 0) { s.className = 'ok'; s.textContent = 'ADELANTADO ' + mmss(-diff) + ' · entraste a ' + mmss(enter) + ', el guion marca ' + mmss(plan); }
    else { s.className = 'late'; s.textContent = 'ATRASADO ' + mmss(diff) + ' · entraste a ' + mmss(enter) + ', el guion marca ' + mmss(plan); }
    d.append(s);
  }
  setInterval(() => { tick(); render(); }, 1000);
})();
