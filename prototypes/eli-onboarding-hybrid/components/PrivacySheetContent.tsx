import { useState, useEffect } from "react"
import { cn } from "@sandbox-lib/utils"
import { CheckCircle2, AlertTriangle, ChevronRight, ChevronDown, Copy, FileText } from "lucide-react"

const STATUS_CARDS = [
  {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    count: 40,
    label: "Valid Policy Found",
    detail: "Compliant and ready for ELI+",
  },
  {
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    count: 8,
    label: "Needs Update",
    detail: "Missing required SMS consent language",
  },
]

const COMPLIANT_PROPERTIES = [
  { id: "p1", name: "Sunset Lofts", city: "Phoenix, AZ" },
  { id: "p2", name: "Harbor View", city: "San Diego, CA" },
  { id: "p3", name: "The Meridian", city: "Austin, TX" },
  { id: "p4", name: "Park Place Residences", city: "Denver, CO" },
  { id: "p5", name: "Riverwalk Commons", city: "Nashville, TN" },
]

type Mode = null | "copy" | "template"

interface TemplateFields {
  companyName: string
  contactEmail: string
  stateList: string
}

interface OptionCardProps {
  icon: React.ElementType
  title: string
  description: string
  active: boolean
  onSelect: () => void
  children?: React.ReactNode
}

function OptionCard({ icon: Icon, title, description, active, onSelect, children }: OptionCardProps) {
  return (
    <div className={cn(
      "rounded-xl border transition-all bg-white",
      active ? "border-zinc-900" : "border-border",
    )}>
      <button
        type="button"
        onClick={onSelect}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="h-4 w-4 text-zinc-600" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        {active
          ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" aria-hidden />
          : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" aria-hidden />
        }
      </button>
      {active && children && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/60 pt-3 bg-white rounded-b-xl">
          {children}
        </div>
      )}
    </div>
  )
}

export function PrivacySheetContent({ onValidChange }: { onValidChange: (valid: boolean) => void }) {
  const [mode, setMode] = useState<Mode>(null)
  const [selectedProperty, setSelectedProperty] = useState<string>("")
  const [fields, setFields] = useState<TemplateFields>({
    companyName: "Sunset Property Group LLC",
    contactEmail: "privacy@sunsetproperties.com",
    stateList: "Arizona, California, Texas",
  })

  useEffect(() => {
    if (mode === "copy") onValidChange(selectedProperty !== "")
    else if (mode === "template") onValidChange(
      fields.companyName.trim() !== "" &&
      fields.contactEmail.trim() !== "" &&
      fields.stateList.trim() !== ""
    )
    else onValidChange(false)
  }, [mode, selectedProperty, fields, onValidChange])

  return (
    <div className="space-y-5">

      {/* Status summary */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 mb-2">
          What We Found
        </p>
        <div className="space-y-2">
          {STATUS_CARDS.map(({ icon: Icon, color, bg, count, label, detail }) => (
            <div key={label} className={cn("flex items-center gap-3 rounded-lg border px-3.5 py-3", bg)}>
              <Icon className={cn("h-4 w-4 shrink-0", color)} aria-hidden />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{count} properties</p>
                <p className="text-xs text-muted-foreground">{detail}</p>
              </div>
              <span className={cn("text-xs font-medium shrink-0", color)}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fix options — both always visible, one expanded */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 mb-2">
          Fix 8 Properties — Choose an Option
        </p>
        <div className="space-y-2">

          {/* Option A: Copy from property */}
          <OptionCard
            icon={Copy}
            title="Copy from a compliant property"
            description="Select one of your 40 valid properties and apply its privacy policy to all 8 non-compliant sites."
            active={mode === "copy"}
            onSelect={() => setMode(mode === "copy" ? null : "copy")}
          >
            <p className="text-sm text-muted-foreground">
              Select a property with a valid, graded privacy policy.
            </p>
            <div className="space-y-1.5">
              {COMPLIANT_PROPERTIES.map((p) => (
                <label
                  key={p.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3.5 py-3 cursor-pointer transition-all bg-card",
                    selectedProperty === p.id ? "border-zinc-900" : "border-border hover:border-zinc-300",
                  )}
                >
                  <input
                    type="radio"
                    name="source-property"
                    value={p.id}
                    checked={selectedProperty === p.id}
                    onChange={() => setSelectedProperty(p.id)}
                    className="accent-zinc-900 h-3.5 w-3.5 shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.city}</p>
                  </div>
                  {selectedProperty === p.id && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 ml-auto shrink-0" aria-hidden />
                  )}
                </label>
              ))}
            </div>
            {selectedProperty && (
              <p className="text-xs text-muted-foreground pt-1">
                "Publish to 8 Websites" will apply{" "}
                <strong className="text-foreground">
                  {COMPLIANT_PROPERTIES.find((p) => p.id === selectedProperty)?.name}
                </strong>
                's policy to all 8 non-compliant properties.
              </p>
            )}
          </OptionCard>

          {/* Option B: Template */}
          <OptionCard
            icon={FileText}
            title="Fill in the Entrata template"
            description="Complete a short form and we'll generate a compliant privacy policy applied to all 8 properties."
            active={mode === "template"}
            onSelect={() => setMode(mode === "template" ? null : "template")}
          >
            {/* Live preview */}
            <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50/60 px-4 py-3 text-sm text-zinc-600 leading-relaxed">
              <span className="text-foreground font-medium">"</span>
              {" "}By providing your phone number, you consent to receive SMS messages from{" "}
              <span className="inline-block border-b border-zinc-400 text-foreground font-medium min-w-[80px]">
                {fields.companyName || "___"}
              </span>
              {" "}regarding your tenancy. Message and data rates may apply. Contact{" "}
              <span className="inline-block border-b border-zinc-400 text-foreground font-medium min-w-[80px]">
                {fields.contactEmail || "___"}
              </span>
              {" "}to opt out. Applies in:{" "}
              <span className="inline-block border-b border-zinc-400 text-foreground font-medium min-w-[80px]">
                {fields.stateList || "___"}
              </span>
              .<span className="text-foreground font-medium">"</span>
            </div>

            <div className="space-y-2.5">
              {([
                { key: "companyName" as const, label: "Legal company name" },
                { key: "contactEmail" as const, label: "Privacy contact email" },
                { key: "stateList" as const, label: "States where this applies" },
              ]).map(({ key, label }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
                  <input
                    type="text"
                    value={fields[key]}
                    onChange={(e) => setFields((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              ))}
            </div>
          </OptionCard>

        </div>
      </div>
    </div>
  )
}
