import type { CategoryId } from './types'

// Internal demand index per market and category, 1 (low) to 5 (very strong).
// This is a planning estimate built from import patterns and Indian-diaspora presence;
// refine it with ITC Trade Map / APEDA export statistics before relying on it.
export const DEMAND: Record<string, Record<CategoryId, number>> = {
  UAE: { dairy: 5, pulp: 4, iqf: 4, gherkins: 2, fresh: 5, oilseeds: 3, spices: 5, oils: 5 },
  SAU: { dairy: 5, pulp: 4, iqf: 4, gherkins: 2, fresh: 4, oilseeds: 3, spices: 4, oils: 4 },
  QAT: { dairy: 4, pulp: 3, iqf: 3, gherkins: 1, fresh: 4, oilseeds: 2, spices: 4, oils: 4 },
  GBR: { dairy: 1, pulp: 4, iqf: 3, gherkins: 3, fresh: 4, oilseeds: 3, spices: 5, oils: 3 },
  NLD: { dairy: 1, pulp: 5, iqf: 3, gherkins: 5, fresh: 4, oilseeds: 4, spices: 4, oils: 2 },
  DEU: { dairy: 1, pulp: 4, iqf: 3, gherkins: 5, fresh: 3, oilseeds: 4, spices: 4, oils: 2 },
  USA: { dairy: 4, pulp: 5, iqf: 3, gherkins: 3, fresh: 2, oilseeds: 3, spices: 5, oils: 2 },
  CAN: { dairy: 2, pulp: 3, iqf: 3, gherkins: 3, fresh: 2, oilseeds: 2, spices: 4, oils: 2 },
  SGP: { dairy: 4, pulp: 3, iqf: 4, gherkins: 2, fresh: 4, oilseeds: 2, spices: 4, oils: 3 },
  MYS: { dairy: 4, pulp: 3, iqf: 3, gherkins: 1, fresh: 4, oilseeds: 3, spices: 4, oils: 3 },
  JPN: { dairy: 2, pulp: 4, iqf: 3, gherkins: 2, fresh: 2, oilseeds: 4, spices: 3, oils: 1 },
  AUS: { dairy: 1, pulp: 3, iqf: 3, gherkins: 3, fresh: 2, oilseeds: 2, spices: 4, oils: 2 },
  RUS: { dairy: 3, pulp: 4, iqf: 3, gherkins: 3, fresh: 4, oilseeds: 3, spices: 3, oils: 2 },
  BGD: { dairy: 5, pulp: 2, iqf: 2, gherkins: 1, fresh: 5, oilseeds: 3, spices: 4, oils: 5 },
  NPL: { dairy: 5, pulp: 2, iqf: 3, gherkins: 1, fresh: 4, oilseeds: 3, spices: 4, oils: 5 },
  LKA: { dairy: 4, pulp: 2, iqf: 2, gherkins: 1, fresh: 4, oilseeds: 2, spices: 3, oils: 4 },
  ZAF: { dairy: 2, pulp: 3, iqf: 2, gherkins: 2, fresh: 2, oilseeds: 2, spices: 4, oils: 2 },
  KEN: { dairy: 2, pulp: 2, iqf: 1, gherkins: 1, fresh: 2, oilseeds: 2, spices: 3, oils: 4 },
}

/** Markets with a large Indian diaspora, where ethnic retail pulls through Indian brands. */
export const DIASPORA_MARKETS = new Set(['UAE', 'SAU', 'QAT', 'USA', 'GBR', 'CAN', 'SGP', 'MYS', 'AUS', 'ZAF', 'KEN'])
