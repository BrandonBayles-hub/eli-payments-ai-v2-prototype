import { useState } from "react"
import {
  Users,
  Building2,
  Zap,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  FolderOpen,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@sandbox-components/ui/card"
import { Badge } from "@sandbox-components/ui/badge"
import { Button } from "@sandbox-components/ui/button"
import { Progress } from "@sandbox-components/ui/progress"
import { Skeleton } from "@sandbox-components/ui/skeleton"
import { EmptyState } from "@sandbox-components/composite/EmptyState"
import { StatCard } from "@sandbox-components/composite/StatCard"
import { StatsRow } from "@sandbox-components/composite/StatsRow"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sandbox-components/ui/table"
import { cn } from "@sandbox-lib/utils"
import type { ClientUsage, PropertyUsage, UserUsage } from "./types"

interface AdminDashboardProps {
  clientUsage: ClientUsage
  users: UserUsage[]
  viewState: string
  onViewUserDetail: (userId: string) => void
  onViewPropertyDetail: (propertyId: string) => void
}

function getUsageBadge(percent: number) {
  if (percent >= 100) return <Badge variant="red">At Limit</Badge>
  if (percent >= 90) return <Badge variant="red">Critical</Badge>
  if (percent >= 75) return <Badge variant="orange">High</Badge>
  if (percent >= 50) return <Badge variant="yellow">Moderate</Badge>
  return <Badge variant="green">Healthy</Badge>
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`
  return tokens.toString()
}

export function AdminDashboard({
  clientUsage,
  users,
  viewState,
  onViewUserDetail,
  onViewPropertyDetail,
}: AdminDashboardProps) {
  if (viewState === "loading") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (viewState === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-error-foreground mb-4" aria-hidden="true" />
        <h3 className="text-lg font-semibold mb-1">Unable to load usage data</h3>
        <p className="text-sm text-muted-foreground mb-4">Something went wrong. Please try again.</p>
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
        title="No usage data yet"
        description="Usage data will appear here once users start interacting with Entrata Experts."
      />
    )
  }

  const usersAtLimit = users.filter((u) => u.status === "at-limit").length
  const usersApproaching = users.filter((u) => u.status === "approaching-limit").length

  return (
    <div className="space-y-6">
      <StatsRow columns={4}>
        <StatCard
          title="Total Token Usage"
          value={`${formatTokens(clientUsage.totalTokensUsed)} / ${formatTokens(clientUsage.totalTokenLimit)}`}
          subtitle={`${clientUsage.percentUsed}% of allocation used`}
          icon={Zap}
          color="financial"
        />
        <StatCard
          title="Active Users"
          value={clientUsage.userCount}
          subtitle={`Across ${clientUsage.propertyCount} properties`}
          icon={Users}
          color="occupancy"
        />
        <StatCard
          title="Conversations"
          value={clientUsage.conversationCount}
          subtitle="This billing period"
          icon={MessageSquare}
          color="communication"
        />
        <StatCard
          title="Users Near Limit"
          value={usersAtLimit + usersApproaching}
          subtitle={`${usersAtLimit} at limit, ${usersApproaching} approaching`}
          icon={AlertTriangle}
          color="alert"
        />
      </StatsRow>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Usage by Property</CardTitle>
            <Badge variant="gray">{clientUsage.properties.length} properties</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Conversations</TableHead>
                  <TableHead>Token Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientUsage.properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">{property.name}</TableCell>
                    <TableCell>
                      {property.activeUsers} / {property.userCount}
                    </TableCell>
                    <TableCell>{property.conversationCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <div className="flex-1">
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                property.percentUsed >= 90
                                  ? "bg-red-500"
                                  : property.percentUsed >= 75
                                  ? "bg-orange-500"
                                  : property.percentUsed >= 50
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              )}
                              style={{ width: `${Math.min(property.percentUsed, 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground w-10 text-right">
                          {property.percentUsed}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getUsageBadge(property.percentUsed)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewPropertyDetail(property.id)}
                      >
                        View Users
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users Approaching Limit</CardTitle>
            <Badge variant="orange">{usersAtLimit + usersApproaching} users</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {usersAtLimit + usersApproaching === 0 ? (
            <div className="py-8 text-center">
              <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">All users are within healthy usage levels</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Token Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users
                    .filter((u) => u.status === "at-limit" || u.status === "approaching-limit")
                    .sort((a, b) => b.percentUsed - a.percentUsed)
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{user.property}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3 min-w-[180px]">
                            <div className="flex-1">
                              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    user.percentUsed >= 100 ? "bg-red-600" : "bg-red-500"
                                  )}
                                  style={{ width: `${Math.min(user.percentUsed, 100)}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground w-10 text-right">
                              {user.percentUsed}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getUsageBadge(user.percentUsed)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewUserDetail(user.id)}
                          >
                            Audit
                          </Button>
                        </TableCell>
                      </TableRow>
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
