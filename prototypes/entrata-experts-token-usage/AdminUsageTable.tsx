import { useState } from "react"
import {
  Search,
  ArrowUpDown,
  Eye,
  RefreshCw,
  FolderOpen,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@sandbox-components/ui/card"
import { Badge } from "@sandbox-components/ui/badge"
import { Button } from "@sandbox-components/ui/button"
import { Input } from "@sandbox-components/ui/input"
import { Skeleton } from "@sandbox-components/ui/skeleton"
import { EmptyState } from "@sandbox-components/composite/EmptyState"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sandbox-components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sandbox-components/ui/table"
import { cn } from "@sandbox-lib/utils"
import type { UserUsage } from "./types"

interface AdminUsageTableProps {
  users: UserUsage[]
  viewState: string
  onAuditUser: (userId: string) => void
}

function getUsageBadge(percent: number) {
  if (percent >= 100) return <Badge variant="red">At Limit</Badge>
  if (percent >= 90) return <Badge variant="red">Critical</Badge>
  if (percent >= 75) return <Badge variant="orange">High</Badge>
  if (percent >= 50) return <Badge variant="yellow">Moderate</Badge>
  return <Badge variant="green">Healthy</Badge>
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`
  return tokens.toString()
}

export function AdminUsageTable({ users, viewState, onAuditUser }: AdminUsageTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Statuses")
  const [propertyFilter, setPropertyFilter] = useState("All Properties")
  const [sortField, setSortField] = useState<"percentUsed" | "name" | "lastActive">("percentUsed")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  if (viewState === "loading") {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-40" />
          </div>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (viewState === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-error-foreground mb-4" aria-hidden="true" />
        <h3 className="text-lg font-semibold mb-1">Unable to load user data</h3>
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
        title="No users yet"
        description="User usage data will appear here once users start using Entrata Experts."
      />
    )
  }

  const properties = [...new Set(users.map((u) => u.property))]

  const filtered = users
    .filter((u) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false
      }
      if (statusFilter !== "All Statuses" && u.status !== statusFilter) return false
      if (propertyFilter !== "All Properties" && u.property !== propertyFilter) return false
      return true
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1
      if (sortField === "percentUsed") return (a.percentUsed - b.percentUsed) * dir
      if (sortField === "name") return a.name.localeCompare(b.name) * dir
      return a.lastActive.localeCompare(b.lastActive) * dir
    })

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>All Users</CardTitle>
          <Badge variant="gray">{filtered.length} users</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 md:max-w-xs">
            <Input
              type="search"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Statuses">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="approaching-limit">Approaching Limit</SelectItem>
              <SelectItem value="at-limit">At Limit</SelectItem>
            </SelectContent>
          </Select>
          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Properties">All Properties</SelectItem>
              {properties.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    className="flex items-center gap-1"
                    onClick={() => toggleSort("name")}
                  >
                    User
                    <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                </TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Conversations</TableHead>
                <TableHead>
                  <button
                    className="flex items-center gap-1"
                    onClick={() => toggleSort("percentUsed")}
                  >
                    Token Usage
                    <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <Search className="h-6 w-6 mx-auto mb-2" aria-hidden="true" />
                    <p>No users match your filters</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{user.property}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.conversationCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <div className="flex-1">
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                user.percentUsed >= 90
                                  ? "bg-red-500"
                                  : user.percentUsed >= 75
                                  ? "bg-orange-500"
                                  : user.percentUsed >= 50
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              )}
                              style={{ width: `${Math.min(user.percentUsed, 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground w-16 text-right">
                          {formatTokens(user.tokensUsed)} / {formatTokens(user.tokenLimit)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getUsageBadge(user.percentUsed)}</TableCell>
                    <TableCell>{user.lastActive}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAuditUser(user.id)}
                        aria-label={`Audit conversations for ${user.name}`}
                      >
                        <Eye className="h-4 w-4" />
                        Audit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
