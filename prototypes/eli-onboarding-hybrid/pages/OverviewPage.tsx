import { useState, useEffect, useCallback } from "react"
import type { PageId } from "../index"
import { buttonVariants } from "@sandbox-components/ui/button"
import { cn } from "@sandbox-lib/utils"
import { ArrowRight, AlertTriangle, CheckCircle2, Users, CreditCard, Wrench, RefreshCw } from "lucide-react"
import { NEEDS_ATTENTION } from "../data/mock"
import { TaskSheet } from "../components/TaskSheet"
import { PrivacySheetContent } from "../components/PrivacySheetContent"
import { PaymentsSheetContent } from "../components/PaymentsSheetContent"
import { DateSettingSheetContent } from "../components/DateSettingSheetContent"
import { PaymentPlansSheetContent } from "../components/PaymentPlansSheetContent"
import { PaymentLinkSheetContent } from "../components/PaymentLinkSheetContent"

import { PolicySheetContent } from "../components/PolicySheetContent"
import { PaymentOptionsSheetContent } from "../components/PaymentOptionsSheetContent"

type SheetId = PageId | "rent-charge-date" | "rent-due-date" | "payment-plans" | "payment-block-date" | "payment-link" | "grace-period" | "outstanding-balance" | "late-fee-policy" | "payment-plan-policy" | "payment-options"

const SEV_PILL: Record<string, string> = {
  critical: "border border-red-300 bg-red-50 text-red-600",
  attention: "border border-amber-300 bg-amber-50 text-amber-700",
  waiting:   "border border-zinc-300 bg-white text-zinc-500",
}

const SEV_LABEL: Record<string, string> = {
  critical: "Action Required",
  attention: "Needs Review",
  waiting: "Pending",
}

const SHEET_TITLE: Partial<Record<SheetId, string>> = {
  privacy:             "Privacy Policy Coverage",
  payments:            "Verify Payments AI Defaults",
  "rent-charge-date":  "Rent Charge Date",
  "rent-due-date":     "Rent Due Date",
  "payment-plans":     "Payment Plans",
  "payment-block-date":"Payment Block Date",
  "payment-link":      "Payment Portal Links",
  "grace-period":      "Grace Period Date",
  "outstanding-balance": "Outstanding Balance Threshold",
  "late-fee-policy":     "Late Fee Policy",
  "payment-plan-policy": "Payment Plan Policy",
  "payment-options":     "Payment Options & Availability",
}

const SHEET_DESCRIPTION: Partial<Record<SheetId, string>> = {
  privacy:              "Apply an approved SMS consent template to properties missing compliant language before campaigns can go live.",
  "rent-charge-date":   "The day of month rent is posted to resident ledgers. Set a bulk value or customize per property.",
  "rent-due-date":      "The day rent is officially overdue. Must align with your lease agreements to avoid improper late fees.",
  "payment-plans":      "Confirm which communities allow residents to split outstanding balances into installments.",
  "payment-block-date": "The day online payments are blocked each month to allow for accounting close. Applies across all properties.",
  "payment-link":       "The URL ELI includes in outbound messages to direct residents to your payment portal.",
  "grace-period":       "How many days after the due date before late fees apply. Set per lease agreement terms.",
  "outstanding-balance":"The minimum balance required before ELI sends a collection nudge to a resident.",
  "late-fee-policy":    "Enter your late fee policy text. ELI includes this language in automated notices sent to residents with past-due balances.",
  "payment-plan-policy":"Enter your payment plan policy. ELI shares this with residents who inquire about splitting their balance into installments.",
  "payment-options":    "Define which payment methods residents can use and the day of month each becomes available — in bulk or per property.",
}

function BoldNumbers({ text }: { text: string }) {
  const parts = text.split(/(\d+(?:\s*\/\s*\d+)?)/g)
  return (
    <>
      {parts.map((part, i) =>
        /^\d/.test(part)
          ? <strong key={i} className="font-semibold text-foreground">{part}</strong>
          : <span key={i}>{part}</span>,
      )}
    </>
  )
}

interface ProductCardProps { label: string; icon: React.ElementType; done: number; total: number; unit?: string }
function ProductCard({ label, icon: Icon, done, total, unit = "properties" }: ProductCardProps) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-5 flex flex-col gap-3">
      {/* Label row: icon + name left, percentage right (small, like sidebar) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
          <p className="text-sm font-medium text-foreground">{label}</p>
        </div>
        <span className="text-sm font-semibold text-emerald-700 tabular-nums">{pct}%</span>
      </div>
      {/* Big number row */}
      <div className="flex items-baseline gap-1.5">
        <p className="text-3xl font-bold text-foreground tabular-nums">{done}</p>
        <p className="text-sm text-muted-foreground">/ {total} {unit}</p>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
        <div className="h-full rounded-full bg-emerald-700 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/** Simple toast notification */
interface ToastProps { message: string; visible: boolean }
function Toast({ message, visible }: ToastProps) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "absolute top-4 left-1/2 -translate-x-1/2 z-[60] flex items-start gap-3 rounded-xl border border-zinc-900 bg-white px-5 py-4 shadow-lg w-max max-w-sm transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 pointer-events-none",
      )}
    >
      <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden />
      <p className="text-sm text-foreground leading-snug">{message}</p>
    </div>
  )
}

interface Props {
  navigate: (to: PageId) => void
  completedTasks: Set<string>
  onComplete: (id: string) => void
}

export function OverviewPage({ navigate, completedTasks, onComplete }: Props) {
  const [activeSheet, setActiveSheet] = useState<SheetId | null>(null)
  const [privacySheetValid, setPrivacySheetValid] = useState(false)
  const [sheetValid, setSheetValid] = useState(false)
  // Items that have "settled" (been complete long enough to move to the bottom)
  const [settledIds, setSettledIds] = useState<Set<string>>(new Set())
  // Toast
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false })

  // When a new task completes: show toast, then after 1.5s move it to the bottom
  useEffect(() => {
    completedTasks.forEach((id) => {
      if (!settledIds.has(id)) {
        const timer = setTimeout(() => {
          setSettledIds((prev) => new Set([...prev, id]))
        }, 2000)
        return () => clearTimeout(timer)
      }
    })
  }, [completedTasks]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!toast.visible) return
    const t = setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000)
    return () => clearTimeout(t)
  }, [toast.visible])

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true })
  }, [])

  const totalItems = NEEDS_ATTENTION.filter((i) => i.severity !== "waiting").length
  const doneCount = NEEDS_ATTENTION.filter((i) => completedTasks.has(i.id)).length

  // Sort: pending items first (original order), settled-complete items at bottom
  const sortedItems = [...NEEDS_ATTENTION].sort((a, b) => {
    const aSettled = settledIds.has(a.id) ? 1 : 0
    const bSettled = settledIds.has(b.id) ? 1 : 0
    return aSettled - bSettled
  })

  function handleSave() {
    if (!activeSheet) return
    const item = NEEDS_ATTENTION.find((i) => i.to === activeSheet)
    if (item) {
      onComplete(item.id)
      showToast(`Success! Action item updated and moved to the bottom. Items refresh daily.`)
    }
    setActiveSheet(null)
    setPrivacySheetValid(false)
    setSheetValid(false)
  }

  return (
    <>
      <div className="p-6 md:p-8 space-y-6 relative">
        <div className="max-w-5xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome, Sunset Property Group!</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track setup progress, confirm required settings, and activate ELI+ across your portfolio.
          </p>
        </div>

        {/* Product progress cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl">
          <ProductCard label="Leasing AI"     icon={Users}      done={9}  total={52} />
          <ProductCard label="Payments AI"    icon={CreditCard} done={24} total={52} />
          <ProductCard label="Maintenance AI" icon={Wrench}     done={0}  total={52} />
          <ProductCard label="Renewals AI"    icon={RefreshCw}  done={0}  total={52} />
        </div>

        {/* Action items */}
        <div className="space-y-3 max-w-4xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Action Items</h2>
            <span className="text-xs text-muted-foreground tabular-nums">{doneCount} / {totalItems} complete</span>
          </div>

          <div className="h-1 w-full rounded-full bg-zinc-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-700 transition-all duration-500"
              style={{ width: totalItems > 0 ? `${(doneCount / totalItems) * 100}%` : "0%" }}
            />
          </div>

          <ul className="space-y-3">
            {sortedItems.map((item) => {
              const done = completedTasks.has(item.id)
              return (
                <li
                  key={item.id}
                  className={cn(
                    "group rounded-xl border bg-card transition-all duration-300",
                    done
                      ? "border-border opacity-70"
                      : "border-border hover:border-zinc-400 hover:shadow-md hover:-translate-y-px cursor-pointer",
                  )}
                  onClick={() => !done && item.severity !== "waiting" && setActiveSheet(item.to as SheetId)}
                >
                  <div className="p-6 flex flex-col gap-3">

                    <div className="flex items-start gap-2 flex-wrap">
                      <p className={cn("text-sm font-semibold leading-snug", done ? "text-muted-foreground line-through decoration-muted-foreground/40" : "text-foreground")}>
                        {item.title}
                      </p>
                      {done ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 mt-0.5 border border-emerald-600/40 bg-emerald-50 text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" aria-hidden />
                          Complete
                        </span>
                      ) : (
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 mt-0.5 text-foreground", SEV_PILL[item.severity])}>
                          {item.severity === "attention" && <AlertTriangle className="h-3 w-3" aria-hidden />}
                          {SEV_LABEL[item.severity]}
                        </span>
                      )}
                    </div>

                    {/* Body — always visible */}
                    <p className={cn("text-sm leading-relaxed max-w-prose", done ? "text-zinc-400" : "text-zinc-600")}>
                      {item.why}
                    </p>

                    <div className="flex items-center justify-between gap-4 pt-1">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.progress && (
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="h-1.5 w-20 rounded-full bg-zinc-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-700 transition-all duration-700"
                                style={{ width: done ? "100%" : (item.progress.total > 0 ? `${(item.progress.done / item.progress.total) * 100}%` : "0%") }}
                              />
                            </div>
                            <span className="text-xs font-medium text-zinc-500 tabular-nums whitespace-nowrap">
                              {done
                                ? `${item.progress.total}/${item.progress.total} ${item.progress.unit}`
                                : `${item.progress.done}/${item.progress.total} ${item.progress.unit}`}
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-zinc-500 truncate">
                          <BoldNumbers text={item.summary} />
                        </p>
                      </div>

                      {!done && item.severity !== "waiting" && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setActiveSheet(item.to as SheetId) }}
                          className={cn(buttonVariants({ variant: "eli", size: "sm" }), "whitespace-nowrap shrink-0 shadow-sm group-hover:shadow transition-shadow")}
                        >
                          Start
                          <ArrowRight className="h-3.5 w-3.5 ml-1" aria-hidden />
                        </button>
                      )}
                    </div>

                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Toast — centered within the workflow content area */}
        <Toast message={toast.message} visible={toast.visible} />
      </div>

      {/* Task sheets */}
      <TaskSheet
        open={activeSheet === "privacy"}
        title={SHEET_TITLE["privacy"] ?? ""}
        description={SHEET_DESCRIPTION["privacy"]}
        onClose={() => { setActiveSheet(null); setPrivacySheetValid(false) }}
        onSave={handleSave}
        saveLabel="Publish to 8 Websites"
        saveDisabled={!privacySheetValid}
      >
        <PrivacySheetContent onValidChange={setPrivacySheetValid} />
      </TaskSheet>

      <TaskSheet
        open={activeSheet === "payments"}
        title={SHEET_TITLE["payments"] ?? ""}
        onClose={() => setActiveSheet(null)}
        onSave={handleSave}
        saveLabel="Confirm All Settings"
      >
        <PaymentsSheetContent navigate={navigate} onSheetClose={() => setActiveSheet(null)} />
      </TaskSheet>

      {(["rent-charge-date", "rent-due-date", "payment-block-date", "grace-period", "outstanding-balance"] as const).map((id) => (
        <TaskSheet
          key={id}
          open={activeSheet === id}
          title={SHEET_TITLE[id] ?? ""}
          description={SHEET_DESCRIPTION[id]}
          onClose={() => { setActiveSheet(null); setSheetValid(false) }}
          onSave={handleSave}
          saveLabel="Save Settings"
          saveDisabled={!sheetValid}
        >
          <DateSettingSheetContent
            label={SHEET_TITLE[id] ?? id}
            onValidChange={setSheetValid}
          />
        </TaskSheet>
      ))}

      <TaskSheet
        open={activeSheet === "payment-plans"}
        title={SHEET_TITLE["payment-plans"] ?? ""}
        description={SHEET_DESCRIPTION["payment-plans"]}
        onClose={() => { setActiveSheet(null); setSheetValid(false) }}
        onSave={handleSave}
        saveLabel="Save Payment Plan Settings"
        saveDisabled={!sheetValid}
      >
        <PaymentPlansSheetContent onValidChange={setSheetValid} />
      </TaskSheet>

      <TaskSheet
        open={activeSheet === "payment-link"}
        title={SHEET_TITLE["payment-link"] ?? ""}
        description={SHEET_DESCRIPTION["payment-link"]}
        onClose={() => { setActiveSheet(null); setSheetValid(false) }}
        onSave={handleSave}
        saveLabel="Save Payment Links"
        saveDisabled={!sheetValid}
      >
        <PaymentLinkSheetContent onValidChange={setSheetValid} />
      </TaskSheet>

      <TaskSheet
        open={activeSheet === "late-fee-policy"}
        title={SHEET_TITLE["late-fee-policy"] ?? ""}
        description={SHEET_DESCRIPTION["late-fee-policy"]}
        onClose={() => { setActiveSheet(null); setSheetValid(false) }}
        onSave={handleSave}
        saveLabel="Save Late Fee Policy"
        saveDisabled={!sheetValid}
      >
        <PolicySheetContent policyType="Late Fee" onValidChange={setSheetValid} />
      </TaskSheet>

      <TaskSheet
        open={activeSheet === "payment-plan-policy"}
        title={SHEET_TITLE["payment-plan-policy"] ?? ""}
        description={SHEET_DESCRIPTION["payment-plan-policy"]}
        onClose={() => { setActiveSheet(null); setSheetValid(false) }}
        onSave={handleSave}
        saveLabel="Save Payment Plan Policy"
        saveDisabled={!sheetValid}
      >
        <PolicySheetContent policyType="Payment Plan" onValidChange={setSheetValid} />
      </TaskSheet>

      <TaskSheet
        open={activeSheet === "payment-options"}
        title={SHEET_TITLE["payment-options"] ?? ""}
        description={SHEET_DESCRIPTION["payment-options"]}
        onClose={() => { setActiveSheet(null); setSheetValid(false) }}
        onSave={handleSave}
        saveLabel="Save Payment Options"
        saveDisabled={!sheetValid}
      >
        <PaymentOptionsSheetContent onValidChange={setSheetValid} />
      </TaskSheet>

    </>
  )
}
