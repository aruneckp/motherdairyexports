# Mother Dairy Global Exports

A React + Motion web portal for exporting Mother Dairy, Safal and Dhara products. It covers the export catalogue, market access and compliance by country, buyer and supplier management, a CRM pipeline, shipment tracking and an interactive trade map.

## Run

```bash
npm install
cp .env.example .env   # then set APP_USERNAME / APP_PASSWORD
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
npm run preview  # check the built site locally
```

## Deploy (static site)

The build is plain static files, so any static host works. On Render, create a **Static Site**:

| Setting | Value |
|---|---|
| Build Command | `npm ci --include=dev && npm run build` |
| Publish Directory | `dist` |
| Environment | `APP_USERNAME`, `APP_PASSWORD`, optional `SESSION_HOURS`, and `NODE_VERSION` = `24` |
| Redirects/Rewrites | Source `/*`, Destination `/index.html`, Action **Rewrite** (so links like `/crm` open the app) |

## Sign-in

Every page except `/login` requires a sign-in, configured with `APP_USERNAME` / `APP_PASSWORD` (and optional `SESSION_HOURS`, default 12) in `.env` or the host's build environment.

- The values are read **at build time**. After changing them, restart `npm run dev` or redeploy.
- The built app contains only a salted PBKDF2 hash of the password (see `vite.config.ts`), never the password itself. The browser hashes what is typed and compares (`src/lib/auth.ts`).
- Changing the username or password signs out existing sessions. After 5 wrong attempts, sign-in is locked for 15 minutes in that browser.
- With no server, this is a gate for casual visitors, not real security. Someone using the browser's dev tools can get past it, and a weak password can be guessed offline from the hash. Use a long password, and move the login and data behind a server before holding real customer data.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Motion (`motion/react`) · React Router · Recharts · Zustand (persisted to localStorage) · d3-geo + world-atlas for the maps.

## Pages

| Route | What it does |
|---|---|
| `/` | Dashboard: hero trade-lane map, sourced company facts, CRM KPIs, top opportunities, export value by region, pipeline, follow-ups |
| `/opportunities` | **Opportunity Spotter**: scores every product × market pair (demand, duty headroom, FTA, transit, season, existing buyers, plant certifications), with a heatmap, a season calendar, and one-click "Pitch" or "Lead" actions |
| `/showcase` | **Buyer Showcase**: client-facing catalogue filtered to what can ship to the buyer's country. Buyers can build a mixed container with volume-tier discounts and send a quote request, which creates a prospect, a lead and a follow-up in the CRM |
| `/pitch` | **Pitch Studio**: generates a branded export proposal (offer table with FOB/CIF and volume discounts, load plan, market readiness, documents, terms). It suggests cross-sell products for the market, and you can print to PDF, copy or draft the email, or save it to the CRM |
| `/map` | Global Trade Map: world markets coloured by region, by market access, or by opportunity score for a chosen product; click a market to zoom in and see its rules, buyers, pipeline and shipments. The India view shows plants, ports, supplier clusters and supply lanes |
| `/catalog` | Export catalogue from the official export range, with specs, documents, plants and a per-market access grid |
| `/compliance` | Shipment audit (eligibility + document checklist), access matrix (category × market with duty) and country rule sheets |
| `/crm` | Drag-and-drop deal pipeline, forecast, win rate, activity timeline |
| `/partners` | Buyer and supplier master data: search, filter, add/edit/delete, CSV export, credit exposure, supplier KPIs |
| `/shipments` | Container tracker with animated status stepper and document checklist |
| `/network` | Plants and the certification register published on motherdairy.com, plus export contacts |
| `/calculator` | FOB → CIF → landed cost estimator with currency conversion |

## Data provenance

- **Brand colours** were sampled from motherdairy.com: sky `#00A2E8`, aqua `#33CCAA`, navy `#184A7C`, coral `#F66753`, orange `#EE8E15`, olive `#ADBA55`, and the Source Sans font.
- **Published by the company** (`src/data/company.ts`, `src/data/plants.ts`):
  - the export range
  - plant certifications (FDA Bengaluru/Mumbai, FSSC 22000 Bengaluru, EIA Junagadh for non-EU dairy, ISO 22000, ISO 9001, Halal)
  - export office and contacts
- **Press figures** each carry a source link in the UI: FY26 turnover ₹20,300 Cr, ~60 lakh L/day milk procured, 9 milk + 4 horticulture plants, ~40 export markets, and the upcoming Nagpur, Itola and Kuppam (Andhra Pradesh) plants.
- **Market rules** (`src/data/countries.ts`) summarise known import regimes. Examples: EU/UK dairy not open to India, the EU erucic-acid limit on mustard oil, US FDA treatment of mustard oil, BICON for Australia and the CEPA/ECTA/CETA preferences. Duty rates are indicative planning numbers, so confirm them before quoting.
- **Product range**: 44 products. Lines marked "on request" come from the domestic Mother Dairy/Dhara range (ice cream, UHT milk, paneer, cheese, Dhara oils) rather than the published export range.
- **Opportunity scoring** (`src/lib/opportunity.ts`) uses an internal demand index (`src/data/demand.ts`). It is an estimate, so tune it with ITC Trade Map or APEDA statistics. Volume tiers and container capacities are in `src/lib/pricing.ts`.
- **CRM data is demo data.** This covers buyers, suppliers, deals, activities and shipments in `src/data/crm.ts`, and is marked as such in the UI. Replace it with live master data. Edits persist in the browser, and "Reset demo data" in the sidebar restores the seed.
