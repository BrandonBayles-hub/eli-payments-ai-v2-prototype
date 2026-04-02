import { Badge } from "@sandbox-components/ui/badge"
import { StatCard } from "@sandbox-components/composite/StatCard"
import { StatsRow } from "@sandbox-components/composite/StatsRow"
import { Progress } from "@sandbox-components/ui/progress"
import { Button } from "@sandbox-components/ui/button"
import { Skeleton } from "@sandbox-components/ui/skeleton"
import { Card, CardContent } from "@sandbox-components/ui/card"
import { EmptyState } from "@sandbox-components/composite/EmptyState"
import {
  Target,
  DollarSign,
  RefreshCw,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  Radio,
  FolderOpen,
} from "lucide-react"
import { cn } from "@sandbox/lib/utils"
import type { ActivationStatus, ChecklistItem, CompanyImplementation, EliProduct, ViewRole } from "../types"
import { CHANNEL_LABELS, PRODUCT_LABELS } from "../types"

const PRODUCTS: EliProduct[] = ["leasing", "payments", "renewals", "maintenance"]
const PI: Record<EliProduct, typeof Target> = { leasing: Target, payments: DollarSign, renewals: RefreshCw, maintenance: Wrench }
const RK: Record<EliProduct, "leasingReady" | "paymentsReady" | "renewalsReady" | "maintenanceReady"> = {
  leasing: "leasingReady", payments: "paymentsReady", renewals: "renewalsReady", maintenance: "maintenanceReady",
}
const AL: Record<ActivationStatus, string> = {
  not_ready: "Not Ready", staged: "Staged", trial_active: "Trial Active", trial_expired: "Trial Expired", live: "Live", partially_live: "Partially Live",
}
const AV: Record<ActivationStatus, "gray" | "yellow" | "blue" | "green" | "red"> = {
  not_ready: "gray", staged: "yellow", trial_active: "blue", trial_expired: "red", live: "green", partially_live: "yellow",
}
const CHS = ["chatStatus", "emailStatus", "smsStatus", "voiceStatus"] as const
const vis = (i: ChecklistItem, role: ViewRole) => role === "internal" || i.visibility !== "internal"
function pb(p: EliProduct, d: CompanyImplementation, role: ViewRole, ready: number, total: number) {
  if (!d.contractedProducts.includes(p)) return { variant: "gray" as const, label: "N/A" }
  const items = d.companyItems.filter((i) => i.product === p || i.product === "all")
  if (items.some((i) => vis(i, role) && i.status === "blocked")) return { variant: "red" as const, label: "Blocked" }
  if (total > 0 && ready === total) return { variant: "green" as const, label: "Ready" }
  return { variant: "yellow" as const, label: "In Progress" }
}

export interface OverviewDashboardProps {
  data: CompanyImplementation
  role: ViewRole
  viewState: string
  onNavigateToProperty: () => void
}

export function OverviewDashboard({ data, role, viewState, onNavigateToProperty }: OverviewDashboardProps) {
  if (viewState === "loading") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}</div>
        <Skeleton className="h-10 w-full max-w-xl rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}</div>
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    )
  }
  if (viewState === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-error-foreground mb-4" aria-hidden="true" />
        <h3 className="text-lg font-semibold mb-1">Unable to load implementation status</h3>
        <p className="text-sm text-muted-foreground mb-4">Something went wrong. Please try again.</p>
        <Button variant="outline" type="button">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try Again
        </Button>
      </div>
    )
  }
  if (viewState === "empty") {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No implementation data yet"
        description="Once your ELI+ rollout is configured, progress and readiness will appear here."
      />
    )
  }

  const clientNeedsInput = data.companyItems.filter((i) => vis(i, role) && i.status === "needs_input").length
  const total = data.propertiesTotal
  const denom = Math.max(total, 1)

  return (
    <div className="space-y-6">
      <StatsRow columns={4}>
        <StatCard label="Overall Progress" value={`${data.overallProgress}%`} icon={Zap} color="occupancy" />
        <StatCard label="Properties Ready" value={`${data.propertiesReady} / ${total}`} icon={CheckCircle2} color="financial" />
        <StatCard
          label={role === "client" ? "Items Need Your Input" : "Client Items Remaining"}
          value={String(role === "client" ? clientNeedsInput : data.clientItemsRemaining)}
          icon={role === "client" && clientNeedsInput > 0 ? Clock : CheckCircle2}
          color={role === "client" && clientNeedsInput > 0 ? "schedule" : "financial"}
        />
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2 min-w-0">
                <p className="text-sm text-muted-foreground">Activation Status</p>
                <Badge variant={AV[data.activationStatus]}>{AL[data.activationStatus]}</Badge>
              </div>
              <div className="p-2 rounded-lg bg-muted shrink-0">
                <Radio className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>
      </StatsRow>

      <div className="space-y-2 max-w-3xl">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Rollout progress</span>
          <span className="font-medium text-foreground">{data.overallProgress}%</span>
        </div>
        <Progress value={data.overallProgress} />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Product readiness</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRODUCTS.map((product) => {
            const contracted = data.contractedProducts.includes(product)
            const ready = contracted ? data.properties.filter((p) => p[RK[product]]).length : 0
            const pct = contracted ? Math.round((ready / denom) * 100) : 0
            const { variant, label } = pb(product, data, role, ready, total)
            const Icon = PI[product]
            return (
              <button
                key={product}
                type="button"
                aria-label={
                  role === "client"
                    ? `Open property readiness for ${PRODUCT_LABELS[product]}`
                    : `${PRODUCT_LABELS[product]} readiness`
                }
                onClick={() => role === "client" && onNavigateToProperty()}
                className={cn(
                  "rounded-lg border border-border bg-card p-4 text-left transition-colors",
                  role === "client" && "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
                    <span className="font-medium text-sm text-foreground truncate">{PRODUCT_LABELS[product]}</span>
                  </div>
                  <Badge variant={variant}>{label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Properties ready: {contracted ? `${ready} / ${total}` : "—"}
                </p>
                <Progress value={pct} className="h-2" />
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Channel availability</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {CHS.map((ch) => {
            const readyCount = data.properties.filter((p) => p[ch] === "ready").length
            return (
              <div key={ch} className="rounded-md border border-border bg-muted/30 px-3 py-2 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-medium text-foreground truncate">{CHANNEL_LABELS[ch]}</span>
                  <span className="text-xs text-muted-foreground shrink-0 tabular-nums">{readyCount}/{total}</span>
                </div>
                <Progress value={Math.round((readyCount / denom) * 100)} className="h-1" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
