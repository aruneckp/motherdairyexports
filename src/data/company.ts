// Company facts sourced from motherdairy.com and published press reports.
// Each fact keeps its source so the portal can show where a number came from.

export const COMPANY = {
  legalName: 'Mother Dairy Fruit & Vegetable Pvt. Ltd.',
  parent: 'Wholly owned subsidiary of the National Dairy Development Board (NDDB)',
  founded: 1974,
  tagline: 'Happy Food. Happy People.',
  exportOffice: {
    address: 'Corporate Office, A-3, Sector-1, Noida – 201301, Uttar Pradesh, India',
    phone: '+91-120-4399519 / 4399500',
    fax: '+91-120-4399527',
    email: 'export@motherdairy.com',
  },
  contacts: [
    {
      role: 'Sales Head – International Business',
      name: 'Aditya Moda',
      email: 'aditya.moda@motherdairy.com',
      phone: '+91-11-44764885',
    },
    {
      role: 'Representative – EU Region',
      name: 'Arvind Kulshrestha (AK Food International)',
      email: 'a.kulshrestha@akfoodinternational.com',
      phone: '+31-651896950',
    },
  ],
}

export interface Fact {
  label: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  detail: string
  source: string
  sourceUrl: string
}

export const FACTS: Fact[] = [
  {
    label: 'FY26 turnover',
    value: 20300,
    prefix: '₹',
    suffix: ' Cr',
    detail: '+17% over FY25; target ₹24,000 Cr in FY27',
    source: 'The Week / PTI, Apr 2026',
    sourceUrl:
      'https://www.theweek.in/wire-updates/business/2026/04/22/mother-dairy-fy26-revenue-rises-17-pc-to-rs-20-300-cr-eyes-rs-24k-cr-turnover-this-fiscal.html',
  },
  {
    label: 'Milk procured daily',
    value: 60,
    suffix: ' lakh L',
    detail: 'Sourced through Milk Producer Organisations',
    source: 'Rural Voice',
    sourceUrl: 'https://eng.ruralvoice.in/mother-dairy-to-achieve-20000-crore-turnover-this-year-manish-bandlish',
  },
  {
    label: 'Export markets',
    value: 40,
    suffix: '',
    detail: 'Safal presence across ~40 countries',
    source: 'Company profile',
    sourceUrl: 'https://www.motherdairy.com/Brands/exports',
  },
  {
    label: 'Processing plants',
    value: 13,
    detail: '9 milk + 4 horticulture plants; Dhara via 16 associated plants',
    source: 'Rural Voice',
    sourceUrl: 'https://eng.ruralvoice.in/mother-dairy-expands-beyond-delhi-ncr-targets-national-market',
  },
]

export const EXPORT_RANGE = [
  'IQF Vegetables',
  'Oilseeds',
  'Fruit Pulp and Concentrates',
  'Gherkins',
  'Fresh Fruits and Vegetables',
  'Dairy Products',
  'Spices',
]

export const BRAND_STYLES = {
  'Mother Dairy': { bg: 'bg-sky-50', text: 'text-md-sky-ink', ring: 'ring-md-sky/30', dot: '#0089C8' },
  Safal: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-300', dot: '#1E9E80' },
  Dhara: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-300', dot: '#D9700A' },
} as const
