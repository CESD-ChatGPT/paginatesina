import { useState, useMemo, useId } from 'react'

/* Demanda observada vs proyectada.
   FORMA: línea (tendencia temporal).
   COLOR: énfasis — la proyección (lo que el producto aporta) lleva el
   acento; lo observado es contexto en gris. No es categórico: es la
   misma métrica partida por certeza, así que además se distingue por
   trazo (continuo vs punteado), no solo por color. */

const W = 640
const H = 220
const PAD = { top: 16, right: 16, bottom: 28, left: 40 }

const monthLabel = (t) => {
  const [y, m] = t.split('-')
  return `${['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][+m - 1]} ${y.slice(2)}`
}

export default function DemandChart({ observed, forecast, unitLabel = 'unidades' }) {
  const [hover, setHover] = useState(null)
  const clipId = useId()

  const { points, scaleX, scaleY, ticks, obsPath, fcPath, splitX } = useMemo(() => {
    const all = [
      ...observed.map((d) => ({ ...d, kind: 'obs' })),
      ...forecast.map((d) => ({ ...d, kind: 'fc' })),
    ]
    const max = Math.max(...all.map((d) => d.v))
    const niceMax = Math.ceil(max / 20) * 20

    const sx = (i) => PAD.left + (i * (W - PAD.left - PAD.right)) / (all.length - 1)
    const sy = (v) => PAD.top + (1 - v / niceMax) * (H - PAD.top - PAD.bottom)

    const pts = all.map((d, i) => ({ ...d, x: sx(i), y: sy(d.v), i }))
    const line = (arr) => arr.map((p) => `${p.x},${p.y}`).join(' ')

    const obs = pts.filter((p) => p.kind === 'obs')
    const fc = pts.filter((p) => p.kind === 'fc')

    return {
      points: pts,
      scaleX: sx,
      scaleY: sy,
      ticks: [0, niceMax / 2, niceMax],
      obsPath: line(obs),
      // la proyección arranca en el último punto observado para que no haya salto
      fcPath: line([obs[obs.length - 1], ...fc]),
      splitX: obs[obs.length - 1].x,
    }
  }, [observed, forecast])

  function handleMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * W
    let nearest = points[0]
    for (const p of points) {
      if (Math.abs(p.x - x) < Math.abs(nearest.x - x)) nearest = p
    }
    setHover(nearest)
  }

  return (
    <div className="relative">
      {/* Leyenda: siempre presente con 2 series */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mb-3">
        <span className="inline-flex items-center gap-2 t-mono text-[11px] text-graphite">
          <span className="w-4 h-0.5" style={{ background: 'var(--chart-context)' }} aria-hidden="true" />
          Observado
        </span>
        <span className="inline-flex items-center gap-2 t-mono text-[11px] text-graphite">
          <span
            className="w-4 h-0.5"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to right, var(--accent) 0 4px, transparent 4px 7px)',
            }}
            aria-hidden="true"
          />
          Proyectado
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto touch-none"
        role="img"
        aria-label={`Demanda mensual en ${unitLabel}. ${observed.length} meses observados, con una proyección de ${forecast.length} meses que continúa la tendencia al alza.`}
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
        onTouchStart={handleMove}
        onTouchMove={handleMove}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={PAD.left} y={0} width={W - PAD.left - PAD.right} height={H} />
          </clipPath>
        </defs>

        {/* Grilla recesiva */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              y1={scaleY(t)}
              x2={W - PAD.right}
              y2={scaleY(t)}
              stroke="var(--chart-grid)"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 8}
              y={scaleY(t) + 4}
              textAnchor="end"
              className="t-mono"
              fontSize="10"
              fill="var(--muted)"
            >
              {t}
            </text>
          </g>
        ))}

        {/* Corte observado | proyectado */}
        <line
          x1={splitX}
          y1={PAD.top}
          x2={splitX}
          y2={H - PAD.bottom}
          stroke="var(--rule-strong)"
          strokeWidth="1"
        />
        <text
          x={splitX + 5}
          y={PAD.top + 9}
          className="t-mono"
          fontSize="9"
          fill="var(--muted)"
        >
          hoy
        </text>

        <g clipPath={`url(#${clipId})`}>
          <polyline points={obsPath} fill="none" stroke="var(--chart-context)" strokeWidth="2" />
          <polyline
            points={fcPath}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeDasharray="5 4"
          />
        </g>

        {/* Etiquetas de eje X: solo extremos y corte, para no saturar */}
        {[points[0], points[points.length - 1]].map((p, i) => (
          <text
            key={p.t}
            x={p.x}
            y={H - 8}
            textAnchor={i === 0 ? 'start' : 'end'}
            className="t-mono"
            fontSize="10"
            fill="var(--muted)"
          >
            {monthLabel(p.t)}
          </text>
        ))}

        {/* Capa de hover */}
        {hover && (
          <g pointerEvents="none">
            <line
              x1={hover.x}
              y1={PAD.top}
              x2={hover.x}
              y2={H - PAD.bottom}
              stroke="var(--muted)"
              strokeWidth="1"
            />
            <circle
              cx={hover.x}
              cy={hover.y}
              r="5"
              fill={hover.kind === 'fc' ? 'var(--accent)' : 'var(--chart-context)'}
              stroke="var(--surface)"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      {/* Tooltip en HTML: hereda tipografía y tokens del sistema */}
      {hover && (
        <div
          className="absolute pointer-events-none px-2.5 py-1.5 border shadow-sm"
          style={{
            left: `${(hover.x / W) * 100}%`,
            top: 0,
            transform: `translateX(${hover.x > W * 0.7 ? '-105%' : '5%'})`,
            background: 'var(--surface)',
            borderColor: 'var(--rule-strong)',
            borderRadius: '2px',
            whiteSpace: 'nowrap',
          }}
          role="status"
        >
          <p className="t-mono text-[10px] text-muted">{monthLabel(hover.t)}</p>
          <p className="t-figure text-[13px] text-ink">
            {hover.v} <span className="text-muted text-[11px]">u.</span>
          </p>
          <p className="t-mono text-[10px]" style={{ color: hover.kind === 'fc' ? 'var(--accent)' : 'var(--muted)' }}>
            {hover.kind === 'fc' ? 'proyectado' : 'observado'}
          </p>
        </div>
      )}
    </div>
  )
}
