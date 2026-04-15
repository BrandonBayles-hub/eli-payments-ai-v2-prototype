# Product Area — ELI+ Implementation Setup

## Domain

- **Product Area**: ELI+ — AI-powered leasing, payments, maintenance, and renewals assistant
- **Primary Users**: Property management companies setting up ELI+ across their portfolio before go-live
- **Prototype Focus**: The implementation setup workflow — specifically the Overview tab and its card-based prioritization system

## What ELI+ is

ELI+ is Entrata's suite of AI agents:

| Agent | What it does |
|---|---|
| Leasing AI | Guides prospects through the leasing funnel — tours, applications, availability |
| Payments AI | Automates rent reminders, late fee notices, and payment plan conversations |
| Maintenance AI | Routes and escalates maintenance requests |
| Renewals AI | Initiates and manages lease renewal conversations with residents |

All four agents share common infrastructure (carrier compliance, email integration) but have their own product-specific configurations.

## The implementation problem this prototype solves

Today, implementation teams set up each ELI product in its own tab, in any order. There's no guidance on what to do first, and carrier compliance — the single biggest delay risk — is buried. Missing carrier compliance can extend implementation from 1 day to weeks.

This prototype introduces a prioritized Overview tab where:
1. Carrier compliance (privacy policy) is always #1
2. All required settings surface as cards — users never have to hunt across tabs
3. Cards order by urgency: carrier compliance → critical → attention → defaults

## Key concepts

**Carrier compliance**: SMS carriers require a publicly accessible privacy policy + 10DLC brand registration before messages can be sent. This is the hardest blocker — missing it stops all outbound AI communication across every ELI product.

**Smart defaults**: Most settings (rent dates, payment options, tour types) are pre-populated from data already in Entrata or reasonable industry defaults. The user reviews and confirms, not starts from scratch.

**"All Agents" settings**: Some settings gate or affect every ELI product simultaneously (privacy policy, email integration). Others are product-specific. The filter tabs on the Overview separate these.

## Card ordering rules

See `DEVELOPER-NOTES.md` in the prototype folder for full rules. Short version:
1. Privacy policy — always pinned first
2. Email integration — pinned second
3. `carrierCompliance: true` items — next
4. Critical blockers
5. Attention items
6. Default review items

## Key metrics (implementation context)

| Metric | Current | Target |
|---|---|---|
| Implementation timeline | ~4 weeks | 1–3 days |
| Carrier compliance delay risk | Weeks if missed | 0 if surfaced first |
| Customer effort (setup) | Many tabs, unclear order | Single prioritized list |

## What this prototype is NOT

- Not a full production spec — it's a proof of concept for the setup UX
- Not the final component library — it uses sandbox components as placeholders
- Not an engineering handoff — see `DEVELOPER-NOTES.md` for what devs need to know
