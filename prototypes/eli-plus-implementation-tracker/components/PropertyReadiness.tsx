import { useMemo, useState, type KeyboardEvent } from "react"
import { Link, useLocation } from "react-router-dom"
import { Badge } from "@sandbox-components/ui/badge"
import { Button } from "@sandbox-components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@sandbox-components/ui/select"
import { Skeleton } from "@sandbox-components/ui/skeleton"
import { Alert } from "@sandbox-components/ui/alert"
import { EmptyState } from "@sandbox-components/composite/EmptyState"
import { SearchInput } from "@sandbox-components/composite/SearchInput"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@sandbox-components/ui/breadcrumb"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@sandbox-components/ui/table"
import {
  CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw, FolderOpen, ChevronLeft, ChevronRight,
  AlertTriangle, MessageSquare, Mail, Smartphone, Phone, Building2,
} from "lucide-react"
import { cn } from "@sandbox-lib/utils"
import type { EliProduct, PropertyReadinessEntry, ChannelStatus, ViewRole, TwilioPropertyStatus } from "../types"
import { PRODUCT_LABELS } from "../types"

export type PropertyReadinessProps = {
  properties: PropertyReadinessEntry[]
  role: ViewRole
  viewState: string
  selectedPropertyId: string | null
  onSelectProperty: (id: string | null) => void
}

const PAGE = 25
const FILTERS: { value: string; label: string }[] = [
  { value: "All Products", label: "All Products" }, { value: "leasing", label: "Leasing AI" },
  { value: "payments", label: "Payments AI" }, { value: "renewals", label: "Renewals AI" }, { value: "maintenance", label: "Maintenance AI" },
]
const TWILIO: Record<TwilioPropertyStatus, string> = {
  campaign_approved: "Campaign approved", campaign_pending: "Campaign pending", campaign_submitted: "Campaign submitted",
  brand_pending: "Brand pending", not_started: "Not started",
}

function chIcon(s: ChannelStatus, label: string) {
  const c = "h-4 w-4 shrink-0"
  if (s === "ready") return <CheckCircle2 className={cn(c, "text-foreground")} aria-label={`${label}: Ready`} />
  if (s === "blocked") return <XCircle className={cn(c, "text-error-foreground")} aria-label={`${label}: Blocked`} />
  if (s === "not_started") return <Clock className={cn(c, "text-muted-foreground")} aria-label={`${label}: Not started`} />
  return <Clock className={cn(c, "text-muted-foreground")} aria-label={`${label}: Pending`} />
}

export function PropertyReadiness({
  properties, role, viewState, selectedPropertyId, onSelectProperty,
}: PropertyReadinessProps) {
  const location = useLocation()
  const [search, setSearch] = useState("")
  const [productFilter, setProductFilter] = useState("All Products")
  const [page, setPage] = useState(0)

  const listHref = useMemo(() => {
    const p = new URLSearchParams(location.search)
    p.delete("property")
    const q = p.toString()
    return q ? `${location.pathname}?${q}` : location.pathname
  }, [location.pathname, location.search])

  const filtered = useMemo(() => {
    let r = properties
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter((x) => x.name.toLowerCase().includes(q) || x.address.toLowerCase().includes(q))
    }
    if (productFilter !== "All Products") {
      const prod = productFilter as EliProduct
      r = r.filter((x) => x.contractedProducts.includes(prod))
    }
    return r
  }, [properties, search, productFilter])

  const pages = Math.ceil(filtered.length / PAGE)
  const paged = filtered.slice(page * PAGE, (page + 1) * PAGE)
  const readyN = properties.filter((p) => p.overallReady).length
  const missE = properties.filter((p) => !p.emergencyContact).length
  const sel = selectedPropertyId ? properties.find((p) => p.id === selectedPropertyId) ?? null : null

  if (viewState === "loading") {
    return (
      <div className="space-y-4">
        <div className="flex gap-3"><Skeleton className="h-10 flex-1" /><Skeleton className="h-10 w-48" /></div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }
  if (viewState === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-error-foreground mb-4" aria-hidden="true" />
        <h3 className="text-lg font-semibold mb-1">Unable to load property data</h3>
        <p className="text-sm text-muted-foreground mb-4">Something went wrong. Please try again.</p>
        <Button variant="outline"><RefreshCw className="h-4 w-4" />Try Again</Button>
      </div>
    )
  }
  if (viewState === "empty" || properties.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="Loading your properties from Entrata"
        description="We're pulling your property list, addresses, unit counts, and existing settings. Each property will show its readiness across SMS, voice, email, and chat — so you can see exactly which are ready to go live and which need attention. This usually takes less than a minute."
        action={<Button variant="primary">Refresh</Button>}
      />
    )
  }
  if (selectedPropertyId && !sel) {
    return (
      <div className="space-y-4">
        <Alert variant="warning" title="Property not found">This property is no longer in the list or the link is invalid.</Alert>
        <Button variant="outline" onClick={() => onSelectProperty(null)}>Back to properties</Button>
      </div>
    )
  }

  if (sel) {
    const chans = [["chat", "Chat", sel.chatStatus, MessageSquare], ["email", "Email", sel.emailStatus, Mail], ["sms", "SMS", sel.smsStatus, Smartphone], ["voice", "Voice", sel.voiceStatus, Phone]] as const
    const prows: [string, boolean][] = [[PRODUCT_LABELS.leasing, sel.leasingReady], [PRODUCT_LABELS.payments, sel.paymentsReady], [PRODUCT_LABELS.renewals, sel.renewalsReady], [PRODUCT_LABELS.maintenance, sel.maintenanceReady]]
    return (
      <div className="space-y-6">
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to={listHref}>Properties</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>{sel.name}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
        <div>
          <h2 className="text-xl font-semibold">{sel.name}</h2>
          <p className="text-sm text-muted-foreground">{sel.address}</p>
          <p className="text-sm text-muted-foreground mt-1">{sel.units} units</p>
        </div>
        <div>
          <h3 className="text-base font-semibold mb-3">Channel readiness</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {chans.map(([key, label, status, Ic]) => (
              <div key={key} className="rounded-lg border border-border bg-card p-3">
                <div className="text-sm font-medium flex items-center gap-2 mb-2"><Ic className="h-4 w-4 text-muted-foreground" aria-hidden="true" />{label}</div>
                <div className="flex items-center gap-2">{chIcon(status, label)}<span className="text-sm capitalize">{status.replace(/_/g, " ")}</span></div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold mb-2">Product readiness</h3>
          <div className="rounded-lg border border-border bg-card px-4">
            {prows.map(([lb, ok]) => (
              <div key={lb} className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0">
                <span className="text-sm font-medium">{lb}</span>{ok ? <Badge variant="green">Ready</Badge> : <Badge variant="yellow">Not ready</Badge>}
              </div>
            ))}
          </div>
        </div>
        {sel.blockers.length > 0 && (
          <div className="rounded-lg border border-border bg-destructive/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-error-foreground"><AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />Blockers</div>
            <ul className="list-disc pl-5 text-sm space-y-1">{sel.blockers.map((b) => <li key={b}>{b}</li>)}</ul>
          </div>
        )}
        {!sel.emergencyContact && (
          <div className="rounded-lg border border-error-foreground/30 bg-destructive/10 p-4 text-sm text-error-foreground">
            <strong>Safety gate</strong> — this property cannot go live without an emergency contact number.
          </div>
        )}
        {role === "internal" && (
          <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2 text-sm">
            <p className="font-semibold">Internal</p>
            <p><span className="text-muted-foreground">Shell created:</span> {sel.shellCreated ? "Yes" : "No"}</p>
            <p><span className="text-muted-foreground">Settings complete:</span> {sel.settingsComplete ? "Yes" : "No"}</p>
            <p><span className="text-muted-foreground">Twilio:</span> {TWILIO[sel.twilioStatus]}</p>
            <p className="flex items-center gap-2 flex-wrap"><span className="text-muted-foreground">IVR:</span>{chIcon(sel.ivrStatus, "IVR")}<span className="capitalize">{sel.ivrStatus.replace(/_/g, " ")}</span></p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="green">{readyN} Ready</Badge>
        <Badge variant="yellow">{properties.length - readyN} In Progress</Badge>
        {missE > 0 && <Badge variant="red">{missE} Missing Emergency</Badge>}
        <span className="text-muted-foreground ml-auto">
          {properties.length} {properties.length === 1 ? "property" : "properties"} total
        </span>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <SearchInput placeholder="Search properties..." value={search} onChange={(v) => { setSearch(v); setPage(0) }} className="flex-1 min-w-0" />
        <Select value={productFilter} onValueChange={(v) => { setProductFilter(v); setPage(0) }}>
          <SelectTrigger className="w-full sm:w-56 shrink-0"><SelectValue /></SelectTrigger>
          <SelectContent>
            {FILTERS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
          <h3 className="text-lg font-semibold mb-1">No properties match your filters</h3>
          <p className="text-sm text-muted-foreground mb-4">Try a different search or product filter.</p>
          <Button variant="outline" onClick={() => { setSearch(""); setProductFilter("All Products") }}>Clear Filters</Button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Property</TableHead>
                  <TableHead scope="col" className="text-right">Units</TableHead>
                  <TableHead scope="col" className="text-center">Chat</TableHead>
                  <TableHead scope="col" className="text-center">Email</TableHead>
                  <TableHead scope="col" className="text-center">SMS</TableHead>
                  <TableHead scope="col" className="text-center">Voice</TableHead>
                  <TableHead scope="col" className="text-center">Emergency</TableHead>
                  {role === "internal" && <TableHead scope="col" className="text-center">Shell</TableHead>}
                  {role === "internal" && <TableHead scope="col" className="text-center">Settings</TableHead>}
                  <TableHead scope="col">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((prop) => (
                  <TableRow
                    key={prop.id}
                    className="cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectProperty(prop.id)}
                    onKeyDown={(e: KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectProperty(prop.id) }
                    }}
                  >
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{prop.name}</p>
                        <p className="text-xs text-muted-foreground">{prop.address}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{prop.units}</TableCell>
                    <TableCell className="text-center">{chIcon(prop.chatStatus, "Chat")}</TableCell>
                    <TableCell className="text-center">{chIcon(prop.emailStatus, "Email")}</TableCell>
                    <TableCell className="text-center">{chIcon(prop.smsStatus, "SMS")}</TableCell>
                    <TableCell className="text-center">{chIcon(prop.voiceStatus, "Voice")}</TableCell>
                    <TableCell className="text-center">
                      {prop.emergencyContact ? (
                        <CheckCircle2 className="h-4 w-4 text-foreground mx-auto" aria-label="Emergency contact provided" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-error-foreground mx-auto" aria-label="Emergency contact missing" />
                      )}
                    </TableCell>
                    {role === "internal" && (
                      <TableCell className="text-center">
                        {prop.shellCreated ? (
                          <CheckCircle2 className="h-4 w-4 text-foreground mx-auto" aria-label="Shell created" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground mx-auto" aria-label="Shell pending" />
                        )}
                      </TableCell>
                    )}
                    {role === "internal" && (
                      <TableCell className="text-center">
                        {prop.settingsComplete ? (
                          <CheckCircle2 className="h-4 w-4 text-foreground mx-auto" aria-label="Settings complete" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground mx-auto" aria-label="Settings incomplete" />
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      {prop.overallReady ? <Badge variant="green">Ready</Badge>
                        : prop.blockers.length > 0 ? (
                          <Badge variant="red">{prop.blockers.length} {prop.blockers.length === 1 ? "blocker" : "blockers"}</Badge>
                        ) : <Badge variant="yellow">In Progress</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {page * PAGE + 1}–{Math.min((page + 1) * PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)} aria-label="Next page">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
