import { useState } from "react"
import type { BasePageProps } from "../index"
import { buttonVariants } from "@sandbox-components/ui/button"
import { cn } from "@sandbox-lib/utils"
import { ArrowLeft, CheckCircle2, AlertTriangle, ChevronRight, ChevronDown } from "lucide-react"
import { DateSettingSheetContent } from "../components/DateSettingSheetContent"
import { PaymentPlansSheetContent } from "../components/PaymentPlansSheetContent"
import { PaymentLinkSheetContent } from "../components/PaymentLinkSheetContent"
import { PolicySheetContent } from "../components/PolicySheetContent"
import { PaymentOptionsSheetContent } from "../components/PaymentOptionsSheetContent"

const SETTINGS = [
  {
    id: "rent-charge-date",
    label: "Rent Charge Date",
    description: "Day of month rent is posted to resident ledgers",
    saveLabel: "Save Rent Charge Dates",
    type: "date" as const,
  },
  {
    id: "rent-due-date",
    label: "Rent Due Date",
    description: "Day rent is officially overdue and late fees may apply",
    saveLabel: "Save Rent Due Dates",
    type: "date" as const,
  },
  {
    id: "payment-plans",
    label: "Payment Plans",
    description: "Whether each community allows residents to split balances into installments",
    saveLabel: "Save Payment Plan Settings",
    type: "plans" as const,
  },
  {
    id: "payment-block-date",
    label: "Payment Block Date",
    description: "Day online payments are blocked for month-end accounting close",
    saveLabel: "Save Payment Block Dates",
    type: "date" as const,
  },
  {
    id: "payment-link",
    label: "Payment Portal Link",
    description: "URL ELI uses in outbound messages to direct residents to your payment portal",
    saveLabel: "Save Payment Links",
    type: "link" as const,
  },
  {
    id: "grace-period",
    label: "Grace Period Date",
    description: "Days after due date before late fees apply",
    saveLabel: "Save Grace Period Dates",
    type: "date" as const,
  },
  {
    id: "outstanding-balance",
    label: "Outstanding Balance Threshold",
    description: "Minimum balance before ELI sends a collection nudge to a resident",
    saveLabel: "Save Balance Thresholds",
    type: "date" as const,
  },
  {
    id: "late-fee-policy",
    label: "Late Fee Policy",
    description: "Policy language ELI uses in automated late fee notices sent to residents",
    saveLabel: "Save Late Fee Policy",
    type: "policy" as const,
    policyType: "Late Fee",
  },
  {
    id: "payment-plan-policy",
    label: "Payment Plan Policy",
    description: "Policy language ELI shares when residents inquire about splitting their balance",
    saveLabel: "Save Payment Plan Policy",
    type: "policy" as const,
    policyType: "Payment Plan",
  },
  {
    id: "payment-options",
    label: "Payment Options & Availability",
    description: "Which payment methods are accepted and the day of month each becomes available",
    saveLabel: "Save Payment Options",
    type: "options" as const,
  },
]

export function PaymentsSummaryPage({ navigate, completedTasks, onComplete }: BasePageProps) {
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [validMap, setValidMap] = useState<Record<string, boolean>>({})

  function setValid(id: string, v: boolean) {
    setValidMap((prev) => ({ ...prev, [id]: v }))
  }

  function handleSave(id: string) {
    onComplete?.(id)
    setOpenSection(null)
  }

  const configuredCount = SETTINGS.filter((s) => completedTasks?.has(s.id)).length

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
          <h1 className="text-2xl font-bold tracking-tight">Payments AI</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure payment settings for your portfolio. Expand any section to update values — changes apply immediately.
          </p>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums shrink-0 mt-1.5">
          {configuredCount} / {SETTINGS.length} configured
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-700 transition-all duration-500"
          style={{ width: `${(configuredCount / SETTINGS.length) * 100}%` }}
        />
      </div>

      {/* Settings accordion */}
      <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
        {SETTINGS.map((setting) => {
          const isConfigured = completedTasks?.has(setting.id) ?? false
          const isOpen = openSection === setting.id
          const isValid = validMap[setting.id] ?? false

          return (
            <div key={setting.id}>
              {/* Row header — always clickable */}
              <button
                type="button"
                onClick={() => setOpenSection(isOpen ? null : setting.id)}
                className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-zinc-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{setting.label}</p>
                    {isConfigured ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" aria-hidden />
                        Configured
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        <AlertTriangle className="h-3 w-3" aria-hidden />
                        Not Set
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{setting.description}</p>
                </div>
                {isOpen
                  ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
                  : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />}
              </button>

              {/* Expanded form */}
              {isOpen && (
                <div className="border-t border-border bg-zinc-50/50">
                  {isConfigured && (
                    <div className="flex items-center gap-2 mx-4 mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden />
                      <p className="text-xs text-emerald-800">
                        Previously configured. Update below and save to apply changes.
                      </p>
                    </div>
                  )}

                  {/* Render the matching form component */}
                  <div className="bg-white">
                    {setting.type === "date" && (
                      <DateSettingSheetContent
                        label={setting.label}
                        onValidChange={(v) => setValid(setting.id, v)}
                      />
                    )}
                    {setting.type === "plans" && (
                      <PaymentPlansSheetContent
                        onValidChange={(v) => setValid(setting.id, v)}
                      />
                    )}
                    {setting.type === "link" && (
                      <PaymentLinkSheetContent
                        onValidChange={(v) => setValid(setting.id, v)}
                      />
                    )}
                    {setting.type === "policy" && (
                      <PolicySheetContent
                        policyType={(setting as { policyType: string }).policyType}
                        onValidChange={(v) => setValid(setting.id, v)}
                      />
                    )}
                    {setting.type === "options" && (
                      <PaymentOptionsSheetContent
                        onValidChange={(v) => setValid(setting.id, v)}
                      />
                    )}
                  </div>

                  <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-white">
                    <button
                      type="button"
                      onClick={() => setOpenSection(null)}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!isValid}
                      onClick={() => handleSave(setting.id)}
                      className={cn(
                        buttonVariants({ variant: "eli", size: "sm" }),
                        !isValid && "opacity-40 cursor-not-allowed",
                      )}
                    >
                      {setting.saveLabel}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
