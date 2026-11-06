import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { APP_URL } from '../lib/app'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/motion'

/* Página de producto con movimiento por scroll. La estructura se inspira en
   las páginas de producto de gran escala (titulares enormes, escenas fijadas
   que cambian al bajar, galería horizontal, cifras que cuentan), pero el
   texto, las formas y el diseño son propios de SOLVUS.

   MOTION (todo se apaga con prefers-reduced-motion):
     · barra de progreso de lectura arriba
     · titular que se revela palabra por palabra al cargar
     · escenas fijadas: cada una ocupa la pantalla y se reemplaza al bajar
     · texto que se ilumina palabra por palabra según el scroll (scrub)
     · galería horizontal fijada que se desplaza con el scroll
     · cifras que cuentan al entrar
     · tarjetas con inclinación 3D siguiendo el mouse
     · botón final con efecto imán */

const ESCENAS = [
  { kicker: 'Stock', titulo: 'Sabé qué hay y dónde está.', texto: 'Cada SKU, en cada depósito, con un solo número y siempre al día.' },
  { kicker: 'Alertas', titulo: 'Te avisa cuando importa.', texto: 'Solo las excepciones: un faltante, un vencimiento o un movimiento raro.' },
  { kicker: 'Reposición', titulo: 'Pide antes de quedarte sin nada.', texto: 'La orden sugerida la armás vos, con el consumo real como base.' },
]

const TARJETAS = [
  { n: '01', titulo: 'Entradas y salidas', texto: 'Cada movimiento queda registrado con fecha y responsable.' },
  { n: '02', titulo: 'Varios depósitos', texto: 'Compara rotación entre sucursales antes de comprar.' },
  { n: '03', titulo: 'Desde el celular', texto: 'Consultá y ajustá el stock desde donde estés.' },
  { n: '04', titulo: 'Sin internet', texto: 'El registro se guarda y se sincroniza cuando vuelve la conexión.' },
]

const CIFRAS = [
  { to: 3, sufijo: '', label: 'Pasos para empezar' },
  { to: 58, sufijo: ' s', label: 'Video de la campaña' },
  { to: 1, sufijo: '', label: 'Panel para todo el depósito' },
]

const PALABRAS_LECTURA =
  'Un inventario confiable no depende de la memoria de nadie. Depende de registrar cada movimiento, mirar los números a tiempo y decidir con datos.'.split(' ')

export default function Producto() {
  const raiz = useRef(null)
  const barraRef = useRef(null)

  useLayoutEffect(() => {
    const el = raiz.current
    if (!el) return

    if (prefersReducedMotion()) {
      gsap.set(el.querySelectorAll('[data-palabra]'), { clearProps: 'all' })
      return
    }

    const ctx = gsap.context(() => {
      /* Barra de progreso de lectura */
      gsap.to(barraRef.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.2 },
      })

      /* Titular: palabra por palabra al cargar */
      gsap.from(el.querySelectorAll('[data-hero-palabra]'), {
        yPercent: 110,
        opacity: 0,
        duration: 1,
        stagger: 0.07,
        ease: 'power4.out',
        delay: 0.15,
      })
      gsap.from('[data-hero-resto]', { opacity: 0, y: 24, duration: 0.9, delay: 0.7, ease: 'power3.out' })

      /* Escenas fijadas: cada una reemplaza a la anterior al bajar */
      const escenas = gsap.utils.toArray('[data-escena]', el)
      escenas.forEach((escena, i) => {
        if (i === 0) return
        gsap.fromTo(
          escena,
          { autoAlpha: 0, yPercent: 12 },
          {
            autoAlpha: 1,
            yPercent: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: escena,
              start: 'top bottom',
              end: 'top top',
              scrub: true,
            },
          },
        )
      })
      ScrollTrigger.create({
        trigger: '[data-escenas]',
        start: 'top top',
        end: 'bottom bottom',
        pin: '[data-escenas-marco]',
        pinSpacing: false,
      })

      /* Texto que se ilumina con el scroll */
      gsap.fromTo(
        el.querySelectorAll('[data-palabra]'),
        { opacity: 0.18 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: '[data-lectura]', start: 'top 75%', end: 'bottom 45%', scrub: true },
        },
      )

      /* Galería horizontal fijada */
      const pista = el.querySelector('[data-pista]')
      if (pista) {
        const desplazamiento = () => -(pista.scrollWidth - window.innerWidth + 32)
        gsap.to(pista, {
          x: desplazamiento,
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-galeria]',
            start: 'top top',
            end: () => `+=${Math.abs(desplazamiento())}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        })
      }

      /* Cifras que cuentan al entrar */
      gsap.utils.toArray('[data-cifra]', el).forEach((nodo) => {
        const destino = Number(nodo.dataset.cifra)
        const sufijo = nodo.dataset.sufijo || ''
        const cuenta = { v: 0 }
        gsap.to(cuenta, {
          v: destino,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: nodo, start: 'top 85%', once: true },
          onUpdate: () => {
            nodo.textContent = `${Math.round(cuenta.v)}${sufijo}`
          },
        })
      })

      /* Entrada en cascada de bloques */
      gsap.utils.toArray('[data-reveal]', el).forEach((nodo) => {
        gsap.from(nodo, {
          opacity: 0,
          y: 40,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: nodo, start: 'top 88%', once: true },
        })
      })
    }, el)

    /* Tarjetas con inclinación según el mouse */
    const tarjetas = el.querySelectorAll('[data-tilt]')
    const manejadores = []
    tarjetas.forEach((t) => {
      const mover = (e) => {
        const r = t.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        gsap.to(t, { rotateY: x * 10, rotateX: -y * 10, transformPerspective: 800, duration: 0.4, ease: 'power2.out' })
      }
      const salir = () => gsap.to(t, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' })
      t.addEventListener('mousemove', mover)
      t.addEventListener('mouseleave', salir)
      manejadores.push([t, mover, salir])
    })

    /* Botón imán */
    const boton = el.querySelector('[data-iman]')
    const magnetico = (e) => {
      const r = boton.getBoundingClientRect()
      gsap.to(boton, {
        x: (e.clientX - (r.left + r.width / 2)) * 0.25,
        y: (e.clientY - (r.top + r.height / 2)) * 0.35,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
    const soltar = () => gsap.to(boton, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    boton?.addEventListener('mousemove', magnetico)
    boton?.addEventListener('mouseleave', soltar)

    return () => {
      manejadores.forEach(([t, mover, salir]) => {
        t.removeEventListener('mousemove', mover)
        t.removeEventListener('mouseleave', salir)
      })
      boton?.removeEventListener('mousemove', magnetico)
      boton?.removeEventListener('mouseleave', soltar)
      ctx.revert()
    }
  }, [])

  const titular = 'Stock claro, decisiones a tiempo.'.split(' ')

  return (
    <div ref={raiz} className="overflow-x-hidden">
      <div
        ref={barraRef}
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-[3px] z-[60] origin-left"
        style={{ background: 'var(--accent)', transform: 'scaleX(0)' }}
      />
      <Header />

      {/* Titular */}
      <section className="min-h-[100svh] grid place-items-center pt-32 pb-24 px-[16px] text-center">
        <div className="shell">
          <p data-hero-resto className="t-label mb-6">Producto</p>
          <h1 className="t-display max-w-[16ch] mx-auto leading-[0.98]" style={{ fontSize: 'clamp(44px, 9vw, 120px)' }}>
            {titular.map((p, i) => (
              <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.22em]">
                <span data-hero-palabra className="inline-block">{p}</span>
              </span>
            ))}
          </h1>
          <p data-hero-resto className="t-body text-[18px] max-w-[46ch] mx-auto mt-8">
            ChatBot Stock registra cada movimiento y te avisa solo cuando hace falta actuar.
          </p>
          <div data-hero-resto className="mt-10 flex justify-center">
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center min-h-[48px] px-7 text-[15px] font-medium"
              style={{ background: 'var(--accent)', color: 'var(--accent-ink)', borderRadius: '999px' }}
            >
              Abrir ChatBot Stock
            </a>
          </div>
        </div>
      </section>

      {/* Escenas fijadas */}
      <section data-escenas className="relative" style={{ height: `${ESCENAS.length * 100}vh` }}>
        <div data-escenas-marco className="h-[100svh] relative overflow-hidden">
          {ESCENAS.map((e, i) => (
            <div
              key={e.titulo}
              data-escena
              className="absolute inset-0 grid place-items-center px-[16px] text-center"
              style={{ visibility: i === 0 ? 'visible' : 'hidden', opacity: i === 0 ? 1 : 0 }}
            >
              <div className="max-w-[820px]">
                <p className="t-mono text-[13px] text-muted mb-4">{e.kicker}</p>
                <h2 className="t-h2 mb-6" style={{ fontSize: 'clamp(36px, 6vw, 80px)' }}>{e.titulo}</h2>
                <p className="t-body text-[18px] max-w-[40ch] mx-auto">{e.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lectura con iluminación por scroll */}
      <section data-lectura className="shell py-40 px-[16px]">
        <p className="t-h3 max-w-[30ch] mx-auto text-center leading-[1.35]" style={{ fontSize: 'clamp(24px, 3.4vw, 40px)' }}>
          {PALABRAS_LECTURA.map((p, i) => (
            <span key={i} data-palabra className="inline-block mr-[0.28em]">{p}</span>
          ))}
        </p>
      </section>

      {/* Galería horizontal */}
      <section data-galeria className="h-[100svh] flex items-center overflow-hidden">
        <div data-pista className="flex gap-6 px-[16px] will-change-transform">
          {TARJETAS.map((t) => (
            <article
              key={t.n}
              data-tilt
              className="shrink-0 w-[min(80vw,380px)] h-[min(60vh,420px)] p-8 flex flex-col justify-between border border-rule rounded-[12px] bg-[var(--surface)]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <span className="t-mono text-[13px] text-muted">{t.n}</span>
              <div>
                <h3 className="t-h3 mb-3">{t.titulo}</h3>
                <p className="t-body text-[15px]">{t.texto}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Cifras */}
      <section className="shell py-32 px-[16px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {CIFRAS.map((c) => (
            <div key={c.label} data-reveal>
              <p className="t-display" style={{ fontSize: 'clamp(56px, 8vw, 104px)' }}>
                <span data-cifra={c.to} data-sufijo={c.sufijo}>0{c.sufijo}</span>
              </p>
              <p className="t-body text-[15px] mt-3">{c.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cierre */}
      <section className="min-h-[70svh] grid place-items-center px-[16px] pb-32 text-center">
        <div data-reveal className="max-w-[640px]">
          <h2 className="t-h2 mb-8">Probalo con tu propio depósito.</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              data-iman
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center min-h-[48px] px-7 text-[15px] font-medium"
              style={{ background: 'var(--accent)', color: 'var(--accent-ink)', borderRadius: '999px' }}
            >
              Abrir ChatBot Stock
            </a>
            <Link to="/" className="inline-flex items-center min-h-[48px] px-6 t-mono text-[12px] text-muted hover:text-[var(--accent)]">
              ← Volver a la landing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
