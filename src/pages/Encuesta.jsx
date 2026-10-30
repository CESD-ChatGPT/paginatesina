import { useState } from 'react'
import { Link } from 'react-router-dom'

/* Encuesta de estudiantes de secundaria. Las respuestas se envían al
   formulario de Google: quedan en su pestaña Respuestas, con los gráficos
   y el resumen que Forms ya genera. Los identificadores (entry.*) son los
   de ese formulario; si se recrea, hay que actualizarlos acá. */

const FORM_ID = '1FAIpQLSdB32yqJErporlnN2mRoVZX6Mqai__Xt0wDZIsVVU93anO8Bw'
const ENDPOINT = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`

const SECCIONES = [
  {
    titulo: 'Perfil',
    preguntas: [
      { entry: '796898657', texto: '¿En qué año de la secundaria estás?', opciones: ['1° a 3°', '4° a 6°', '7° año'] },
      {
        entry: '2079158814',
        texto: '¿Qué orientación tiene tu escuela?',
        opciones: [
          'Ciencias Naturales',
          'Ciencias Sociales y Humanidades',
          'Economía y Administración',
          'Informática, Robótica o Programación',
          'Agronomía y Ambiente',
          'Comunicación',
          'Lengua',
          'Arte (visuales, música o teatro)',
          'Otra o no lo sé',
        ],
      },
      {
        entry: '1169245877',
        texto: '¿Tenés algún trabajo, o ayudás en un negocio familiar?',
        opciones: ['No', 'Sí, en un comercio o depósito', 'Sí, en otro tipo de trabajo'],
      },
    ],
  },
  {
    titulo: 'Experiencia con materiales y stock',
    preguntas: [
      {
        entry: '2125080448',
        texto:
          '¿Alguna vez te tocó llevar el control de algo en tu escuela o en un proyecto? (cooperadora, centro de estudiantes, taller, feria de ciencias, kiosco escolar)',
        opciones: ['Sí, de forma habitual', 'Sí, alguna vez', 'No'],
      },
      {
        entry: '1665973924',
        texto: '¿Cómo lo llevaron o lo llevan?',
        opciones: [
          'Planilla de cálculo',
          'Cuaderno o papel',
          'Software específico',
          'Conteo manual cuando hace falta',
          'No lo llevamos',
          'No aplica',
        ],
      },
      {
        entry: '915429923',
        texto: '¿Alguna vez faltó un material o producto en el momento que hacía falta?',
        opciones: ['Nunca', 'Algunas veces', 'Seguido'],
      },
      {
        entry: '941291545',
        texto: '¿Alguna vez hubo materiales que se perdieron, se rompieron o se usaron sin anotar?',
        opciones: ['Nunca', 'Algunas veces', 'Seguido'],
      },
      {
        entry: '668228193',
        texto: '¿Qué parte del control te parece más difícil?',
        opciones: [
          'Saber qué hay y dónde está',
          'Saber cuánto y cuándo pedir',
          'Mantener los números al día',
          'Saber quién retiró qué',
          'Otro',
        ],
      },
    ],
  },
  {
    titulo: 'Interés en tecnología',
    preguntas: [
      {
        entry: '1302798601',
        texto: 'Del 1 (nada) al 5 (mucho), ¿qué tanto te interesan la robótica, los sensores o las máquinas que hacen tareas solas?',
        escala: true,
      },
      {
        entry: '634917201',
        texto: '¿Te gustaría participar en proyectos de robótica o electrónica en tu escuela?',
        opciones: ['Sí, ya participo', 'Sí, me interesaría', 'Tal vez', 'No'],
      },
      {
        entry: '1609856626',
        texto: '¿Qué te parecería más útil de un sistema de control de materiales en la escuela?',
        opciones: [
          'Ver desde el celular qué hay disponible',
          'Recibir un aviso cuando falta algo',
          'Saber quién sacó cada cosa',
          'Tener reportes para organizar las compras',
          'Otro',
        ],
      },
      {
        entry: '73624012',
        texto: '¿Te gustaría probar una herramienta así en un proyecto o en la escuela?',
        opciones: ['Sí', 'Tal vez', 'No'],
      },
    ],
  },
  {
    titulo: 'Opinión sobre el uso en la escuela',
    preguntas: [
      {
        entry: '86662909',
        texto: '¿Quién debería decidir si la escuela usa un sistema así?',
        opciones: [
          'La dirección',
          'La cooperadora o el centro de estudiantes',
          'El docente a cargo del taller o laboratorio',
          'Otro',
        ],
      },
      {
        entry: '2078907995',
        texto: '¿Qué te haría dudar más para que la escuela use un sistema así?',
        opciones: [
          'Que no funcione sin internet',
          'Que sea difícil de usar',
          'Que cueste mucho',
          'No confiar en los datos',
          'Otro',
        ],
      },
    ],
  },
]

const TODAS = SECCIONES.flatMap((s) => s.preguntas)

/* Si en la pregunta de experiencia responde "No", las preguntas siguientes
   de esa sección no aplican. Forms hace lo mismo con saltos de página. */
const EXPERIENCIA = '2125080448'
const SI_NO_HAY_EXPERIENCIA = ['1665973924', '915429923', '941291545', '668228193']

export default function Encuesta() {
  const [respuestas, setRespuestas] = useState({})
  const [faltan, setFaltan] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [enviada, setEnviada] = useState(false)

  const ocultas = respuestas[EXPERIENCIA] === 'No' ? SI_NO_HAY_EXPERIENCIA : []
  const visibles = TODAS.filter((p) => !ocultas.includes(p.entry))

  function elegir(entry, valor) {
    setRespuestas((r) => ({ ...r, [entry]: valor }))
  }

  async function enviar(e) {
    e.preventDefault()
    const pendientes = visibles.filter((p) => !respuestas[p.entry])
    if (pendientes.length > 0) {
      setFaltan(true)
      document.getElementById(`pregunta-${pendientes[0].entry}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setFaltan(false)
    setEnviando(true)
    const cuerpo = new URLSearchParams()
    visibles.forEach((p) => cuerpo.append(`entry.${p.entry}`, respuestas[p.entry]))
    try {
      // no-cors: Google no devuelve cabeceras, así que no podemos leer la respuesta.
      await fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', body: cuerpo })
      setEnviada(true)
    } catch {
      setFaltan(false)
      alert('No se pudo enviar. Revisá la conexión e intentá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  if (enviada) {
    return (
      <main className="shell pt-32 pb-24 max-w-[640px]">
        <p className="t-label mb-4">Encuesta</p>
        <h1 className="t-h2 mb-4">Gracias por responder</h1>
        <p className="t-body">Tu respuesta ya quedó registrada. No se guarda ningún dato personal.</p>
        <Link to="/" className="inline-flex items-center min-h-[44px] mt-8 t-mono text-[12px] text-muted hover:text-[var(--accent)]">
          ← Volver a la landing
        </Link>
      </main>
    )
  }

  return (
    <main className="shell pt-32 pb-24 max-w-[760px]">
      <Link to="/" className="t-mono text-[12px] text-muted hover:text-[var(--accent)]">← Volver a la landing</Link>

      <p className="t-label mt-10 mb-3">Encuesta</p>
      <h1 className="t-h2 mb-4">Control de materiales y tecnología en la secundaria</h1>
      <p className="t-body mb-3">
        Tiempo estimado: 3 minutos. Es anónima, no pide datos personales y se usa solo para estadísticas académicas.
      </p>
      {faltan && (
        <p className="t-small mb-6" style={{ color: 'var(--accent)' }} role="alert">
          Falta responder alguna pregunta. La marcamos más arriba.
        </p>
      )}

      <form onSubmit={enviar} noValidate className="mt-10 flex flex-col gap-12">
        {SECCIONES.map((seccion) => (
          <section key={seccion.titulo}>
            <h2 className="t-label mb-6 pb-3 border-b border-rule">{seccion.titulo}</h2>
            <div className="flex flex-col gap-10">
              {seccion.preguntas.filter((p) => !ocultas.includes(p.entry)).map((p) => (
                <fieldset
                  key={p.entry}
                  id={`pregunta-${p.entry}`}
                  className="min-w-0"
                >
                  <legend className="t-body text-[16px] font-medium mb-4">
                    <span className="t-mono text-[12px] text-muted mr-2">{String(TODAS.findIndex((t) => t.entry === p.entry) + 1).padStart(2, '0')}</span>
                    {p.texto}
                  </legend>

                  {p.escala ? (
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <label
                          key={n}
                          className="grid place-items-center w-12 h-12 cursor-pointer border text-[15px]"
                          style={{
                            borderRadius: '2px',
                            borderColor: respuestas[p.entry] === String(n) ? 'var(--accent)' : 'var(--rule-strong)',
                            background: respuestas[p.entry] === String(n) ? 'var(--accent)' : 'var(--surface)',
                            color: respuestas[p.entry] === String(n) ? 'var(--accent-ink)' : 'var(--ink)',
                          }}
                        >
                          <input
                            type="radio"
                            name={`entry.${p.entry}`}
                            value={n}
                            checked={respuestas[p.entry] === String(n)}
                            onChange={() => elegir(p.entry, String(n))}
                            className="sr-only"
                          />
                          {n}
                        </label>
                      ))}
                      <p className="t-mono text-[11px] text-muted w-full mt-2">1 = nada · 5 = mucho</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {p.opciones.map((op) => (
                        <label
                          key={op}
                          className="flex items-center gap-3 min-h-[44px] py-2 cursor-pointer border-t border-rule last:border-b text-[15px]"
                        >
                          <input
                            type="radio"
                            name={`entry.${p.entry}`}
                            value={op}
                            checked={respuestas[p.entry] === op}
                            onChange={() => elegir(p.entry, op)}
                            className="w-4 h-4"
                            style={{ accentColor: 'var(--accent)' }}
                          />
                          {op}
                        </label>
                      ))}
                    </div>
                  )}
                </fieldset>
              ))}
            </div>
          </section>
        ))}

        <div className="flex flex-col gap-3 pt-2">
          <button
            type="submit"
            disabled={enviando}
            className="inline-flex items-center justify-center min-h-[48px] px-6 text-[15px] font-medium disabled:opacity-60"
            style={{ background: 'var(--accent)', color: 'var(--accent-ink)', borderRadius: '2px' }}
          >
            {enviando ? 'Enviando…' : 'Enviar respuestas'}
          </button>
          <p className="t-small text-muted">
            Como las respuestas son de menores, no pedimos nombre ni contacto. Antes de aplicarla conviene pedir autorización a la escuela o a las familias.
          </p>
        </div>
      </form>
    </main>
  )
}
