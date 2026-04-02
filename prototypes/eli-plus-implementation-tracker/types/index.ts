export type ViewRole = "client" | "internal"
export type ClientSegment = "new" | "backfill"
export type ItemLevel = "company" | "property"
export type ItemVisibility = "client" | "internal" | "both"

export type ItemStatus =
  | "complete"
  | "needs_input"
  | "in_progress"
  | "blocked"
  | "not_started"
  | "auto_confirmed"

export type ItemCategory =
  | "company_info"
  | "property_details"
  | "eli_settings"
  | "backend_plumbing"
  | "twilio_registration"
  | "activation"

export type InputType = "text" | "url" | "phone" | "ein" | "select" | "confirm" | "none"

export interface ChecklistItem {
  id: string
  label: string
  description: string
  category: ItemCategory
  level: ItemLevel
  visibility: ItemVisibility
  status: ItemStatus
  product?: EliProduct | "all"
  sourceIfBackfill?: string
  clientAction?: string
  internalOwner?: string
  blockedReason?: string
  inputType?: InputType
  inputPlaceholder?: string
  inputValue?: string
  helpUrl?: string
  helpLabel?: string
  isSafetyGate?: boolean
}

export type EliProduct = "leasing" | "payments" | "renewals" | "maintenance"

export type ChannelStatus = "ready" | "pending" | "not_started" | "blocked"

export interface PropertyReadinessEntry {
  id: string
  name: string
  address: string
  units: number
  smsStatus: ChannelStatus
  voiceStatus: ChannelStatus
  emailStatus: ChannelStatus
  chatStatus: ChannelStatus
  emergencyContact: boolean
  emergencyPhone?: string
  settingsComplete: boolean
  shellCreated: boolean
  twilioStatus: TwilioPropertyStatus
  ivrStatus: ChannelStatus
  overallReady: boolean
  blockers: string[]
  contractedProducts: EliProduct[]
  leasingReady: boolean
  paymentsReady: boolean
  renewalsReady: boolean
  maintenanceReady: boolean
}

export type TwilioPropertyStatus =
  | "campaign_approved"
  | "campaign_pending"
  | "campaign_submitted"
  | "brand_pending"
  | "not_started"

export type ActivationStatus =
  | "not_ready"
  | "staged"
  | "trial_active"
  | "trial_expired"
  | "live"
  | "partially_live"

export interface CompanyImplementation {
  companyId: string
  companyName: string
  segment: ClientSegment
  contractedProducts: EliProduct[]
  companyItems: ChecklistItem[]
  properties: PropertyReadinessEntry[]
  overallProgress: number
  clientItemsRemaining: number
  propertiesReady: number
  propertiesTotal: number
  activationStatus: ActivationStatus
  trialEndsAt?: string
  activatedAt?: string
}

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  company_info: "Company Information",
  property_details: "Property Details",
  eli_settings: "ELI+ Product Settings",
  backend_plumbing: "Backend Plumbing",
  twilio_registration: "Communications Setup",
  activation: "Activation & Go-Live",
}

export const CATEGORY_DESCRIPTIONS: Record<ItemCategory, string> = {
  company_info: "One-time company details needed for carrier registration",
  property_details: "Per-property configuration items",
  eli_settings: "Review and confirm how each AI product should behave",
  backend_plumbing: "Internal infrastructure (Entrata team manages these)",
  twilio_registration: "SMS and voice carrier registration status",
  activation: "Final readiness check and go-live",
}

export const CATEGORY_ORDER: ItemCategory[] = [
  "company_info",
  "twilio_registration",
  "property_details",
  "eli_settings",
  "backend_plumbing",
  "activation",
]

export const PRODUCT_LABELS: Record<EliProduct, string> = {
  leasing: "Leasing AI",
  payments: "Payments AI",
  renewals: "Renewals AI",
  maintenance: "Maintenance AI",
}

export const PRODUCT_ICONS: Record<EliProduct, string> = {
  leasing: "Target",
  payments: "DollarSign",
  renewals: "RefreshCw",
  maintenance: "Wrench",
}

export const STATUS_LABELS: Record<ItemStatus, string> = {
  complete: "Complete",
  needs_input: "Needs Your Input",
  in_progress: "In Progress",
  blocked: "Blocked",
  not_started: "Not Started",
  auto_confirmed: "Confirmed from Settings",
}

export const CHANNEL_LABELS: Record<string, string> = {
  chatStatus: "Chat",
  emailStatus: "Email",
  smsStatus: "SMS",
  voiceStatus: "Voice",
}
