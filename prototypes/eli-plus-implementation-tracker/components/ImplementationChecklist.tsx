import { useState, type ReactNode } from "react"
import { Badge } from "@sandbox-components/ui/badge"
import { Button } from "@sandbox-components/ui/button"
import { Input } from "@sandbox-components/ui/input"
import { Label } from "@sandbox-components/ui/label"
import { Progress } from "@sandbox-components/ui/progress"
import { Skeleton } from "@sandbox-components/ui/skeleton"
import { Alert } from "@sandbox-components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@sandbox-components/ui/select"
import { PhoneInput } from "@sandbox-components/composite/PhoneInput"
import { EmptyState } from "@sandbox-components/composite/EmptyState"
import {
  CheckCircle2, Clock, AlertTriangle, Circle, ShieldCheck, ChevronDown, ChevronRight,
  AlertCircle, RefreshCw, FolderOpen, ExternalLink,
} from "lucide-react"
import type { ChecklistItem, ViewRole, ItemCategory, ItemStatus } from "../types"
import {
  CATEGORY_LABELS, CATEGORY_ORDER, CATEGORY_DESCRIPTIONS, PRODUCT_LABELS, STATUS_LABELS,
} from "../types"

type BV = "green" | "yellow" | "red" | "blue" | "gray"
const BADGE: Record<ItemStatus, BV> = {
  complete: "green", auto_confirmed: "blue", needs_input: "yellow", in_progress: "blue", blocked: "red", not_started: "gray",
}
const IC = { complete: CheckCircle2, auto_confirmed: ShieldCheck, needs_input: Clock, in_progress: Circle, blocked: AlertTriangle, not_started: Circle }
function StatusGlyph({ s }: { s: ItemStatus }) {
  const C = IC[s]
  const cls = s === "blocked" ? "h-5 w-5 text-error-foreground" : s === "in_progress" ? "h-5 w-5 text-primary animate-pulse" : "h-5 w-5 text-muted-foreground"
  return <C className={cls} aria-hidden />
}

interface Props { items: ChecklistItem[]; role: ViewRole; viewState: string }

function ClientInputBlock({ item, onComplete }: { item: ChecklistItem; onComplete: () => void }) {
  const id = `cf-${item.id}`
  const [text, setText] = useState(item.inputValue ?? "")
  const [phone, setPhone] = useState("")
  const [day, setDay] = useState("")
  const t = item.inputType
  if (!t || t === "none") {
    return item.clientAction ? (
      <div className="flex gap-2 text-sm bg-muted rounded-md px-3 py-2 mb-3 border border-border">
        <Clock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <span>{item.clientAction}</span>
      </div>
    ) : null
  }
  if (t === "confirm") {
    return (
      <Button variant="primary" type="button" className="mt-2" onClick={onComplete}>Mark as Complete</Button>
    )
  }
  const go = () => onComplete()
  if (t === "select") {
    return (
      <div className="space-y-2 mt-3">
        <Label htmlFor={id}>Payment block day</Label>
        <Select value={day} onValueChange={setDay}>
          <SelectTrigger id={id} className="max-w-xs"><SelectValue placeholder="Select day of month" /></SelectTrigger>
          <SelectContent>
            {[...Array(31)].map((_, i) => {
              const d = String(i + 1)
              return <SelectItem key={d} value={d}>{d}</SelectItem>
            })}
          </SelectContent>
        </Select>
        <Button variant="primary" type="button" onClick={go}>Confirm</Button>
      </div>
    )
  }
  let label = item.label
  let inner: ReactNode = null
  if (t === "ein") {
    inner = <Input id={id} placeholder="XX-XXXXXXX" value={text} onChange={(e) => setText(e.target.value)} className="max-w-md" />
    label = "Employer Identification Number (EIN)"
  } else if (t === "url") {
    inner = <Input id={id} type="url" placeholder={item.inputPlaceholder ?? "https://"} value={text} onChange={(e) => setText(e.target.value)} className="max-w-md" />
    label = "URL"
  } else if (t === "phone") {
    inner = <PhoneInput id={id} value={phone} onChange={(v) => setPhone(v ?? "")} className="max-w-md" />
    label = "Phone number"
  } else if (t === "text") {
    inner = <Input id={id} placeholder={item.inputPlaceholder ?? "Enter value"} value={text} onChange={(e) => setText(e.target.value)} className="max-w-md" />
  }
  return inner ? (
    <div className="space-y-2 mt-3">
      <Label htmlFor={id}>{label}</Label>
      {inner}
      <Button variant="primary" type="button" onClick={go}>Submit</Button>
    </div>
  ) : null
}

function ItemRow({ item, role, onDone }: { item: ChecklistItem; role: ViewRole; onDone: (id: string) => void }) {
  const [ex, setEx] = useState(item.status === "needs_input" || item.status === "blocked")
  const st = item.status
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button type="button" className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors" onClick={() => setEx(!ex)} aria-expanded={ex}>
        <StatusGlyph s={st} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{item.label}</span>
            {item.product && item.product !== "all" && <Badge variant="gray" className="text-xs shrink-0">{PRODUCT_LABELS[item.product]}</Badge>}
          </div>
        </div>
        <Badge variant={BADGE[st]}>{STATUS_LABELS[st]}</Badge>
        {ex ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />}
      </button>
      {ex && (
        <div className="px-4 pb-4 pt-1 border-t border-border bg-muted/30">
          {item.isSafetyGate && (
            <Alert variant="error" title="Safety requirement" className="mb-3">
              This is a safety requirement. Properties without this information cannot go live.
            </Alert>
          )}
          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
          {item.helpUrl && item.helpLabel && (
            <a href={item.helpUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary mb-3">
              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
              {item.helpLabel}
            </a>
          )}
          {st === "auto_confirmed" && item.sourceIfBackfill && (
            <div className="flex gap-2 text-sm bg-muted rounded-md px-3 py-2 mb-3 border border-border">
              <ShieldCheck className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <span>Confirmed from: {item.sourceIfBackfill}</span>
            </div>
          )}
          {st === "needs_input" && <ClientInputBlock item={item} onComplete={() => onDone(item.id)} />}
          {st === "blocked" && item.blockedReason && (
            <div className="flex gap-2 text-sm bg-destructive/5 rounded-md px-3 py-2 mb-3 border border-destructive/20">
              <AlertTriangle className="h-4 w-4 shrink-0 text-error-foreground" aria-hidden />
              <span>{item.blockedReason}</span>
            </div>
          )}
          {role === "internal" && item.internalOwner && (
            <p className="text-xs text-muted-foreground">Internal owner: <span className="font-medium">{item.internalOwner}</span></p>
          )}
          {item.level === "property" && <p className="text-xs text-muted-foreground mt-1">Applies to: Each property individually</p>}
        </div>
      )}
    </div>
  )
}

function Cat({ cat, items, role, onDone }: { cat: ItemCategory; items: ChecklistItem[]; role: ViewRole; onDone: (id: string) => void }) {
  const [collapsed, setCollapsed] = useState(false)
  const done = items.filter((i) => i.status === "complete" || i.status === "auto_confirmed").length
  const pct = items.length ? Math.round((done / items.length) * 100) : 0
  return (
    <div className="space-y-2">
      <button type="button" className="flex flex-col gap-2 w-full text-left rounded-lg" onClick={() => setCollapsed(!collapsed)} aria-expanded={!collapsed}>
        <div className="flex items-start gap-2 w-full">
          {collapsed ? <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" aria-hidden /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" aria-hidden />}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold">{CATEGORY_LABELS[cat]}</h3>
              <Badge variant={done === items.length ? "green" : "gray"}>{done} / {items.length}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{CATEGORY_DESCRIPTIONS[cat]}</p>
            <Progress value={pct} className="h-2 max-w-md" />
          </div>
        </div>
      </button>
      {!collapsed && (
        <div className="space-y-2 pl-6">
          {items.map((it) => <ItemRow key={it.id} item={it} role={role} onDone={onDone} />)}
        </div>
      )}
    </div>
  )
}

export function ImplementationChecklist({ items, role, viewState }: Props) {
  const [doneIds, setDoneIds] = useState<Set<string>>(() => new Set())
  const mark = (id: string) => setDoneIds((p) => new Set(p).add(id))
  const resolve = (i: ChecklistItem) => (doneIds.has(i.id) ? { ...i, status: "complete" as const } : i)

  if (viewState === "loading") {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-48" /><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    )
  }
  if (viewState === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-error-foreground mb-4" aria-hidden />
        <h3 className="text-lg font-semibold mb-1">Unable to load checklist</h3>
        <p className="text-sm text-muted-foreground mb-4">Something went wrong. Please try again.</p>
        <Button variant="outline" type="button"><RefreshCw className="h-4 w-4" />Try Again</Button>
      </div>
    )
  }
  const vis = items.map(resolve).filter((item) => (role === "client" ? item.visibility === "client" || item.visibility === "both" : true))
  if (viewState === "empty" || vis.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="Your checklist is being prepared"
        description="We're scanning your Entrata settings to pre-fill as much as possible — company address, office hours, property policies, pet and parking rules, financial settings, and more. In a moment, you'll see a checklist showing what's already confirmed and the few items that need your input. Most clients only need to provide an EIN, emergency contact numbers, and confirm a handful of settings."
        action={<Button variant="primary">Refresh</Button>}
      />
    )
  }
  const groups = CATEGORY_ORDER.map((c) => ({ cat: c, items: vis.filter((i) => i.category === c) })).filter((g) => g.items.length > 0)
  return (
    <div className="space-y-6">
      {groups.map(({ cat, items: list }) => <Cat key={cat} cat={cat} items={list} role={role} onDone={mark} />)}
    </div>
  )
}
