import { Card } from "@/components/Card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/Table"
import { PageHeader } from "@/components/ui/PageHeader"
import { housing, monthLabel, pct, usd } from "@/lib/data"
import { cx } from "@/lib/utils"

const tone = (n: number) =>
  n >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"

export default function Cities() {
  const rows = housing.summary
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.divergence_5y_pp)))

  return (
    <main>
      <PageHeader
        title="Cities"
        description={`Zillow ZHVI as of ${monthLabel(housing.latest_price_month)}. Divergence is each city's 5-year change minus the average city's, in percentage points.`}
      />
      <Card className="p-0">
        <TableRoot>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>City</TableHeaderCell>
                <TableHeaderCell className="text-right">Home value</TableHeaderCell>
                <TableHeaderCell className="text-right">1-yr</TableHeaderCell>
                <TableHeaderCell className="text-right">5-yr</TableHeaderCell>
                <TableHeaderCell className="min-w-56">Divergence from average (5-yr)</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.city}>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-50">{r.city}</TableCell>
                  <TableCell className="text-right tabular-nums">{usd(r.latest_zhvi)}</TableCell>
                  <TableCell className={cx("text-right tabular-nums", tone(r.pct_change_1y))}>
                    {pct(r.pct_change_1y)}
                  </TableCell>
                  <TableCell className={cx("text-right tabular-nums", tone(r.pct_change_5y))}>
                    {pct(r.pct_change_5y)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-2 w-40 rounded bg-gray-100 dark:bg-gray-800" aria-hidden="true">
                        <div className="absolute inset-y-0 left-1/2 w-px bg-gray-400" />
                        <div
                          className={cx(
                            "absolute inset-y-0 rounded",
                            r.divergence_5y_pp >= 0 ? "left-1/2 bg-blue-500" : "right-1/2 bg-amber-500",
                          )}
                          style={{ width: `${(Math.abs(r.divergence_5y_pp) / maxAbs) * 50}%` }}
                        />
                      </div>
                      <span className="w-16 text-xs tabular-nums text-gray-700 dark:text-gray-300">
                        {r.divergence_5y_pp > 0 ? "+" : ""}
                        {r.divergence_5y_pp.toFixed(1)} pts
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableRoot>
      </Card>
      <p className="mt-4 text-xs text-gray-500">
        ZHVI is a smoothed estimate of typical home value, not actual sale prices. The average city is
        an equal-weighted mean of the cities shown, not an official county figure.
      </p>
    </main>
  )
}
