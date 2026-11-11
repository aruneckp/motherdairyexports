# Mother Dairy Global Exports

A React + Motion web portal for exporting Mother Dairy, Safal and Dhara products. It covers the export catalogue, market access and compliance by country, buyer and supplier management, a CRM pipeline, shipment tracking and an interactive trade map.

## Run

```bash
npm install
cp .env.example .env   # then set APP_USERNAME / APP_PASSWORD
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm start        # serve dist/ with the login API on PORT (default 4173), Node 22.18+
```

## Sign-in

Every page except `/login` requires a sign-in. The username and password come from `.env`:

| Variable | Purpose |
|---|---|
| `APP_USERNAME` / `APP_PASSWORD` | The portal login (username is not case-sensitive) |
| `SESSION_SECRET` | Signs the session cookie; generate with `openssl rand -hex 32` |
| `SESSION_HOURS` | How long a sign-in lasts (default 12) |
| `PORT` | Port for `npm start` |

- These variables have no `VITE_` prefix on purpose: they stay on the server and are never bundled into the browser JavaScript. The check runs in `server/auth.ts`, which is used by the Vite dev/preview server and by `npm start`.
- In dev, `.env` is re-read on every request, so a new password takes effect immediately. Changing the username or password signs out existing sessions.
- After 5 wrong attempts from one address, sign-in is locked for 15 minutes.
- Sessions are an HttpOnly cookie (marked `Secure` behind HTTPS).
- Serving `dist/` from a plain static host will not work, because the login API needs `npm start` or an equivalent server. On a host, you can set the same variables in its environment instead of `.env`.
- The login gates the app UI. The demo catalogue and CRM data are still compiled into the JavaScript bundle. Live data should come from an API that checks the same session.

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
