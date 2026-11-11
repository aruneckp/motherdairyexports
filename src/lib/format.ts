import type { BuyerStatus, DealStage, RuleLevel, ShipmentStatus, SupplierStatus } from '../data/types'

export const usd = (n: number, compact = false) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
  }).format(n)

export const num = (n: number) => new Intl.NumberFormat('en-IN').format(n)

export const date = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`

export const DEAL_STAGES: DealStage[] = ['Lead', 'Qualified', 'Sample Sent', 'Negotiation', 'Contract', 'Won', 'Lost']

export const STAGE_PROBABILITY: Record<DealStage, number> = {
  Lead: 0.1,
  Qualified: 0.25,
  'Sample Sent': 0.4,
  Negotiation: 0.6,
  Contract: 0.85,
  Won: 1,
  Lost: 0,
}

export const STAGE_COLOR: Record<DealStage, string> = {
  Lead: 'bg-slate-100 text-slate-700',
  Qualified: 'bg-sky-100 text-sky-800',
  'Sample Sent': 'bg-indigo-100 text-indigo-800',
  Negotiation: 'bg-amber-100 text-amber-800',
  Contract: 'bg-teal-100 text-teal-800',
  Won: 'bg-emerald-100 text-emerald-800',
  Lost: 'bg-rose-100 text-rose-800',
}

export const SHIPMENT_FLOW: ShipmentStatus[] = ['Booked', 'Stuffing', 'Sailed', 'In Transit', 'Arrived', 'Customs Cleared', 'Delivered']

export const BUYER_STATUS_COLOR: Record<BuyerStatus, string> = {
  'Active Multi-Year': 'bg-emerald-100 text-emerald-800',
  'Active Order': 'bg-sky-100 text-sky-800',
  'Under Negotiation': 'bg-amber-100 text-amber-800',
  Prospect: 'bg-indigo-100 text-indigo-800',
  Dormant: 'bg-slate-100 text-slate-600',
}

export const SUPPLIER_STATUS_COLOR: Record<SupplierStatus, string> = {
  'Verified Active': 'bg-emerald-100 text-emerald-800',
  'Audit Pending': 'bg-amber-100 text-amber-800',
  Onboarding: 'bg-sky-100 text-sky-800',
  Suspended: 'bg-rose-100 text-rose-800',
}

export const RULE_STYLE: Record<RuleLevel, { label: string; cls: string; fill: string }> = {
  ok: { label: 'Eligible', cls: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200', fill: '#1E9E80' },
  conditional: { label: 'Conditional', cls: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200', fill: '#D9700A' },
  restricted: { label: 'Restricted', cls: 'bg-rose-50 text-rose-800 ring-1 ring-rose-200', fill: '#D9473A' },
}

/** Validated categorical chart palette (brand-derived, passes CVD + contrast checks on light surface). */
export const CHART_COLORS = ['#0089C8', '#D9700A', '#1E9E80', '#D9473A', '#3D6FB5', '#8A9A2E']

/** Region identity colours: six validated hues plus a neutral slate for the seventh (CIS) region. */
export const REGION_COLOR: Record<string, string> = {
  'GCC & Middle East': CHART_COLORS[0],
  'South Asia': CHART_COLORS[1],
  Europe: CHART_COLORS[2],
  'Asia Pacific': CHART_COLORS[3],
  'North America': CHART_COLORS[4],
  Africa: CHART_COLORS[5],
  CIS: '#64748B',
}

/** India on maps uses brand navy so it never reads as a destination region. */
export const INDIA_FILL = '#184A7C'
