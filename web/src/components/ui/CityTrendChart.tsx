"use client"

import { LineChart } from "@/components/LineChart"
import { cx } from "@/lib/utils"
import { housing, monthLabel } from "@/lib/data"
import { useState } from "react"

const COLORS = ["blue", "emerald", "violet", "amber", "cyan", "pink", "lime", "fuchsia"] as const
const MAX_SELECTED = COLORS.length - 1 // one slot is reserved for the average line

export function CityTrendChart() {
  const [selected, setSelected] = useState(["Irvine", "Anaheim", "Newport Beach"])
  const categories = ["Average", ...selected]

  const toggle = (city: string) =>
    setSelected((s) =>
      s.includes(city)
        ? s.filter((c) => c !== city)
        : s.length < MAX_SELECTED
          ? [...s, city]
          : s,
    )

  const data = housing.indexed.map((row) => ({ ...row, label: monthLabel(row.month as string) }))

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {housing.cities.map((city) => {
          const on = selected.includes(city)
          return (
            <button
              key={city}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(city)}
              className={cx(
                "rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition",
                on
                  ? "bg-blue-50 text-blue-900 ring-blue-500/30 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30"
                  : "text-gray-600 ring-gray-300 hover:bg-gray-50 dark:text-gray-400 dark:ring-gray-800 dark:hover:bg-gray-900",
              )}
            >
              {city}
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Select up to {MAX_SELECTED} cities. &quot;Average&quot; is the equal-weighted mean of all{" "}
        {housing.cities.length} cities.
      </p>
      <LineChart
        className="mt-4 h-80"
        data={data}
        index="label"
        categories={categories}
        colors={["gray", ...COLORS.slice(0, selected.length)]}
        valueFormatter={(v) => v.toFixed(1)}
        yAxisWidth={44}
        autoMinValue
        tickGap={40}
      />
    </div>
  )
}
