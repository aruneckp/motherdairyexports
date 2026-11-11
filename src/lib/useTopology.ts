import { useEffect, useState } from 'react'
import type { Topology } from 'topojson-specification'

const cache: Partial<Record<'110m' | '50m', Topology>> = {}

/** Lazy-loads world-atlas topology so the large 50m file only ships with the map pages. */
export function useTopology(res: '110m' | '50m' = '110m') {
  const [topo, setTopo] = useState<Topology | undefined>(cache[res])
  useEffect(() => {
    if (cache[res]) return
    const load = res === '50m' ? import('world-atlas/countries-50m.json') : import('world-atlas/countries-110m.json')
    load.then((m) => {
      cache[res] = m.default as unknown as Topology
      setTopo(cache[res])
    })
  }, [res])
  return topo
}
