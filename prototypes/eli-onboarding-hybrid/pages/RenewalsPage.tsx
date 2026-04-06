import { useState } from "react"
import type { PageId } from "../index"
import { buttonVariants } from "@sandbox-components/ui/button"
import { cn } from "@sandbox-lib/utils"
import { ArrowLeft, CalendarDays, CheckCircle2, Sparkles } from "lucide-react"
import { PROPERTIES } from "../data/properties"
import { PropertyFilter, usePropertyFilter } from "../components/PropertyFilter"
import { isValidDays, RENEWAL_DEFAULT_DAYS } from "../components/RenewalLeadTimeSheetContent"

interface Props {
  navigate: (to: PageId) => void
  days: Record<string, string>
  onChange: (id: string, val: string) => void
}

function DaysTable({ days, onChange }: { days: Record<string, string>; onChange: (id: string, val: string) => void }) {
  const { search, setSearch, group, setGroup, filtered } = usePropertyFilter()
  const filledCount = Object.values(days).filter(isValidDays).length

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <PropertyFilter
          search={search}
          onSearchChange={setSearch}
          group={group}
          onGroupChange={setGroup}
          resultCount={filtered.length}
          totalCount={PROPERTIES.length}
        />
        <span className="text-xs text-muted-foreground tabular-nums shrink-0 ml-2">
          {filledCount} / {PROPERTIES.length}
        </span>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">No properties match.</div>
        ) : (
          filtered.map((prop, idx) => {
            const val = days[prop.id] ?? ""
            const valid = isValidDays(val)
            return (
              <div
                key={prop.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 border-b border-border last:border-0",
                  idx % 2 === 0 ? "bg-white" : "bg-zinc-50/50",
                )}
              >
                <div className="w-36 shrink-0">
                  <p className="text-sm font-medium text-foreground truncate">{prop.name}</p>
                  <p className="text-xs text-muted-foreground">{prop.city}, {prop.state}</p>
                </div>
                <div className="relative flex-1 flex items-center gap-2">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" aria-hidden />
                  <input
                    type="number"
                    min="1"
                    max="365"
                    placeholder="120"
                    value={val}
                    onChange={(e) => onChange(prop.id, e.target.value)}
                    className="w-full h-8 rounded-lg border border-border bg-white pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
                  />
                  <span className="text-xs text-muted-foreground shrink-0">days</span>
                </div>
                <div className="w-6 shrink-0 flex justify-center">
                  {valid && <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export function RenewalsPage({ navigate, days, onChange }: Props) {
  const [saved, setSaved] = useState(false)
  const filledCount = Object.values(days).filter(isValidDays).length
  const allFilled = filledCount === PROPERTIES.length
  const pct = Math.round((filledCount / PROPERTIES.length) * 100)

  function handleSave() {
    setSaved(true)
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl space-y-6">
      <button
        type="button"
        onClick={() => navigate("overview")}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 -ml-2 text-muted-foreground")}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Overview
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Renewals AI</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Set the number of days before a lease expires that ELI begins renewal outreach — per property.
          We defaulted to <strong>{RENEWAL_DEFAULT_DAYS} days</strong> for all properties. Adjust any that differ.
        </p>
      </div>

      {/* Default applied notice */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
        <Sparkles className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" aria-hidden />
        <p className="text-xs text-blue-900 leading-relaxed">
          <strong>Default applied:</strong> All properties are set to {RENEWAL_DEFAULT_DAYS} days based on standard industry practice.
          This is not a blocker — you can go live and adjust later. We recommend reviewing to confirm the lead time matches your lease terms.
        </p>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>{filledCount} / {PROPERTIES.length} properties configured</span>
          <span className="text-emerald-700 font-medium">{pct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-700 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {saved && allFilled && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden />
          <p className="text-xs text-emerald-800">All properties saved. This setting is complete.</p>
        </div>
      )}

      <DaysTable days={days} onChange={onChange} />

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          className={cn(buttonVariants({ variant: "eli" }))}
        >
          {allFilled ? "Save & Mark Complete" : `Save Progress (${filledCount}/${PROPERTIES.length})`}
        </button>
      </div>
    </div>
  )
}
