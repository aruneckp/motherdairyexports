import type { Activity, Buyer, Deal, Shipment, Supplier } from './types'

// Demo CRM records. Company and person names are fictional placeholders
// to be replaced with the real buyer and supplier master data.

export const SEED_BUYERS: Buyer[] = [
  {
    id: 'b1', name: 'Gulf Crescent Foodstuff Trading LLC', country: 'UAE', city: 'Dubai', segment: 'Importer / Distributor',
    products: ['p-ghee', 'p-butter', 'p-peas'], incoterm: 'CIF Jebel Ali', paymentTerms: 'LC at sight', moq: '1 × 20ft reefer',
    status: 'Active Multi-Year', contactPerson: 'Omar Haddad', email: 'procurement@gulfcrescent.example', phone: '+971 4 555 0142',
    annualValueUsd: 1_850_000, creditLimitUsd: 400_000, rating: 4.8, since: '2019-04-01', tags: ['Halal', 'Key account'],
  },
  {
    id: 'b2', name: 'Atlantic Spice & Pulp Imports Inc.', country: 'USA', city: 'Edison, NJ', segment: 'Ethnic Grocery',
    products: ['p-alphonso', 'p-turmeric', 'p-ghee'], incoterm: 'FOB Nhava Sheva', paymentTerms: 'CAD 30 days', moq: '1 × 20ft dry',
    status: 'Active Order', contactPerson: 'Daniel Brooks', email: 'buying@atlanticspice.example', phone: '+1 732 555 0188',
    annualValueUsd: 920_000, creditLimitUsd: 250_000, rating: 4.5, since: '2021-08-15', tags: ['FSVP importer'],
  },
  {
    id: 'b3', name: 'Nordhafen Fruchtsaft GmbH', country: 'DEU', city: 'Hamburg', segment: 'Industrial / Beverage',
    products: ['p-alphonso', 'p-totapuri', 'p-guava'], incoterm: 'CFR Hamburg', paymentTerms: 'TT 60 days', moq: '80 drums',
    status: 'Under Negotiation', contactPerson: 'Katrin Vogel', email: 'k.vogel@nordhafen.example', phone: '+49 40 555 0193',
    annualValueUsd: 1_200_000, creditLimitUsd: 300_000, rating: 4.2, since: '2026-02-10', tags: ['EU', 'Pulp'],
  },
  {
    id: 'b4', name: 'Lion City Fresh Mart Pte Ltd', country: 'SGP', city: 'Singapore', segment: 'Retail Chain',
    products: ['p-peas', 'p-corn', 'p-mixveg'], incoterm: 'CIF Singapore', paymentTerms: 'TT 45 days', moq: '1 × 40ft reefer',
    status: 'Active Multi-Year', contactPerson: 'Grace Lim', email: 'g.lim@lioncityfresh.example', phone: '+65 6555 0120',
    annualValueUsd: 760_000, creditLimitUsd: 200_000, rating: 4.7, since: '2020-01-20', tags: ['Frozen', 'Private label'],
  },
  {
    id: 'b5', name: 'Thames Valley Ethnic Foods Ltd', country: 'GBR', city: 'Slough', segment: 'Importer / Distributor',
    products: ['p-gherkins', 'p-alphonso', 'p-chilli'], incoterm: 'CIF Felixstowe', paymentTerms: 'CAD 45 days', moq: '1 × 20ft dry',
    status: 'Active Order', contactPerson: 'Priya Shah', email: 'priya@thamesvalleyfoods.example', phone: '+44 1753 555 017',
    annualValueUsd: 540_000, creditLimitUsd: 150_000, rating: 4.4, since: '2022-06-01', tags: ['CETA benefit'],
  },
  {
    id: 'b6', name: 'Red Sea Provisions Co.', country: 'SAU', city: 'Jeddah', segment: 'Food Service',
    products: ['p-smp', 'p-ghee'], incoterm: 'CFR Jeddah', paymentTerms: 'LC 60 days', moq: '20 MT',
    status: 'Prospect', contactPerson: 'Faisal Al-Amri', email: 'faisal@redseaprov.example', phone: '+966 12 555 0110',
    annualValueUsd: 0, creditLimitUsd: 0, rating: 3.9, since: '2026-09-05', tags: ['SFDA registration pending'],
  },
  {
    id: 'b7', name: 'Sakura Gourmet Trading KK', country: 'JPN', city: 'Yokohama', segment: 'Industrial / Beverage',
    products: ['p-alphonso', 'p-sesame'], incoterm: 'CIF Yokohama', paymentTerms: 'TT 30 days', moq: '40 drums',
    status: 'Under Negotiation', contactPerson: 'Kenji Mori', email: 'k.mori@sakuragourmet.example', phone: '+81 45 555 0177',
    annualValueUsd: 380_000, creditLimitUsd: 120_000, rating: 4.1, since: '2026-05-12', tags: ['CEPA'],
  },
  {
    id: 'b8', name: 'Southern Cross Grocers Pty Ltd', country: 'AUS', city: 'Melbourne', segment: 'Retail Chain',
    products: ['p-gherkins', 'p-turmeric', 'p-ricebran'], incoterm: 'CIF Melbourne', paymentTerms: 'TT 45 days', moq: '1 × 20ft dry',
    status: 'Active Order', contactPerson: 'Liam Carter', email: 'liam@southerncross.example', phone: '+61 3 5550 1199',
    annualValueUsd: 310_000, creditLimitUsd: 100_000, rating: 4.3, since: '2023-03-14', tags: ['ECTA zero duty'],
  },
  {
    id: 'b9', name: 'Bengal Delta Distributors', country: 'BGD', city: 'Dhaka', segment: 'Importer / Distributor',
    products: ['p-onion', 'p-smp', 'p-ricebran'], incoterm: 'DAP Benapole', paymentTerms: 'LC at sight', moq: '30 MT',
    status: 'Active Multi-Year', contactPerson: 'Rafiq Hossain', email: 'rafiq@bengaldelta.example', phone: '+880 2 5550 1144',
    annualValueUsd: 1_050_000, creditLimitUsd: 300_000, rating: 4.6, since: '2018-11-01', tags: ['Road + rail'],
  },
  {
    id: 'b10', name: 'Swahili Coast Traders Ltd', country: 'KEN', city: 'Mombasa', segment: 'Importer / Distributor',
    products: ['p-mustard', 'p-ricebran', 'p-chilli'], incoterm: 'CFR Mombasa', paymentTerms: 'LC 90 days', moq: '1 × 20ft dry',
    status: 'Dormant', contactPerson: 'Amina Otieno', email: 'amina@swahilicoast.example', phone: '+254 41 555 0133',
    annualValueUsd: 90_000, creditLimitUsd: 50_000, rating: 3.6, since: '2021-02-01', tags: ['Re-engage'],
  },
]

export const SEED_SUPPLIERS: Supplier[] = [
  {
    id: 's1', name: 'Saurashtra Milk Producers Organisation', state: 'Gujarat', coords: [70.8, 21.7], type: 'Milk Pool / MPO',
    supplies: ['Raw cow milk', 'Raw buffalo milk'], certifications: ['FSSAI', 'Village BMC hygiene audit'],
    contactPerson: 'Field Procurement Lead', email: 'procurement@saurashtra-mpo.example', phone: '+91 285 555 0101',
    leadTimeDays: 1, rating: 4.8, onTimePct: 98, qualityPct: 97, status: 'Verified Active', lastAudit: '2026-08-12',
  },
  {
    id: 's2', name: 'Ratnagiri Alphonso Growers Collective', state: 'Maharashtra', coords: [73.3, 16.99], type: 'Fruit & Vegetable Cluster',
    supplies: ['Alphonso mango'], certifications: ['GLOBALG.A.P', 'GI-tagged Alphonso'],
    contactPerson: 'Collective Secretary', email: 'exports@ratnagiri-alphonso.example', phone: '+91 2352 555 012',
    leadTimeDays: 3, rating: 4.7, onTimePct: 92, qualityPct: 95, status: 'Verified Active', lastAudit: '2026-03-20',
  },
  {
    id: 's3', name: 'Chittoor Totapuri Farmers FPO', state: 'Andhra Pradesh', coords: [79.1, 13.22], type: 'Fruit & Vegetable Cluster',
    supplies: ['Totapuri mango', 'Guava'], certifications: ['FSSAI', 'ICS organic (partial)'],
    contactPerson: 'FPO CEO', email: 'ceo@chittoor-fpo.example', phone: '+91 8572 555 019',
    leadTimeDays: 3, rating: 4.5, onTimePct: 90, qualityPct: 93, status: 'Verified Active', lastAudit: '2026-05-02',
  },
  {
    id: 's4', name: 'Himachal & Punjab Pea Growers Network', state: 'Punjab', coords: [75.85, 30.9], type: 'Fruit & Vegetable Cluster',
    supplies: ['Green peas', 'Sweet corn', 'Carrot'], certifications: ['GLOBALG.A.P', 'Residue monitoring'],
    contactPerson: 'Cluster Coordinator', email: 'peas@hp-pea-network.example', phone: '+91 161 555 0177',
    leadTimeDays: 2, rating: 4.6, onTimePct: 94, qualityPct: 94, status: 'Verified Active', lastAudit: '2026-01-15',
  },
  {
    id: 's5', name: 'Krishnagiri Gherkin Contract Farmers', state: 'Tamil Nadu', coords: [78.21, 12.52], type: 'Fruit & Vegetable Cluster',
    supplies: ['Gherkins (count graded)'], certifications: ['GLOBALG.A.P'],
    contactPerson: 'Agronomy Lead', email: 'agri@krishnagiri-gherkin.example', phone: '+91 4343 555 016',
    leadTimeDays: 2, rating: 4.4, onTimePct: 91, qualityPct: 90, status: 'Audit Pending', lastAudit: '2025-10-30',
  },
  {
    id: 's6', name: 'Nashik Grape & Onion Pack-house', state: 'Maharashtra', coords: [73.79, 20.0], type: 'Fruit & Vegetable Cluster',
    supplies: ['Table grapes', 'Red onion'], certifications: ['APEDA GrapeNet registered', 'GLOBALG.A.P'],
    contactPerson: 'Pack-house Manager', email: 'ops@nashik-packhouse.example', phone: '+91 253 555 0144',
    leadTimeDays: 2, rating: 4.6, onTimePct: 93, qualityPct: 94, status: 'Verified Active', lastAudit: '2026-02-08',
  },
  {
    id: 's7', name: 'Bharatpur Mustard Seed Aggregators', state: 'Rajasthan', coords: [77.49, 27.22], type: 'Oilseeds',
    supplies: ['Mustard seed', 'Groundnut'], certifications: ['Agmark', 'FSSAI'],
    contactPerson: 'Procurement Head', email: 'seed@bharatpur-agg.example', phone: '+91 5644 555 012',
    leadTimeDays: 5, rating: 4.5, onTimePct: 95, qualityPct: 92, status: 'Verified Active', lastAudit: '2026-06-18',
  },
  {
    id: 's8', name: 'Guntur Chilli & Erode Turmeric Traders', state: 'Andhra Pradesh', coords: [80.44, 16.3], type: 'Spices',
    supplies: ['Teja chilli', 'Turmeric fingers'], certifications: ['Spices Board registration', 'Steam sterilisation'],
    contactPerson: 'Export Desk', email: 'spices@guntur-erode.example', phone: '+91 863 555 0190',
    leadTimeDays: 7, rating: 4.2, onTimePct: 88, qualityPct: 89, status: 'Onboarding', lastAudit: '2026-10-01',
  },
  {
    id: 's9', name: 'Aseptic Flexi-Pack Solutions', state: 'Gujarat', coords: [72.57, 23.02], type: 'Packaging',
    supplies: ['Aseptic bags 215 kg', 'Export drums', 'Tins'], certifications: ['FDA food-contact compliant', 'BRCGS Packaging'],
    contactPerson: 'Key Account Manager', email: 'sales@asepticflexi.example', phone: '+91 79 555 0112',
    leadTimeDays: 14, rating: 4.6, onTimePct: 96, qualityPct: 97, status: 'Verified Active', lastAudit: '2026-04-11',
  },
  {
    id: 's10', name: 'Coldline Reefer Logistics', state: 'Maharashtra', coords: [73.0, 19.03], type: 'Logistics / Cold Chain',
    supplies: ['Reefer haulage', 'Cold storage at JNPT', 'Data loggers'], certifications: ['ISO 9001', 'GDP cold-chain'],
    contactPerson: 'Operations Lead', email: 'ops@coldline.example', phone: '+91 22 555 0166',
    leadTimeDays: 2, rating: 4.3, onTimePct: 89, qualityPct: 95, status: 'Verified Active', lastAudit: '2026-07-07',
  },
]

export const SEED_DEALS: Deal[] = [
  { id: 'd1', title: 'Ghee & butter annual contract 2027', buyerId: 'b1', country: 'UAE', productIds: ['p-ghee', 'p-butter'], valueUsd: 1_400_000, stage: 'Contract', owner: 'Intl. Sales – GCC', expectedClose: '2026-12-15', createdAt: '2026-07-01', nextStep: 'Legal review of contract draft' },
  { id: 'd2', title: 'Alphonso pulp season 2027', buyerId: 'b3', country: 'DEU', productIds: ['p-alphonso', 'p-totapuri'], valueUsd: 640_000, stage: 'Negotiation', owner: 'EU Representative', expectedClose: '2027-01-31', createdAt: '2026-08-20', nextStep: 'Send revised Brix-based price list' },
  { id: 'd3', title: 'Frozen veg private label', buyerId: 'b4', country: 'SGP', productIds: ['p-peas', 'p-corn', 'p-mixveg'], valueUsd: 420_000, stage: 'Won', owner: 'Intl. Sales – APAC', expectedClose: '2026-10-10', createdAt: '2026-06-02', nextStep: 'Artwork approval' },
  { id: 'd4', title: 'SMP tender – food service', buyerId: 'b6', country: 'SAU', productIds: ['p-smp'], valueUsd: 580_000, stage: 'Qualified', owner: 'Intl. Sales – GCC', expectedClose: '2027-02-28', createdAt: '2026-09-10', nextStep: 'Complete SFDA establishment registration' },
  { id: 'd5', title: 'Pulp & sesame trial order', buyerId: 'b7', country: 'JPN', productIds: ['p-alphonso', 'p-sesame'], valueUsd: 150_000, stage: 'Sample Sent', owner: 'Intl. Sales – APAC', expectedClose: '2027-01-15', createdAt: '2026-09-25', nextStep: 'Await lab results from buyer' },
  { id: 'd6', title: 'Gherkins & spices range', buyerId: 'b5', country: 'GBR', productIds: ['p-gherkins', 'p-chilli'], valueUsd: 260_000, stage: 'Negotiation', owner: 'Intl. Sales – Europe', expectedClose: '2026-12-20', createdAt: '2026-08-05', nextStep: 'Apply CETA preferential origin' },
  { id: 'd7', title: 'Ethnic grocery mixed container', buyerId: 'b2', country: 'USA', productIds: ['p-alphonso', 'p-turmeric', 'p-ghee'], valueUsd: 310_000, stage: 'Contract', owner: 'Intl. Sales – Americas', expectedClose: '2026-11-30', createdAt: '2026-07-18', nextStep: 'Confirm FSVP documents' },
  { id: 'd8', title: 'Onion & oils – Q1', buyerId: 'b9', country: 'BGD', productIds: ['p-onion', 'p-ricebran'], valueUsd: 390_000, stage: 'Lead', owner: 'Intl. Sales – South Asia', expectedClose: '2027-03-15', createdAt: '2026-10-28', nextStep: 'Share price indication' },
  { id: 'd9', title: 'Re-activation: Dhara oils', buyerId: 'b10', country: 'KEN', productIds: ['p-mustard', 'p-ricebran'], valueUsd: 85_000, stage: 'Lead', owner: 'Intl. Sales – Africa', expectedClose: '2027-04-01', createdAt: '2026-11-02', nextStep: 'Intro call' },
  { id: 'd10', title: 'Retail gherkin jars', buyerId: 'b8', country: 'AUS', productIds: ['p-gherkins'], valueUsd: 120_000, stage: 'Lost', owner: 'Intl. Sales – APAC', expectedClose: '2026-09-30', createdAt: '2026-05-10', nextStep: 'Lost on price – revisit next season' },
]

export const SEED_ACTIVITIES: Activity[] = [
  { id: 'a1', type: 'meeting', partnerId: 'b1', partnerKind: 'buyer', subject: 'Gulfood pre-meeting', note: 'Discussed 2027 volumes, +15% on ghee 1 L.', date: '2026-11-09', owner: 'Intl. Sales – GCC', done: true },
  { id: 'a2', type: 'sample', partnerId: 'b7', partnerKind: 'buyer', subject: 'Alphonso pulp samples dispatched', note: '3 × 1 kg pouches by courier, AWB shared.', date: '2026-11-04', owner: 'Intl. Sales – APAC', done: true },
  { id: 'a3', type: 'document', partnerId: 'b2', partnerKind: 'buyer', subject: 'FDA Prior Notice for SHP-2611', note: 'File 24h before arrival at NY/NJ.', date: '2026-11-18', owner: 'Export Documentation', done: false },
  { id: 'a4', type: 'audit', partnerId: 's5', partnerKind: 'supplier', subject: 'Annual GLOBALG.A.P re-audit', note: 'Audit overdue since Oct 2026.', date: '2026-11-15', owner: 'Quality Assurance', done: false },
  { id: 'a5', type: 'call', partnerId: 'b3', partnerKind: 'buyer', subject: 'Price negotiation call', note: 'Buyer asks for €/kg Brix-adjusted pricing.', date: '2026-11-12', owner: 'EU Representative', done: false },
  { id: 'a6', type: 'email', partnerId: 'b6', partnerKind: 'buyer', subject: 'SFDA registration documents', note: 'Shared plant dossier for Junagadh.', date: '2026-11-06', owner: 'Intl. Sales – GCC', done: true },
  { id: 'a7', type: 'meeting', partnerId: 's2', partnerKind: 'supplier', subject: '2027 season allocation', note: 'Pre-book 3,000 MT Alphonso.', date: '2026-11-20', owner: 'Procurement – Safal', done: false },
  { id: 'a8', type: 'call', partnerId: 'b10', partnerKind: 'buyer', subject: 'Re-engagement intro', note: 'Introduce Dhara rice bran range.', date: '2026-11-14', owner: 'Intl. Sales – Africa', done: false },
]

export const SEED_SHIPMENTS: Shipment[] = [
  { id: 'SHP-2601', buyerId: 'b1', productId: 'p-ghee', quantity: '12,000 L', container: '1 × 20ft dry', pol: 'Mundra', pod: 'Jebel Ali', country: 'UAE', etd: '2026-11-02', eta: '2026-11-07', status: 'Customs Cleared', valueUsd: 93_600, docs: [{ name: 'Commercial invoice', done: true }, { name: 'Packing list', done: true }, { name: 'EIA health certificate', done: true }, { name: 'Halal certificate', done: true }, { name: 'CEPA certificate of origin', done: true }] },
  { id: 'SHP-2605', buyerId: 'b4', productId: 'p-peas', quantity: '24,000 kg', container: '1 × 40ft reefer', pol: 'Nhava Sheva (JNPT)', pod: 'Singapore', country: 'SGP', etd: '2026-11-05', eta: '2026-11-14', status: 'In Transit', tempSetC: -20, valueUsd: 32_400, docs: [{ name: 'Commercial invoice', done: true }, { name: 'Packing list', done: true }, { name: 'Phytosanitary certificate', done: true }, { name: 'SFA import permit', done: true }, { name: 'Reefer temperature log', done: false }] },
  { id: 'SHP-2611', buyerId: 'b2', productId: 'p-alphonso', quantity: '80 drums', container: '1 × 20ft dry', pol: 'Chennai', pod: 'New York / New Jersey', country: 'USA', etd: '2026-10-28', eta: '2026-11-29', status: 'Sailed', valueUsd: 23_200, docs: [{ name: 'Commercial invoice', done: true }, { name: 'Packing list', done: true }, { name: 'FDA Prior Notice', done: false }, { name: 'Certificate of origin', done: true }, { name: 'Bill of lading', done: true }] },
  { id: 'SHP-2614', buyerId: 'b9', productId: 'p-onion', quantity: '30,000 kg', container: '2 × rail wagons', pol: 'Kolkata (Haldia)', pod: 'Benapole', country: 'BGD', etd: '2026-11-10', eta: '2026-11-13', status: 'Stuffing', valueUsd: 12_600, docs: [{ name: 'Commercial invoice', done: true }, { name: 'Phytosanitary certificate', done: false }, { name: 'SAFTA certificate of origin', done: false }] },
  { id: 'SHP-2617', buyerId: 'b5', productId: 'p-gherkins', quantity: '72 drums', container: '1 × 20ft dry', pol: 'Chennai', pod: 'Felixstowe', country: 'GBR', etd: '2026-11-20', eta: '2026-12-14', status: 'Booked', valueUsd: 18_720, docs: [{ name: 'Commercial invoice', done: false }, { name: 'Packing list', done: false }, { name: 'IPAFFS pre-notification', done: false }, { name: 'CETA origin declaration', done: false }] },
  { id: 'SHP-2598', buyerId: 'b8', productId: 'p-turmeric', quantity: '8,000 kg', container: '1 × 20ft dry', pol: 'Chennai', pod: 'Melbourne', country: 'AUS', etd: '2026-10-08', eta: '2026-10-28', status: 'Delivered', valueUsd: 19_200, docs: [{ name: 'Commercial invoice', done: true }, { name: 'BICON import permit', done: true }, { name: 'Fumigation certificate', done: true }, { name: 'ECTA certificate of origin', done: true }] },
]

/** Monthly export value in USD thousands, by region (demo series for the dashboard). */
export const MONTHLY_EXPORTS = [
  { month: 'Dec', gcc: 410, europe: 160, americas: 120, apac: 140, southAsia: 190 },
  { month: 'Jan', gcc: 380, europe: 210, americas: 110, apac: 150, southAsia: 170 },
  { month: 'Feb', gcc: 420, europe: 190, americas: 130, apac: 130, southAsia: 200 },
  { month: 'Mar', gcc: 470, europe: 230, americas: 150, apac: 160, southAsia: 210 },
  { month: 'Apr', gcc: 520, europe: 280, americas: 190, apac: 170, southAsia: 180 },
  { month: 'May', gcc: 560, europe: 340, americas: 240, apac: 210, southAsia: 160 },
  { month: 'Jun', gcc: 530, europe: 320, americas: 260, apac: 220, southAsia: 150 },
  { month: 'Jul', gcc: 480, europe: 260, americas: 210, apac: 190, southAsia: 170 },
  { month: 'Aug', gcc: 450, europe: 220, americas: 170, apac: 180, southAsia: 190 },
  { month: 'Sep', gcc: 490, europe: 200, americas: 160, apac: 200, southAsia: 220 },
  { month: 'Oct', gcc: 540, europe: 210, americas: 180, apac: 230, southAsia: 240 },
  { month: 'Nov', gcc: 580, europe: 230, americas: 200, apac: 250, southAsia: 260 },
]
