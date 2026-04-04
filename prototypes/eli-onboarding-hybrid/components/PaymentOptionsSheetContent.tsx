import { useState, useEffect } from "react"
import { cn } from "@sandbox-lib/utils"
import { CheckCircle2, ChevronDown, ChevronRight } from "lucide-react"

const PAYMENT_METHODS = [
  { id: "online",  label: "Online Payment",      description: "Resident portal or mobile app" },
  { id: "ach",     label: "ACH / Bank Transfer",  description: "Direct bank debit" },
  { id: "credit",  label: "Credit Card",          description: "Visa, Mastercard, Amex" },
  { id: "check",   label: "Check / Money Order",  description: "Paper check or money order" },
  { id: "cash",    label: "Cash",                 description: "In-person cash payment" },
]

const PROPERTIES = [
  { id: "p1", name: "Sunset Ridge",      city: "Austin" },
  { id: "p2", name: "Harbor View",       city: "Denver" },
  { id: "p3", name: "Maple Commons",     city: "Phoenix" },
  { id: "p4", name: "The Edison",        city: "Dallas" },
  { id: "p5", name: "Parkside Lofts",    city: "Houston" },
  { id: "p6", name: "River North Plaza", city: "Austin" },
  { id: "p7", name: "Cedar Glen",        city: "Denver" },
  { id: "p8", name: "Oakwood Terrace",   city: "Phoenix" },
]

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => String(i + 1))

type MethodSetting = { enabled: boolean; day: string }
type MethodMap = Record<string, MethodSetting>

const DEFAULT_BULK: MethodMap = {
  online: { enabled: true,  day: "1" },
  ach:    { enabled: true,  day: "1" },
  credit: { enabled: false, day: "" },
  check:  { enabled: true,  day: "1" },
  cash:   { enabled: true,  day: "7" },
}

function MethodRow({
  method,
  setting,
  onChange,
}: {
  method: typeof PAYMENT_METHODS[0]
  setting: MethodSetting
  onChange: (s: MethodSetting) => void
}) {
  return (
    <div className={cn(
      "flex items-center gap-3 rounded-lg border px-3.5 py-3 transition-colors",
      setting.enabled ? "border-zinc-300 bg-white" : "border-border bg-zinc-50/60",
    )}>
      {/* Toggle */}
      <button
        type="button"
        role="switch"
        aria-checked={setting.enabled}
        onClick={() => onChange({ ...setting, enabled: !setting.enabled, day: !setting.enabled ? "1" : "" })}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/20",
          setting.enabled ? "bg-emerald-700" : "bg-zinc-200",
        )}
      >
        <span className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200",
          setting.enabled ? "translate-x-4" : "translate-x-0",
        )} />
        <span className="sr-only">{setting.enabled ? "Enabled" : "Disabled"}</span>
      </button>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", setting.enabled ? "text-foreground" : "text-muted-foreground")}>
          {method.label}
        </p>
        <p className="text-xs text-muted-foreground">{method.description}</p>
      </div>

      {/* Day selector */}
      {setting.enabled && (
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground whitespace-nowrap">from day</span>
          <select
            value={setting.day}
            onChange={(e) => onChange({ ...setting, day: e.target.value })}
            className="h-8 w-16 rounded-lg border border-border bg-white px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
          >
            {DAY_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      )}
    </div>
  )
}

interface Props {
  onValidChange: (valid: boolean) => void
}

export function PaymentOptionsSheetContent({ onValidChange }: Props) {
  const [bulk, setBulk] = useState<MethodMap>(DEFAULT_BULK)
  const [applied, setApplied] = useState(false)
  const [perProperty, setPerProperty] = useState<Record<string, MethodMap>>(
    Object.fromEntries(PROPERTIES.map((p) => [p.id, { ...DEFAULT_BULK }])),
  )
  const [openProperty, setOpenProperty] = useState<string | null>(null)

  useEffect(() => {
    const anyEnabled = Object.values(bulk).some((m) => m.enabled)
    onValidChange(anyEnabled)
  }, [bulk, onValidChange])

  function applyBulk() {
    setPerProperty(Object.fromEntries(PROPERTIES.map((p) => [p.id, { ...bulk }])))
    setApplied(true)
  }

  function updateBulkMethod(id: string, setting: MethodSetting) {
    setBulk((prev) => ({ ...prev, [id]: setting }))
    setApplied(false)
  }

  function updatePropertyMethod(propId: string, methodId: string, setting: MethodSetting) {
    setPerProperty((prev) => ({
      ...prev,
      [propId]: { ...prev[propId], [methodId]: setting },
    }))
  }

  const enabledCount = Object.values(bulk).filter((m) => m.enabled).length

  return (
    <div className="space-y-6 p-6">
      {/* Bulk configure */}
      <div className="rounded-xl border border-border bg-white p-4 space-y-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Configure for All Properties</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Toggle payment methods on or off and set the day of month each becomes available.
          </p>
        </div>

        <div className="space-y-2">
          {PAYMENT_METHODS.map((method) => (
            <MethodRow
              key={method.id}
              method={method}
              setting={bulk[method.id]}
              onChange={(s) => updateBulkMethod(method.id, s)}
            />
          ))}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            disabled={enabledCount === 0}
            onClick={applyBulk}
            className="h-9 px-4 rounded-lg bg-zinc-900 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
          >
            Apply to All Properties
          </button>
          {applied && (
            <span className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Applied to {PROPERTIES.length} properties
            </span>
          )}
        </div>
      </div>

      {/* Per-property override */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Per-Property Override</p>
        <p className="text-xs text-muted-foreground">Expand a property to customize its payment schedule.</p>

        <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
          {PROPERTIES.map((prop) => {
            const config = perProperty[prop.id]
            const isOpen = openProperty === prop.id
            const enabledMethods = PAYMENT_METHODS.filter((m) => config[m.id]?.enabled)

            return (
              <div key={prop.id}>
                <button
                  type="button"
                  onClick={() => setOpenProperty(isOpen ? null : prop.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{prop.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {enabledMethods.length > 0
                        ? enabledMethods.map((m) => `${m.label} (day ${config[m.id].day})`).join(" · ")
                        : "No methods configured"}
                    </p>
                  </div>
                  {isOpen
                    ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
                    : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-2 space-y-2 bg-zinc-50/60 border-t border-border">
                    {PAYMENT_METHODS.map((method) => (
                      <MethodRow
                        key={method.id}
                        method={method}
                        setting={config[method.id]}
                        onChange={(s) => updatePropertyMethod(prop.id, method.id, s)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
