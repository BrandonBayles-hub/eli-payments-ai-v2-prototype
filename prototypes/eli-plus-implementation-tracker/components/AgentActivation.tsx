import { useMemo, useState, type ReactNode } from "react"
import { DeployButton, TrialBanner } from "@sandbox-components/composite/agent"
import { Badge } from "@sandbox-components/ui/badge"
import { Button } from "@sandbox-components/ui/button"
import { Alert } from "@sandbox-components/ui/alert"
import { Progress } from "@sandbox-components/ui/progress"
import { Skeleton } from "@sandbox-components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@sandbox-components/ui/card"
import { EliGradientBorder } from "@sandbox-components/ui/eli-gradient-border"
import { EmptyState } from "@sandbox-components/composite/EmptyState"
import { ConfirmDialog } from "@sandbox-components/composite/ConfirmDialog"
import { AlertCircle, CheckCircle2, RefreshCw, Rocket } from "lucide-react"
import type { CompanyImplementation, EliProduct, ItemStatus, ViewRole } from "../types"
import { PRODUCT_LABELS, STATUS_LABELS } from "../types"

const ALL: EliProduct[] = ["leasing", "payments", "renewals", "maintenance"]
const RK: Record<EliProduct, "leasingReady" | "paymentsReady" | "renewalsReady" | "maintenanceReady"> = {
  leasing: "leasingReady", payments: "paymentsReady", renewals: "renewalsReady", maintenance: "maintenanceReady",
}
const fmt = (iso?: string) =>
  !iso ? "—" : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso))
const rank = (s: ItemStatus) => ({ blocked: 0, needs_input: 1, in_progress: 2, not_started: 3 }[s] ?? 9)
const itemVar = (s: ItemStatus): "red" | "yellow" | "blue" | "gray" | "green" =>
  s === "blocked" ? "red" : s === "needs_input" ? "yellow" : s === "in_progress" ? "blue" : s === "complete" || s === "auto_confirmed" ? "green" : "gray"
const live = (d: CompanyImplementation, p: EliProduct) => {
  const r = d.properties.filter((x) => x.contractedProducts.includes(p))
  return r.length > 0 && r.every((x) => x[RK[p]])
}

function Channels({ data }: { data: CompanyImplementation }) {
  const chs = ["chatStatus", "emailStatus", "smsStatus", "voiceStatus"] as const
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-muted/30">
      {chs.map((ch) => {
        const lb = ch.replace("Status", "").replace(/^./, (c) => c.toUpperCase())
        const n = data.properties.filter((p) => p[ch] === "ready").length
        const pct = data.propertiesTotal ? Math.round((n / data.propertiesTotal) * 100) : 0
        return (
          <div key={ch} className="flex items-center justify-between px-3 py-2 text-sm">
            <span className="font-medium">{lb}</span>
            <span className="text-muted-foreground tabular-nums">{n} / {data.propertiesTotal} ({pct}%)</span>
          </div>
        )
      })}
    </div>
  )
}

function Products({ data, kind }: { data: CompanyImplementation; kind: "staged" | "trial" | "live" | "partial" }) {
  return (
    <div className="divide-y divide-border">
      {ALL.map((p) => {
        const c = data.contractedProducts.includes(p)
        const lv = live(data, p)
        let r: ReactNode
        if (kind === "staged") r = <CheckCircle2 className="h-4 w-4 text-success-foreground" aria-hidden="true" />
        else if (kind === "trial") r = <Badge variant="green">Active</Badge>
        else if (kind === "live") r = c ? <Badge variant="green">Active</Badge> : <Badge variant="gray">Not contracted</Badge>
        else r = !c ? <Badge variant="gray">Not contracted</Badge> : lv ? <Badge variant="green">Active</Badge> : <Badge variant="yellow">Pending</Badge>
        return (
          <div key={p} className="flex items-center justify-between py-2">
            <span className="text-sm font-medium">{PRODUCT_LABELS[p]}</span>
            {r}
          </div>
        )
      })}
    </div>
  )
}

export interface AgentActivationProps {
  data: CompanyImplementation
  role: ViewRole
  viewState: string
}

export function AgentActivation({ data, role, viewState }: AgentActivationProps) {
  const [ok, setOk] = useState(false)
  const [off, setOff] = useState(false)
  const st = data.activationStatus ?? "not_ready"
  const blockers = useMemo(() => {
    const vis = (i: (typeof data.companyItems)[0]) => (role === "client" ? i.visibility !== "internal" : true)
    const bad = (s: ItemStatus) => s !== "complete" && s !== "auto_confirmed"
    return [...data.companyItems].filter((i) => vis(i) && bad(i.status)).sort((a, b) => rank(a.status) - rank(b.status)).slice(0, 3)
  }, [data.companyItems, role])
  const nProps = data.propertiesTotal - data.propertiesReady

  if (viewState === "loading") {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-48" /><Skeleton className="h-4 max-w-md w-full mt-2" /></CardHeader>
        <CardContent className="space-y-4"><Skeleton className="h-2 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-10 w-40" /></CardContent>
      </Card>
    )
  }
  if (viewState === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-error-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-1">Unable to load activation</h3>
        <p className="text-sm text-muted-foreground mb-4">Something went wrong. Please try again.</p>
        <Button variant="outline"><RefreshCw className="h-4 w-4" />Try Again</Button>
      </div>
    )
  }
  if (viewState === "empty") {
    return (
      <EmptyState icon={Rocket} title="ELI+ activation will appear here when you're ready"
        description="Once your implementation checklist is complete and all properties are staged, this page will show your activation controls. We'll verify that carrier registration is approved, settings are synced, emergency contacts are confirmed, and every property has the channels it needs. When everything checks out, you'll see a single button to go live." />
    )
  }
  if (st === "trial_expired") {
    return (
      <div className="rounded-lg border border-border overflow-hidden">
        <TrialBanner trialEndsAt={data.trialEndsAt ?? new Date(0).toISOString()} />
        <Card className="border-0 shadow-none rounded-none"><CardHeader><CardTitle className="text-xl">Trial ended</CardTitle>
          <p className="text-sm text-muted-foreground">Contact your account manager to renew or subscribe.</p></CardHeader></Card>
      </div>
    )
  }
  if (st === "not_ready") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{role === "client" ? "Almost There" : "Staging Status"}</CardTitle>
          <p className="text-sm text-muted-foreground">{data.clientItemsRemaining} item{data.clientItemsRemaining !== 1 ? "s" : ""} need{role === "client" ? " your input" : " client input"} · {nProps} propert{nProps !== 1 ? "ies" : "y"} not ready</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Overall progress</span><span className="font-medium tabular-nums">{data.overallProgress}%</span></div>
            <Progress value={data.overallProgress} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold">Top blockers</p>
            <ul className="space-y-2">
              {blockers.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                  <span className="font-medium">{item.label}</span>
                  <Badge variant={itemVar(item.status)}>{STATUS_LABELS[item.status]}</Badge>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <DeployButton label="Activate ELI+" onClick={() => {}} disabled visuallyDisabled requireConfirmation={false} />
            <p className="text-xs text-muted-foreground">Complete the remaining items above to unlock activation.</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  if (st === "staged") {
    if (ok) {
      return <Alert variant="success" title="Activation scheduled">ELI+ activation is queued. Resident communications will transition on the next maintenance window.</Alert>
    }
    return (
      <EliGradientBorder active={false}>
        <Card className="border-0 shadow-none bg-card">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><CheckCircle2 className="h-6 w-6 text-success-foreground" aria-hidden="true" />Ready to Go Live</CardTitle>
            <p className="text-sm text-muted-foreground">All prerequisites are complete. Your properties are staged and ready.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-border p-4 bg-muted/20"><p className="text-sm font-semibold mb-2">Products</p><Products data={data} kind="staged" /></div>
            <p className="text-sm"><span className="font-medium">Properties ready:</span> <span className="text-muted-foreground">{data.propertiesReady} of {data.propertiesTotal} properties staged</span></p>
            <DeployButton label="Activate ELI+" onClick={() => setOk(true)} requireConfirmation confirmationRecordCount={data.propertiesTotal} confirmationDescription="ELI+ will begin handling resident communications for all staged properties." />
          </CardContent>
        </Card>
      </EliGradientBorder>
    )
  }
  if (st === "trial_active") {
    return (
      <EliGradientBorder active>
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <TrialBanner trialEndsAt={data.trialEndsAt ?? new Date(Date.now() + 86400000 * 14).toISOString()} />
          <Card className="border-0 shadow-none rounded-none">
            <CardHeader className="flex flex-row flex-wrap items-center gap-2 justify-between"><CardTitle className="text-xl">ELI+ Trial Active</CardTitle><Badge variant="blue">Free Trial</Badge></CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-border p-4 bg-muted/20"><p className="text-sm font-semibold mb-2">Products</p><Products data={data} kind="trial" /></div>
              <div><p className="text-sm font-semibold mb-2">Channels</p><Channels data={data} /></div>
              <p className="text-sm text-muted-foreground">Contact your account manager to convert to a full subscription.</p>
            </CardContent>
          </Card>
        </div>
      </EliGradientBorder>
    )
  }

  const partial = st === "partially_live"
  const payNote = partial && data.contractedProducts.includes("payments") && !live(data, "payments")
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-40" /><span className="relative inline-flex h-3 w-3 rounded-full bg-success-foreground" /></span>
          {partial ? "ELI+ Partially Active" : "ELI+ is Active"}
        </CardTitle>
        {partial && <p className="text-sm text-muted-foreground">Some products are live; others are still rolling out.</p>}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-border p-4 bg-muted/20"><p className="text-sm font-semibold mb-2">Products</p><Products data={data} kind={partial ? "partial" : "live"} /></div>
        {payNote && <Alert variant="warning" title="Payments AI calendar constraint">Payments AI stays pending until billing calendar rules are confirmed for every property.</Alert>}
        <div><p className="text-sm font-semibold mb-2">Channels</p><Channels data={data} /></div>
        <p className="text-sm text-muted-foreground">{partial ? "Activated: " : "Activated "}{fmt(data.activatedAt)}</p>
        {role === "internal" && !partial && (
          <>
            <Button variant="delete" onClick={() => setOff(true)}>Turn Off</Button>
            <ConfirmDialog open={off} onOpenChange={setOff} title="Turn off ELI+?" description="This stops ELI+ from handling resident communications for this company. Operators can re-enable after review." confirmLabel="Turn Off" confirmVariant="delete" onConfirm={() => setOff(false)} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
