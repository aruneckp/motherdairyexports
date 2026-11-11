import { productById } from '../data/products'
import type { Country, Product } from '../data/types'

export type ContainerKind = 'dry' | 'reefer'

export const CONTAINERS: Record<ContainerKind, { label: string; kg: number }> = {
  dry: { label: "20' dry", kg: 18000 },
  reefer: { label: "40' reefer", kg: 24000 },
}

/** Volume tiers measured in container-equivalents across the whole order. */
export const TIERS = [
  { min: 0, discount: 0, label: 'Trial / LCL' },
  { min: 0.5, discount: 0.02, label: 'Half load' },
  { min: 1, discount: 0.05, label: 'Full container' },
  { min: 3, discount: 0.08, label: 'Multi-container' },
]

export function kgPerUnit(p: Product) {
  if (p.unitKg) return p.unitKg
  if (p.stockUnit === 'litres') return 0.92
  return 1
}

export const unitLabel = (p: Product) => (p.stockUnit === 'litres' ? 'litre' : p.stockUnit.replace(/s$/, ''))

export const unitPlural = (p: Product) => (unitLabel(p) === 'kg' ? 'kg' : `${unitLabel(p)}s`)

export const containerFor = (p: Product): ContainerKind => (p.tempType === 'ambient' ? 'dry' : 'reefer')

/** Default order quantity: one container of this product alone. */
export const defaultQty = (p: Product) => Math.round(CONTAINERS[containerFor(p)].kg / kgPerUnit(p) / 10) * 10

export function seaFreightPerKg(transitDays: number, kind: ContainerKind) {
  const base = 0.035 + transitDays * 0.0018
  return kind === 'reefer' ? base * 2.2 : base
}

export interface BasketItem {
  productId: string
  qty: number
}

export function planBasket(items: BasketItem[], country?: Country) {
  const lines = items
    .map((i) => ({ ...i, product: productById(i.productId)! }))
    .filter((l) => l.product && l.qty > 0)
    .map((l) => ({ ...l, kg: l.qty * kgPerUnit(l.product), kind: containerFor(l.product) }))

  const groups = (['dry', 'reefer'] as ContainerKind[])
    .map((kind) => {
      const kg = lines.filter((l) => l.kind === kind).reduce((s, l) => s + l.kg, 0)
      const equiv = kg / CONTAINERS[kind].kg
      return { kind, kg, equiv, containers: Math.ceil(equiv - 1e-9), fill: equiv % 1 === 0 && equiv > 0 ? 1 : equiv % 1 }
    })
    .filter((g) => g.kg > 0)

  const equiv = groups.reduce((s, g) => s + g.equiv, 0)
  const tier = [...TIERS].reverse().find((t) => equiv >= t.min) ?? TIERS[0]
  const next = TIERS.find((t) => t.min > equiv)
  const mainKind = groups.sort((a, b) => b.kg - a.kg)[0]?.kind ?? 'dry'
  const kgToNext = next ? Math.ceil((next.min - equiv) * CONTAINERS[mainKind].kg) : 0

  const priced = lines.map((l) => {
    const unit = l.product.fobUsd * (1 - tier.discount)
    const freightUnit = country ? seaFreightPerKg(country.transitDays, l.kind) * kgPerUnit(l.product) : 0
    const insuranceUnit = (unit + freightUnit) * 1.1 * 0.003
    const cifUnit = unit + freightUnit + insuranceUnit
    return { ...l, listUnit: l.product.fobUsd, unit, cifUnit, fobTotal: unit * l.qty, cifTotal: cifUnit * l.qty }
  })

  const listTotal = priced.reduce((s, l) => s + l.listUnit * l.qty, 0)
  const fobTotal = priced.reduce((s, l) => s + l.fobTotal, 0)
  const cifTotal = priced.reduce((s, l) => s + l.cifTotal, 0)

  return { lines: priced, groups, equiv, tier, next, kgToNext, mainKind, listTotal, fobTotal, cifTotal, savings: listTotal - fobTotal }
}
