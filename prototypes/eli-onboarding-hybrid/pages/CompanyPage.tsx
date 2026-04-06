import { useState } from "react"
import type { PageId } from "../index"
import { buttonVariants } from "@sandbox-components/ui/button"
import { cn } from "@sandbox-lib/utils"
import { ArrowLeft, Lock } from "lucide-react"

interface Props { navigate: (to: PageId) => void }

const PREFILLED_EIN = "98-7654321"
const maskedEin = `••-•••${PREFILLED_EIN.slice(-4)}`

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-foreground mb-1.5">
      <span className="text-red-500 mr-1">*</span>{children}
    </label>
  )
}

function Field({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-0", className)}>{children}</div>
}

function TextInput({ id, defaultValue, placeholder, className }: { id?: string; defaultValue?: string; placeholder?: string; className?: string }) {
  return (
    <input
      id={id}
      type="text"
      defaultValue={defaultValue}
      placeholder={placeholder}
      className={cn(
        "w-full h-11 rounded-lg border border-border bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-zinc-900/20",
        className,
      )}
    />
  )
}

export function CompanyPage({ navigate }: Props) {
  const [einRevealed, setEinRevealed] = useState(false)

  return (
    <div className="p-6 md:p-8 max-w-2xl space-y-8">
      <button
        type="button"
        onClick={() => navigate("overview")}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 -ml-2 text-muted-foreground")}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Overview
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">10DLC Compliance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Confirm your business details for carrier registration. Required before SMS and voice campaigns can go live.
        </p>
      </div>

      {/* ── Company Information ────────────────────────────────────────────── */}
      <div className="space-y-5">
        <Field>
          <RequiredLabel>Legal Business Name</RequiredLabel>
          <TextInput id="legal" defaultValue="Sunset Properties LLC" />
        </Field>

        <Field>
          <RequiredLabel>EIN (Federal Tax ID)</RequiredLabel>
          <div className="relative">
            <input
              id="ein"
              type="text"
              readOnly
              value={einRevealed ? PREFILLED_EIN : maskedEin}
              className="w-full h-11 rounded-lg border border-border bg-zinc-50 px-3 pr-10 text-sm text-muted-foreground cursor-default focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setEinRevealed((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              aria-label={einRevealed ? "Hide EIN" : "Reveal EIN"}
            >
              <Lock className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" aria-hidden />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">Pulled from your Entrata account. Contact support to update.</p>
        </Field>

        <Field>
          <RequiredLabel>Business Address</RequiredLabel>
          <TextInput id="address-street" defaultValue="123 Main Street, Suite 200" className="mb-2" />
          <div className="grid grid-cols-3 gap-2">
            <TextInput id="address-city" defaultValue="Austin" placeholder="City" />
            <TextInput id="address-state" defaultValue="TX" placeholder="State" />
            <TextInput id="address-zip" defaultValue="78701" placeholder="ZIP" />
          </div>
        </Field>

        <Field>
          <RequiredLabel>Company Phone Number</RequiredLabel>
          <TextInput id="company-phone" defaultValue="(512) 555-0123" />
        </Field>

        <Field>
          <RequiredLabel>Website URL</RequiredLabel>
          <TextInput id="website" defaultValue="https://www.sunsetproperties.com" />
        </Field>
      </div>

      {/* ── Authorized Representative ──────────────────────────────────────── */}
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Authorized Representative</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Contact person authorized to manage this account</p>
        </div>

        <Field>
          <RequiredLabel>Full Name</RequiredLabel>
          <TextInput id="rep-name" defaultValue="Sarah Johnson" />
        </Field>

        <Field>
          <RequiredLabel>Email Address</RequiredLabel>
          <TextInput id="rep-email" defaultValue="sarah.johnson@sunsetproperties.com" />
        </Field>

        <Field>
          <RequiredLabel>Phone Number</RequiredLabel>
          <TextInput id="rep-phone" defaultValue="(512) 555-0124" />
        </Field>
      </div>

      <div className="pt-2">
        <button
          type="button"
          className="h-10 rounded-lg bg-zinc-900 px-6 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
        >
          Save & continue
        </button>
      </div>
    </div>
  )
}
