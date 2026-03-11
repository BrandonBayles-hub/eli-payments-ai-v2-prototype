import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { EmptyState } from "@sandbox-components/composite/EmptyState"
import { LabeledValue } from "@sandbox-components/composite/LabeledValue"
import { StatCard } from "@sandbox-components/composite/StatCard"
import { StatsRow } from "@sandbox-components/composite/StatsRow"
import { Badge } from "@sandbox-components/ui/badge"
import { Button } from "@sandbox-components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@sandbox-components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@sandbox-components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sandbox-components/ui/dialog"
import { Input } from "@sandbox-components/ui/input"
import { Label } from "@sandbox-components/ui/label"
import { Progress } from "@sandbox-components/ui/progress"
import { Skeleton } from "@sandbox-components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sandbox-components/ui/table"
import { Textarea } from "@sandbox-components/ui/textarea"
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Calendar,
  FolderOpen,
  History,
  Pencil,
  RefreshCw,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"
import { Alert } from "@sandbox-components/ui/alert"
import type { BetaClient, AllotmentChange } from "./types"

interface AllotmentManagerProps {
  client: BetaClient
  viewState: string
  onBack: () => void
  onAdjustAllotment?: (newLimit: number, reason: string, changedBy: string) => void
}

function statusBadge(status: BetaClient["status"]) {
  const map: Record<BetaClient["status"], { variant: string; label: string }> = {
    healthy: { variant: "green", label: "Healthy" },
    watch: { variant: "yellow", label: "Watch" },
    critical: { variant: "orange", label: "Critical" },
    exhausted: { variant: "red", label: "Exhausted" },
  }
  const { variant, label } = map[status]
  return <Badge variant={variant as "green" | "yellow" | "orange" | "red"}>{label}</Badge>
}

function AllotmentHistoryRow({ change }: { change: AllotmentChange }) {
  const increased = change.newLimit > change.previousLimit

  return (
    <TableRow>
      <TableCell className="text-sm">{change.timestamp}</TableCell>
      <TableCell className="text-sm">{change.changedBy}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            {change.previousLimit === 0 ? "—" : change.previousLimit.toLocaleString()}
          </span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
          <span className={increased ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
            {change.newLimit.toLocaleString()}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-sm max-w-xs">{change.reason}</TableCell>
    </TableRow>
  )
}

function ConfirmStep({
  client,
  newAllotmentValue,
  reason,
  onBack,
  onConfirm,
}: {
  client: BetaClient
  newAllotmentValue: number
  reason: string
  onBack: () => void
  onConfirm: () => void
}) {
  const isIncrease = newAllotmentValue > client.tokenAllotment
  const diff = Math.abs(newAllotmentValue - client.tokenAllotment)
  const currentPercent = client.percentUsed
  const newPercent = Math.min(
    Math.round((client.tokensUsed / newAllotmentValue) * 100),
    100
  )
  const usersAtLimit = isIncrease && currentPercent >= 100
  const willExceedLimit = !isIncrease && newPercent >= 100

  return (
    <>
      <DialogHeader>
        <DialogTitle>Confirm Allotment Change</DialogTitle>
        <DialogDescription>
          Review the impact of this change before applying.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Allotment</span>
            <span className="text-sm font-medium">{client.tokenAllotment.toLocaleString()} tokens</span>
          </div>
          <div className="flex items-center justify-center gap-3 py-1">
            <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">New Allotment</span>
            <span className={`text-sm font-semibold ${isIncrease ? "text-green-600" : "text-orange-600"}`}>
              {newAllotmentValue.toLocaleString()} tokens
            </span>
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-sm text-muted-foreground">Change</span>
            <span className={`text-sm font-medium ${isIncrease ? "text-green-600" : "text-orange-600"}`}>
              {isIncrease ? "+" : "−"}{diff.toLocaleString()} tokens ({isIncrease ? "+" : "−"}{Math.round((diff / client.tokenAllotment) * 100)}%)
            </span>
          </div>
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium">Impact Preview</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Usage After Change</span>
            <span className="text-sm">
              <span className="text-muted-foreground">{currentPercent}%</span>
              {" → "}
              <span className={`font-semibold ${newPercent >= 90 ? "text-red-600" : newPercent >= 75 ? "text-orange-600" : "text-green-600"}`}>
                {newPercent}%
              </span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tokens Remaining</span>
            <span className="text-sm font-medium">
              {Math.max(newAllotmentValue - client.tokensUsed, 0).toLocaleString()}
            </span>
          </div>
        </div>

        {usersAtLimit && (
          <Alert variant="info" title="Users will be unblocked">
            Users who have hit their limit will be able to resume using Entrata Experts after this increase.
          </Alert>
        )}

        {willExceedLimit && (
          <Alert variant="warning" title="Users may be locked out">
            The new allotment is below current usage. Users at or above the new limit will be unable to send new messages until the next billing period or until the allotment is increased.
          </Alert>
        )}

        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">Reason</p>
          <p className="text-sm">{reason}</p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Confirm Change
        </Button>
      </DialogFooter>
    </>
  )
}

export function AllotmentManager({ client, viewState, onBack, onAdjustAllotment }: AllotmentManagerProps) {
  const location = useLocation()
  const basePath = location.pathname

  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
  const [newAllotment, setNewAllotment] = useState(client.tokenAllotment.toString())
  const [adjustReason, setAdjustReason] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)

  if (viewState === "loading") {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (viewState === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-error-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-1">Unable to load client data</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Something went wrong. Please try again.
        </p>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  if (viewState === "empty") {
    return (
      <EmptyState
        icon={FolderOpen}
        title="Client not found"
        description="This client may have been removed from the beta program."
        action={
          <Button variant="outline" onClick={onBack}>
            Back to Dashboard
          </Button>
        }
      />
    )
  }

  const remaining = client.tokenAllotment - client.tokensUsed
  const daysInPeriod = 31
  const daysPassed = 10
  const projectedUsage = Math.round(
    (client.tokensUsed / daysPassed) * daysInPeriod
  )
  const projectedPercent = Math.round((projectedUsage / client.tokenAllotment) * 100)
  const willExceed = projectedPercent > 100

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={basePath}>Beta Clients</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{client.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-3">
            {client.name}
            {statusBadge(client.status)}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Enrolled {client.enrolledDate} &middot; {client.propertyCount} properties &middot;{" "}
            {client.userCount} users &middot; Plan: {client.plan}
          </p>
        </div>

        <Dialog open={adjustDialogOpen} onOpenChange={(open) => {
          setAdjustDialogOpen(open)
          if (!open) setShowConfirm(false)
        }}>
          <DialogTrigger asChild>
            <Button variant="primary">
              <Pencil className="h-4 w-4" />
              Adjust Allotment
            </Button>
          </DialogTrigger>
          <DialogContent>
            {!showConfirm ? (
              <>
                <DialogHeader>
                  <DialogTitle>Adjust Token Allotment</DialogTitle>
                  <DialogDescription>
                    Change the token allotment for {client.name}. Current allotment:{" "}
                    {client.tokenAllotment.toLocaleString()} tokens.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-allotment">Current Allotment</Label>
                    <Input
                      id="current-allotment"
                      value={client.tokenAllotment.toLocaleString()}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-allotment">New Allotment</Label>
                    <Input
                      id="new-allotment"
                      type="number"
                      value={newAllotment}
                      onChange={(e) => setNewAllotment(e.target.value)}
                      placeholder="e.g. 200000"
                    />
                    <p className="text-xs text-muted-foreground">
                      {Number(newAllotment) > client.tokenAllotment
                        ? `Increase of ${(Number(newAllotment) - client.tokenAllotment).toLocaleString()} tokens`
                        : Number(newAllotment) < client.tokenAllotment
                          ? `Decrease of ${(client.tokenAllotment - Number(newAllotment)).toLocaleString()} tokens`
                          : "No change"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adjust-reason">Reason for Change</Label>
                    <Textarea
                      id="adjust-reason"
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                      placeholder="e.g. Client reported heavy usage on leasing workflows. Increasing to avoid throttling during peak season."
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be logged in the allotment history for audit purposes.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAdjustDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setShowConfirm(true)}
                    disabled={
                      !adjustReason.trim() ||
                      Number(newAllotment) === client.tokenAllotment ||
                      Number(newAllotment) <= 0
                    }
                  >
                    Review Change
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <ConfirmStep
                client={client}
                newAllotmentValue={Number(newAllotment)}
                reason={adjustReason}
                onBack={() => setShowConfirm(false)}
                onConfirm={() => {
                  onAdjustAllotment?.(Number(newAllotment), adjustReason, "Caleb Harris")
                  setAdjustDialogOpen(false)
                  setShowConfirm(false)
                  setAdjustReason("")
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <StatsRow columns={4}>
        <StatCard
          label="Current Allotment"
          value={client.tokenAllotment.toLocaleString()}
          icon={Zap}
          color="financial"
          subValue="tokens this period"
        />
        <StatCard
          label="Tokens Used"
          value={client.tokensUsed.toLocaleString()}
          icon={TrendingUp}
          color={client.percentUsed >= 90 ? "alert" : "occupancy"}
          subValue={`${client.percentUsed}% of allotment`}
        />
        <StatCard
          label="Remaining"
          value={remaining > 0 ? remaining.toLocaleString() : "0"}
          icon={Calendar}
          color={remaining <= 0 ? "alert" : "system"}
          subValue={remaining <= 0 ? "Allotment exhausted" : `${Math.round((remaining / client.tokenAllotment) * 100)}% remaining`}
        />
        <StatCard
          label="Projected Month-End"
          value={`${projectedPercent}%`}
          icon={TrendingUp}
          color={willExceed ? "alert" : "financial"}
          subValue={
            willExceed
              ? `~${projectedUsage.toLocaleString()} tokens — will exceed allotment`
              : `~${projectedUsage.toLocaleString()} tokens projected`
          }
        />
      </StatsRow>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usage Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Usage</span>
                <span className="font-medium">{client.percentUsed}%</span>
              </div>
              <Progress value={client.percentUsed} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <LabeledValue label="Active Users" value={`${client.activeUsers} / ${client.userCount}`} />
              <LabeledValue label="Total Conversations" value={client.conversationCount.toString()} />
              <LabeledValue label="Avg Tokens / User" value={client.avgTokensPerUser.toLocaleString()} />
              <LabeledValue label="Top Property" value={client.topUsageProperty} />
              <LabeledValue label="Last Active" value={client.lastActive} />
              <LabeledValue
                label="Feedback Score"
                value={client.feedbackScore != null ? `${client.feedbackScore}/5` : "—"}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4" aria-hidden="true" />
              Quick Adjust Presets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Common allotment adjustments based on beta feedback patterns.
            </p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: "+25% increase", amount: Math.round(client.tokenAllotment * 1.25), reason: "Moderate increase based on healthy adoption" },
                { label: "+50% increase", amount: Math.round(client.tokenAllotment * 1.5), reason: "Significant increase — client expanding usage across teams" },
                { label: "Double allotment", amount: client.tokenAllotment * 2, reason: "Major expansion — full organization rollout" },
                { label: "Reset to 100K", amount: 100_000, reason: "Reset to standard beta baseline" },
              ].map((preset) => (
                <button
                  key={preset.label}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors text-left"
                  onClick={() => {
                    setNewAllotment(preset.amount.toString())
                    setAdjustReason(preset.reason)
                    setAdjustDialogOpen(true)
                  }}
                >
                  <div>
                    <p className="text-sm font-medium">{preset.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {preset.amount.toLocaleString()} tokens
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" aria-hidden="true" />
            Allotment Change History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {client.allotmentHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No allotment changes recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Changed By</TableHead>
                    <TableHead>Allotment Change</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...client.allotmentHistory]
                    .reverse()
                    .map((change) => (
                      <AllotmentHistoryRow key={change.id} change={change} />
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
