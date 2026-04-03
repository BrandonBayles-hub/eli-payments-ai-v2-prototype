import { useMemo, useState, type ReactNode } from "react"
import { ArrowRight, AlertCircle, AlertTriangle, CheckCircle2, Circle, Clock, FolderOpen, Lock, RefreshCw, Shield } from "lucide-react"
import { Badge } from "@sandbox-components/ui/badge"
import { Button } from "@sandbox-components/ui/button"
import { Progress } from "@sandbox-components/ui/progress"
import { Skeleton } from "@sandbox-components/ui/skeleton"
import { EmptyState } from "@sandbox-components/composite/EmptyState"
import type { ChecklistItem, ItemCategory, ItemStatus } from "../types"

export interface InternalPipelineProps {
  items: ChecklistItem[]
  viewState: string
}

type EngineConfig = { key: string; label: string; description: string; categories: ItemCategory[] }

const ENGINES: EngineConfig[] = [
  { key: "plumbing", label: "Engine 1: Plumbing", description: "Everything that does not interact with the resident yet.", categories: ["backend_plumbing", "twilio_registration"] },
  { key: "studio", label: "Engine 2: Agent Studio", description: "Configuration and tuning. Settings, defaults, product-specific tuning.", categories: ["eli_settings", "company_info", "property_details"] },
  { key: "rollout", label: "Engine 3: Full Rollout", description: "Go live, activation trigger, safety gates.", categories: ["activation"] },
]

function isDone(s: ItemStatus) {
  return s === "complete" || s === "auto_confirmed"
}

function statusBadgeVariant(s: ItemStatus): "green" | "yellow" | "red" | "blue" | "gray" {
  if (isDone(s)) return "green"
  if (s === "blocked") return "red"
  if (s === "needs_input") return "yellow"
  if (s === "in_progress") return "blue"
  return "gray"
}

function statusLabel(s: ItemStatus): string {
  if (isDone(s)) return "Done"
  if (s === "in_progress") return "In Progress"
  if (s === "needs_input") return "Awaiting Client"
  if (s === "blocked") return "Blocked"
  return "Not Started"
}

function statusIcon(s: ItemStatus): ReactNode {
  if (isDone(s)) return <CheckCircle2 className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
  if (s === "in_progress") return <Clock className="h-4 w-4 text-primary animate-pulse shrink-0" aria-hidden="true" />
  if (s === "needs_input") return <Clock className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
  if (s === "blocked") return <AlertTriangle className="h-4 w-4 text-error-foreground shrink-0" aria-hidden="true" />
  return <Circle className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
}

function groupByOwner(rows: ChecklistItem[]): [string, ChecklistItem[]][] {
  const m = new Map<string, ChecklistItem[]>()
  for (const r of rows) {
    const o = r.internalOwner?.trim() || "Unassigned"
    m.set(o, [...(m.get(o) ?? []), r])
  }
  return [...m.entries()].sort(([a], [b]) => (a === "Unassigned" ? 1 : b === "Unassigned" ? -1 : a.localeCompare(b)))
}

function EngineBlock({
  engine,
  items,
  overrides,
  onMarkDone,
  showConnectorAfter,
  nextUnlocked,
}: {
  engine: EngineConfig
  items: ChecklistItem[]
  overrides: Record<string, ItemStatus>
  onMarkDone: (id: string) => void
  showConnectorAfter: boolean
  nextUnlocked: boolean
}) {
  const rows = items.filter((i) => engine.categories.includes(i.category))
  if (rows.length === 0) return null
  const done = rows.filter((i) => isDone(overrides[i.id] ?? i.status)).length
  const pct = Math.round((done / rows.length) * 100)

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-base font-semibold">{engine.label}</h3>
            <p className="text-xs text-muted-foreground">{engine.description}</p>
          </div>
          <Badge variant={pct === 100 ? "green" : pct > 50 ? "yellow" : "gray"} className="shrink-0 w-fit">
            {done}/{rows.length}
          </Badge>
        </div>
        <Progress value={pct} className="h-2" />
        <div className="bg-muted rounded-lg overflow-hidden divide-y divide-border">
          {groupByOwner(rows).map(([owner, group]) => (
            <div key={owner}>
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/80">
                {owner} · {group.length} {group.length === 1 ? "item" : "items"}
              </div>
              {group.map((item) => {
                const s = overrides[item.id] ?? item.status
                const canMark = s === "not_started" || s === "in_progress"
                return (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                    {statusIcon(s)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.label}</p>
                    </div>
                    {canMark && (
                      <Button type="button" variant="outline" size="sm" onClick={() => onMarkDone(item.id)} aria-label={`Mark ${item.label} done`}>
                        Mark Done
                      </Button>
                    )}
                    <Badge variant={statusBadgeVariant(s)}>{statusLabel(s)}</Badge>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      {showConnectorAfter && (
        <p className={`flex items-center gap-2 text-xs ${nextUnlocked ? "font-medium text-success-foreground" : "text-muted-foreground"}`}>
          <ArrowRight className="h-3 w-3 shrink-0" aria-hidden="true" />
          {nextUnlocked ? "Unlocked" : `Engine ${engine.key === "plumbing" ? "2" : "3"} unlocked when Engine ${engine.key === "plumbing" ? "1" : "2"} completes`}
        </p>
      )}
    </>
  )
}

export function InternalPipeline({ items, viewState }: InternalPipelineProps) {
  const [overrides, setOverrides] = useState<Record<string, ItemStatus>>({})
  const onMarkDone = (id: string) => setOverrides((o) => ({ ...o, [id]: "complete" }))

  const engineCompletion = useMemo(() => {
    const res = ENGINES.map((e) => {
      const rows = items.filter((i) => e.categories.includes(i.category))
      if (rows.length === 0) return true
      return rows.every((i) => isDone(overrides[i.id] ?? i.status))
    })
    return res
  }, [items, overrides])

  if (viewState === "loading") {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full rounded-lg" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-36 w-full rounded-lg" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (viewState === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-error-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-1">Unable to load pipeline</h3>
        <p className="text-sm text-muted-foreground mb-4">Something went wrong. Please try again.</p>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  if (viewState === "empty") {
    return <EmptyState icon={Shield} title="No active implementation pipeline" description="When a client is contracted for ELI+, this view shows the 3-engine pipeline: Plumbing (Twilio, shells, email), Agent Studio (settings, defaults, sync), and Full Rollout (activation, safety gates, metrics). Each engine has per-step status, owner attribution, and dependency tracking." />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3 border border-border">
        <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>This view is only visible to Entrata employees.</span>
      </div>
      {ENGINES.map((engine, idx) => (
        <EngineBlock
          key={engine.key}
          engine={engine}
          items={items}
          overrides={overrides}
          onMarkDone={onMarkDone}
          showConnectorAfter={idx < ENGINES.length - 1}
          nextUnlocked={engineCompletion[idx]!}
        />
      ))}
    </div>
  )
}
