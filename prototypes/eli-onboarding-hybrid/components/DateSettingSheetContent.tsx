import { useState, useEffect } from "react"
import { cn } from "@sandbox-lib/utils"
import { CheckCircle2 } from "lucide-react"

const PROPERTIES = [
  { id: "p1", name: "Sunset Ridge",     city: "Austin" },
  { id: "p2", name: "Harbor View",      city: "Denver" },
  { id: "p3", name: "Maple Commons",    city: "Phoenix" },
  { id: "p4", name: "The Edison",       city: "Dallas" },
  { id: "p5", name: "Parkside Lofts",   city: "Houston" },
  { id: "p6", name: "River North Plaza",city: "Austin" },
  { id: "p7", name: "Cedar Glen",       city: "Denver" },
  { id: "p8", name: "Oakwood Terrace",  city: "Phoenix" },
]

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => String(i + 1))

interface Props {
  /** Human label shown in the per-property column header, e.g. "Rent Charge Date" */
  label: string
  onValidChange: (valid: boolean) => void
}

export function DateSettingSheetContent({ label, onValidChange }: Props) {
  const [bulkValue, setBulkValue] = useState("")
  const [applied, setApplied] = useState(false)
  const [perProperty, setPerProperty] = useState<Record<string, string>>(
    Object.fromEntries(PROPERTIES.map((p) => [p.id, ""])),
  )

  // Valid once any property has a value
  useEffect(() => {
    const anySet = Object.values(perProperty).some((v) => v !== "")
    onValidChange(anySet)
  }, [perProperty, onValidChange])

  function applyBulk() {
    if (!bulkValue) return
    setPerProperty(Object.fromEntries(PROPERTIES.map((p) => [p.id, bulkValue])))
    setApplied(true)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Bulk apply */}
      <div className="rounded-xl border border-border bg-white p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Apply to All Properties</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Set one value and push it to every property in your portfolio.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={bulkValue}
            onChange={(e) => { setBulkValue(e.target.value); setApplied(false) }}
            className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-foreground w-32 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
          >
            <option value="">Day of month</option>
            {DAY_OPTIONS.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <button
            type="button"
            disabled={!bulkValue}
            onClick={applyBulk}
            className="h-9 px-4 rounded-lg bg-zinc-900 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
          >
            Apply to All
          </button>
          {applied && (
            <span className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Applied to {PROPERTIES.length} properties
            </span>
          )}
        </div>
      </div>

      {/* Per-property overrides */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Per-Property Override</p>
        <p className="text-xs text-muted-foreground">Customize individual properties if needed.</p>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-zinc-50">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Property</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">City</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">{label}</th>
              </tr>
            </thead>
            <tbody>
              {PROPERTIES.map((prop, idx) => (
                <tr
                  key={prop.id}
                  className={cn(
                    "border-b border-border last:border-0",
                    idx % 2 === 0 ? "bg-white" : "bg-zinc-50/50",
                  )}
                >
                  <td className="px-4 py-3 font-medium text-foreground">{prop.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{prop.city}</td>
                  <td className="px-4 py-3">
                    <select
                      value={perProperty[prop.id]}
                      onChange={(e) =>
                        setPerProperty((prev) => ({ ...prev, [prop.id]: e.target.value }))
                      }
                      className="h-8 rounded-lg border border-border bg-white px-2 text-sm text-foreground w-24 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
                    >
                      <option value="">—</option>
                      {DAY_OPTIONS.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
