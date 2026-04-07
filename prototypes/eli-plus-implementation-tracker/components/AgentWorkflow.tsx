import { useState } from "react"
import { Badge } from "@sandbox-components/ui/badge"
import { Button } from "@sandbox-components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@sandbox-components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsProvider } from "@sandbox-components/ui/tabs"
import { Alert } from "@sandbox-components/ui/alert"
import { Progress } from "@sandbox-components/ui/progress"
import {
  Settings, Mic2, FileCode2, FlaskConical, GitMerge, BarChart3,
  Home, CreditCard, Wrench, RefreshCw, Play, ChevronDown, ChevronUp,
  CheckCircle2, AlertTriangle, TrendingUp, Zap, Volume2, User, Clock,
  ArrowRight, Brain, MessageSquare, PhoneCall, Mail, Ticket,
} from "lucide-react"

type AgentId = "leasing" | "payments" | "maintenance" | "renewals"
type PillarId = "settings" | "voice" | "prompt" | "testing" | "escalations" | "reporting"

const AGENTS: { id: AgentId; label: string; icon: typeof Home; color: string; description: string }[] = [
  { id: "leasing", label: "Leasing AI", icon: Home, color: "from-blue-600 to-cyan-500", description: "Handles prospect inquiries, tour scheduling, and lead qualification" },
  { id: "payments", label: "Payments AI", icon: CreditCard, color: "from-emerald-600 to-teal-500", description: "Manages rent reminders, payment questions, and late fee resolution" },
  { id: "maintenance", label: "Maintenance AI", icon: Wrench, color: "from-orange-600 to-amber-500", description: "Triages work orders, dispatches vendors, and updates residents" },
  { id: "renewals", label: "Renewals AI", icon: RefreshCw, color: "from-purple-600 to-pink-500", description: "Drives lease renewals, presents offers, and captures decisions" },
]

const PILLARS: { id: PillarId; label: string; icon: typeof Settings }[] = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "voice", label: "Voice & Name", icon: Mic2 },
  { id: "prompt", label: "Prompt Config", icon: FileCode2 },
  { id: "testing", label: "Agent Testing", icon: FlaskConical },
  { id: "escalations", label: "Escalations", icon: GitMerge },
  { id: "reporting", label: "Reporting & Evolution", icon: BarChart3 },
]

// ─── Settings content per agent ─────────────────────────────────────────────

type SettingItem = { label: string; value: string; editable?: boolean }

const AGENT_SETTINGS: Record<AgentId, { group: string; items: SettingItem[] }[]> = {
  leasing: [
    { group: "Availability", items: [
      { label: "Tour Hours", value: "Mon–Fri 9am–6pm, Sat 10am–4pm", editable: true },
      { label: "Same-Day Tour Lead Time", value: "2 hours", editable: true },
      { label: "Max Tours Per Day", value: "12", editable: true },
    ]},
    { group: "Tour Types", items: [
      { label: "In-Person Tours", value: "Enabled" },
      { label: "Virtual Tours", value: "Enabled" },
      { label: "Self-Guided Tours", value: "Disabled" },
    ]},
    { group: "Lead Handling", items: [
      { label: "Waitlist Policy", value: "Collect and notify automatically", editable: true },
      { label: "Follow-up Cadence", value: "Day 1, Day 3, Day 7", editable: true },
      { label: "Unresponsive Lead Timeout", value: "14 days", editable: true },
    ]},
  ],
  payments: [
    { group: "Payment Rules", items: [
      { label: "Rent Due Date", value: "1st of month", editable: true },
      { label: "Grace Period", value: "5 days", editable: true },
      { label: "Late Fee Policy", value: "$75 flat after grace period", editable: true },
    ]},
    { group: "Payment Options", items: [
      { label: "Payment Plans", value: "Available on request", editable: true },
      { label: "Outstanding Balance Threshold", value: "$500 — escalate to human", editable: true },
      { label: "Payment Portal Link", value: "pay.sunsetproperties.com", editable: true },
    ]},
    { group: "Notifications", items: [
      { label: "Reminder: 5 Days Before Due", value: "Enabled" },
      { label: "Reminder: Day Of", value: "Enabled" },
      { label: "Reminder: 3 Days Past Due", value: "Enabled" },
    ]},
  ],
  maintenance: [
    { group: "Response Windows", items: [
      { label: "Emergency Response SLA", value: "2 hours", editable: true },
      { label: "Routine Response SLA", value: "24 hours", editable: true },
      { label: "After-Hours Emergency Line", value: "(801) 555-0192", editable: true },
    ]},
    { group: "Triage Settings", items: [
      { label: "Auto-Triage Work Orders", value: "Enabled" },
      { label: "Resident Entry Permission Default", value: "Ask every time", editable: true },
      { label: "Repeat Issue Threshold", value: "3+ occurrences → flag for review", editable: true },
    ]},
    { group: "Vendors", items: [
      { label: "Preferred Plumbing Vendor", value: "Ace Plumbing Co.", editable: true },
      { label: "Preferred HVAC Vendor", value: "CoolAir Services", editable: true },
      { label: "Preferred Electrician", value: "Bright Electric", editable: true },
    ]},
  ],
  renewals: [
    { group: "Offer Timing", items: [
      { label: "First Renewal Outreach", value: "120 days before lease end", editable: true },
      { label: "Follow-up Cadence", value: "Every 14 days until decision", editable: true },
      { label: "Final Notice Window", value: "30 days before lease end", editable: true },
    ]},
    { group: "Offer Parameters", items: [
      { label: "Lease Term Options", value: "3, 6, 12, 15 months", editable: true },
      { label: "Incentive Range", value: "Up to 1 month free on 12-month", editable: true },
      { label: "Auto-Renewal Threshold", value: "No response after 90 days", editable: true },
    ]},
    { group: "Decision Capture", items: [
      { label: "Accept Renewals via Chat", value: "Enabled" },
      { label: "Decline Routing", value: "Notify leasing team + start move-out flow", editable: true },
      { label: "Counter-Offer Escalation", value: "Enabled — route to leasing manager", editable: true },
    ]},
  ],
}

// ─── Voice content per agent ─────────────────────────────────────────────────

const VOICE_DEFAULTS: Record<AgentId, { name: string; gender: "female" | "male"; tone: number }> = {
  leasing: { name: "Avery", gender: "female", tone: 75 },
  payments: { name: "Jordan", gender: "male", tone: 40 },
  maintenance: { name: "Taylor", gender: "male", tone: 50 },
  renewals: { name: "Morgan", gender: "female", tone: 65 },
}

// ─── Prompt sections per agent ───────────────────────────────────────────────

const PROMPT_SECTIONS: Record<AgentId, { section: string; content: string }[]> = {
  leasing: [
    { section: "Brand Introduction", content: "You are Avery, the leasing assistant for Sunset Property Group. You help prospective residents explore available apartments, schedule tours, and answer questions about our communities." },
    { section: "Tone Guidelines", content: "Be warm, upbeat, and professional. Use first names when possible. Avoid jargon. Keep responses concise but complete — no more than 3–4 sentences per reply." },
    { section: "Tour Scheduling", content: "When a prospect asks to schedule a tour, collect their preferred date, time, and tour type (in-person or virtual). Confirm availability and send a calendar invite. If the preferred slot is unavailable, offer 2–3 alternatives." },
    { section: "Off-Topic Deflection", content: "If asked about topics outside leasing (e.g., current resident issues, maintenance), politely redirect: 'That's handled by a different team — I can connect you with the right contact.'" },
  ],
  payments: [
    { section: "Brand Introduction", content: "You are Jordan, the payments assistant for Sunset Property Group. You help residents understand their account balance, make payments, and resolve billing questions." },
    { section: "Tone Guidelines", content: "Be empathetic and calm — payment conversations can be stressful. Avoid accusatory language. Lead with solutions. Never shame a resident for a late payment." },
    { section: "Payment Handling", content: "When a resident asks to pay rent, provide the payment portal link and available methods. If they report a payment issue, collect their unit number and payment date, then escalate to the accounting team." },
    { section: "Off-Topic Deflection", content: "For non-payment topics (maintenance, leasing), respond: 'I specialize in payments — let me connect you with the right team for that.'" },
  ],
  maintenance: [
    { section: "Brand Introduction", content: "You are Taylor, the maintenance coordinator for Sunset Property Group. You help residents submit work orders, track repair status, and handle emergency situations." },
    { section: "Triage Protocol", content: "For every maintenance request, determine urgency: Emergency (fire, flood, no heat in winter, gas leak) → call emergency line immediately. Urgent (no hot water, broken locks) → 24-hour SLA. Routine (minor repairs) → 3–5 day SLA." },
    { section: "Entry Permission", content: "Always ask: 'Does our maintenance team have permission to enter your unit if you're not home?' Record the resident's answer before scheduling." },
    { section: "Off-Topic Deflection", content: "For leasing or billing questions, respond: 'That's outside my area — I'll connect you with the right team right away.'" },
  ],
  renewals: [
    { section: "Brand Introduction", content: "You are Morgan, the renewal specialist for Sunset Property Group. I'm reaching out because your lease is coming up and I'd love to help you explore your options for staying." },
    { section: "Offer Presentation", content: "Present renewal offers enthusiastically but without pressure. Lead with the best available term. If a resident hesitates, acknowledge their concern and offer to answer questions before they decide." },
    { section: "Objection Handling", content: "Common objections: 'Too expensive' → offer shorter term at lower rate, or mention available incentives. 'Not sure yet' → offer to follow up in 1–2 weeks. 'Moving out' → thank them and initiate move-out checklist." },
    { section: "Off-Topic Deflection", content: "For maintenance or billing topics: 'I specialize in renewals — let me make sure the right person helps you with that.'" },
  ],
}

// ─── Test scenarios per agent ─────────────────────────────────────────────────

const TEST_SCENARIOS: Record<AgentId, { label: string; input: string; response: string }[]> = {
  leasing: [
    { label: "Tour Scheduling", input: "Hi! I'd like to schedule a tour for Saturday afternoon.", response: "Hi there! I'd love to set that up. We have availability Saturday at 1:00 PM and 3:00 PM — which works best for you? Also, would you prefer an in-person or virtual tour?" },
    { label: "Availability Question", input: "Do you have any 2-bedroom units available?", response: "Great question! We currently have 3 two-bedroom units available, with move-in dates ranging from the 1st to the 15th of next month. Would you like me to walk you through the options or schedule a tour first?" },
    { label: "Off-Topic: Maintenance", input: "My faucet is leaking, can you help?", response: "I'm your leasing assistant, so I specialize in tours and availability — but I'll connect you with our maintenance team right now. They'll get that taken care of quickly!" },
  ],
  payments: [
    { label: "Late Payment", input: "I'm going to be a few days late on rent this month.", response: "I appreciate you letting us know! You have a 5-day grace period, so as long as payment is made by the 6th, you're all set with no late fee. Would you like me to send you the payment portal link?" },
    { label: "Balance Question", input: "Why does my balance show $1,250 when my rent is $1,175?", response: "Happy to help clarify! The extra $75 is a late fee from last month. I can pull up the full breakdown if you'd like, or connect you with our accounting team if you'd like to discuss it further." },
    { label: "Payment Plan Request", input: "Can I split my rent into two payments this month?", response: "Yes, payment plans are available on a case-by-case basis. I'll connect you with our accounting team to get that set up — they can usually confirm within a few hours." },
  ],
  maintenance: [
    { label: "Urgent: No Hot Water", input: "I've had no hot water since last night.", response: "I'm so sorry — that's an urgent issue. I'm logging this as a priority work order right now. Our team will contact you within 2 hours to schedule a visit. Does our team have permission to enter your unit if you're not home?" },
    { label: "Routine: Light Fixture", input: "The light in my bathroom is flickering.", response: "Got it, I've submitted a routine work order for the bathroom light fixture. Our electrician typically handles these within 3–5 business days. You'll get a text confirmation with the scheduled window. Anything else I can help with?" },
    { label: "Emergency: Gas Smell", input: "I smell gas in my apartment.", response: "This is an emergency — please leave your unit immediately and call 911, then our emergency line at (801) 555-0192. Do not use any light switches or open flames. Your safety is the top priority." },
  ],
  renewals: [
    { label: "Interested Resident", input: "I got a message about my lease renewal. What are my options?", response: "Hi! I'm so glad you reached out. Your lease ends in about 90 days and we'd love to have you stay. Right now we have 6-month and 12-month options available — the 12-month comes with a special incentive. Want me to walk you through the details?" },
    { label: "Cost Objection", input: "The renewal offer is a bit more than I was hoping to pay.", response: "I completely understand — let me see what I can do. We do have a 6-month option at a slightly lower rate, and there may be a move-in incentive available if you commit by the end of the month. Would either of those work better for you?" },
    { label: "Moving Out", input: "I've decided I'm going to be moving out.", response: "Thank you for letting us know — we're sad to see you go! I'll start your move-out checklist and connect you with our team to schedule a final walkthrough. Is there anything we could have done to make you want to stay? Your feedback really helps us improve." },
  ],
}

// ─── Escalation rules per agent ──────────────────────────────────────────────

type EscalationRule = { trigger: string; condition: string; route: string; channel: "human" | "email" | "ticket" }

const ESCALATION_RULES: Record<AgentId, EscalationRule[]> = {
  leasing: [
    { trigger: "Legal / Discrimination", condition: "Keywords: fair housing, discrimination, lawsuit, ADA", route: "Leasing Manager + Legal email", channel: "human" },
    { trigger: "Urgent Tour Request", condition: "Prospect requests same-day tour within 1hr of closing", route: "On-call Leasing Agent", channel: "human" },
    { trigger: "VIP / Corporate Lead", condition: "Prospect mentions corporate housing, 5+ units", route: "Regional Sales Manager", channel: "email" },
    { trigger: "Unresolved After 3 Turns", condition: "3 consecutive unresolved conversation turns", route: "Leasing team queue", channel: "ticket" },
  ],
  payments: [
    { trigger: "High Balance", condition: "Outstanding balance > $500", route: "Accounting Team", channel: "human" },
    { trigger: "Payment Dispute", condition: "Keywords: dispute, wrong charge, didn't pay, refund", route: "Accounting Manager + ticket created", channel: "ticket" },
    { trigger: "Eviction Risk", condition: "Keywords: eviction, court, attorney, legal action", route: "Property Manager + Legal", channel: "human" },
    { trigger: "Bank Error", condition: "Keywords: NSF, returned payment, bank error", route: "Accounting Team via email", channel: "email" },
  ],
  maintenance: [
    { trigger: "Life Safety Emergency", condition: "Keywords: fire, flood, gas leak, no heat (winter), structural damage", route: "Emergency line (801) 555-0192 + 911 advisory", channel: "human" },
    { trigger: "Repeat Issue", condition: "Same category work order 3+ times in 90 days", route: "Maintenance Manager review queue", channel: "ticket" },
    { trigger: "Resident Anger", condition: "Negative sentiment score > 0.8 for 2+ turns", route: "Property Manager", channel: "human" },
    { trigger: "Vendor Unavailable", condition: "No vendor available within SLA window", route: "Maintenance Manager to source backup", channel: "email" },
  ],
  renewals: [
    { trigger: "Move-Out Confirmed", condition: "Resident confirms non-renewal", route: "Leasing team (vacancy planning) + move-out checklist triggered", channel: "ticket" },
    { trigger: "Counter-Offer Request", condition: "Resident asks for a price below published rates", route: "Leasing Manager for approval", channel: "human" },
    { trigger: "Legal / Rent Control", condition: "Keywords: rent control, attorney, housing authority", route: "Property Manager + Legal", channel: "human" },
    { trigger: "Corporate Lease", condition: "Resident mentions employer-sponsored housing", route: "Regional Sales Manager", channel: "email" },
  ],
}

// ─── Reporting data per agent ─────────────────────────────────────────────────

type ReportingData = {
  volume: number; csat: number; resolution: number; escalation: number
  topTopics: { topic: string; pct: number }[]
  evolutionLog: { date: string; change: string; impact: string }[]
}

const REPORTING: Record<AgentId, ReportingData> = {
  leasing: {
    volume: 1284, csat: 4.6, resolution: 87, escalation: 6,
    topTopics: [{ topic: "Tour scheduling", pct: 42 }, { topic: "Availability inquiry", pct: 31 }, { topic: "Pricing questions", pct: 14 }, { topic: "Application status", pct: 8 }, { topic: "Other", pct: 5 }],
    evolutionLog: [
      { date: "Apr 2", change: "Added weekend tour availability language", impact: "+9% Saturday bookings" },
      { date: "Mar 28", change: "Improved virtual tour fallback when in-person unavailable", impact: "+14% overall conversion" },
      { date: "Mar 21", change: "Shortened average response length by 18%", impact: "+0.2 CSAT score" },
    ],
  },
  payments: {
    volume: 986, csat: 4.3, resolution: 79, escalation: 12,
    topTopics: [{ topic: "Balance inquiry", pct: 38 }, { topic: "Late fee questions", pct: 25 }, { topic: "Payment portal help", pct: 19 }, { topic: "Payment plans", pct: 11 }, { topic: "Other", pct: 7 }],
    evolutionLog: [
      { date: "Apr 3", change: "Softened tone for late payment conversations", impact: "+0.4 CSAT score" },
      { date: "Mar 25", change: "Added proactive grace period reminder language", impact: "-18% escalation rate" },
      { date: "Mar 17", change: "Improved payment portal link delivery on mobile", impact: "+22% direct payment completions" },
    ],
  },
  maintenance: {
    volume: 1547, csat: 4.5, resolution: 83, escalation: 9,
    topTopics: [{ topic: "Work order submission", pct: 48 }, { topic: "Status updates", pct: 24 }, { topic: "Emergency triage", pct: 11 }, { topic: "Vendor scheduling", pct: 10 }, { topic: "Other", pct: 7 }],
    evolutionLog: [
      { date: "Apr 4", change: "Improved emergency keyword detection (added 12 phrases)", impact: "-2 min avg emergency response" },
      { date: "Mar 30", change: "Added entry permission ask to all scheduled visits", impact: "+31% resident satisfaction on visit day" },
      { date: "Mar 22", change: "Expanded category list for faster triage", impact: "-24% unclassified work orders" },
    ],
  },
  renewals: {
    volume: 612, csat: 4.4, resolution: 74, escalation: 8,
    topTopics: [{ topic: "Renewal offer review", pct: 44 }, { topic: "Pricing negotiation", pct: 22 }, { topic: "Move-out confirmed", pct: 17 }, { topic: "Lease term questions", pct: 11 }, { topic: "Other", pct: 6 }],
    evolutionLog: [
      { date: "Apr 1", change: "Added incentive language for 12-month commitments", impact: "+11% 12-month selection rate" },
      { date: "Mar 27", change: "Improved objection handling for price concerns", impact: "+8% retention after 'too expensive'  objection" },
      { date: "Mar 19", change: "Shortened initial outreach message by 30%", impact: "+16% open-to-response rate" },
    ],
  },
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SettingsPillar({ agentId }: { agentId: AgentId }) {
  const groups = AGENT_SETTINGS[agentId]
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Configure the settings that influence how this agent converses with residents and handles requests.</p>
      {groups.map((group) => (
        <div key={group.group}>
          <h4 className="text-sm font-semibold text-foreground mb-3">{group.group}</h4>
          <div className="divide-y divide-border rounded-lg border border-border bg-white">
            {group.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{item.value}</span>
                  {item.editable && (
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">Edit</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function VoicePillar({ agentId }: { agentId: AgentId }) {
  const defaults = VOICE_DEFAULTS[agentId]
  const [name, setName] = useState(defaults.name)
  const [gender, setGender] = useState<"female" | "male">(defaults.gender)
  const [tone, setTone] = useState(defaults.tone)
  const [playing, setPlaying] = useState(false)

  const handlePreview = () => {
    setPlaying(true)
    setTimeout(() => setPlaying(false), 2500)
  }

  return (
    <div className="space-y-6 max-w-xl">
      <p className="text-sm text-muted-foreground">Choose the agent's name, voice, and conversational tone. These settings affect how residents perceive and connect with the AI.</p>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Agent Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-muted-foreground">This is the name residents will see and hear in conversations.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Voice</label>
        <div className="flex gap-3">
          {(["female", "male"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                gender === g
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-white text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              <User className="h-4 w-4" aria-hidden="true" />
              {g === "female" ? "Female Voice" : "Male Voice"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Tone</label>
          <span className="text-xs text-muted-foreground">
            {tone < 30 ? "Formal & Professional" : tone < 60 ? "Balanced" : tone < 80 ? "Warm & Friendly" : "Casual & Conversational"}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={tone}
          onChange={(e) => setTone(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Formal</span>
          <span>Casual</span>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Volume2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium">{name} · {gender === "female" ? "Female" : "Male"} Voice</p>
            <p className="text-xs text-muted-foreground">Preview a sample greeting</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handlePreview} disabled={playing}>
          <Play className="h-4 w-4" aria-hidden="true" />
          {playing ? "Playing…" : "Preview"}
        </Button>
      </div>

      {playing && (
        <Alert variant="info" title={`"Hi, I'm ${name}! How can I help you today?"`}>
          This is a simulated preview. Live voice synthesis plays in the resident conversation channel.
        </Alert>
      )}

      <Button variant="primary" size="sm">Save Voice & Name</Button>
    </div>
  )
}

function PromptPillar({ agentId }: { agentId: AgentId }) {
  const sections = PROMPT_SECTIONS[agentId]
  const [expanded, setExpanded] = useState<string | null>(sections[0].section)
  const [editing, setEditing] = useState<string | null>(null)
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(sections.map((s) => [s.section, s.content]))
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">View and edit the agent's prompt. Each section controls a specific aspect of the conversation flow and brand voice.</p>
        <Button variant="outline" size="sm"><Brain className="h-4 w-4" aria-hidden="true" />Rebuild Prompt</Button>
      </div>
      {sections.map((s) => {
        const isOpen = expanded === s.section
        const isEditing = editing === s.section
        return (
          <div key={s.section} className="rounded-lg border border-border bg-white overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
              onClick={() => setExpanded(isOpen ? null : s.section)}
            >
              <span className="text-sm font-medium text-foreground">{s.section}</span>
              {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
            {isOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-border">
                {isEditing ? (
                  <>
                    <textarea
                      value={values[s.section]}
                      onChange={(e) => setValues((v) => ({ ...v, [s.section]: e.target.value }))}
                      rows={4}
                      className="mt-3 w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" onClick={() => setEditing(null)}>Save</Button>
                      <Button variant="outline" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{values[s.section]}</p>
                    <Button variant="ghost" size="sm" onClick={() => setEditing(s.section)}>Edit Section</Button>
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}
      <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-center">
        <Button variant="ghost" size="sm" className="text-muted-foreground">+ Add Custom Section</Button>
      </div>
    </div>
  )
}

function TestingPillar({ agentId }: { agentId: AgentId }) {
  const scenarios = TEST_SCENARIOS[agentId]
  const [active, setActive] = useState<number | null>(null)
  const [custom, setCustom] = useState("")
  const [customResponse, setCustomResponse] = useState<string | null>(null)
  const [running, setRunning] = useState(false)

  const runCustom = () => {
    if (!custom.trim()) return
    setRunning(true)
    setTimeout(() => {
      setCustomResponse("I'd be happy to help with that! Let me look into this for you and get back to you shortly. Is there anything else you'd like to add before I proceed?")
      setRunning(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Run pre-built scenarios or type a custom message to see exactly how the agent will respond before going live.</p>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Pre-Built Scenarios</h4>
        {scenarios.map((scenario, i) => (
          <div key={scenario.label} className="rounded-lg border border-border bg-white overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
              onClick={() => setActive(active === i ? null : i)}
            >
              <div className="flex items-center gap-3">
                <FlaskConical className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-sm font-medium">{scenario.label}</span>
              </div>
              <Play className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </button>
            {active === i && (
              <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                <div className="flex justify-end">
                  <div className="max-w-sm rounded-2xl rounded-tr-sm bg-primary/10 px-4 py-2 text-sm text-foreground">
                    {scenario.input}
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-sm rounded-2xl rounded-tl-sm bg-muted px-4 py-2 text-sm text-foreground">
                    {scenario.response}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Custom Test</h4>
        <div className="rounded-lg border border-border bg-white p-4 space-y-3">
          <textarea
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Type a message as if you were a resident…"
            rows={3}
            className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <Button variant="primary" size="sm" onClick={runCustom} disabled={running || !custom.trim()}>
            <Play className="h-4 w-4" aria-hidden="true" />
            {running ? "Running…" : "Run Test"}
          </Button>
          {customResponse && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-end">
                <div className="max-w-sm rounded-2xl rounded-tr-sm bg-primary/10 px-4 py-2 text-sm text-foreground">{custom}</div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-sm rounded-2xl rounded-tl-sm bg-muted px-4 py-2 text-sm text-foreground">{customResponse}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const CHANNEL_ICONS = { human: PhoneCall, email: Mail, ticket: Ticket }
const CHANNEL_LABELS = { human: "Live Agent", email: "Email Alert", ticket: "Create Ticket" }

function EscalationsPillar({ agentId }: { agentId: AgentId }) {
  const rules = ESCALATION_RULES[agentId]
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Define when and how the agent hands off conversations. Each rule specifies a trigger, condition, and routing path.</p>
        <Button variant="outline" size="sm">+ Add Rule</Button>
      </div>
      {rules.map((rule) => {
        const Icon = CHANNEL_ICONS[rule.channel]
        return (
          <div key={rule.trigger} className="rounded-lg border border-border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={rule.channel === "human" ? "red" : rule.channel === "email" ? "blue" : "yellow"}>
                    <Icon className="h-3 w-3" aria-hidden="true" />
                    {CHANNEL_LABELS[rule.channel]}
                  </Badge>
                  <span className="text-sm font-semibold text-foreground">{rule.trigger}</span>
                </div>
                <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">When:</span> {rule.condition}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  <span>{rule.route}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="shrink-0 text-xs">Edit</Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ReportingPillar({ agentId }: { agentId: AgentId }) {
  const data = REPORTING[agentId]
  const [autoEvolve, setAutoEvolve] = useState(true)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Conversations (30d)", value: data.volume.toLocaleString(), icon: MessageSquare, color: "text-blue-600" },
          { label: "CSAT Score", value: `${data.csat} / 5.0`, icon: CheckCircle2, color: "text-emerald-600" },
          { label: "Self-Resolved", value: `${data.resolution}%`, icon: TrendingUp, color: "text-purple-600" },
          { label: "Escalation Rate", value: `${data.escalation}%`, icon: AlertTriangle, color: "text-amber-600" },
        ].map((m) => {
          const Icon = m.icon
          return (
            <div key={m.label} className="rounded-lg border border-border bg-white p-4 space-y-2">
              <Icon className={`h-4 w-4 ${m.color}`} aria-hidden="true" />
              <p className="text-xl font-bold text-foreground">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </div>
          )
        })}
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-3">Top Topics</h4>
        <div className="space-y-2">
          {data.topTopics.map((t) => (
            <div key={t.topic} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground">{t.topic}</span>
                <span className="text-muted-foreground tabular-nums">{t.pct}%</span>
              </div>
              <Progress value={t.pct} className="h-1.5" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="text-sm font-semibold">Auto-Analyze & Evolve</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={autoEvolve}
            onClick={() => setAutoEvolve(!autoEvolve)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoEvolve ? "bg-primary" : "bg-muted-foreground/30"}`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${autoEvolve ? "translate-x-4" : "translate-x-1"}`} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          When enabled, the agent automatically analyzes conversation outcomes, identifies patterns in escalations and low CSAT scores, and proposes prompt improvements. All changes are logged below and require your approval before going live.
        </p>
        {autoEvolve && <Badge variant="green"><CheckCircle2 className="h-3 w-3" />Active — reviewing weekly</Badge>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold">Evolution Log</h4>
          <Badge variant="blue">{data.evolutionLog.length} recent changes</Badge>
        </div>
        <div className="space-y-2">
          {data.evolutionLog.map((entry) => (
            <div key={entry.date} className="rounded-lg border border-border bg-white px-4 py-3 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 shrink-0">
                  <Brain className="h-3 w-3 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{entry.change}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{entry.date}</p>
                </div>
              </div>
              <Badge variant="green" className="shrink-0 text-xs">{entry.impact}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Agent card with pillar tabs ─────────────────────────────────────────────

function AgentPanel({ agent }: { agent: typeof AGENTS[0] }) {
  const [pillar, setPillar] = useState<PillarId>("settings")
  const Icon = agent.icon

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-white">
        <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${agent.color} flex items-center justify-center shrink-0`}>
          <Icon className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">{agent.label}</h3>
            <Badge variant="green"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" /><span className="relative inline-flex rounded-full h-2 w-2 bg-success-foreground" /></span>Active</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{agent.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Clock className="h-3.5 w-3.5" aria-hidden="true" />History</Button>
        </div>
      </div>

      <TabsProvider variant="subtab">
        <Tabs value={pillar} onValueChange={(v) => setPillar(v as PillarId)}>
          <TabsList className="flex-wrap">
            {PILLARS.map((p) => {
              const PIcon = p.icon
              return (
                <TabsTrigger key={p.id} value={p.id}>
                  <PIcon className="h-4 w-4" aria-hidden="true" />
                  {p.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
          <TabsContent value="settings"><SettingsPillar agentId={agent.id} /></TabsContent>
          <TabsContent value="voice"><VoicePillar agentId={agent.id} /></TabsContent>
          <TabsContent value="prompt"><PromptPillar agentId={agent.id} /></TabsContent>
          <TabsContent value="testing"><TestingPillar agentId={agent.id} /></TabsContent>
          <TabsContent value="escalations"><EscalationsPillar agentId={agent.id} /></TabsContent>
          <TabsContent value="reporting"><ReportingPillar agentId={agent.id} /></TabsContent>
        </Tabs>
      </TabsProvider>
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function AgentWorkflow() {
  const [activeAgent, setActiveAgent] = useState<AgentId>("leasing")
  const agent = AGENTS.find((a) => a.id === activeAgent)!

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Agent Roster</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure each AI agent's settings, voice, prompts, testing, escalations, and performance reporting.</p>
      </div>

      <TabsProvider variant="subtab">
        <Tabs value={activeAgent} onValueChange={(v) => setActiveAgent(v as AgentId)}>
          <TabsList>
            {AGENTS.map((a) => {
              const AIcon = a.icon
              return (
                <TabsTrigger key={a.id} value={a.id}>
                  <AIcon className="h-4 w-4" aria-hidden="true" />
                  {a.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
          {AGENTS.map((a) => (
            <TabsContent key={a.id} value={a.id}>
              <AgentPanel agent={a} />
            </TabsContent>
          ))}
        </Tabs>
      </TabsProvider>
    </div>
  )
}
