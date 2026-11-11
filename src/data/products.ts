import type { CategoryId, Product } from './types'

export const CATEGORIES: { id: CategoryId | 'all'; name: string }[] = [
  { id: 'all', name: 'All products' },
  { id: 'dairy', name: 'Dairy Products' },
  { id: 'pulp', name: 'Fruit Pulp & Concentrates' },
  { id: 'iqf', name: 'IQF & Frozen Foods' },
  { id: 'gherkins', name: 'Gherkins' },
  { id: 'fresh', name: 'Fresh Fruits & Vegetables' },
  { id: 'oilseeds', name: 'Oilseeds' },
  { id: 'spices', name: 'Spices' },
  { id: 'oils', name: 'Dhara Edible Oils' },
]

export const categoryName = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.name ?? id

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const ALL_YEAR = undefined

// Categories follow the official export range on motherdairy.com. Products marked
// "on-request" come from the domestic Mother Dairy / Dhara range and are offered for
// export on enquiry. Stock and FOB prices are indicative working figures.
export const PRODUCTS: Product[] = [
  // ---------- Fruit pulp & concentrates ----------
  {
    id: 'p-alphonso', name: 'Alphonso Mango Pulp', brand: 'Safal', category: 'pulp', hsCode: '2008.99.30', emoji: '🥭',
    tempType: 'ambient', tempReq: 'Ambient, cool & dry storage', shelfLife: '24 months', packs: 'Aseptic bags 215 kg in drums, A10 cans 3.1 kg',
    description: 'Select Alphonso mangoes ripened under controlled atmosphere, washed, destoned, extracted, homogenised, thermally processed and aseptically filled for commercial sterility.',
    certsRequired: ['FSSAI Export', 'Phytosanitary / Health Certificate', 'Certificate of Origin', 'US FDA Facility Reg. (USA)'],
    specs: { Colour: 'Golden yellow', 'TSS (°Brix)': 'Min 16', 'Acidity (% as CA)': 'Max 0.90%', pH: '3.6 – 4.2', Viscosity: 'Min 2200 cps @ 20 °C', 'Total plate count': '< 10/g or absent', 'Yeast & mould': '< 10/g or absent', 'E. coli': 'Nil' },
    stock: 180, stockUnit: 'drums', unitKg: 230, fobUsd: 290, plantIds: ['bengaluru'], exportStatus: 'regular', moq: '20 drums', season: [4, 5, 6],
  },
  {
    id: 'p-kesar', name: 'Kesar Mango Pulp', brand: 'Safal', category: 'pulp', hsCode: '2008.99.30', emoji: '🥭',
    tempType: 'ambient', tempReq: 'Ambient, cool & dry storage', shelfLife: '24 months', packs: 'Aseptic bags 215 kg, A10 cans 3.1 kg',
    description: 'Saffron-hued Kesar pulp from Gujarat orchards — sweet, aromatic and popular for lassi, kulfi and desserts.',
    certsRequired: ['FSSAI Export', 'Phytosanitary / Health Certificate', 'Certificate of Origin'],
    specs: { 'TSS (°Brix)': 'Min 16', pH: '3.6 – 4.2' },
    stock: 120, stockUnit: 'drums', unitKg: 230, fobUsd: 255, plantIds: ['bengaluru'], exportStatus: 'regular', moq: '20 drums', season: [5, 6],
  },
  {
    id: 'p-totapuri', name: 'Totapuri Mango Pulp & Concentrate', brand: 'Safal', category: 'pulp', hsCode: '2008.99.30', emoji: '🥭',
    tempType: 'ambient', tempReq: 'Ambient, cool & dry storage', shelfLife: '24 months', packs: 'Aseptic bags 215 kg, 28–30 °Brix concentrate',
    description: 'Bright, tangy Totapuri pulp and concentrate for beverage, dairy and bakery manufacturers.',
    certsRequired: ['FSSAI Export', 'Phytosanitary / Health Certificate', 'Non-GMO Declaration'],
    specs: { 'TSS (°Brix)': 'Min 14 (pulp) / 28–30 (conc.)', pH: '3.5 – 4.2' },
    stock: 240, stockUnit: 'drums', unitKg: 230, fobUsd: 210, plantIds: ['bengaluru'], exportStatus: 'regular', moq: '40 drums', season: [5, 6, 7],
  },
  {
    id: 'p-guava', name: 'White & Pink Guava Pulp', brand: 'Safal', category: 'pulp', hsCode: '2008.99.40', emoji: '🍈',
    tempType: 'ambient', tempReq: 'Ambient, cool & dry storage', shelfLife: '24 months', packs: 'Aseptic bags 215 kg',
    description: 'White and pink guava ripened under controlled conditions, blanched, destoned, centrifuged and aseptically packed.',
    certsRequired: ['FSSAI Export', 'Phytosanitary / Health Certificate'],
    specs: { Colour: 'Creamish (white) / Pink', 'TSS (°Brix)': 'Min 8 (pulp) / Min 20 (white conc.)' },
    stock: 95, stockUnit: 'drums', unitKg: 230, fobUsd: 175, plantIds: ['bengaluru'], exportStatus: 'regular', moq: '20 drums', season: [9, 10, 11, 12, 1],
  },
  {
    id: 'p-papaya', name: 'Papaya Pulp', brand: 'Safal', category: 'pulp', hsCode: '2008.99.90', emoji: '🧡',
    tempType: 'ambient', tempReq: 'Ambient, cool & dry storage', shelfLife: '18 months', packs: 'Aseptic bags 215 kg',
    description: 'Red papaya pulp for nectars, smoothies and baby food blends.',
    certsRequired: ['FSSAI Export', 'Phytosanitary / Health Certificate'],
    stock: 60, stockUnit: 'drums', unitKg: 230, fobUsd: 165, plantIds: ['bengaluru'], exportStatus: 'regular', moq: '20 drums', season: ALL_YEAR,
  },

  // ---------- IQF & frozen ----------
  {
    id: 'p-peas', name: 'IQF Green Peas', brand: 'Safal', category: 'iqf', hsCode: '0710.21.00', emoji: '🫛',
    tempType: 'frozen', tempReq: 'Deep frozen, −18 °C or below', shelfLife: '18 months', packs: '200 g, 500 g, 1 kg retail; 10 kg & 25 kg bulk',
    description: 'Individually quick-frozen peas that keep their natural sweetness, colour and texture.',
    certsRequired: ['FSSAI Export', 'Phytosanitary Certificate', 'Pesticide Residue Report', 'Cold-chain log'],
    stock: 28000, stockUnit: 'kg', fobUsd: 1.35, plantIds: ['mangolpuri', 'ranchi'], exportStatus: 'regular', moq: '5,000 kg', season: [11, 12, 1, 2],
  },
  {
    id: 'p-corn', name: 'IQF Sweet Corn', brand: 'Safal', category: 'iqf', hsCode: '0710.40.00', emoji: '🌽',
    tempType: 'frozen', tempReq: 'Deep frozen, −18 °C or below', shelfLife: '18 months', packs: '400 g, 1 kg retail; 10 kg bulk',
    description: 'Golden sweet-corn kernels, blanched and individually quick-frozen.',
    certsRequired: ['FSSAI Export', 'Phytosanitary Certificate', 'Non-GMO Declaration'],
    stock: 16500, stockUnit: 'kg', fobUsd: 1.45, plantIds: ['mangolpuri'], exportStatus: 'regular', moq: '5,000 kg',
  },
  {
    id: 'p-mixveg', name: 'IQF Mixed Vegetables', brand: 'Safal', category: 'iqf', hsCode: '0710.90.00', emoji: '🥕',
    tempType: 'frozen', tempReq: 'Deep frozen, −18 °C or below', shelfLife: '18 months', packs: '400 g, 1 kg retail; 10 kg bulk',
    description: 'Carrot, beans, peas and corn blend for retail and food service.',
    certsRequired: ['FSSAI Export', 'Phytosanitary Certificate', 'Pesticide Residue Report'],
    stock: 9200, stockUnit: 'kg', fobUsd: 1.3, plantIds: ['mangolpuri'], exportStatus: 'regular', moq: '5,000 kg',
  },
  {
    id: 'p-okra', name: 'IQF Okra & Cut Beans', brand: 'Safal', category: 'iqf', hsCode: '0710.80.90', emoji: '🫑',
    tempType: 'frozen', tempReq: 'Deep frozen, −18 °C or below', shelfLife: '18 months', packs: '400 g retail; 10 kg bulk',
    description: 'Whole baby okra and cut French beans for ethnic retail and catering.',
    certsRequired: ['FSSAI Export', 'Phytosanitary Certificate', 'Pesticide Residue Report'],
    stock: 7400, stockUnit: 'kg', fobUsd: 1.7, plantIds: ['mangolpuri'], exportStatus: 'regular', moq: '3,000 kg',
  },
  {
    id: 'p-mangochunks', name: 'IQF Mango Chunks', brand: 'Safal', category: 'iqf', hsCode: '0811.90.90', emoji: '🥭',
    tempType: 'frozen', tempReq: 'Deep frozen, −18 °C or below', shelfLife: '24 months', packs: '1 kg retail; 10 kg bulk',
    description: 'Ripe Alphonso and Totapuri cubes for smoothie bars, bakeries and retail.',
    certsRequired: ['FSSAI Export', 'Phytosanitary Certificate', 'Microbiology report'],
    stock: 5200, stockUnit: 'kg', fobUsd: 2.6, plantIds: ['bengaluru'], exportStatus: 'regular', moq: '2,000 kg', season: [4, 5, 6],
  },
  {
    id: 'p-fries', name: 'Safal Frozen French Fries', brand: 'Safal', category: 'iqf', hsCode: '2004.10.00', emoji: '🍟',
    tempType: 'frozen', tempReq: 'Deep frozen, −18 °C or below', shelfLife: '18 months', packs: '420 g retail; 2.5 kg food-service',
    description: 'Par-fried 9 mm shoestring fries for QSR and retail.',
    certsRequired: ['FSSAI Export', 'Health Certificate', 'Acrylamide monitoring'],
    stock: 14000, stockUnit: 'kg', fobUsd: 1.25, plantIds: ['mangolpuri'], exportStatus: 'on-request', moq: '5,000 kg',
  },
  {
    id: 'p-tikki', name: 'Safal Frozen Snacks (Aloo Tikki, Veg Patties)', brand: 'Safal', category: 'iqf', hsCode: '2004.90.00', emoji: '🥔',
    tempType: 'frozen', tempReq: 'Deep frozen, −18 °C or below', shelfLife: '12 months', packs: '400 g retail; 1.5 kg food-service',
    description: 'Ready-to-fry vegetarian Indian snacks made with Safal vegetables.',
    certsRequired: ['FSSAI Export', 'Health Certificate', 'Allergen declaration'],
    stock: 6000, stockUnit: 'kg', fobUsd: 2.2, plantIds: ['mangolpuri'], exportStatus: 'on-request', moq: '2,000 kg',
  },

  // ---------- Gherkins ----------
  {
    id: 'p-gherkins', name: 'Preserved Gherkins (Brine / Vinegar)', brand: 'Safal', category: 'gherkins', hsCode: '2001.10.00', emoji: '🥒',
    tempType: 'ambient', tempReq: 'Ambient', shelfLife: '24 months', packs: 'Drums 240 kg, pails 10 kg',
    description: 'Contract-farmed gherkins graded by count and preserved in brine or vinegar for repackers.',
    certsRequired: ['FSSAI Export', 'APEDA RCMC', 'Health Certificate'],
    stock: 310, stockUnit: 'drums', unitKg: 255, fobUsd: 260, plantIds: ['bengaluru'], exportStatus: 'regular', moq: '40 drums',
  },
  {
    id: 'p-gherkinjars', name: 'Retail Gherkin Jars (Dill, Sweet, Sliced)', brand: 'Safal', category: 'gherkins', hsCode: '2001.10.00', emoji: '🫙',
    tempType: 'ambient', tempReq: 'Ambient', shelfLife: '24 months', packs: '680 g & 1 kg glass jars, 12 per carton',
    description: 'Private-label ready gherkins in jars for supermarkets.',
    certsRequired: ['FSSAI Export', 'Health Certificate', 'Destination label approval'],
    stock: 4200, stockUnit: 'cartons', unitKg: 13, fobUsd: 14.5, plantIds: ['bengaluru'], exportStatus: 'regular', moq: '1,000 cartons',
  },

  // ---------- Fresh fruit & vegetables ----------
  {
    id: 'p-grapes', name: 'Fresh Table Grapes', brand: 'Safal', category: 'fresh', hsCode: '0806.10.00', emoji: '🍇',
    tempType: 'chilled', tempReq: 'Reefer 0 to +1 °C, RH 90–95%', shelfLife: '45–60 days in cold chain', packs: '4.5 kg / 5 kg export cartons, punnets',
    description: 'Thompson Seedless and coloured varieties packed at registered pack-houses.',
    certsRequired: ['Phytosanitary Certificate', 'APEDA GrapeNet traceability', 'MRL residue report', 'GLOBALG.A.P'],
    stock: 0, stockUnit: 'kg', fobUsd: 1.6, plantIds: ['mangolpuri'], exportStatus: 'regular', moq: '1 × 40ft reefer', season: [1, 2, 3, 4],
  },
  {
    id: 'p-banana', name: 'Fresh Cavendish Bananas', brand: 'Safal', category: 'fresh', hsCode: '0803.90.10', emoji: '🍌',
    tempType: 'chilled', tempReq: 'Reefer 13–14 °C', shelfLife: '21–28 days', packs: '13 kg export cartons',
    description: 'Green-harvested Cavendish (G-9) bananas for ripening at destination.',
    certsRequired: ['Phytosanitary Certificate', 'GLOBALG.A.P', 'Certificate of Origin'],
    stock: 42000, stockUnit: 'kg', fobUsd: 0.48, plantIds: ['bengaluru'], exportStatus: 'regular', moq: '1 × 40ft reefer',
  },
  {
    id: 'p-pomegranate', name: 'Fresh Pomegranate (Bhagwa)', brand: 'Safal', category: 'fresh', hsCode: '0810.90.10', emoji: '🍎',
    tempType: 'chilled', tempReq: 'Reefer 5–7 °C, RH 90–95%', shelfLife: '60–80 days in cold chain', packs: '3.5 kg / 5 kg export cartons',
    description: 'Deep-red Bhagwa pomegranates with soft seeds, sorted by count.',
    certsRequired: ['Phytosanitary Certificate', 'APEDA AnarNet traceability', 'MRL residue report'],
    stock: 18000, stockUnit: 'kg', fobUsd: 1.9, plantIds: ['mangolpuri'], exportStatus: 'regular', moq: '1 × 40ft reefer', season: [9, 10, 11, 12, 1, 2, 3],
  },
  {
    id: 'p-freshmango', name: 'Fresh Mangoes (Alphonso & Kesar)', brand: 'Safal', category: 'fresh', hsCode: '0804.50.20', emoji: '🥭',
    tempType: 'chilled', tempReq: 'Reefer/air 10–13 °C', shelfLife: '14–21 days', packs: '3 kg / 4 kg export cartons',
    description: 'Hand-picked premium mangoes, hot-water or vapour-heat treated as the market requires.',
    certsRequired: ['Phytosanitary Certificate', 'VHT / HWT treatment cert', 'Irradiation cert (USA)', 'GLOBALG.A.P'],
    stock: 0, stockUnit: 'kg', fobUsd: 3.4, plantIds: ['mumbai'], exportStatus: 'regular', moq: '1 air pallet', season: [4, 5, 6],
  },
  {
    id: 'p-onion', name: 'Fresh Red Onion', brand: 'Safal', category: 'fresh', hsCode: '0703.10.19', emoji: '🧅',
    tempType: 'ambient', tempReq: 'Ventilated, 0–4 °C preferred', shelfLife: '60–90 days', packs: '5 / 10 / 25 kg mesh bags',
    description: 'Nashik-grade red onion, graded 45–65 mm.',
    certsRequired: ['Phytosanitary Certificate', 'Certificate of Origin', 'DGFT export policy check'],
    stock: 60000, stockUnit: 'kg', fobUsd: 0.42, plantIds: ['mangolpuri'], exportStatus: 'regular', moq: '1 × 40ft (29 MT)',
  },
  {
    id: 'p-okrafresh', name: 'Fresh Okra & Green Chilli', brand: 'Safal', category: 'fresh', hsCode: '0709.99.90', emoji: '🌶️',
    tempType: 'chilled', tempReq: 'Air freight 8–10 °C', shelfLife: '7–10 days', packs: '5 kg perforated cartons',
    description: 'Tender okra and green chillies flown fresh for ethnic grocers.',
    certsRequired: ['Phytosanitary Certificate', 'MRL residue report'],
    stock: 3000, stockUnit: 'kg', fobUsd: 2.1, plantIds: ['mangolpuri'], exportStatus: 'regular', moq: '500 kg (air)',
  },

  // ---------- Dairy ----------
  {
    id: 'p-ghee', name: 'Mother Dairy Pure Ghee', brand: 'Mother Dairy', category: 'dairy', hsCode: '0405.90.20', emoji: '🧈',
    tempType: 'ambient', tempReq: 'Ambient, 15–25 °C', shelfLife: '12 months', packs: '200 ml, 500 ml, 1 L jars/cartons; 15 kg tins',
    description: 'Traditional clarified butter with rich aroma, made from cow and buffalo milk fat.',
    certsRequired: ['EIA Export Certificate', 'Veterinary Health Certificate', 'Halal (GCC/SE Asia)', 'Certificate of Origin'],
    stock: 14200, stockUnit: 'litres', fobUsd: 7.8, plantIds: ['junagadh', 'patparganj'], exportStatus: 'regular', moq: '5,000 L',
  },
  {
    id: 'p-cowghee', name: 'Mother Dairy Cow Ghee', brand: 'Mother Dairy', category: 'dairy', hsCode: '0405.90.20', emoji: '🐄',
    tempType: 'ambient', tempReq: 'Ambient, 15–25 °C', shelfLife: '12 months', packs: '500 ml, 1 L jars; 15 kg tins',
    description: 'Golden cow ghee with granular texture, positioned for premium retail.',
    certsRequired: ['EIA Export Certificate', 'Veterinary Health Certificate', 'Halal (GCC/SE Asia)'],
    stock: 8600, stockUnit: 'litres', fobUsd: 8.6, plantIds: ['junagadh'], exportStatus: 'regular', moq: '3,000 L',
  },
  {
    id: 'p-butter', name: 'Mother Dairy Table Butter', brand: 'Mother Dairy', category: 'dairy', hsCode: '0405.10.00', emoji: '🧈',
    tempType: 'chilled', tempReq: 'Chilled, 2–4 °C (frozen −18 °C for bulk)', shelfLife: '9–12 months', packs: '100 g, 500 g retail; 25 kg bulk cartons',
    description: 'Pasteurised salted table butter and unsalted cooking butter.',
    certsRequired: ['EIA Export Certificate', 'Veterinary Health Certificate', 'Halal (GCC/SE Asia)'],
    stock: 6400, stockUnit: 'kg', fobUsd: 5.9, plantIds: ['junagadh'], exportStatus: 'regular', moq: '3,000 kg',
  },
  {
    id: 'p-smp', name: 'Skimmed Milk Powder (SMP)', brand: 'Mother Dairy', category: 'dairy', hsCode: '0402.10.10', emoji: '🥛',
    tempType: 'ambient', tempReq: 'Ambient, dry, < 30 °C', shelfLife: '24 months', packs: '25 kg multi-wall bags with PE liner',
    description: 'Spray-dried SMP for recombination, bakery and confectionery.',
    certsRequired: ['EIA Export Certificate', 'Veterinary Health Certificate', 'Melamine-free certificate', 'Halal'],
    specs: { Moisture: 'Max 4.0%', Fat: 'Max 1.25%', Protein: 'Min 34% (on SNF)' },
    stock: 120000, stockUnit: 'kg', fobUsd: 2.9, plantIds: ['junagadh'], exportStatus: 'regular', moq: '1 × 20ft (18 MT)',
  },
  {
    id: 'p-wmp', name: 'Whole Milk Powder (WMP)', brand: 'Mother Dairy', category: 'dairy', hsCode: '0402.21.10', emoji: '🥛',
    tempType: 'ambient', tempReq: 'Ambient, dry, < 30 °C', shelfLife: '18 months', packs: '25 kg multi-wall bags with PE liner',
    description: 'Full-cream milk powder for recombined milk and confectionery.',
    certsRequired: ['EIA Export Certificate', 'Veterinary Health Certificate', 'Halal'],
    specs: { Moisture: 'Max 2.5%', Fat: 'Min 26%' },
    stock: 48000, stockUnit: 'kg', fobUsd: 3.6, plantIds: ['junagadh'], exportStatus: 'regular', moq: '1 × 20ft (18 MT)',
  },
  {
    id: 'p-whitener', name: 'Dairy Whitener', brand: 'Mother Dairy', category: 'dairy', hsCode: '0402.29.20', emoji: '☕',
    tempType: 'ambient', tempReq: 'Ambient, dry', shelfLife: '12 months', packs: '200 g, 500 g, 1 kg pouches; 25 kg bags',
    description: 'Sweetened milk powder for tea and coffee — strong demand in South Asian and Gulf markets.',
    certsRequired: ['EIA Export Certificate', 'Veterinary Health Certificate', 'Halal'],
    stock: 22000, stockUnit: 'kg', fobUsd: 3.1, plantIds: ['junagadh'], exportStatus: 'regular', moq: '5,000 kg',
  },
  {
    id: 'p-uht', name: 'UHT Long-Life Milk (Tetra Pak)', brand: 'Mother Dairy', category: 'dairy', hsCode: '0401.20.00', emoji: '🥛',
    tempType: 'ambient', tempReq: 'Ambient (aseptic pack)', shelfLife: '6 months', packs: '1 L Tetra Brik, 12 per carton',
    description: 'Ultra-heat-treated toned and full-cream milk in six-layer aseptic packs; no refrigeration until opened.',
    certsRequired: ['EIA Export Certificate', 'Veterinary Health Certificate', 'Sterility test report'],
    stock: 45000, stockUnit: 'litres', fobUsd: 0.95, plantIds: ['patparganj'], exportStatus: 'on-request', moq: '1 × 20ft',
  },
  {
    id: 'p-paneer', name: 'Frozen Malai Paneer', brand: 'Mother Dairy', category: 'dairy', hsCode: '0406.10.00', emoji: '🧀',
    tempType: 'frozen', tempReq: 'Deep frozen, −18 °C', shelfLife: '12 months (frozen)', packs: '200 g, 1 kg blocks & cubes',
    description: 'Soft, high-protein cottage cheese for Indian restaurants and ethnic retail.',
    certsRequired: ['EIA Export Certificate', 'Veterinary Health Certificate', 'Cold-chain log', 'Halal'],
    stock: 8500, stockUnit: 'kg', fobUsd: 6.2, plantIds: ['patparganj'], exportStatus: 'on-request', moq: '2,000 kg',
  },
  {
    id: 'p-cheese', name: 'Processed Cheese & Mozzarella', brand: 'Mother Dairy', category: 'dairy', hsCode: '0406.30.00', emoji: '🧀',
    tempType: 'chilled', tempReq: 'Chilled, 2–4 °C', shelfLife: '9 months', packs: 'Slices 200 g, blocks 1 kg, diced mozzarella 2 kg',
    description: 'Processed cheese slices, blocks and pizza mozzarella for retail and QSR.',
    certsRequired: ['EIA Export Certificate', 'Veterinary Health Certificate', 'Halal'],
    stock: 6200, stockUnit: 'kg', fobUsd: 5.4, plantIds: ['patparganj'], exportStatus: 'on-request', moq: '2,000 kg',
  },
  {
    id: 'p-icecream', name: 'Mother Dairy Ice Cream & Kulfi', brand: 'Mother Dairy', category: 'dairy', hsCode: '2105.00.00', emoji: '🍦',
    tempType: 'frozen', tempReq: 'Deep frozen, −25 °C', shelfLife: '12 months', packs: 'Kulfi sticks, cups, 1 L tubs; 4 L food-service',
    description: 'Kulfi, cassata and classic flavours for Indian diaspora retail and restaurants.',
    certsRequired: ['Health Certificate', 'Veterinary Health Certificate', 'Halal', 'Cold-chain log'],
    stock: 9000, stockUnit: 'litres', fobUsd: 2.4, plantIds: ['patparganj'], exportStatus: 'on-request', moq: '1 × 40ft reefer',
  },

  // ---------- Oilseeds ----------
  {
    id: 'p-groundnut', name: 'Groundnut Kernels (HPS)', brand: 'Safal', category: 'oilseeds', hsCode: '1202.42.00', emoji: '🥜',
    tempType: 'ambient', tempReq: 'Ambient, dry, ventilated', shelfLife: '12 months', packs: '25 / 50 kg PP bags',
    description: 'Hand-picked and selected Java/Bold kernels, sorted by count.',
    certsRequired: ['Phytosanitary Certificate', 'Aflatoxin test report (APEDA lab)', 'Certificate of Origin'],
    stock: 75000, stockUnit: 'kg', fobUsd: 1.2, plantIds: ['mangolpuri'], exportStatus: 'regular', moq: '1 × 20ft (18 MT)', season: [10, 11, 12],
  },
  {
    id: 'p-sesame', name: 'Hulled Sesame Seeds', brand: 'Safal', category: 'oilseeds', hsCode: '1207.40.90', emoji: '⚪',
    tempType: 'ambient', tempReq: 'Ambient, dry', shelfLife: '12 months', packs: '25 kg paper/PP bags',
    description: 'Natural and hulled white sesame, 99.95% purity, steam-sterilised on request.',
    certsRequired: ['Phytosanitary Certificate', 'Salmonella & ETO-free report', 'Certificate of Origin'],
    stock: 32000, stockUnit: 'kg', fobUsd: 1.75, plantIds: ['mangolpuri'], exportStatus: 'regular', moq: '1 × 20ft', season: [9, 10, 11],
  },
  {
    id: 'p-blacksesame', name: 'Black Sesame Seeds', brand: 'Safal', category: 'oilseeds', hsCode: '1207.40.90', emoji: '⚫',
    tempType: 'ambient', tempReq: 'Ambient, dry', shelfLife: '12 months', packs: '25 kg bags',
    description: 'Sortex-cleaned black sesame popular in Japan, Korea and the Gulf.',
    certsRequired: ['Phytosanitary Certificate', 'Salmonella & ETO-free report'],
    stock: 12000, stockUnit: 'kg', fobUsd: 2.3, plantIds: ['mangolpuri'], exportStatus: 'regular', moq: '5,000 kg', season: [9, 10, 11],
  },
  {
    id: 'p-mustardseed', name: 'Mustard Seeds (Yellow & Brown)', brand: 'Safal', category: 'oilseeds', hsCode: '1207.50.10', emoji: '🟡',
    tempType: 'ambient', tempReq: 'Ambient, dry', shelfLife: '12 months', packs: '25 / 50 kg bags',
    description: 'Machine-cleaned mustard seed for tempering, pickling and condiments.',
    certsRequired: ['Phytosanitary Certificate', 'Certificate of Origin'],
    stock: 26000, stockUnit: 'kg', fobUsd: 1.05, plantIds: ['dhara-network'], exportStatus: 'regular', moq: '5,000 kg', season: [3, 4],
  },

  // ---------- Spices ----------
  {
    id: 'p-turmeric', name: 'Turmeric Fingers & Powder', brand: 'Safal', category: 'spices', hsCode: '0910.30.20', emoji: '🟠',
    tempType: 'ambient', tempReq: 'Ambient, dry', shelfLife: '24 months', packs: '25 kg bags; 100 g – 1 kg retail',
    description: 'High-curcumin turmeric, steam-sterilised for regulated markets.',
    certsRequired: ['Spices Board export registration', 'Phytosanitary Certificate', 'Lead & ETO test report'],
    stock: 18000, stockUnit: 'kg', fobUsd: 2.4, plantIds: ['mangolpuri'], exportStatus: 'regular', moq: '2,000 kg', season: [2, 3, 4],
  },
  {
    id: 'p-chilli', name: 'Red Chilli (Whole & Powder)', brand: 'Safal', category: 'spices', hsCode: '0904.21.10', emoji: '🌶️',
    tempType: 'ambient', tempReq: 'Ambient, dry', shelfLife: '18 months', packs: '10 / 25 kg bags; 100 g – 1 kg retail',
    description: 'Teja and Byadgi varieties graded for colour (ASTA) and pungency (SHU).',
    certsRequired: ['Spices Board export registration', 'Aflatoxin & Sudan-dye free report'],
    stock: 14000, stockUnit: 'kg', fobUsd: 2.8, plantIds: ['mangolpuri'], exportStatus: 'regular', moq: '2,000 kg', season: [1, 2, 3, 4],
  },
  {
    id: 'p-cumin', name: 'Cumin Seeds', brand: 'Safal', category: 'spices', hsCode: '0909.31.29', emoji: '🌿',
    tempType: 'ambient', tempReq: 'Ambient, dry', shelfLife: '24 months', packs: '25 kg bags; 100 g – 500 g retail',
    description: 'Unjha-origin cumin, Singapore/Europe quality, 99% purity.',
    certsRequired: ['Spices Board export registration', 'Phytosanitary Certificate', 'Pesticide residue report'],
    stock: 9000, stockUnit: 'kg', fobUsd: 3.9, plantIds: ['mangolpuri'], exportStatus: 'regular', moq: '1,000 kg', season: [2, 3, 4],
  },
  {
    id: 'p-coriander', name: 'Coriander Seeds & Powder', brand: 'Safal', category: 'spices', hsCode: '0909.21.29', emoji: '🌱',
    tempType: 'ambient', tempReq: 'Ambient, dry', shelfLife: '18 months', packs: '25 kg bags; retail packs',
    description: 'Eagle and Badami grades from Rajasthan and MP.',
    certsRequired: ['Spices Board export registration', 'Phytosanitary Certificate'],
    stock: 11000, stockUnit: 'kg', fobUsd: 1.6, plantIds: ['mangolpuri'], exportStatus: 'regular', moq: '2,000 kg', season: [2, 3, 4],
  },
  {
    id: 'p-pepper', name: 'Black Pepper (Malabar)', brand: 'Safal', category: 'spices', hsCode: '0904.11.20', emoji: '⚫',
    tempType: 'ambient', tempReq: 'Ambient, dry', shelfLife: '24 months', packs: '25 kg bags; retail grinders',
    description: 'Malabar garbled black pepper, 550 g/L density, steam-sterilised on request.',
    certsRequired: ['Spices Board export registration', 'Phytosanitary Certificate', 'Salmonella test report'],
    stock: 4000, stockUnit: 'kg', fobUsd: 7.5, plantIds: ['mangolpuri'], exportStatus: 'regular', moq: '1,000 kg', season: [12, 1, 2],
  },

  // ---------- Dhara oils ----------
  {
    id: 'p-mustard', name: 'Dhara Kachi Ghani Mustard Oil', brand: 'Dhara', category: 'oils', hsCode: '1514.99.20', emoji: '🫗',
    tempType: 'ambient', tempReq: 'Ambient', shelfLife: '9 months', packs: '1 L pouch/PET/Tetra, 5 L jar, 15 L tin',
    description: 'Cold-pressed (kachi ghani) mustard oil with natural pungency.',
    certsRequired: ['FSSAI Export', 'Agmark', 'Erucic acid test report'],
    stock: 32000, stockUnit: 'litres', fobUsd: 2.1, plantIds: ['dhara-network'], exportStatus: 'on-request', moq: '1 × 20ft',
  },
  {
    id: 'p-ricebran', name: 'Dhara Rice Bran Oil', brand: 'Dhara', category: 'oils', hsCode: '1515.90.40', emoji: '🌾',
    tempType: 'ambient', tempReq: 'Ambient', shelfLife: '9 months', packs: '1 L pouch/PET, 5 L jar, 15 L tin',
    description: 'Physically refined rice bran oil rich in oryzanol, high smoke point.',
    certsRequired: ['FSSAI Export', 'Agmark', 'Heavy-metal analysis'],
    stock: 18500, stockUnit: 'litres', fobUsd: 1.9, plantIds: ['dhara-network'], exportStatus: 'on-request', moq: '1 × 20ft',
  },
  {
    id: 'p-sunflower', name: 'Dhara Refined Sunflower Oil', brand: 'Dhara', category: 'oils', hsCode: '1512.19.10', emoji: '🌻',
    tempType: 'ambient', tempReq: 'Ambient', shelfLife: '9 months', packs: '1 L PET, 5 L jar, 15 L tin',
    description: 'Light refined sunflower oil fortified with vitamins A & D.',
    certsRequired: ['FSSAI Export', 'Agmark', 'Fortification declaration'],
    stock: 21000, stockUnit: 'litres', fobUsd: 1.85, plantIds: ['dhara-network'], exportStatus: 'on-request', moq: '1 × 20ft',
  },
  {
    id: 'p-soya', name: 'Dhara Refined Soyabean Oil', brand: 'Dhara', category: 'oils', hsCode: '1507.90.10', emoji: '🫘',
    tempType: 'ambient', tempReq: 'Ambient', shelfLife: '9 months', packs: '1 L pouch/PET, 5 L jar, 15 L tin',
    description: 'Everyday refined soyabean oil for households and food service.',
    certsRequired: ['FSSAI Export', 'Agmark', 'Non-GMO / IP declaration'],
    stock: 26000, stockUnit: 'litres', fobUsd: 1.6, plantIds: ['dhara-network'], exportStatus: 'on-request', moq: '1 × 20ft',
  },
  {
    id: 'p-groundnutoil', name: 'Dhara Filtered Groundnut Oil', brand: 'Dhara', category: 'oils', hsCode: '1508.90.10', emoji: '🥜',
    tempType: 'ambient', tempReq: 'Ambient', shelfLife: '9 months', packs: '1 L PET, 5 L jar, 15 L tin',
    description: 'Traditional filtered groundnut oil with nutty aroma for South Asian cuisine.',
    certsRequired: ['FSSAI Export', 'Agmark', 'Aflatoxin test report'],
    stock: 9000, stockUnit: 'litres', fobUsd: 2.6, plantIds: ['dhara-network'], exportStatus: 'on-request', moq: '1 × 20ft',
  },
]

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id)
