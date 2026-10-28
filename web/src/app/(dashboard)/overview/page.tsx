import { Badge } from "@/components/Badge"
import { Card } from "@/components/Card"
import { CityTrendChart } from "@/components/ui/CityTrendChart"
import { Kpi } from "@/components/ui/Kpi"
import { PageHeader } from "@/components/ui/PageHeader"
import { averages, housing, monthLabel, pct, usdCompact } from "@/lib/data"

export default function Overview() {
  const avg = averages()
  const { rates, quality, summary } = housing
  const latestRate = rates[rates.length - 1]
  const yearAgo = rates[rates.length - 1 - 12]
  const rateDelta = latestRate.rate - yearAgo.rate
  const passing = quality.checks.filter((c) => c.status === "pass").length
  const failing = quality.checks.filter((c) => c.status === "fail").length
  const yearsBack = (n: number) => {
    const [y, m] = housing.latest_price_month.split("-")
    return monthLabel(`${Number(y) - n}-${m}`)
  }
  const leaders = summary.slice(0, 3)
  const laggards = summary.slice(-3).reverse()

  return (
    <main>
      <PageHeader
        eyebrow="01 / Overview"
        title="Overview"
        description={`Home values through ${monthLabel(housing.latest_price_month)} across ${housing.cities.length} Orange County cities. Descriptive only; not a forecast.`}
      />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Avg. typical home value"
          value={usdCompact(avg.zhvi)}
          note="Zillow ZHVI, mean of cities"
        />
        <Kpi
          label="1-year change"
          value={pct(avg.pct1y)}
          delta={{ text: `vs. ${yearsBack(1)}`, positive: avg.pct1y > 0 }}
        />
        <Kpi
          label="5-year change"
          value={pct(avg.pct5y)}
          delta={{ text: `vs. ${yearsBack(5)}`, positive: avg.pct5y > 0 }}
        />
        <Kpi
          label="30-yr mortgage rate"
          value={`${latestRate.rate.toFixed(2)}%`}
          delta={{
            text: `${rateDelta > 0 ? "+" : ""}${rateDelta.toFixed(2)} pts YoY`,
            positive: null,
          }}
          note={`${monthLabel(latestRate.month)} (partial month), national`}
        />
      </section>

      <section className="mt-8">
        <Card>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500">
            Indexed home values (start = 100, {monthLabel(housing.indexed[0].month as string)})
          </h2>
          <div className="mt-4">
            <CityTrendChart />
          </div>
        </Card>
      </section>

      <section className="mt-8 rounded-[14px] bg-gray-900 px-8 py-16 text-white sm:px-14 sm:py-24">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray-400">
          Five-year picture
        </p>
        <p className="mt-7 max-w-4xl font-display text-4xl font-normal leading-[0.98] tracking-[-0.07em] sm:text-6xl">
          {leaders[0].city} and {leaders[1].city} rose most over five years.{" "}
          <span className="text-[#7e8992]">
            {laggards[0].city} and {laggards[1].city} rose least.
          </span>
        </p>
        <p className="mt-8 max-w-xs text-[13px] leading-[1.7] text-[#aeb6bc]">
          Descriptive comparison of Zillow ZHVI changes across {housing.cities.length} cities. Not a forecast, and not a causal claim.
        </p>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500">Strongest 5-year growth</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {leaders.map((c) => (
              <li key={c.city} className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">{c.city}</span>
                <span className="tabular-nums text-gray-900 dark:text-gray-50">{pct(c.pct_change_5y)}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500">Weakest 5-year growth</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {laggards.map((c) => (
              <li key={c.city} className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">{c.city}</span>
                <span className="tabular-nums text-gray-900 dark:text-gray-50">{pct(c.pct_change_5y)}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500">Data status</h2>
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
            {passing} of {quality.checks.length} checks passing
            {failing > 0 && `, ${failing} failing`}.
          </p>
          {quality.not_loaded.length > 0 && (
            <p className="mt-2 text-sm">
              <Badge variant="warning">Pending</Badge>{" "}
              <span className="text-gray-700 dark:text-gray-300">
                {quality.not_loaded.join(", ")} (Redfin data not loaded)
              </span>
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">Generated {housing.generated}</p>
        </Card>
      </section>
    </main>
  )
}
