import { useState, useMemo } from "react"
import { Badge } from "@sandbox-components/ui/badge"
import { Button } from "@sandbox-components/ui/button"
import { Alert } from "@sandbox-components/ui/alert"
import { Progress } from "@sandbox-components/ui/progress"
import { Skeleton } from "@sandbox-components/ui/skeleton"
import { EmptyState } from "@sandbox-components/composite/EmptyState"
import { SearchInput } from "@sandbox-components/composite/SearchInput"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@sandbox-components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@sandbox-components/ui/table"
import {
  CheckCircle2, Link2, HelpCircle, AlertTriangle, ArrowRight,
  AlertCircle, RefreshCw, FolderOpen, Database,
} from "lucide-react"
import { settingsMap, MAPPING_STATUS_LABELS, RISK_LABELS } from "../data/settings-map"
import type { MappingStatus, SettingRisk } from "../data/settings-map"
import { PRODUCT_LABELS } from "../types"
import type { EliProduct } from "../types"

interface SettingsIntelligenceProps {
  viewState: string
}

const STATUS_BADGE: Record<MappingStatus, { variant: "green" | "blue" | "yellow" | "gray"; icon: React.ReactNode }> = {
  mapped: { variant: "green", icon: <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> },
  derivable: { variant: "blue", icon: <Link2 className="h-3 w-3" aria-hidden="true" /> },
  eli_only: { variant: "yellow", icon: <Database className="h-3 w-3" aria-hidden="true" /> },
  unknown: { variant: "gray", icon: <HelpCircle className="h-3 w-3" aria-hidden="true" /> },
}

const RISK_BADGE: Record<SettingRisk, "red" | "orange" | "yellow" | "gray"> = {
  critical: "red",
  high: "orange",
  medium: "yellow",
  low: "gray",
}

export function SettingsIntelligence({ viewState }: SettingsIntelligenceProps) {
  const [search, setSearch] = useState("")
  const [productFilter, setProductFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = settingsMap
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((s) =>
        s.settingName.toLowerCase().includes(q) ||
        s.entrataLocation?.toLowerCase().includes(q) ||
        s.colleenField?.toLowerCase().includes(q) ||
        s.mappingNotes?.toLowerCase().includes(q),
      )
    }
    if (productFilter !== "All") {
      result = result.filter((s) => s.product === productFilter || s.product === "all")
    }
    if (statusFilter !== "All") {
      result = result.filter((s) => s.mappingStatus === statusFilter)
    }
    return result
  }, [search, productFilter, statusFilter])

  const stats = useMemo(() => {
    const total = settingsMap.length
    const mapped = settingsMap.filter((s) => s.mappingStatus === "mapped").length
    const derivable = settingsMap.filter((s) => s.mappingStatus === "derivable").length
    const eliOnly = settingsMap.filter((s) => s.mappingStatus === "eli_only").length
    const unknown = settingsMap.filter((s) => s.mappingStatus === "unknown").length
    const autoPopulable = settingsMap.filter((s) => s.canAutoPopulate).length
    const pullsFromEntrata = settingsMap.filter((s) => s.pullsFromEntrata).length
    const clientInput = settingsMap.filter((s) => s.requiresClientInput).length
    const critical = settingsMap.filter((s) => s.risk === "critical").length
    return { total, mapped, derivable, eliOnly, unknown, autoPopulable, pullsFromEntrata, clientInput, critical }
  }, [])

  if (viewState === "loading") {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (viewState === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-error-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-1">Unable to load settings map</h3>
        <p className="text-sm text-muted-foreground mb-4">Something went wrong.</p>
        <Button variant="outline"><RefreshCw className="h-4 w-4" />Try Again</Button>
      </div>
    )
  }

  if (viewState === "empty") {
    return (
      <EmptyState icon={Database} title="Settings map is being built" description="This map will show every configuration field ELI+ needs, where it lives in Entrata, and whether it can be auto-populated. Once populated, you'll see which settings already pull from your existing Entrata data, which are ELI+ specific, and which still need investigation. The goal: minimize what the client has to provide by using what Entrata already knows." />
    )
  }

  const mappedPct = Math.round(((stats.mapped + stats.derivable) / stats.total) * 100)

  return (
    <div className="space-y-6">
      <Alert variant="info" title="This is a working document">
        This settings map shows what we know today about where each ELI+ configuration field lives in Entrata. Rows marked "Needs Investigation" are gaps — if you know the answer, update the data file or reply in Slack.
      </Alert>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-muted rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total Settings</p>
        </div>
        <div className="bg-muted rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.mapped + stats.derivable}</p>
          <p className="text-xs text-muted-foreground">Mapped / Derivable</p>
        </div>
        <div className="bg-muted rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">{stats.pullsFromEntrata}</p>
          <p className="text-xs text-muted-foreground">Pull from Entrata</p>
        </div>
        <div className="bg-muted rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.clientInput}</p>
          <p className="text-xs text-muted-foreground">Need Client Input</p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Entrata coverage</span>
          <span className="font-medium">{mappedPct}% mapped or derivable</span>
        </div>
        <Progress value={mappedPct} className="h-2" />
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <SearchInput placeholder="Search settings..." value={search} onChange={(v) => setSearch(v)} />
        </div>
        <Select value={productFilter} onValueChange={setProductFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Products</SelectItem>
            {(["leasing", "payments", "renewals", "maintenance"] as EliProduct[]).map((p) => (
              <SelectItem key={p} value={p}>{PRODUCT_LABELS[p]}</SelectItem>
            ))}
            <SelectItem value="all">Cross-Product</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="mapped">Mapped to Entrata</SelectItem>
            <SelectItem value="derivable">Derivable</SelectItem>
            <SelectItem value="eli_only">ELI+ Only</SelectItem>
            <SelectItem value="unknown">Needs Investigation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
          <h3 className="text-lg font-semibold mb-1">No settings match your filters</h3>
          <Button variant="outline" onClick={() => { setSearch(""); setProductFilter("All"); setStatusFilter("All") }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Setting</TableHead>
                <TableHead scope="col">Product</TableHead>
                <TableHead scope="col">Entrata Source</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col">Risk</TableHead>
                <TableHead scope="col" className="text-center">Auto</TableHead>
                <TableHead scope="col" className="text-center">Client</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((setting) => {
                const sc = STATUS_BADGE[setting.mappingStatus]
                const isExpanded = expandedId === setting.id
                return (
                  <TableRow
                    key={setting.id}
                    className="cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpandedId(isExpanded ? null : setting.id)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpandedId(isExpanded ? null : setting.id) } }}
                  >
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{setting.settingName}</p>
                        {isExpanded && (
                          <div className="mt-2 space-y-2 text-xs">
                            {setting.colleenField && (
                              <p><span className="text-muted-foreground">Colleen Admin:</span> {setting.colleenField}</p>
                            )}
                            {setting.entrataPath && (
                              <p><span className="text-muted-foreground">Entrata path:</span> {setting.entrataPath}</p>
                            )}
                            {setting.onboardingFormRef && (
                              <p><span className="text-muted-foreground">Onboarding form:</span> {setting.onboardingFormRef}</p>
                            )}
                            {setting.pullsFromEntrata && (
                              <p className="text-green-700">Pulls from Entrata automatically</p>
                            )}
                            {setting.defaultValue && (
                              <p><span className="text-muted-foreground">Default:</span> {setting.defaultValue}</p>
                            )}
                            {setting.mappingNotes && (
                              <p className="text-muted-foreground italic">{setting.mappingNotes}</p>
                            )}
                            {setting.riskReason && (
                              <div className="flex items-start gap-2 bg-destructive/5 rounded px-2 py-1">
                                <AlertTriangle className="h-3 w-3 text-error-foreground mt-px shrink-0" aria-hidden="true" />
                                <span className="text-error-foreground">{setting.riskReason}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="gray">
                        {setting.product === "all" ? "All" : PRODUCT_LABELS[setting.product]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {setting.entrataLocation ? (
                        <span className="text-xs text-muted-foreground">{setting.entrataLocation}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={sc.variant}>
                        {sc.icon}
                        {MAPPING_STATUS_LABELS[setting.mappingStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={RISK_BADGE[setting.risk]}>{RISK_LABELS[setting.risk]}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {setting.canAutoPopulate ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" aria-label="Yes" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {setting.requiresClientInput ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500 mx-auto" aria-label="Required" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          Legend
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Badge variant="green"><CheckCircle2 className="h-3 w-3" aria-hidden="true" />Mapped</Badge>
            <span className="text-muted-foreground">1:1 field in Entrata</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="blue"><Link2 className="h-3 w-3" aria-hidden="true" />Derivable</Badge>
            <span className="text-muted-foreground">Computable from Entrata data</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="yellow"><Database className="h-3 w-3" aria-hidden="true" />ELI+ Only</Badge>
            <span className="text-muted-foreground">No Entrata equivalent</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="gray"><HelpCircle className="h-3 w-3" aria-hidden="true" />Unknown</Badge>
            <span className="text-muted-foreground">Needs investigation</span>
          </div>
        </div>
      </div>
    </div>
  )
}
