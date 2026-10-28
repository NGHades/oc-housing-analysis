import { Kpi } from "@/components/ui/Kpi"
import { PageHeader } from "@/components/ui/PageHeader"
import { RatesCharts } from "@/components/ui/RatesCharts"
import { housing, monthLabel } from "@/lib/data"

const SINCE = "2000-01"

export default function Rates() {
  const rates = housing.rates.filter((r) => r.month >= SINCE)
  const latest = rates[rates.length - 1]
  const peak = rates.reduce((a, b) => (b.rate > a.rate ? b : a))
  const low = rates.reduce((a, b) => (b.rate < a.rate ? b : a))

  const priceAvg = housing.prices.map((row) => {
    const vals = housing.cities.map((c) => row[c]).filter((v): v is number => typeof v === "number")
    return { month: row.month as string, label: monthLabel(row.month as string), "Avg. home value": vals.reduce((a, b) => a + b, 0) / vals.length }
  })
  const rateByMonth = new Map(rates.map((r) => [r.month, r.rate]))
  const combined = priceAvg.map((p) => ({ ...p, "30-yr rate (%)": rateByMonth.get(p.month) ?? null }))

  return (
    <main>
      <PageHeader
        eyebrow="03 / Mortgage Rates"
        title="Mortgage Rates"
        description="Freddie Mac 30-year fixed rate (via FRED), monthly average of weekly readings. National, not local."
      />
      <section className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Latest" value={`${latest.rate.toFixed(2)}%`} note={`${monthLabel(latest.month)} (partial month)`} />
        <Kpi label={`Peak since ${SINCE.slice(0, 4)}`} value={`${peak.rate.toFixed(2)}%`} note={monthLabel(peak.month)} />
        <Kpi label={`Low since ${SINCE.slice(0, 4)}`} value={`${low.rate.toFixed(2)}%`} note={monthLabel(low.month)} />
      </section>

      <RatesCharts data={combined} />
      <p className="mt-4 text-xs text-gray-500">
        Shown side by side for context only. This page makes no causal claim about rates and prices.
      </p>
    </main>
  )
}
