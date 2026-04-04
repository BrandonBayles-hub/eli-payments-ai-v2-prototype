import { useState } from "react"
import type { BasePageProps } from "../index"
import { buttonVariants } from "@sandbox-components/ui/button"
import { cn } from "@sandbox-lib/utils"
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Copy,
  FileText,
  ChevronRight,
  ChevronDown,
} from "lucide-react"

const COMPLIANT_PROPERTIES = [
  { id: "p1", name: "Sunset Lofts",          city: "Phoenix, AZ" },
  { id: "p2", name: "Harbor View",            city: "San Diego, CA" },
  { id: "p3", name: "The Meridian",           city: "Austin, TX" },
  { id: "p4", name: "Park Place Residences",  city: "Denver, CO" },
  { id: "p5", name: "Riverwalk Commons",      city: "Nashville, TN" },
]

interface TemplateFields { companyName: string; contactEmail: string; stateList: string }

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
    <div className={cn("rounded-xl border transition-all bg-white", active ? "border-zinc-900" : "border-border")}>
      <button type="button" onClick={onSelect} className="w-full flex items-start gap-3 p-4 text-left">
        <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="h-4 w-4 text-zinc-600" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        {active
          ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" aria-hidden />
          : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" aria-hidden />}
      </button>
      {active && children && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/60 pt-3 bg-white rounded-b-xl">
          {children}
        </div>
      )}
    </div>
  )
}

export function PrivacyPage({ navigate, completedTasks, onComplete }: BasePageProps) {
  const isConfigured = completedTasks?.has("privacy") ?? false
  const [mode, setMode] = useState<null | "copy" | "template">(null)
  const [selectedProperty, setSelectedProperty] = useState("")
  const [fields, setFields] = useState<TemplateFields>({
    companyName: "Sunset Property Group LLC",
    contactEmail: "privacy@sunsetproperties.com",
    stateList: "Arizona, California, Texas",
  })

  const isValid =
    (mode === "copy" && selectedProperty !== "") ||
    (mode === "template" &&
      fields.companyName.trim() !== "" &&
      fields.contactEmail.trim() !== "" &&
      fields.stateList.trim() !== "")

  function handleSave() {
    onComplete?.("privacy")
    navigate("overview")
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl space-y-6">
      <button
        type="button"
        onClick={() => navigate("overview")}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 -ml-2 text-muted-foreground")}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Overview
      </button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Privacy Policy Coverage</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Verify SMS consent language is present on your property websites before sending campaigns.
          </p>
        </div>
        {isConfigured && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 shrink-0 mt-1">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            Configured
          </span>
        )}
      </div>

      {/* Always show the editable form — completed banner is informational only */}
      {isConfigured && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden />
          <p className="text-sm text-emerald-800">
            Previously applied to 8 properties. You can update the policy below and re-publish at any time.
          </p>
        </div>
      )}

      <div className="space-y-5">
        {/* Status summary */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 mb-2">
            What We Found
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{isConfigured ? 48 : 40} properties</p>
                <p className="text-xs text-muted-foreground">SMS consent language confirmed on property website</p>
              </div>
              <span className="text-xs font-medium text-emerald-600 shrink-0">Compliant</span>
            </div>
            {!isConfigured && (
              <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" aria-hidden />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">8 properties</p>
                  <p className="text-xs text-muted-foreground">Missing required SMS consent language</p>
                </div>
                <span className="text-xs font-medium text-amber-600 shrink-0">Needs Update</span>
              </div>
            )}
          </div>
        </div>

        {/* Fix / update options — always editable */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 mb-2">
            {isConfigured ? "Update Policy — Choose an Option" : "Fix 8 Properties — Choose an Option"}
          </p>
          <div className="space-y-2">
            <OptionCard
              icon={Copy}
              title="Copy from a compliant property"
              description="Select one of your valid properties and apply its privacy policy to all non-compliant sites."
              active={mode === "copy"}
              onSelect={() => setMode(mode === "copy" ? null : "copy")}
            >
              <p className="text-sm text-muted-foreground">Select a property with a valid, graded privacy policy.</p>
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
                  Will apply{" "}
                  <strong className="text-foreground">
                    {COMPLIANT_PROPERTIES.find((p) => p.id === selectedProperty)?.name}
                  </strong>
                  's policy to all non-compliant properties.
                </p>
              )}
            </OptionCard>

            <OptionCard
              icon={FileText}
              title="Fill in the Entrata template"
              description="Complete a short form and we'll generate a compliant privacy policy applied to all properties."
              active={mode === "template"}
              onSelect={() => setMode(mode === "template" ? null : "template")}
            >
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
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>
                ))}
              </div>
            </OptionCard>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <button
            type="button"
            disabled={!isValid}
            onClick={handleSave}
            className={cn(buttonVariants({ variant: "eli" }), !isValid && "opacity-40 cursor-not-allowed")}
          >
            {isConfigured ? "Re-publish to All Properties" : "Publish to 8 Websites & Mark Complete"}
          </button>
        </div>
      </div>
    </div>
  )
}
