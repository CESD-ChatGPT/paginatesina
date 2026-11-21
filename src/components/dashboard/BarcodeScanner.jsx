import { useEffect, useRef, useState } from 'react'
import { ScanLine, X } from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   ESCANEAR CÓDIGO DE BARRAS

   El conteo físico es la tarea más lenta y más propensa a error del
   depósito. El EAN ya estaba en el modelo; faltaba la forma de
   leerlo sin tipearlo.

   Usa BarcodeDetector, que viene en el navegador y no pesa nada.
   No está en todos lados —hoy sí en Chrome y Edge de Android y
   escritorio, no en Firefox ni en Safari—, así que el componente
   se esconde solo donde no existe en vez de ofrecer un botón que
   no hace nada.

   Decisión: no se carga una librería de respaldo. Las que leen
   códigos por software pesan entre 200 KB y 1 MB y se comen el
   presupuesto del bundle entero para una función que la mitad del
   público va a usar desde un teléfono Android, donde sí está la
   API nativa. Donde no está, se escribe el código a mano como
   hasta ahora.
   ═══════════════════════════════════════════════════════════════ */

const FORMATOS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf']

export function hayEscaner() {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window
}

export default function BarcodeScanner({ onLeido, label = 'Escanear' }) {
  const [abierto, setAbierto] = useState(false)
  const [error, setError] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const pedidoRef = useRef(null)

  function cerrar() {
    if (pedidoRef.current) cancelAnimationFrame(pedidoRef.current)
    pedidoRef.current = null
    /* Soltar la cámara explícitamente: si el stream queda abierto, el
       indicador del teléfono sigue encendido y la batería se va. */
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setAbierto(false)
  }

  useEffect(() => cerrar, [])

  async function abrir() {
    setError('')
    if (!hayEscaner()) {
      setError('Este navegador no puede leer códigos. Probá desde Chrome en Android.')
      return
    }
    setAbierto(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        /* La cámara trasera es la que enfoca de cerca; sin esto los
           teléfonos abren la frontal. */
        video: { facingMode: { ideal: 'environment' } },
      })
      streamRef.current = stream
      const video = videoRef.current
      if (!video) return
      video.srcObject = stream
      await video.play()

      const detector = new window.BarcodeDetector({ formats: FORMATOS })

      const mirar = async () => {
        if (!streamRef.current) return
        try {
          const codigos = await detector.detect(video)
          if (codigos.length) {
            const valor = codigos[0].rawValue
            if (valor) {
              /* Vibrar al leer: en un depósito con ruido es la única
                 confirmación que se percibe sin mirar la pantalla. */
              navigator.vibrate?.(60)
              onLeido?.(valor)
              cerrar()
              return
            }
          }
        } catch {
          /* Un cuadro que no se puede analizar no es un fallo: se
             sigue con el siguiente. */
        }
        pedidoRef.current = requestAnimationFrame(mirar)
      }
      pedidoRef.current = requestAnimationFrame(mirar)
    } catch (e) {
      cerrar()
      setError(
        e?.name === 'NotAllowedError'
          ? 'Hace falta permiso para usar la cámara.'
          : 'No pude abrir la cámara.'
      )
    }
  }

  /* Donde la API no existe el botón no aparece: ofrecer un control
     que no puede funcionar es peor que no ofrecerlo. */
  if (!hayEscaner()) return null

  return (
    <>
      <button
        type="button"
        onClick={abierto ? cerrar : abrir}
        className="inline-flex items-center justify-center gap-2 min-h-[42px] px-3 text-[13px] font-medium border shrink-0"
        style={{ borderColor: 'var(--rule-strong)', borderRadius: '2px' }}
        aria-label={label}
      >
        <ScanLine className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">{label}</span>
      </button>

      {abierto && (
        <div
          role="dialog"
          aria-label="Escanear código de barras"
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 p-5"
          style={{ background: 'rgba(10,10,10,0.92)' }}
        >
          <p className="t-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: '#93a7b1' }}>
            Apuntá al código
          </p>
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full max-w-[460px] bg-black"
            style={{ borderRadius: '3px', aspectRatio: '4 / 3', objectFit: 'cover' }}
          />
          <button
            type="button"
            onClick={cerrar}
            className="inline-flex items-center gap-2 min-h-[44px] px-5 text-[14px] font-medium border"
            style={{ borderColor: '#21506a', borderRadius: '2px', color: '#f2f6f7' }}
          >
            <X className="w-4 h-4" aria-hidden="true" />
            Cancelar
          </button>
        </div>
      )}

      {error && <p className="t-mono text-[11px] w-full" style={{ color: 'var(--alert)' }}>{error}</p>}
    </>
  )
}
