"use client"

import { Card } from "@/components/Card"
import { LineChart } from "@/components/LineChart"
import { usdCompact } from "@/lib/data"

export function RatesCharts({ data }: { data: Record<string, string | number | null>[] }) {
  return (
    <section className="mt-8 grid gap-4">
      <Card>
        <h2 className="font-semibold text-gray-900 dark:text-gray-50">30-year mortgage rate</h2>
        <LineChart
          className="mt-4 h-64"
          data={data}
          index="label"
          categories={["30-yr rate (%)"]}
          colors={["amber"]}
          valueFormatter={(v) => `${v.toFixed(2)}%`}
          connectNulls
          tickGap={60}
          yAxisWidth={44}
        />
      </Card>
      <Card>
        <h2 className="font-semibold text-gray-900 dark:text-gray-50">
          Average home value (same time axis)
        </h2>
        <LineChart
          className="mt-4 h-64"
          data={data}
          index="label"
          categories={["Avg. home value"]}
          colors={["blue"]}
          valueFormatter={usdCompact}
          tickGap={60}
          yAxisWidth={60}
        />
      </Card>
    </section>
  )
}
