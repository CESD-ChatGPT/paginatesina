import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* Punto único de registro de plugins GSAP — evita registrar ScrollTrigger
   más de una vez si varios componentes lo importan. */
gsap.registerPlugin(ScrollTrigger)

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export { gsap, ScrollTrigger }
