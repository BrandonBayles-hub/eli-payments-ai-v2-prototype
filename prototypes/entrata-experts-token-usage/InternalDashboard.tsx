import { StatsRow } from "@sandbox-components/composite/StatsRow"
import { StatCard } from "@sandbox-components/composite/StatCard"
import { EmptyState } from "@sandbox-components/composite/EmptyState"
import { Badge } from "@sandbox-components/ui/badge"
import { Button } from "@sandbox-components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@sandbox-components/ui/card"
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
import {
  AlertCircle,
  ArrowUpDown,
  Building2,
  FolderOpen,
  RefreshCw,
  Settings,
  Zap,
  Users,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"
import type { BetaClient, BetaOverview } from "./types"

interface InternalDashboardProps {
  overview: BetaOverview
  clients: BetaClient[]
  viewState: string
  onManageClient: (clientId: string) => void
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

function usageColor(percent: number) {
  if (percent >= 95) return "text-error-foreground"
  if (percent >= 80) return "text-orange-600"
  if (percent >= 60) return "text-yellow-600"
  return "text-foreground"
}

export function InternalDashboard({
  overview,
  clients,
  viewState,
  onManageClient,
}: InternalDashboardProps) {
  if (viewState === "loading") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (viewState === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-error-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-1">Unable to load beta data</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Something went wrong fetching usage data. Please try again.
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
        title="No beta clients enrolled"
        description="Enroll beta clients to start tracking Experts token usage and allotments."
        action={
          <Button variant="primary">
            <Building2 className="h-4 w-4" />
            Enroll Beta Client
          </Button>
        }
      />
    )
  }

  const criticalClients = clients.filter(
    (c) => c.status === "critical" || c.status === "exhausted"
  )

  return (
    <div className="space-y-6">
      <StatsRow columns={4}>
        <StatCard
          label="Beta Clients"
          value={overview.totalClients}
          icon={Building2}
          color="occupancy"
        />
        <StatCard
          label="Total Utilization"
          value={`${overview.percentUsed}%`}
          icon={TrendingUp}
          color="financial"
          subValue={`${overview.totalTokensUsed.toLocaleString()} / ${overview.totalTokensAllocated.toLocaleString()} tokens`}
        />
        <StatCard
          label="Clients At/Near Limit"
          value={overview.clientsAtLimit + overview.clientsApproaching}
          icon={AlertTriangle}
          color="alert"
          subValue={`${overview.clientsAtLimit} exhausted, ${overview.clientsApproaching} approaching`}
        />
        <StatCard
          label="Allotment Changes This Week"
          value={overview.allotmentChangesThisWeek}
          icon={Settings}
          color="system"
        />
      </StatsRow>

      {criticalClients.length > 0 && (
        <Card className="border-orange-300 bg-orange-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-600" aria-hidden="true" />
              Clients Needing Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between rounded-lg bg-card p-3 border"
                >
                  <div className="flex items-center gap-3">
                    {statusBadge(client.status)}
                    <div>
                      <p className="text-sm font-medium">{client.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {client.tokensUsed.toLocaleString()} / {client.tokenAllotment.toLocaleString()} tokens
                        ({client.percentUsed}%)
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onManageClient(client.id)}
                  >
                    <Settings className="h-4 w-4" />
                    Manage
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Beta Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="flex items-center gap-1">
                      Usage
                      <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                    </span>
                  </TableHead>
                  <TableHead className="text-right">Allotment</TableHead>
                  <TableHead className="text-right">Used</TableHead>
                  <TableHead className="text-right">Users</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{client.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {client.propertyCount} properties &middot; Enrolled {client.enrolledDate}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="gray">{client.plan}</Badge>
                    </TableCell>
                    <TableCell>{statusBadge(client.status)}</TableCell>
                    <TableCell>
                      <div className="w-32 space-y-1">
                        <Progress value={client.percentUsed} className="h-2" />
                        <p className={`text-xs font-medium ${usageColor(client.percentUsed)}`}>
                          {client.percentUsed}%
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {client.tokenAllotment.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {client.tokensUsed.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {client.activeUsers}/{client.userCount}
                    </TableCell>
                    <TableCell>
                      {client.feedbackScore != null ? (
                        <span className="text-sm">{client.feedbackScore}/5</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onManageClient(client.id)}
                      >
                        <Settings className="h-4 w-4" />
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
