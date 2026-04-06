import type { PageId } from "../index"
import { NEEDS_ATTENTION } from "../data/mock"
import {
  LayoutDashboard,
  Building2,
  Shield,
  Mail,
  Users,
  CreditCard,
  Wrench,
  RefreshCw,
  Rocket,
  Settings2,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
} from "lucide-react"
import { cn } from "@sandbox-lib/utils"
import { Progress } from "@sandbox-components/ui/progress"

const PAYMENT_TASK_IDS = [
  "rent-charge-date",
  "rent-due-date",
  "payment-plans",
  "payment-block-date",
  "payment-link",
  "grace-period",
  "outstanding-balance",
  "late-fee-policy",
  "payment-plan-policy",
  "payment-options",
]

const MAINTENANCE_TASK_IDS = [
  "maintenance-during-escalation",
  "maintenance-after-escalation",
]

const RENEWALS_TASK_IDS = [
  "renewal-lead-time",
]

const LEASING_TASK_IDS = [
  "agent-goal",
  "model-units",
  "tour-types",
  "tour-priority",
]

const SUB_ITEMS = [
  { id: "company"            as PageId, label: "10DLC Compliance",       icon: Building2,      taskIds: [] as string[], indent: false },
  { id: "privacy"            as PageId, label: "Privacy Policies",       icon: Shield,         taskIds: ["privacy"],    indent: false },
  { id: "email"              as PageId, label: "Email Integration",      icon: Mail,           taskIds: [] as string[], indent: false, notification: true },
  { id: "leasing"            as PageId, label: "Leasing AI",             icon: Users,          taskIds: LEASING_TASK_IDS, indent: false },
  { id: "payments"           as PageId, label: "Payments AI",            icon: CreditCard,     taskIds: PAYMENT_TASK_IDS, indent: false },
  { id: "maintenance"        as PageId, label: "Maintenance AI",         icon: Wrench,     taskIds: MAINTENANCE_TASK_IDS, indent: false },
  { id: "renewals"           as PageId, label: "Renewals AI",            icon: RefreshCw,  taskIds: RENEWALS_TASK_IDS, indent: false },
]

const STATUS: Partial<Record<PageId, "complete" | "warning" | "blocked">> = {
  company: "complete",
  payments: "warning",
}

function StatusIcon({ status }: { status?: "complete" | "warning" | "blocked" }) {
  if (status === "complete") return <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
  if (status === "blocked") return <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
  return null
}

const ROLLOUT_PCT = 62

interface HybridShellProps {
  page: PageId
  navigate: (to: PageId) => void
  completedTasks: Set<string>
  children: React.ReactNode
}

export function HybridShell({ page, navigate, completedTasks, children }: HybridShellProps) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] bg-background">
      <aside
        className="w-[240px] shrink-0 border-r border-border bg-card flex flex-col"
        aria-label="ELI+ setup navigation"
      >
        {/* Logo + Progress — combined */}
        <div className="px-4 py-4 border-b border-border space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0">
              <Rocket className="h-4 w-4 text-white" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight">ELI+ Setup</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-medium mb-1.5">
              <span className="flex items-center gap-1 text-muted-foreground uppercase tracking-wide">
                Overall Progress
                <span className="group relative inline-flex">
                  <Info className="h-3 w-3 text-muted-foreground/60 cursor-default" />
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 rounded-md bg-popover border border-border px-2.5 py-1.5 text-[11px] text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity normal-case tracking-normal font-normal leading-snug whitespace-normal z-50">
                    48 of 52 properties pending Payments &amp; Leasing AI
                  </span>
                </span>
              </span>
              <span className="text-emerald-700">{ROLLOUT_PCT}%</span>
            </div>
            <Progress value={ROLLOUT_PCT} className="h-1.5" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-4" aria-label="Setup steps">

          {/* AI Settings group */}
          <div>
            <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              AI Settings
            </p>

            {/* Badge legend */}
            <div className="mx-1 mb-2.5 rounded-lg border border-border bg-zinc-50 px-2.5 py-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">!</span>
                <span className="text-[11px] text-foreground font-medium leading-tight">Required before go-live</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white leading-none">✓</span>
                <span className="text-[11px] text-muted-foreground leading-tight">Defaults applied — no action needed</span>
              </div>
            </div>

            {/* Overview — top-level */}
            {(() => {
              const totalBlocking = NEEDS_ATTENTION.filter((i) => {
                if (completedTasks.has(i.id)) return false
                return i.severity === "critical" || i.severity === "attention"
              }).length
              return (
                <button
                  type="button"
                  onClick={() => navigate("overview")}
                  className={cn(
                    "w-full flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors mb-0.5",
                    page === "overview"
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="flex-1 text-left">Overview</span>
                  {totalBlocking > 0 && (
                    <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                      {totalBlocking}
                    </span>
                  )}
                </button>
              )
            })()}

            {/* Sub-tabs with vertical line */}
            <div className="ml-[18px] border-l border-border pl-2 space-y-0.5">
              {SUB_ITEMS.map(({ id, label, icon: Icon, taskIds, indent, comingSoon, notification }) => {
                // Red-worthy: critical or attention items not yet completed
                const isProductTab = ["leasing", "payments", "maintenance", "renewals"].includes(id)
                const blockingCount = taskIds.filter((t) => {
                  if (completedTasks.has(t)) return false
                  const item = NEEDS_ATTENTION.find((i) => i.to === t)
                  return item && item.severity !== "default" && item.severity !== "waiting"
                }).length + (isProductTab ? NEEDS_ATTENTION.filter((i) =>
                  i.product === "all" &&
                  !completedTasks.has(i.id) &&
                  (i.severity === "critical" || i.severity === "attention")
                ).length : 0)
                // Blue-worthy: default items not yet dismissed/completed
                const defaultCount = taskIds.filter((t) => {
                  if (completedTasks.has(t)) return false
                  const item = NEEDS_ATTENTION.find((i) => i.to === t)
                  return item && item.severity === "default"
                }).length
                const allDone = taskIds.length > 0 && blockingCount === 0 && defaultCount === 0
                const isComplete = STATUS[id] === "complete" || allDone
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => navigate(id)}
                    className={cn(
                      "w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                      page === id
                        ? "bg-accent text-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                    )}
                  >
                    {Icon && <Icon className={cn("h-3.5 w-3.5 shrink-0", isComplete ? "text-emerald-700" : undefined)} aria-hidden />}
                    <span className="flex-1 text-left text-xs">{label}</span>
                    {!comingSoon && <StatusIcon status={isComplete ? "complete" : STATUS[id]} />}
                    {/* Red: has blocking items */}
                    {!comingSoon && blockingCount > 0 && (
                      <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                        {blockingCount}
                      </span>
                    )}
                    {/* Blue: only optional defaults remaining */}
                    {!comingSoon && blockingCount === 0 && defaultCount > 0 && (
                      <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-500 text-[10px] font-bold text-white leading-none">
                        {defaultCount}
                      </span>
                    )}
                    {/* Red dot: manual notification flag (e.g. email) */}
                    {notification && blockingCount === 0 && defaultCount === 0 && (
                      <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                        1
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Activate group */}
          <div>
            <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              Activate
            </p>
            <button
              type="button"
              onClick={() => navigate("golive")}
              className={cn(
                "w-full flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors",
                page === "golive"
                  ? "bg-accent text-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <Rocket className={cn("h-4 w-4 shrink-0", STATUS["golive"] === "complete" ? "text-emerald-700" : undefined)} aria-hidden />
              <span className="flex-1 text-left">Go Live</span>
              <StatusIcon status={STATUS["golive"]} />
            </button>
          </div>

        </nav>

        {/* Advanced shortcut */}
        <div className="px-2 pb-3 border-t border-border pt-3">
          <button
            type="button"
            onClick={() => navigate("payments-advanced")}
            className={cn(
              "w-full flex items-center gap-2 rounded-md px-2 py-2 text-sm border border-dashed transition-colors",
              page === "payments-advanced"
                ? "border-foreground bg-foreground text-background font-medium"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
            )}
          >
            <Settings2 className="h-4 w-4 shrink-0" aria-hidden />
            <span className="text-xs font-medium">Advanced — Payments</span>
          </button>
        </div>
      </aside>

      <div id="main-content" className="flex-1 min-w-0 bg-background overflow-auto">
        {children}
      </div>
    </div>
  )
}
