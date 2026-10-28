import { Badge } from "@/components/Badge"
import { Card } from "@/components/Card"

export function Kpi({
  label,
  value,
  delta,
  note,
}: {
  label: string
  value: string
  delta?: { text: string; positive: boolean | null }
  note?: string
}) {
  return (
    <Card>
      <p className="text-sm text-gray-500 dark:text-gray-500">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-3xl font-semibold tabular-nums text-gray-900 dark:text-gray-50">
          {value}
        </p>
        {delta && (
          <Badge
            variant={
              delta.positive === null ? "neutral" : delta.positive ? "success" : "error"
            }
          >
            {delta.text}
          </Badge>
        )}
      </div>
      {note && <p className="mt-2 text-xs text-gray-500">{note}</p>}
    </Card>
  )
}
