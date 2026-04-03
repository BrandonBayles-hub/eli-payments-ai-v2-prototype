import type {
  ChecklistItem,
  PropertyReadinessEntry,
  CompanyImplementation,
  EliProduct,
  ChannelStatus,
  TwilioPropertyStatus,
  ActivationStatus,
} from "../types"

// ─── Checklist Item Definitions ──────────────────────────────────────────────
// This is the single source of truth for all items in the tracker.
// To add/remove/reorder items, edit this array. No component changes needed.

export const checklistItems: ChecklistItem[] = [
  // ── Company Information ────────────────────────────────────────────────────
  {
    id: "ein",
    label: "Employer Identification Number (EIN)",
    description: "Required for carrier registration so ELI+ can send SMS and make calls on your behalf.",
    category: "company_info",
    level: "company",
    visibility: "both",
    status: "needs_input",
    product: "all",
    sourceIfBackfill: "Existing Twilio profile",
    clientAction: "Provide your 9-digit EIN",
    inputType: "ein",
    inputPlaceholder: "XX-XXXXXXX",
    inputValue: "",
  },
  {
    id: "auth_rep",
    label: "Authorized Representative",
    description: "A person at your company authorized to approve communications sent on your behalf. Required for carrier registration.",
    category: "company_info",
    level: "company",
    visibility: "both",
    status: "needs_input",
    product: "all",
    sourceIfBackfill: "Existing Twilio profile",
    clientAction: "Provide name, email, phone, and title",
    inputType: "text",
    inputPlaceholder: "Full name, email, phone, title",
    inputValue: "",
  },
  {
    id: "privacy_policy",
    label: "Privacy Policy URL",
    description: "Your website must have a published privacy policy. This is required by carriers before SMS messaging can be approved.",
    category: "company_info",
    level: "company",
    visibility: "both",
    status: "needs_input",
    product: "all",
    sourceIfBackfill: "Marketing tab in Entrata",
    clientAction: "Confirm the URL to your website's privacy policy page",
    inputType: "url",
    inputPlaceholder: "https://yoursite.com/privacy",
    helpUrl: "https://support.entrata.com/hc/en-us/articles/privacy-policy-requirements",
    helpLabel: "Privacy policy requirements",
    inputValue: "",
  },
  {
    id: "business_address",
    label: "Business Address",
    description: "Your company's registered business address for carrier registration.",
    category: "company_info",
    level: "company",
    visibility: "both",
    status: "complete",
    product: "all",
    sourceIfBackfill: "Entrata company settings",
    clientAction: "Confirm or update",
  },
  {
    id: "website_url",
    label: "Company Website URL",
    description: "The primary website for your company, used during carrier registration.",
    category: "company_info",
    level: "company",
    visibility: "both",
    status: "complete",
    product: "all",
    sourceIfBackfill: "Marketing tab in Entrata",
    clientAction: "Confirm or update",
  },

  // ── Communications Registration (Twilio) ───────────────────────────────────
  {
    id: "twilio_profile",
    label: "Communications Profile Created",
    description: "Your company profile has been submitted for carrier approval.",
    category: "twilio_registration",
    level: "company",
    visibility: "both",
    status: "in_progress",
    product: "all",
    internalOwner: "Patrick Muir",
  },
  {
    id: "twilio_brand",
    label: "Brand Registration Approved",
    description: "Carrier has approved your brand identity. This typically takes 1–3 business days.",
    category: "twilio_registration",
    level: "company",
    visibility: "both",
    status: "in_progress",
    product: "all",
    internalOwner: "Patrick Muir",
  },
  {
    id: "twilio_campaigns",
    label: "Messaging Campaigns Approved",
    description: "Per-property messaging campaigns have been submitted and are awaiting carrier approval (10–15 business days).",
    category: "twilio_registration",
    level: "property",
    visibility: "both",
    status: "in_progress",
    product: "all",
    internalOwner: "Patrick Muir",
  },
  {
    id: "phone_numbers",
    label: "Phone Numbers Provisioned",
    description: "Dedicated phone numbers have been purchased and assigned to each property.",
    category: "twilio_registration",
    level: "property",
    visibility: "internal",
    status: "not_started",
    product: "all",
    internalOwner: "Patrick Muir",
  },
  {
    id: "third_party_website",
    label: "Third-Party Website Agreement",
    description: "If your website is not hosted by Entrata, a legal agreement and TCPA-compliant form language are required for SMS opt-in.",
    category: "twilio_registration",
    level: "company",
    visibility: "both",
    status: "needs_input",
    product: "leasing",
    clientAction: "Coordinate with your website vendor to sign the API agreement and add consent language",
    blockedReason: "SMS cannot be enabled through third-party websites until the agreement is signed",
    inputType: "confirm",
    inputValue: "",
  },

  // ── Property Details ───────────────────────────────────────────────────────
  {
    id: "emergency_contacts",
    label: "Emergency Contact Numbers",
    description: "After-hours emergency phone numbers for each property. Required for Maintenance AI — properties without emergency numbers cannot go live.",
    category: "property_details",
    level: "property",
    visibility: "both",
    status: "needs_input",
    product: "maintenance",
    sourceIfBackfill: "Entrata property settings",
    clientAction: "Provide or confirm emergency contact numbers for each property",
    inputType: "phone",
    inputPlaceholder: "(555) 123-4567",
    isSafetyGate: true,
    helpUrl: "https://support.entrata.com/hc/en-us/articles/emergency-contact-requirements",
    helpLabel: "Emergency contact requirements",
    inputValue: "",
  },
  {
    id: "ivr_preferences",
    label: "IVR Call Routing Preferences",
    description: "Review the standard call routing template. Customize only if your properties need non-standard phone tree options.",
    category: "property_details",
    level: "property",
    visibility: "both",
    status: "complete",
    product: "leasing",
    sourceIfBackfill: "Standard IVR template auto-applied",
    clientAction: "Review standard template; customize if needed",
    helpUrl: "https://support.entrata.com/hc/en-us/articles/ivr-setup-guide",
    helpLabel: "IVR setup guide",
  },
  {
    id: "prospect_portal",
    label: "Property Website Selection",
    description: "Confirm which website URL each property should use for leasing inquiries.",
    category: "property_details",
    level: "property",
    visibility: "both",
    status: "auto_confirmed",
    product: "leasing",
    sourceIfBackfill: "Marketing tab in Entrata",
    clientAction: "Confirm or update per property",
  },
  {
    id: "facilities_pro_check",
    label: "Facilities Pro Conflict Check",
    description: "Internal verification that Maintenance AI routing does not conflict with Facilities Pro work order assignment rules.",
    category: "property_details",
    level: "property",
    visibility: "internal",
    status: "in_progress",
    product: "maintenance",
    internalOwner: "Facilities integrations",
  },

  // ── ELI+ Settings ─────────────────────────────────────────────────────────
  {
    id: "payments_grace_period",
    label: "Grace Period & Late Fee Preferences",
    description: "Review the grace period and late fee settings that ELI+ will use when communicating with residents about payments.",
    category: "eli_settings",
    level: "property",
    visibility: "both",
    status: "auto_confirmed",
    product: "payments",
    sourceIfBackfill: "Entrata financial settings",
    clientAction: "Review defaults; override if your policy differs",
  },
  {
    id: "payments_block_day",
    label: "Payment Block Day",
    description: "The day of the month after which online payments are blocked. ELI+ uses this to stop sending payment reminders.",
    category: "eli_settings",
    level: "property",
    visibility: "both",
    status: "needs_input",
    product: "payments",
    sourceIfBackfill: "Derived from Entrata payment settings (complex)",
    clientAction: "Confirm the correct block day for each property",
    inputType: "select",
    inputPlaceholder: "Day of month",
    inputValue: "",
  },
  {
    id: "payments_activation_window",
    label: "Payments AI Activation Window",
    description: "Payments AI may only be activated between the 2nd and 8th of each month so billing cycles stay aligned with your accounting close.",
    category: "eli_settings",
    level: "company",
    visibility: "both",
    status: "auto_confirmed",
    product: "payments",
    sourceIfBackfill: "Billing calendar policy acknowledged",
    clientAction: "Plan go-live within the monthly activation window",
  },
  {
    id: "leasing_lead_assignment",
    label: "Lead Assignment Preferences",
    description: "How new leasing leads should be assigned when ELI+ schedules a tour.",
    category: "eli_settings",
    level: "property",
    visibility: "both",
    status: "auto_confirmed",
    product: "leasing",
    sourceIfBackfill: "Leasing settings in Entrata",
    clientAction: "Review default assignment rules",
  },
  {
    id: "email_override",
    label: "Custom Email Domain",
    description: "Optional branded sending domain for ELI+ email. If not set, messages send from the default Entrata-hosted domain.",
    category: "eli_settings",
    level: "company",
    visibility: "both",
    status: "auto_confirmed",
    product: "leasing",
    sourceIfBackfill: "Default Entrata domain in use",
    clientAction: "Provide DNS details only if you want a custom domain",
  },
  {
    id: "maintenance_afterhours",
    label: "After-Hours Routing & On-Call",
    description: "Configure how Maintenance AI handles requests outside business hours, including on-call vendor dispatch.",
    category: "eli_settings",
    level: "property",
    visibility: "both",
    status: "needs_input",
    product: "maintenance",
    clientAction: "Confirm after-hours routing for each property",
    inputType: "phone",
    inputPlaceholder: "(555) 123-4567",
    inputValue: "",
  },
  {
    id: "renewals_comm_prefs",
    label: "Renewal Communication Preferences",
    description: "Defaults are applied for renewal outreach timing and messaging. Review if you want to customize.",
    category: "eli_settings",
    level: "property",
    visibility: "both",
    status: "auto_confirmed",
    product: "renewals",
    sourceIfBackfill: "Defaults applied",
    clientAction: "Review defaults",
  },
  {
    id: "communication_channels",
    label: "Preferred Communication Channels",
    description: "Choose which channels (SMS, email, voice, chat) ELI+ should use for each product.",
    category: "eli_settings",
    level: "company",
    visibility: "both",
    status: "auto_confirmed",
    product: "all",
    sourceIfBackfill: "All channels enabled by default",
    clientAction: "Disable any channels you do not want ELI+ to use",
  },

  // ── Backend Plumbing (Internal Only) ───────────────────────────────────────
  {
    id: "shell_creation",
    label: "Colleen Admin Shells Created",
    description: "Organization and property shells created in the backend admin system.",
    category: "backend_plumbing",
    level: "company",
    visibility: "internal",
    status: "complete",
    product: "all",
    internalOwner: "Cal / Doron / Dana",
  },
  {
    id: "api_credentials",
    label: "API Credentials Configured",
    description: "Property API credentials configured in backend admin from Entrata API Access tab.",
    category: "backend_plumbing",
    level: "property",
    visibility: "internal",
    status: "complete",
    product: "all",
    internalOwner: "Cal / Doron / Dana",
  },
  {
    id: "product_defaults",
    label: "Product Defaults Applied",
    description: "GPT triggers, communication toggles, and bot settings applied for all contracted products.",
    category: "backend_plumbing",
    level: "property",
    visibility: "internal",
    status: "in_progress",
    product: "all",
    internalOwner: "Don / Colleen team",
  },
  {
    id: "email_provisioned",
    label: "Email Inboxes Provisioned",
    description: "Entrata-hosted email inboxes created and associated to properties via Nexus.",
    category: "backend_plumbing",
    level: "property",
    visibility: "internal",
    status: "complete",
    product: "all",
    internalOwner: "Patrick Muir / Abe",
  },
  {
    id: "ivr_configured",
    label: "IVR Templates Cloned & Configured",
    description: "Standard IVR template cloned per property with vanity numbers assigned.",
    category: "backend_plumbing",
    level: "property",
    visibility: "internal",
    status: "in_progress",
    product: "leasing",
    internalOwner: "Austin Lawyer",
  },
  {
    id: "settings_synced",
    label: "Settings Synced to Backend",
    description: "All 44 ELI+ settings synced from Entrata to the backend config store.",
    category: "backend_plumbing",
    level: "property",
    visibility: "internal",
    status: "in_progress",
    product: "all",
    internalOwner: "Brandon Bayles",
  },
  {
    id: "oxp_restriction_removed",
    label: "OXP Contract Restriction Removed",
    description: "All properties visible in OXP regardless of contract status.",
    category: "backend_plumbing",
    level: "company",
    visibility: "internal",
    status: "complete",
    product: "all",
    internalOwner: "Mark Freeman",
  },

  // ── Activation & Go-Live ───────────────────────────────────────────────────
  {
    id: "staging_readiness",
    label: "Staging Readiness Check",
    description: "All prerequisites verified. The staging readiness service confirms this client is ready to go live.",
    category: "activation",
    level: "company",
    visibility: "internal",
    status: "not_started",
    product: "all",
    internalOwner: "OXP Engineering",
  },
  {
    id: "go_live_toggle",
    label: "Ready to Activate",
    description: "All requirements met. ELI+ can be activated for your properties.",
    category: "activation",
    level: "company",
    visibility: "both",
    status: "not_started",
    product: "all",
    clientAction: "Activate when ready",
  },
]

// ─── Property Generation ─────────────────────────────────────────────────────

const PROPERTY_NAMES = [
  "Sunset Apartments", "Oak Ridge Townhomes", "Harbor View Complex", "Maple Creek Residences",
  "Pine Valley Estates", "Brookstone Landing", "Willowbrook Village", "Cypress Point Apartments",
  "Silverado Heights", "Riverwalk Terrace", "Summit Ridge Apartments", "Lakeside Commons",
  "Aspen Grove Village", "Birchwood Place", "Cedar Springs Apartments", "Desert Rose Villas",
  "Elm Street Residences", "Foxglove Meadows", "Granite Peak Apartments", "Hawthorn Court",
  "Ironwood Station", "Juniper Hills", "Kensington Park", "Laurel Heights",
  "Magnolia Gardens", "Northgate Crossing", "Orchard Park Apartments", "Palmetto Way",
  "Quail Run Estates", "Redwood Terrace", "Sage Creek Village", "Timber Ridge Apartments",
  "University Place", "Valencia Gardens", "Westgate Manor", "Yellowstone Lodge",
  "Azure Bay Apartments", "Beacon Hill Residences", "Coral Springs", "Driftwood Cove",
  "Eagle Point Apartments", "Fieldstone Village", "Golden Oaks", "Highland Park Residences",
  "Ivory Tower Apartments", "Jade Creek Village", "Kingston Arms", "Liberty Square",
  "Meadowland Apartments", "Nightingale Court", "Olympic View Residences", "Parkside Terrace",
  "Queensbury Place", "Rosewood Commons", "Stonebridge Crossing", "Trailside Village",
  "Upper Falls Apartments", "Vista Del Sol", "Windermere Place", "Excalibur Heights",
  "York Square", "Zenith Apartments", "Ashford Crossing", "Belmont Station",
  "Canterbury Place", "Dunmore Ridge", "Edgewater Village", "Falcon Crest",
  "Georgetown Landing", "Harmony Place", "Independence Square", "Jefferson Park",
  "Knollwood Terrace", "Lincoln Heights", "Morrison Creek", "Newport Village",
  "Oxford Commons", "Princeton Estates", "Regency Park", "Sheffield Place",
  "Thornton Meadows", "Union Station Lofts", "Vernon Hills Apartments", "Wellington Court",
  "Xavier Gardens", "Yale Square", "Zephyr Ridge", "Abingdon Place",
  "Bradford Manor", "Chatsworth Residences", "Devon Park", "Eastwick Village",
  "Florence Court", "Greenwich Apartments", "Hamilton Place", "Irving Park Residences",
  "Jamestown Village", "Kingsland Apartments", "Lancaster Ridge", "Marlborough Place",
  "Norwich Gardens", "Oakmont Terrace", "Pembroke Estates", "Richmond Court",
  "Stratford Village", "Tiverton Square", "Uplands Apartments", "Wakefield Place",
  "Aldridge Commons", "Buckingham Landing", "Clarendon Heights", "Dorchester Village",
  "Evergreen Terrace", "Fairview Place",
]

const STREETS = [
  "Main St", "Oak Ave", "Elm Blvd", "Park Dr", "Lake Rd", "Pine Way", "Cedar Ln",
  "Maple Ct", "River Rd", "Hill St", "Valley Dr", "Spring Ave", "Forest Blvd",
  "Meadow Ln", "Summit Rd", "Creek Dr", "Garden Way", "Sunrise Blvd",
]

const CITIES = [
  "Austin, TX", "Denver, CO", "Phoenix, AZ", "Salt Lake City, UT", "Nashville, TN",
  "Charlotte, NC", "Tampa, FL", "Atlanta, GA", "Raleigh, NC", "Dallas, TX",
  "Portland, OR", "San Antonio, TX", "Orlando, FL", "Minneapolis, MN",
]

function generateProperties(
  count: number,
  seed: number,
  contractedProducts: EliProduct[],
): PropertyReadinessEntry[] {
  const rng = (i: number) => {
    const x = Math.sin(seed + i * 127.1) * 43758.5453
    return x - Math.floor(x)
  }

  const pick = <T,>(arr: T[], salt: number): T => {
    const idx = Math.floor(rng(salt) * arr.length) % arr.length
    return arr[idx]
  }

  const hasProduct = (p: EliProduct) => contractedProducts.includes(p)

  return Array.from({ length: count }, (_, i) => {
    const r = rng(i)
    const smsOptions: ChannelStatus[] = r > 0.7 ? ["ready"] : r > 0.4 ? ["pending"] : r > 0.15 ? ["not_started"] : ["blocked"]
    const voiceOptions: ChannelStatus[] = r > 0.65 ? ["ready"] : r > 0.35 ? ["pending"] : ["not_started"]
    const emailReady: ChannelStatus = r > 0.2 ? "ready" : "pending"
    const smsStatus = smsOptions[0]
    const voiceStatus = voiceOptions[0]
    const hasEmergency = rng(i + 200) > 0.12
    const settingsDone = rng(i + 300) > 0.15
    const shellDone = rng(i + 400) > 0.05
    const facilitiesProClear = rng(i + 700) > 0.18

    const twilioMap: Record<string, TwilioPropertyStatus> = {
      ready: "campaign_approved",
      pending: rng(i + 500) > 0.5 ? "campaign_pending" : "campaign_submitted",
      not_started: rng(i + 600) > 0.5 ? "brand_pending" : "not_started",
      blocked: "not_started",
    }

    const blockers: string[] = []
    if (!hasEmergency) blockers.push("Missing emergency contact number")
    if (smsStatus === "blocked") blockers.push("SMS blocked — privacy policy missing")
    if (!settingsDone) blockers.push("Settings sync incomplete")
    if (!shellDone) blockers.push("Backend shell not created")
    if (hasProduct("maintenance") && !facilitiesProClear) blockers.push("Facilities Pro routing review pending")

    const overallReady = smsStatus === "ready" && voiceStatus === "ready" &&
      emailReady === "ready" && hasEmergency && settingsDone && shellDone

    const leasingBase =
      shellDone &&
      settingsDone &&
      (voiceStatus === "ready" || voiceStatus === "pending") &&
      smsStatus !== "blocked"
    const paymentsBase = settingsDone && rng(i + 800) > 0.1
    const renewalsBase = settingsDone && rng(i + 810) > 0.06
    const maintenanceBase =
      hasEmergency &&
      settingsDone &&
      shellDone &&
      facilitiesProClear &&
      rng(i + 820) > 0.12

    const leasingReady = !hasProduct("leasing") || leasingBase
    const paymentsReady = !hasProduct("payments") || paymentsBase
    const renewalsReady = !hasProduct("renewals") || renewalsBase
    const maintenanceReady = !hasProduct("maintenance") || maintenanceBase

    return {
      id: `prop-${i + 1}`,
      name: PROPERTY_NAMES[i % PROPERTY_NAMES.length],
      address: `${1000 + i * 37} ${pick(STREETS, 10_000 + i * 2)}, ${pick(CITIES, 10_000 + i * 2 + 1)}`,
      units: Math.floor(80 + rng(i + 100) * 320),
      smsStatus,
      voiceStatus,
      emailStatus: emailReady,
      chatStatus: "ready" as ChannelStatus,
      emergencyContact: hasEmergency,
      emergencyPhone: hasEmergency ? "(555) 123-4567" : undefined,
      settingsComplete: settingsDone,
      shellCreated: shellDone,
      twilioStatus: twilioMap[smsStatus],
      ivrStatus: voiceStatus,
      overallReady,
      blockers,
      contractedProducts: [...contractedProducts],
      leasingReady,
      paymentsReady,
      renewalsReady,
      maintenanceReady,
    }
  })
}

// ─── Company Implementations ─────────────────────────────────────────────────

const CONTRACTED_ALL: EliProduct[] = ["leasing", "payments", "renewals", "maintenance"]

const newClientProperties = generateProperties(112, 42, CONTRACTED_ALL)
const backfillProperties = generateProperties(87, 99, CONTRACTED_ALL)

function buildCompany(
  companyId: string,
  companyName: string,
  segment: "new" | "backfill",
  products: EliProduct[],
  properties: PropertyReadinessEntry[],
  itemOverrides: Partial<Record<string, Partial<ChecklistItem>>>,
  activationStatus: ActivationStatus,
  trialEndsAt?: string,
): CompanyImplementation {
  const companyItems = checklistItems.map((item) => {
    const override = itemOverrides[item.id]
    return override ? { ...item, ...override } : { ...item }
  })

  const clientItems = companyItems.filter(
    (i) => i.visibility !== "internal" && (i.status === "needs_input" || i.status === "blocked"),
  )

  const propertiesReady = properties.filter((p) => p.overallReady).length

  const totalItems = companyItems.length
  const completedItems = companyItems.filter(
    (i) => i.status === "complete" || i.status === "auto_confirmed",
  ).length

  return {
    companyId,
    companyName,
    segment,
    contractedProducts: products,
    companyItems,
    properties,
    overallProgress: Math.round((completedItems / totalItems) * 100),
    clientItemsRemaining: clientItems.length,
    propertiesReady,
    propertiesTotal: properties.length,
    activationStatus,
    ...(trialEndsAt !== undefined ? { trialEndsAt } : {}),
  }
}

export const newClientImplementation: CompanyImplementation = buildCompany(
  "CID-4821",
  "National Horizon Real Estate Services",
  "new",
  CONTRACTED_ALL,
  newClientProperties,
  {
    ein: { status: "needs_input" },
    auth_rep: { status: "needs_input" },
    privacy_policy: { status: "needs_input" },
    business_address: { status: "complete" },
    website_url: { status: "complete" },
    twilio_profile: { status: "not_started" },
    twilio_brand: { status: "not_started" },
    twilio_campaigns: { status: "not_started" },
    third_party_website: { status: "needs_input" },
    emergency_contacts: { status: "needs_input" },
    payments_block_day: { status: "needs_input" },
    maintenance_afterhours: { status: "needs_input" },
    payments_activation_window: { status: "auto_confirmed" },
    email_override: { status: "auto_confirmed" },
    facilities_pro_check: { status: "not_started" },
    shell_creation: { status: "in_progress" },
    product_defaults: { status: "not_started" },
    settings_synced: { status: "not_started" },
    go_live_toggle: { status: "not_started" },
  },
  "not_ready",
)

export const backfillImplementation: CompanyImplementation = buildCompany(
  "CID-1392",
  "Burkentine Property Management",
  "backfill",
  CONTRACTED_ALL,
  backfillProperties,
  {
    ein: { status: "auto_confirmed", sourceIfBackfill: "Pulled from existing Twilio profile" },
    auth_rep: { status: "auto_confirmed", sourceIfBackfill: "Pulled from existing Twilio profile" },
    privacy_policy: { status: "needs_input", blockedReason: "Privacy policy URL not found on website" },
    business_address: { status: "auto_confirmed", sourceIfBackfill: "Entrata company record" },
    website_url: { status: "auto_confirmed", sourceIfBackfill: "Marketing tab" },
    twilio_profile: { status: "complete" },
    twilio_brand: { status: "complete" },
    twilio_campaigns: { status: "in_progress" },
    third_party_website: { status: "complete" },
    emergency_contacts: { status: "needs_input" },
    payments_block_day: { status: "auto_confirmed", sourceIfBackfill: "Derived from Entrata financial settings" },
    payments_grace_period: { status: "auto_confirmed", sourceIfBackfill: "Entrata financial settings" },
    payments_activation_window: { status: "auto_confirmed", sourceIfBackfill: "Billing calendar policy on file" },
    leasing_lead_assignment: { status: "auto_confirmed", sourceIfBackfill: "Leasing settings" },
    email_override: { status: "auto_confirmed", sourceIfBackfill: "Default Entrata domain in use" },
    maintenance_afterhours: { status: "needs_input" },
    renewals_comm_prefs: { status: "auto_confirmed" },
    facilities_pro_check: { status: "complete" },
    shell_creation: { status: "complete" },
    api_credentials: { status: "complete" },
    product_defaults: { status: "complete" },
    email_provisioned: { status: "complete" },
    ivr_configured: { status: "complete" },
    settings_synced: { status: "in_progress" },
    oxp_restriction_removed: { status: "complete" },
    staging_readiness: { status: "in_progress" },
    go_live_toggle: { status: "not_started" },
  },
  "staged",
  "2026-05-15T00:00:00Z",
)
