/** Prototype-only sample data — illustrates IA, not production contracts. */

export type BlockerSeverity = "critical" | "attention" | "waiting"

export interface NeedAttentionItem {
  id: string
  title: string
  why: string
  /** Human-friendly: confirmation types / properties, not raw setting counts */
  summary: string
  severity: BlockerSeverity
  to: string
  progress?: { done: number; total: number; unit: string }
}

export const NEEDS_ATTENTION: NeedAttentionItem[] = [
  {
    id: "privacy",
    title: "Update Privacy Policy Coverage",
    why: "Properties missing SMS consent language can't send campaigns — and expose your company to carrier fines. Apply the approved template before go-live.",
    summary: "8 properties need update",
    severity: "attention",
    to: "privacy",
    progress: { done: 40, total: 52, unit: "properties" },
  },
  {
    id: "rent-charge-date",
    title: "Set Rent Charge Date",
    why: "The day rent is posted to resident ledgers each month. Mismatches between charge and due dates cause late fee disputes and resident confusion.",
    summary: "8 properties need a value",
    severity: "attention",
    to: "rent-charge-date",
    progress: { done: 44, total: 52, unit: "properties" },
  },
  {
    id: "rent-due-date",
    title: "Set Rent Due Date",
    why: "Determines when rent is officially overdue. Must align with your lease agreements to avoid improper late fee application.",
    summary: "8 properties need a value",
    severity: "attention",
    to: "rent-due-date",
    progress: { done: 44, total: 52, unit: "properties" },
  },
  {
    id: "payment-plans",
    title: "Configure Payment Plans",
    why: "Confirm which communities allow residents to split outstanding balances into installments. Unset communities default to no payment plans at activation.",
    summary: "8 communities need confirmation",
    severity: "attention",
    to: "payment-plans",
    progress: { done: 44, total: 52, unit: "properties" },
  },
  {
    id: "payment-block-date",
    title: "Set Payment Block Date",
    why: "Online payments are blocked after this day each month for month-end accounting close. Incorrect values can block resident payments prematurely.",
    summary: "8 properties need a value",
    severity: "attention",
    to: "payment-block-date",
    progress: { done: 44, total: 52, unit: "properties" },
  },
  {
    id: "payment-link",
    title: "Add Payment Portal Links",
    why: "ELI uses these links in outbound messages to direct residents to your payment portal. Missing links will prevent payment nudges from sending.",
    summary: "8 properties missing a link",
    severity: "attention",
    to: "payment-link",
    progress: { done: 44, total: 52, unit: "properties" },
  },
  {
    id: "grace-period",
    title: "Set Grace Period Date",
    why: "Number of days after the due date before late fees apply. Incorrect values may trigger fees earlier than your lease terms allow.",
    summary: "8 properties need a value",
    severity: "attention",
    to: "grace-period",
    progress: { done: 44, total: 52, unit: "properties" },
  },
  {
    id: "outstanding-balance",
    title: "Set Outstanding Balance Threshold",
    why: "Minimum balance required before ELI sends a collection nudge. Setting this too low triggers excessive messages and resident complaints.",
    summary: "8 properties need a value",
    severity: "attention",
    to: "outstanding-balance",
    progress: { done: 44, total: 52, unit: "properties" },
  },
  {
    id: "late-fee-policy",
    title: "Set Late Fee Policy",
    why: "Residents receive automated late fee notices from ELI. Your policy language must be accurate and match your lease agreements before go-live.",
    summary: "Policy text required for all 52 properties",
    severity: "attention",
    to: "late-fee-policy",
    progress: { done: 0, total: 52, unit: "properties" },
  },
  {
    id: "payment-plan-policy",
    title: "Set Payment Plan Policy",
    why: "When a resident asks about payment plans, ELI shares your official policy. Missing policy text will block these conversations from completing.",
    summary: "Policy text required for all 52 properties",
    severity: "attention",
    to: "payment-plan-policy",
    progress: { done: 0, total: 52, unit: "properties" },
  },
  {
    id: "payment-options",
    title: "Configure Payment Options & Availability",
    why: "Define which payment methods residents can use and when each becomes available each month. ELI uses this to guide residents to the right payment channel.",
    summary: "8 properties need configuration",
    severity: "attention",
    to: "payment-options",
    progress: { done: 44, total: 52, unit: "properties" },
  },
]

export interface PropertySettingRow {
  id: string
  propertyName: string
  city: string
  setting: string
  status: "verified" | "needs_input" | "applied"
  value: string
  source: string
}

const PROPERTIES = [
  "Sunset Ridge", "Harbor View", "Maple Commons", "The Edison", "Parkside Lofts",
  "River North Plaza", "Cedar Glen", "Oakwood Terrace", "Lakeside Villas", "Metro 1200",
  "Summit Pointe", "Willow Creek", "Aspen Heights", "Stonegate", "The Reserve",
]

const SETTINGS = [
  "Rent charge date",
  "Rent due date",
  "Payment block day",
  "Grace period",
  "Late fee policy summary",
]

export function buildSettingRows(): PropertySettingRow[] {
  const rows: PropertySettingRow[] = []
  let n = 0
  for (const prop of PROPERTIES) {
    for (const setting of SETTINGS) {
      const needs = n % 7 === 0 || n % 11 === 0
      rows.push({
        id: `r-${n}`,
        propertyName: prop,
        city: ["Austin", "Denver", "Phoenix", "Dallas", "Houston"][n % 5],
        setting,
        status: needs ? "needs_input" : n % 5 === 0 ? "verified" : "applied",
        value: needs ? "—" : setting.includes("date") || setting.includes("day") ? `${(n % 28) + 1}${["st", "nd", "rd", "th"][Math.min(3, (n % 28) % 10)]}` : "From Entrata default",
        source: needs ? "—" : "Financial > Charges / Delinquency",
      })
      n += 1
    }
  }
  return rows
}
