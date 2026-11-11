import { COUNTRIES, ruleFor } from '../data/countries'
import { DEMAND, DIASPORA_MARKETS } from '../data/demand'
import { PLANTS } from '../data/plants'
import { MONTHS, PRODUCTS } from '../data/products'
import type { Buyer, Country, Product, RuleLevel } from '../data/types'
import { defaultQty } from './pricing'

export type OppType = 'whitespace' | 'cross-sell' | 'upsell'

export interface Opportunity {
  id: string
  product: Product
  country: Country
  type: OppType
  score: number
  potentialUsd: number
  access: RuleLevel
  reasons: string[]
  caution?: string
  buyer?: Buyer
  seasonSoon: boolean
}

export const OPP_TYPE_META: Record<OppType, { label: string; cls: string; hint: string }> = {
  whitespace: { label: 'New market', cls: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200', hint: 'Eligible market with no buyer yet' },
  'cross-sell': { label: 'Cross-sell', cls: 'bg-sky-50 text-sky-800 ring-1 ring-sky-200', hint: 'Existing buyer in market does not buy this yet' },
  upsell: { label: 'Volume upsell', cls: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200', hint: 'Buyer already buys it — grow to full containers' },
}

/** True if any season month falls within the next `ahead` months, including the current one. */
export function seasonWithin(season: number[] | undefined, now: Date, ahead = 4) {
  if (!season) return false
  const m = now.getMonth() + 1
  for (let i = 0; i <= ahead; i++) if (season.includes(((m - 1 + i) % 12) + 1)) return true
  return false
}

export const seasonLabel = (season?: number[]) => (season ? season.map((m) => MONTHS[m - 1]).join(', ') : 'Year-round')

const plantCerts = (p: Product) => PLANTS.filter((pl) => p.plantIds.includes(pl.id)).flatMap((pl) => pl.certifications)

export function computeOpportunities(buyers: Buyer[], now = new Date()): Opportunity[] {
  const out: Opportunity[] = []
  for (const product of PRODUCTS) {
    const certs = plantCerts(product)
    for (const country of COUNTRIES) {
      const rule = ruleFor(country, product.category)
      if (rule.level === 'restricted') continue

      const demand = DEMAND[country.code]?.[product.category] ?? 2
      const duty = country.duty[product.category] ?? 10
      const inMarket = buyers.filter((b) => b.country === country.code && b.status !== 'Dormant')
      const buying = inMarket.filter((b) => b.products.includes(product.id))
      const type: OppType = buying.length ? 'upsell' : inMarket.length ? 'cross-sell' : 'whitespace'
      const seasonSoon = seasonWithin(product.season, now)
      const diaspora = DIASPORA_MARKETS.has(country.code)

      const certFit =
        (country.halalRequired && certs.some((c) => c.startsWith('Halal'))) || (country.code === 'USA' && certs.some((c) => c.startsWith('US FDA')))

      let score =
        demand * 9 + // up to 45
        12 * (1 - Math.min(duty, 30) / 30) + // duty headroom, up to 12
        8 * (1 - Math.min(country.transitDays, 40) / 40) + // proximity, up to 8
        (country.tradeAgreement ? 4 : 0) +
        (seasonSoon ? 5 : 0) +
        (type === 'cross-sell' ? 6 : type === 'upsell' ? 4 : 0) +
        (diaspora && (product.category === 'dairy' || product.category === 'spices' || product.category === 'oils') ? 3 : 0) +
        (certFit ? 3 : 0) +
        (product.exportStatus === 'regular' ? 4 : -4)
      if (rule.level === 'conditional') score *= 0.75
      score = Math.max(1, Math.min(99, Math.round(score)))

      const reasons: string[] = []
      if (demand >= 4) reasons.push(`Strong demand (${demand}/5)`)
      if (duty === 0) reasons.push(country.tradeAgreement ? `0% duty · ${country.tradeAgreement.split(' (')[0]}` : '0% duty')
      else if (country.tradeAgreement) reasons.push(`${country.tradeAgreement.split(' (')[0]} preference`)
      if (country.transitDays <= 10) reasons.push(`${country.transitDays}-day transit`)
      if (seasonSoon) reasons.push(`Season: ${seasonLabel(product.season)}`)
      if (country.halalRequired && certs.some((c) => c.startsWith('Halal'))) reasons.push('Halal-certified plant')
      if (country.code === 'USA' && certs.some((c) => c.startsWith('US FDA'))) reasons.push('US FDA-registered plant')
      if (diaspora) reasons.push('Indian diaspora market')
      if (type === 'cross-sell') reasons.push(`Warm account: ${inMarket[0].name}`)
      if (type === 'upsell') reasons.push(`${buying[0].name} already buys this`)

      // value of one container of this product, times a demand-driven containers-per-year estimate
      const containerValue = defaultQty(product) * product.fobUsd
      const potentialUsd =
        type === 'upsell'
          ? Math.round(Math.max(buying[0].annualValueUsd * 0.15, containerValue * 2))
          : Math.round(containerValue * demand * (type === 'cross-sell' ? 1.6 : 1.2))

      out.push({
        id: `${product.id}:${country.code}`,
        product,
        country,
        type,
        score,
        potentialUsd,
        access: rule.level,
        reasons,
        caution: rule.level === 'conditional' ? rule.note : undefined,
        buyer: buying[0] ?? inMarket[0],
        seasonSoon,
      })
    }
  }
  return out.sort((a, b) => b.score - a.score)
}

/** Sequential single-hue ramp (light → dark brand blue) for opportunity scores. */
export function scoreColor(score: number) {
  const stops = ['#e3f3fb', '#b5def3', '#7cc4ea', '#3ea6dc', '#0a83c2', '#0b5e8f']
  const i = Math.min(stops.length - 1, Math.max(0, Math.floor((score / 100) * stops.length)))
  return stops[i]
}
