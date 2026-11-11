export type Brand = 'Mother Dairy' | 'Safal' | 'Dhara'

export type TempType = 'ambient' | 'chilled' | 'frozen'

export type CategoryId =
  | 'dairy'
  | 'pulp'
  | 'iqf'
  | 'gherkins'
  | 'fresh'
  | 'oilseeds'
  | 'spices'
  | 'oils'

export interface Product {
  id: string
  name: string
  brand: Brand
  category: CategoryId
  hsCode: string
  tempType: TempType
  tempReq: string
  shelfLife: string
  packs: string
  description: string
  certsRequired: string[]
  specs?: Record<string, string>
  stock: number
  stockUnit: string
  /** Indicative FOB price in USD per stock unit, for estimation only */
  fobUsd: number
  plantIds: string[]
  emoji: string
  /** regular = listed in the official export range; on-request = domestic range offered for export on enquiry */
  exportStatus: 'regular' | 'on-request'
  moq: string
  /** Harvest / production months (1–12) for seasonal products */
  season?: number[]
  /** Gross kg per stock unit when the unit is not kg or litres */
  unitKg?: number
}

export type PlantStatus = 'operational' | 'commissioning' | 'planned'
export type PlantType = 'dairy' | 'safal' | 'dhara' | 'office' | 'port'

export interface Plant {
  id: string
  name: string
  city: string
  state: string
  /** [longitude, latitude] */
  coords: [number, number]
  type: PlantType
  status: PlantStatus
  summary: string
  certifications: string[]
  products: string[]
  source?: string
}

export type RuleLevel = 'ok' | 'conditional' | 'restricted'

export interface MarketRule {
  categories: CategoryId[]
  level: RuleLevel
  note: string
}

export interface Country {
  code: string
  /** ISO 3166-1 numeric id as used by world-atlas */
  isoNum: string
  name: string
  region: Region
  flag: string
  /** Main discharge port [longitude, latitude] */
  coords: [number, number]
  port: string
  tradeAgreement?: string
  halalRequired: boolean
  transitDays: number
  protocols: string
  labeling: string
  authorities: string[]
  /** Indicative MFN/preferential duty % by category */
  duty: Partial<Record<CategoryId, number>>
  rules: MarketRule[]
}

export type Region =
  | 'GCC & Middle East'
  | 'Europe'
  | 'North America'
  | 'Asia Pacific'
  | 'South Asia'
  | 'Africa'
  | 'CIS'

export interface Certification {
  id: string
  name: string
  site: string
  scope: string
  issuer: string
  validTill: string
  verified: boolean
}

export type BuyerStatus = 'Active Multi-Year' | 'Active Order' | 'Under Negotiation' | 'Prospect' | 'Dormant'
export type SupplierStatus = 'Verified Active' | 'Audit Pending' | 'Onboarding' | 'Suspended'

export interface Buyer {
  id: string
  name: string
  country: string
  city: string
  segment: 'Retail Chain' | 'Importer / Distributor' | 'Food Service' | 'Industrial / Beverage' | 'Ethnic Grocery'
  products: string[]
  incoterm: string
  paymentTerms: string
  moq: string
  status: BuyerStatus
  contactPerson: string
  email: string
  phone: string
  annualValueUsd: number
  creditLimitUsd: number
  rating: number
  since: string
  tags: string[]
}

export interface Supplier {
  id: string
  name: string
  state: string
  /** [longitude, latitude] */
  coords: [number, number]
  type: 'Milk Pool / MPO' | 'Fruit & Vegetable Cluster' | 'Oilseeds' | 'Spices' | 'Packaging' | 'Logistics / Cold Chain'
  supplies: string[]
  certifications: string[]
  contactPerson: string
  email: string
  phone: string
  leadTimeDays: number
  rating: number
  onTimePct: number
  qualityPct: number
  status: SupplierStatus
  lastAudit: string
}

export type DealStage = 'Lead' | 'Qualified' | 'Sample Sent' | 'Negotiation' | 'Contract' | 'Won' | 'Lost'

export interface Deal {
  id: string
  title: string
  buyerId: string
  country: string
  productIds: string[]
  valueUsd: number
  stage: DealStage
  owner: string
  expectedClose: string
  createdAt: string
  nextStep: string
}

export type ActivityType = 'call' | 'email' | 'meeting' | 'sample' | 'document' | 'audit'

export interface Activity {
  id: string
  type: ActivityType
  partnerId: string
  partnerKind: 'buyer' | 'supplier'
  subject: string
  note: string
  date: string
  owner: string
  done: boolean
}

export type ShipmentStatus = 'Booked' | 'Stuffing' | 'Sailed' | 'In Transit' | 'Arrived' | 'Customs Cleared' | 'Delivered'

export interface Shipment {
  id: string
  buyerId: string
  productId: string
  quantity: string
  container: string
  pol: string
  pod: string
  country: string
  etd: string
  eta: string
  status: ShipmentStatus
  tempSetC?: number
  valueUsd: number
  docs: { name: string; done: boolean }[]
}
