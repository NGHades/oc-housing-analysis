import raw from "@/data/housing.json"

export type CitySummary = {
  city: string
  latest_zhvi: number
  pct_change_1y: number
  pct_change_5y: number
  divergence_5y_pp: number
}

export type QualityCheck = {
  table: string
  check: string
  result: string
  status: "pass" | "fail" | "flag" | "skipped"
}

export type Housing = {
  generated: string
  latest_price_month: string
  cities: string[]
  prices: Record<string, string | number>[]
  indexed: Record<string, string | number>[]
  summary: CitySummary[]
  rates: { month: string; rate: number }[]
  quality: {
    checks: QualityCheck[]
    tables: {
      name: string
      rows: number
      first_month: string
      last_month: string
      cities: number | null
    }[]
    null_gaps: { table: string; column: string; city: string | null; month: string }[]
    not_loaded: string[]
    thresholds: { max_null_rate: number; max_mom_change: number }
  }
}

export const housing = raw as Housing

export const usd = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n)

export const usdCompact = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${Math.round(n / 1000)}K`

export const pct = (n: number, digits = 1) =>
  `${n > 0 ? "+" : ""}${n.toFixed(digits)}%`

export const monthLabel = (m: string) =>
  new Date(`${m}-01T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })

/** Average of the per-city latest ZHVI and changes (equal-weighted, not an official county index). */
export function averages() {
  const s = housing.summary
  const mean = (f: (c: CitySummary) => number) => s.reduce((a, c) => a + f(c), 0) / s.length
  return {
    zhvi: mean((c) => c.latest_zhvi),
    pct1y: mean((c) => c.pct_change_1y),
    pct5y: mean((c) => c.pct_change_5y),
  }
}
