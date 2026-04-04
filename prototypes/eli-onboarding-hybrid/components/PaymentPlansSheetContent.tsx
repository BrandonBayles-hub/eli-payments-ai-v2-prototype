import { useState, useEffect } from "react"
import { cn } from "@sandbox-lib/utils"
import { ExternalLink, Info } from "lucide-react"

const PROPERTIES = [
  { id: "p1", name: "Sunset Ridge",      city: "Austin",  enabled: true  },
  { id: "p2", name: "Harbor View",       city: "Denver",  enabled: false },
  { id: "p3", name: "Maple Commons",     city: "Phoenix", enabled: true  },
  { id: "p4", name: "The Edison",        city: "Dallas",  enabled: false },
  { id: "p5", name: "Parkside Lofts",    city: "Houston", enabled: true  },
  { id: "p6", name: "River North Plaza", city: "Austin",  enabled: false },
  { id: "p7", name: "Cedar Glen",        city: "Denver",  enabled: true  },
  { id: "p8", name: "Oakwood Terrace",   city: "Phoenix", enabled: false },
]

interface Props {
  onValidChange: (valid: boolean) => void
}

export function PaymentPlansSheetContent({ onValidChange }: Props) {
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(PROPERTIES.map((p) => [p.id, p.enabled])),
  )
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    onValidChange(touched)
  }, [touched, onValidChange])

  function toggle(id: string) {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }))
    setTouched(true)
  }

  function enableAll() {
    setToggles(Object.fromEntries(PROPERTIES.map((p) => [p.id, true])))
    setTouched(true)
  }

  function disableAll() {
    setToggles(Object.fromEntries(PROPERTIES.map((p) => [p.id, false])))
    setTouched(true)
  }

  const enabledCount = Object.values(toggles).filter(Boolean).length

  return (
    <div className="space-y-6 p-6">
      {/* Pre-populated notice */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" aria-hidden />
        <div className="space-y-1 min-w-0">
          <p className="text-xs text-blue-900 leading-relaxed">
            These values were pre-populated from your existing Entrata financial configuration. Review each toggle below and confirm they're correct before saving.
          </p>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            View Payment Plan Settings in Entrata
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        </div>
      </div>

      {/* Bulk actions */}
      <div className="rounded-xl border border-border bg-white p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Bulk Settings</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {enabledCount} of {PROPERTIES.length} communities currently allow payment plans.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={enableAll}
            className="h-8 px-3 rounded-lg border border-zinc-300 bg-white text-xs font-medium text-foreground hover:bg-zinc-50 transition-colors"
          >
            Enable All
          </button>
          <button
            type="button"
            onClick={disableAll}
            className="h-8 px-3 rounded-lg border border-zinc-300 bg-white text-xs font-medium text-foreground hover:bg-zinc-50 transition-colors"
          >
            Disable All
          </button>
        </div>
      </div>

      {/* Per-community toggles */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Per-Community Setting</p>
        <div className="rounded-xl border border-border overflow-hidden">
          {PROPERTIES.map((prop, idx) => (
            <div
              key={prop.id}
              className={cn(
                "flex items-center justify-between px-4 py-3 border-b border-border last:border-0",
                idx % 2 === 0 ? "bg-white" : "bg-zinc-50/50",
              )}
            >
              <div>
                <p className="text-sm font-medium text-foreground">{prop.name}</p>
                <p className="text-xs text-muted-foreground">{prop.city}</p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-muted-foreground">
                  {toggles[prop.id] ? "Allowed" : "Not Allowed"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={toggles[prop.id]}
                  onClick={() => toggle(prop.id)}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/20",
                    toggles[prop.id] ? "bg-emerald-700" : "bg-zinc-200",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200",
                      toggles[prop.id] ? "translate-x-4" : "translate-x-0",
                    )}
                  />
                  <span className="sr-only">{toggles[prop.id] ? "Enabled" : "Disabled"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
