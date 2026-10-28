import { Badge } from "@/components/Badge"
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
import { housing, monthLabel, type QualityCheck } from "@/lib/data"

const statusVariant: Record<QualityCheck["status"], "success" | "error" | "warning" | "neutral"> = {
  pass: "success",
  fail: "error",
  flag: "warning",
  skipped: "neutral",
}

const stages = (notLoaded: string[]) => [
  { name: "Download Zillow ZHVI", done: true },
  { name: "Download FRED mortgage rates", done: true },
  { name: "Download Redfin market tracker", done: !notLoaded.includes("market_stats"), note: "Manual download required (S3 access denied)" },
  { name: "Pandera schemas and validation", done: true },
  { name: "Quality report", done: true },
  { name: "Analysis and charts", done: true },
  { name: "Findings write-up", done: false },
]

export default function Quality() {
  const { quality } = housing
  const progress = stages(quality.not_loaded)
  const done = progress.filter((s) => s.done).length

  return (
    <main>
      <PageHeader
        eyebrow="04 / Data Quality"
        title="Data Quality"
        description={`Pipeline progress and validation results. Generated ${housing.generated}. Thresholds: null rate ≤ ${(quality.thresholds.max_null_rate * 100).toFixed(0)}%, month-over-month change ≤ ${(quality.thresholds.max_mom_change * 100).toFixed(0)}%.`}
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500">
            Pipeline progress ({done} of {progress.length})
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {progress.map((s) => (
              <li key={s.name} className="flex items-start gap-2">
                <Badge variant={s.done ? "success" : "warning"}>{s.done ? "Done" : "Pending"}</Badge>
                <span className="text-gray-700 dark:text-gray-300">
                  {s.name}
                  {!s.done && s.note && <span className="block text-xs text-gray-500">{s.note}</span>}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500">Loaded tables</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {quality.tables.map((t) => (
              <li key={t.name}>
                <p className="font-medium text-gray-900 dark:text-gray-50">{t.name}</p>
                <p className="text-gray-600 dark:text-gray-400">
                  {t.rows.toLocaleString()} rows · {monthLabel(t.first_month)} to {monthLabel(t.last_month)}
                  {t.cities !== null && ` · ${t.cities} cities`}
                </p>
              </li>
            ))}
            {quality.not_loaded.map((n) => (
              <li key={n}>
                <p className="font-medium text-gray-900 dark:text-gray-50">
                  {n} <Badge variant="warning">Not loaded</Badge>
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="mt-8">
        <Card className="p-0">
          <TableRoot>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Table</TableHeaderCell>
                  <TableHeaderCell>Check</TableHeaderCell>
                  <TableHeaderCell>Result</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quality.checks.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-gray-900 dark:text-gray-50">{c.table}</TableCell>
                    <TableCell>{c.check}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[c.status]}>{c.result}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableRoot>
        </Card>
      </section>

      {quality.null_gaps.length > 0 && (
        <section className="mt-8">
          <Card>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500">Issues kept for review</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Null values are kept as null, not imputed.
            </p>
            <ul className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-300">
              {quality.null_gaps.map((g, i) => (
                <li key={i}>
                  {g.table}.{g.column}: {g.city} in {monthLabel(g.month)}
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}
    </main>
  )
}
