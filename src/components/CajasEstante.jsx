import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/motion'

/* Las cajas de "Stockus, de SOLVUS": cada diferencial es una caja apoyada
   en un estante. Con el mouse o el dedo se pueden agarrar, tirar y apilar.

   Física (matter-js, cargada recién cuando la sección está por entrar en
   pantalla): gravedad, fricción y choques entre cajas, así que no se pisan.
   El recinto tiene piso, techo y paredes a la medida de la sección, y el
   puntero no puede arrastrar una caja fuera de él. El contenido sigue siendo
   HTML: cada caja es un elemento que se mueve con transform.

   Hay cuatro estantes (dos arriba y dos abajo) con una caja en cada uno. Las
   cajas no giran. En táctil solo se agarra de la manija (arriba a la derecha), para no trabar el
   scroll de la página. Con reducción de movimiento las cajas quedan quietas
   en su lugar y no se pueden mover. */

const SEPARACION = 12
const GROSOR = 14

/* Calcula dónde va cada caja y el tamaño del recinto: cuatro estantes en dos
   filas, uno arriba a la izquierda, uno arriba a la derecha y los dos de
   abajo, con una caja en cada uno. Mide la altura real de cada caja con el
   ancho que le toca, porque el texto cambia de alto. */
function disponer(ancho, cajas) {
  const mitad = ancho / 2
  const ranura = 12 // separación entre los dos estantes de una fila
  const largo = mitad - ranura / 2
  const cajaW = Math.floor(Math.min(340, largo - SEPARACION * 2))

  cajas.forEach((el) => {
    el.style.width = cajaW + 'px'
  })
  const alturas = cajas.map((el) => Math.ceil(el.offsetHeight))

  const estantes = []
  const lugares = []
  let y = 40
  ;[[0, 1], [2, 3]].forEach((fila) => {
    const alto = Math.max(...fila.map((i) => alturas[i]))
    const yEstante = y + alto
    fila.forEach((i, k) => {
      const izquierda = k === 0
      const desde = izquierda ? 0 : mitad + ranura / 2
      const hasta = izquierda ? mitad - ranura / 2 : ancho
      estantes.push({ y: yEstante, desde, hasta, lado: izquierda ? 'izq' : 'der' })
      lugares[i] = { x: (desde + hasta) / 2, y: yEstante - alturas[i] / 2 }
    })
    y = yEstante + GROSOR + 56
  })
  return { ancho, alto: y - 56 + GROSOR + 20, cajaW, alturas, estantes, lugares }
}

export default function CajasEstante({ cajas }) {
  const recinto = useRef(null)
  const elementos = useRef([])
  const mundoRef = useRef(null)
  const [conFisica, setConFisica] = useState(false)

  useEffect(() => {
    const cont = recinto.current
    const els = elementos.current.filter(Boolean)
    if (!cont || els.length !== cajas.length) return

    const reducir = prefersReducedMotion()
    let cancelado = false
    let mundo = null
    let anchoActual = 0
    let visible = true
    let iniciado = false

    function colocarEstantes(plano) {
      cont.style.height = plano.alto + 'px'
      cont.querySelectorAll('[data-estante]').forEach((n) => n.remove())
      const pieza = (estilo) => {
        const n = document.createElement('div')
        n.setAttribute('data-estante', '')
        n.setAttribute('aria-hidden', 'true')
        Object.assign(n.style, { position: 'absolute', background: 'var(--graphite)', pointerEvents: 'none' }, estilo)
        cont.prepend(n)
      }
      plano.estantes.forEach((e) => {
        pieza({ left: e.desde + 'px', top: e.y + 'px', width: e.hasta - e.desde + 'px', height: GROSOR + 'px', borderRadius: '2px' })
        // Ménsula del lado de la pared, para que se lea como estante y no como línea.
        pieza({
          left: e.lado === 'izq' ? '0px' : plano.ancho - 10 + 'px',
          top: e.y + GROSOR + 'px',
          width: '10px',
          height: '26px',
          borderRadius: '0 0 2px 2px',
        })
      })
    }

    function posarFijas(plano) {
      els.forEach((el, i) => {
        const l = plano.lugares[i]
        el.style.transform = `translate(${l.x - plano.cajaW / 2}px, ${l.y - plano.alturas[i] / 2}px)`
      })
    }

    async function armar() {
      const ancho = Math.round(cont.getBoundingClientRect().width)
      if (ancho < 200) return
      anchoActual = ancho
      const plano = disponer(ancho, els)
      colocarEstantes(plano)
      if (reducir) {
        posarFijas(plano)
        return
      }
      if (!mundo) {
        const Matter = (await import('matter-js')).default
        if (cancelado) return
        mundo = crearMundo(Matter, cont, els)
        mundo.visible = visible
        mundoRef.current = mundo
        setConFisica(true)
      }
      mundo.cargar(plano)
    }

    const alCambiar = new ResizeObserver(() => {
      const ancho = Math.round(cont.getBoundingClientRect().width)
      if (ancho !== anchoActual) armar()
    })

    // La física se carga cuando la sección está por entrar en pantalla.
    const alVer = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting
        if (mundo) mundo.visible = visible
        if (e.isIntersecting && !iniciado) {
          iniciado = true
          armar()
          alCambiar.observe(cont)
        }
      },
      { rootMargin: '300px' },
    )
    alVer.observe(cont)

    return () => {
      cancelado = true
      alVer.disconnect()
      alCambiar.disconnect()
      if (mundo) mundo.destruir()
      mundoRef.current = null
    }
  }, [cajas])

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <p className="t-mono text-[11px] text-muted">Arrastrá las cajas. No salen del estante ni se pisan.</p>
        {conFisica && (
          <button type="button" onClick={() => mundoRef.current?.reordenar()} className="btn-neo">
            <span>Ordenar cajas</span>
          </button>
        )}
      </div>
      <div
        ref={recinto}
        className="relative w-full overflow-hidden select-none"
        style={{ border: '1px solid var(--rule)', borderRadius: 3, background: 'var(--surface-sunken)', minHeight: 320 }}
      >
        {cajas.map(({ titulo, texto }, i) => (
          <article
            key={titulo}
            ref={(el) => (elementos.current[i] = el)}
            data-caja
            className="absolute top-0 left-0"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--rule-strong)',
              borderRadius: 2,
              padding: '22px 14px 14px',
              cursor: 'grab',
              touchAction: 'pan-y',
              willChange: 'transform',
              boxShadow: '0 1px 0 var(--rule)',
              boxSizing: 'border-box',
            }}
          >
            {/* Cinta de la caja */}
            <span
              aria-hidden="true"
              style={{ position: 'absolute', top: 0, left: '50%', width: 36, height: 10, marginLeft: -18, background: 'var(--accent)', opacity: 0.35 }}
            />
            {/* Manija: en táctil es lo único que se agarra */}
            <span
              data-manija
              aria-hidden="true"
              style={{ position: 'absolute', top: 4, right: 4, width: 28, height: 24, display: 'grid', placeItems: 'center', touchAction: 'none', color: 'var(--muted)', fontSize: 14, lineHeight: 1, cursor: 'grab' }}
            >
              ⠿
            </span>
            <h3 className="t-h3 mb-1.5" style={{ fontSize: 16, lineHeight: 1.25 }}>{titulo}</h3>
            <p className="t-body" style={{ fontSize: 13, lineHeight: 1.45 }}>{texto}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

/* Mundo físico: un cuerpo por caja, estantes fijos y un recinto cerrado.
   Devuelve cargar(plano) para armar o rearmar la escena, y destruir(). */
function crearMundo(Matter, cont, els) {
  const { Engine, Bodies, Body, Composite, Constraint, Sleeping } = Matter
  const engine = Engine.create({ enableSleeping: true })
  engine.gravity.y = 1.1
  const mundo = {}
  let visibleInterno = true

  let cuerpos = []
  let fijos = []
  let plano = null
  let raf = 0
  let ultimo = 0
  let acumulado = 0
  let arrastre = null

  function sincronizar() {
    cuerpos.forEach((c, i) => {
      const { x, y } = c.position
      els[i].style.transform = `translate(${x - plano.cajaW / 2}px, ${y - plano.alturas[i] / 2}px)`
    })
  }

  function limitarVelocidad() {
    cuerpos.forEach((c) => {
      const v = c.velocity
      const rapidez = Math.hypot(v.x, v.y)
      if (rapidez > 20) Body.setVelocity(c, { x: (v.x / rapidez) * 20, y: (v.y / rapidez) * 20 })
    })
  }

  /* Red de seguridad: si una caja llegara a asomar fuera del recinto (por
     ejemplo al tirar con mucha fuerza contra una esquina), se la devuelve. */
  function contener() {
    cuerpos.forEach((c) => {
      const { min, max } = c.bounds
      let dx = 0
      let dy = 0
      if (min.x < 0) dx = -min.x
      else if (max.x > plano.ancho) dx = plano.ancho - max.x
      if (min.y < 0) dy = -min.y
      else if (max.y > plano.alto) dy = plano.alto - max.y
      if (dx || dy) {
        Body.translate(c, { x: dx, y: dy })
        Body.setVelocity(c, { x: dx ? 0 : c.velocity.x, y: dy ? 0 : c.velocity.y })
      }
    })
  }

  /* Si se amontonan más cajas de las que entran en una columna, el choque
     contra el techo puede dejarlas trabadas una sobre otra, sin salida. Si una
     caja sigue pisando a otra por casi un segundo (y no la sostiene el puntero),
     vuelve a un estante libre. Así nunca queda una pila imposible. */
  let trabada = []
  function resolverTrabadas() {
    const sostenida = arrastre ? arrastre.resorte.bodyB : null
    const pisa = (a, bounds) => {
      const ox = Math.min(a.bounds.max.x, bounds.max.x) - Math.max(a.bounds.min.x, bounds.min.x)
      const oy = Math.min(a.bounds.max.y, bounds.max.y) - Math.max(a.bounds.min.y, bounds.min.y)
      return ox >= 8 && oy >= 8
    }
    let hay = false
    cuerpos.forEach((c, i) => {
      if (c === sostenida) {
        trabada[i] = 0
        return
      }
      const otras = cuerpos.filter((o, j) => j !== i)
      // Solo la de arriba del par es la que se mueve.
      const encima = otras.some((o) => o !== sostenida && pisa(c, o.bounds) && c.position.y <= o.position.y)
      if (!encima) {
        trabada[i] = 0
        return
      }
      hay = true
      trabada[i] = (trabada[i] || 0) + 1
      if (trabada[i] < 45) return
      trabada[i] = 0
      const { cajaW, alturas } = plano
      const libre = [i, ...plano.lugares.keys()].find((k) => {
        const l = plano.lugares[k]
        const caja = { min: { x: l.x - cajaW / 2, y: l.y - alturas[i] / 2 }, max: { x: l.x + cajaW / 2, y: l.y + alturas[i] / 2 } }
        return !otras.some((o) => pisa({ bounds: caja }, o.bounds))
      })
      if (libre == null) return
      const l = plano.lugares[libre]
      Body.setPosition(c, { x: l.x, y: l.y - (libre === i ? 0 : (alturas[i] - alturas[libre]) / 2) })
      Body.setVelocity(c, { x: 0, y: 0 })
      Sleeping.set(c, false)
    })
    return hay
  }

  function paso(ts) {
    raf = 0
    if (!mundo.visible) {
      ultimo = 0
      return
    }
    if (!ultimo) ultimo = ts
    acumulado += Math.min(50, ts - ultimo)
    ultimo = ts
    // Dos subpasos por cuadro: con las tablas finas, una caja rápida no las atraviesa.
    while (acumulado >= 1000 / 120) {
      Engine.update(engine, 1000 / 120)
      limitarVelocidad()
      contener()
      acumulado -= 1000 / 120
    }
    const hayTrabadas = resolverTrabadas()
    sincronizar()
    const todosQuietos = cuerpos.every((c) => c.isSleeping)
    if (arrastre || hayTrabadas || !todosQuietos) raf = requestAnimationFrame(paso)
    else ultimo = 0
  }

  function despertar() {
    cuerpos.forEach((c) => Sleeping.set(c, false))
    if (!raf) raf = requestAnimationFrame(paso)
  }

  function cargar(nuevo) {
    plano = nuevo
    soltar()
    Composite.clear(engine.world, false)
    const grosor = 400
    const { ancho, alto } = plano
    fijos = [
      // piso, techo y paredes del recinto: nada sale de la sección
      Bodies.rectangle(ancho / 2, alto + grosor / 2, ancho + grosor * 2, grosor, { isStatic: true, friction: 0.9 }),
      Bodies.rectangle(ancho / 2, -grosor / 2, ancho + grosor * 2, grosor, { isStatic: true }),
      Bodies.rectangle(-grosor / 2, alto / 2, grosor, alto * 3, { isStatic: true, friction: 0.2 }),
      Bodies.rectangle(ancho + grosor / 2, alto / 2, grosor, alto * 3, { isStatic: true, friction: 0.2 }),
      ...plano.estantes.map((e) =>
        Bodies.rectangle((e.desde + e.hasta) / 2, e.y + GROSOR / 2, e.hasta - e.desde, GROSOR, { isStatic: true, friction: 0.9 }),
      ),
    ]
    trabada = []
    cuerpos = els.map((_, i) => {
      const l = plano.lugares[i]
      const cuerpo = Bodies.rectangle(l.x, l.y, plano.cajaW, plano.alturas[i], {
        friction: 0.6,
        frictionStatic: 0.9,
        restitution: 0.08,
        frictionAir: 0.02,
        density: 0.002,
        sleepThreshold: 45,
        slop: 0.02,
      })
      // Las cajas no giran: se deslizan y se apilan, pero no se dan vuelta.
      Body.setInertia(cuerpo, Infinity)
      return cuerpo
    })
    Composite.add(engine.world, [...fijos, ...cuerpos])
    sincronizar()
    despertar()
  }

  /* Agarrar: un resorte entre el puntero y el punto de la caja donde se tocó. */
  function soltar() {
    if (!arrastre) return
    Composite.remove(engine.world, arrastre.resorte)
    arrastre = null
  }

  function posicionEnRecinto(e) {
    const r = cont.getBoundingClientRect()
    return {
      x: Math.min(plano.ancho - 4, Math.max(4, e.clientX - r.left)),
      y: Math.min(plano.alto - 4, Math.max(4, e.clientY - r.top)),
    }
  }

  const oyentes = []
  els.forEach((el, i) => {
    const alBajar = (e) => {
      if (!plano || (e.pointerType === 'touch' && !e.target.closest('[data-manija]'))) return
      if (e.button != null && e.button > 0) return
      e.preventDefault()
      try {
        el.setPointerCapture(e.pointerId)
      } catch {
        // sin captura, el seguimiento sigue por los eventos de la propia caja
      }
      soltar()
      const cuerpo = cuerpos[i]
      const p = posicionEnRecinto(e)
      const dx = p.x - cuerpo.position.x
      const dy = p.y - cuerpo.position.y
      const a = -cuerpo.angle
      const resorte = Constraint.create({
        pointA: p,
        bodyB: cuerpo,
        pointB: { x: dx * Math.cos(a) - dy * Math.sin(a), y: dx * Math.sin(a) + dy * Math.cos(a) },
        stiffness: 0.12,
        damping: 0.12,
        length: 0,
      })
      Composite.add(engine.world, resorte)
      arrastre = { resorte, id: e.pointerId, el }
      el.style.cursor = 'grabbing'
      el.style.zIndex = '2'
      despertar()
    }
    const alMover = (e) => {
      if (!arrastre || arrastre.id !== e.pointerId || arrastre.el !== el) return
      arrastre.resorte.pointA = posicionEnRecinto(e)
      despertar()
    }
    const alSoltar = (e) => {
      if (!arrastre || arrastre.id !== e.pointerId || arrastre.el !== el) return
      try {
        el.releasePointerCapture(e.pointerId)
      } catch {
        // ya estaba liberado
      }
      el.style.cursor = 'grab'
      el.style.zIndex = ''
      soltar()
      despertar()
    }
    el.addEventListener('pointerdown', alBajar)
    el.addEventListener('pointermove', alMover)
    el.addEventListener('pointerup', alSoltar)
    el.addEventListener('pointercancel', alSoltar)
    oyentes.push([el, alBajar, alMover, alSoltar])
  })

  function destruir() {
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    oyentes.forEach(([el, b, m, s]) => {
      el.removeEventListener('pointerdown', b)
      el.removeEventListener('pointermove', m)
      el.removeEventListener('pointerup', s)
      el.removeEventListener('pointercancel', s)
    })
    Composite.clear(engine.world, false)
    Engine.clear(engine)
  }

  Object.defineProperty(mundo, 'visible', {
    get: () => visibleInterno,
    set: (v) => {
      visibleInterno = v
      if (v && cuerpos.length && !raf) raf = requestAnimationFrame(paso)
    },
  })
  mundo.cargar = cargar
  mundo.reordenar = () => plano && cargar(plano)
  mundo.destruir = destruir
  return mundo
}
