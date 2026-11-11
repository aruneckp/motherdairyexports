import { geoMercator, geoNaturalEarth1, geoPath, type GeoProjection } from 'd3-geo'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { motion } from 'motion/react'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'

export interface MapMarker {
  id: string
  coords: [number, number]
  color: string
  label: string
  size?: number
  shape?: 'circle' | 'square' | 'diamond'
  pulse?: boolean
  muted?: boolean
  hideLabel?: boolean
  /** Where the label sits relative to the marker (default right) */
  labelSide?: 'right' | 'left' | 'below'
  tooltip?: ReactNode
}

export interface MapArc {
  id: string
  from: [number, number]
  to: [number, number]
  color: string
  width?: number
  dashed?: boolean
}

type CountryProps = { name: string }

interface Props {
  topo: Topology
  width?: number
  height?: number
  /** Fit to [[lonMin, latMin], [lonMax, latMax]]; omit for the whole world */
  bounds?: [[number, number], [number, number]]
  fills?: Record<string, string>
  markers?: MapMarker[]
  arcs?: MapArc[]
  selectedIso?: string | null
  onCountryClick?: (iso: string, name: string) => void
  onMarkerClick?: (id: string) => void
  selectedMarker?: string | null
  /** Zoom center [lon, lat] and factor */
  zoom?: { center: [number, number]; k: number } | null
  showLabels?: boolean
  baseFill?: string
  className?: string
}

export default function GeoMap({
  topo,
  width = 960,
  height = 500,
  bounds,
  fills = {},
  markers = [],
  arcs = [],
  selectedIso,
  onCountryClick,
  onMarkerClick,
  selectedMarker,
  zoom,
  showLabels = false,
  baseFill = '#ffffff',
  className = '',
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<{ x: number; y: number; content: ReactNode } | null>(null)

  const countries = useMemo(
    () => feature(topo, topo.objects.countries as GeometryCollection<CountryProps>) as FeatureCollection<Geometry, CountryProps>,
    [topo],
  )

  const projection: GeoProjection = useMemo(() => {
    if (bounds) {
      const [[x0, y0], [x1, y1]] = bounds
      const box: Feature = {
        type: 'Feature',
        properties: {},
        geometry: { type: 'MultiPoint', coordinates: [[x0, y0], [x1, y1], [x0, y1], [x1, y0]] },
      }
      return geoMercator().fitExtent([[10, 10], [width - 10, height - 10]], box)
    }
    return geoNaturalEarth1().fitExtent([[0, 8], [width, height - 4]], { type: 'Sphere' } as never)
  }, [bounds, width, height])

  const path = useMemo(() => geoPath(projection), [projection])
  const spherePath = useMemo(() => (bounds ? null : path({ type: 'Sphere' } as never)), [bounds, path])

  const k = zoom?.k ?? 1
  const viewBox = useMemo(() => {
    if (!zoom) return `0 0 ${width} ${height}`
    const p = projection(zoom.center) ?? [width / 2, height / 2]
    const w = width / zoom.k
    const h = height / zoom.k
    const x = Math.max(0, Math.min(width - w, p[0] - w / 2))
    const y = Math.max(0, Math.min(height - h, p[1] - h / 2))
    return `${x} ${y} ${w} ${h}`
  }, [zoom, projection, width, height])

  const arcPaths = useMemo(
    () =>
      arcs.map((a) => {
        const s = projection(a.from)
        const t = projection(a.to)
        if (!s || !t) return null
        const mx = (s[0] + t[0]) / 2
        const my = (s[1] + t[1]) / 2
        const dx = t[0] - s[0]
        const dy = t[1] - s[1]
        const dist = Math.hypot(dx, dy)
        // lift the control point perpendicular to the chord so arcs bow upward
        const lift = Math.min(160, dist * 0.35)
        const nx = -dy / (dist || 1)
        const ny = dx / (dist || 1)
        const sign = ny > 0 ? -1 : 1
        const cx = mx + nx * lift * sign
        const cy = my + ny * lift * sign
        return { ...a, d: `M${s[0]},${s[1]} Q${cx},${cy} ${t[0]},${t[1]}` }
      }),
    [arcs, projection],
  )

  const showTip = (e: React.MouseEvent, content: ReactNode) => {
    const r = wrapRef.current?.getBoundingClientRect()
    if (!r) return
    setHover({ x: e.clientX - r.left, y: e.clientY - r.top, content })
  }

  return (
    <div ref={wrapRef} className={`relative ${className}`} onMouseLeave={() => setHover(null)}>
      <motion.svg
        viewBox={`0 0 ${width} ${height}`}
        animate={{ viewBox }}
        transition={{ type: 'spring', stiffness: 90, damping: 20 }}
        className="h-auto w-full select-none"
        role="img"
        aria-label="Map"
      >
        <defs>
          <radialGradient id="ocean" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor="#eaf7fd" />
            <stop offset="100%" stopColor="#d6eef9" />
          </radialGradient>
        </defs>
        {spherePath ? <path d={spherePath} fill="url(#ocean)" /> : <rect width={width} height={height} fill="url(#ocean)" />}
        <g>
          {countries.features.map((f) => {
            const iso = String(f.id)
            const d = path(f)
            if (!d) return null
            const fill = fills[iso]
            const isSel = selectedIso === iso
            const interactive = !!onCountryClick && !!fill
            return (
              <path
                key={iso + f.properties.name}
                d={d}
                fill={fill ?? baseFill}
                fillOpacity={fill ? (isSel ? 1 : 0.78) : 1}
                stroke={isSel ? '#0f2f50' : '#b9d3e3'}
                strokeWidth={(isSel ? 1.4 : 0.5) / k}
                className={interactive ? 'cursor-pointer transition-[fill-opacity] hover:fill-opacity-100' : ''}
                onClick={() => interactive && onCountryClick?.(iso, f.properties.name)}
                onMouseMove={(e) => fill && showTip(e, <span className="font-semibold">{f.properties.name}</span>)}
                onMouseLeave={() => setHover(null)}
              />
            )
          })}
        </g>

        <g fill="none">
          {arcPaths.map((a, i) =>
            a ? (
              <g key={a.id}>
                <motion.path
                  d={a.d}
                  stroke={a.color}
                  strokeWidth={(a.width ?? 1.6) / k}
                  strokeLinecap="round"
                  strokeDasharray={a.dashed ? `${4 / k} ${4 / k}` : undefined}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.85 }}
                  transition={{ duration: 1.4, delay: 0.15 + i * 0.06, ease: 'easeInOut' }}
                />
                <circle r={2.6 / k} fill={a.color}>
                  <animateMotion dur={`${3 + (i % 4)}s`} repeatCount="indefinite" path={a.d} begin={`${1.2 + i * 0.1}s`} />
                </circle>
              </g>
            ) : null,
          )}
        </g>

        <g>
          {markers.map((m, i) => {
            const p = projection(m.coords)
            if (!p) return null
            const r = (m.size ?? 5) / k
            const sel = selectedMarker === m.id
            return (
              <motion.g
                key={m.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: m.muted ? 0.45 : 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.03, type: 'spring', stiffness: 300, damping: 18 }}
                style={{ transformOrigin: `${p[0]}px ${p[1]}px`, transformBox: 'view-box' }}
                className={onMarkerClick ? 'cursor-pointer' : ''}
                onClick={() => onMarkerClick?.(m.id)}
                onMouseMove={(e) => showTip(e, m.tooltip ?? <span className="font-semibold">{m.label}</span>)}
                onMouseLeave={() => setHover(null)}
              >
                {m.pulse && (
                  <circle cx={p[0]} cy={p[1]} r={r} fill={m.color} opacity={0.35}>
                    <animate attributeName="r" from={r} to={r * 3.2} dur="2.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.45" to="0" dur="2.2s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* larger invisible hit target */}
                <circle cx={p[0]} cy={p[1]} r={r * 2.4} fill="transparent" />
                {m.shape === 'square' ? (
                  <rect x={p[0] - r} y={p[1] - r} width={r * 2} height={r * 2} rx={r * 0.3} fill={m.color} stroke="#fff" strokeWidth={1.5 / k} />
                ) : m.shape === 'diamond' ? (
                  <rect x={p[0] - r} y={p[1] - r} width={r * 2} height={r * 2} fill={m.color} stroke="#fff" strokeWidth={1.5 / k} transform={`rotate(45 ${p[0]} ${p[1]})`} />
                ) : (
                  <circle cx={p[0]} cy={p[1]} r={r} fill={m.color} stroke="#fff" strokeWidth={1.5 / k} />
                )}
                {sel && <circle cx={p[0]} cy={p[1]} r={r * 2} fill="none" stroke="#0f2f50" strokeWidth={1.5 / k} />}
                {showLabels && !m.hideLabel && (
                  <text
                    x={m.labelSide === 'left' ? p[0] - r - 3 / k : m.labelSide === 'below' ? p[0] : p[0] + r + 3 / k}
                    y={m.labelSide === 'below' ? p[1] + r + 11 / k : p[1] + 3.5 / k}
                    textAnchor={m.labelSide === 'left' ? 'end' : m.labelSide === 'below' ? 'middle' : 'start'}
                    fontSize={11 / k}
                    fontWeight={700}
                    fill="#0f2f50"
                    stroke="#fff"
                    strokeWidth={3 / k}
                    paintOrder="stroke"
                    className="pointer-events-none"
                  >
                    {m.label}
                  </text>
                )}
              </motion.g>
            )
          })}
        </g>
      </motion.svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 max-w-64 -translate-x-1/2 -translate-y-full rounded-lg bg-md-navy-900 px-2.5 py-1.5 text-xs text-white shadow-lg"
          style={{ left: hover.x, top: hover.y - 10 }}
        >
          {hover.content}
        </div>
      )}
    </div>
  )
}
