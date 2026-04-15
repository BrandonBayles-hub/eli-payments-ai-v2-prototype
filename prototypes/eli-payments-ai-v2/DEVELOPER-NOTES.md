# ELI+ Setup — Developer Notes

> Short, focused context for engineers building this workflow. Read this before touching the Overview tab or card ordering logic.

---

## What this prototype is

The ELI+ Setup flow is where property management companies configure all ELI AI services before go-live. It replaces a fragmented, tab-per-product experience with a single prioritized to-do list. The user shouldn't have to hunt across tabs to know what's left.

---

## Overview tab — card ordering

Cards on the Overview surface in this order, always:

| Priority | What | Why |
|---|---|---|
| 1 | **Privacy Policy** (pinned) | Carrier compliance. Missing this is the single biggest delay risk — can push go-live from 1 day to weeks while SMS carriers investigate. |
| 2 | **Email Integration** (pinned) | All AI services send from the customer's domain. No email = no outbound ELI messages. |
| 3 | **Carrier compliance items** (`carrierCompliance: true`) | Any other settings in the Carrier Compliance tab that haven't been resolved. Same urgency tier as privacy. |
| 4 | **Critical** items | Hard blockers — ELI cannot function at all without these. |
| 5 | **Attention** items | Important gaps that need resolution before go-live but don't fully stop it. |
| 6 | **Default** items | Smart defaults were pre-applied. User reviews and confirms. These are shown on the overview so nothing is hidden — but they're low urgency. |
| 7 | **IVR Setup** (conditional) | Unlocks only after carrier compliance is complete — uses the compliance phone number as the foundation. |

Completed items sink to the bottom regardless of original priority.

---

## Product filter tabs

| Tab | Shows |
|---|---|
| All Agents | Every incomplete item across all products |
| Leasing AI | Items tagged `product: "leasing"` + items tagged `product: "all"` |
| Payments AI | Items tagged `product: "payments"` + `product: "all"` |
| Maintenance AI | Items tagged `product: "maintenance"` + `product: "all"` |
| Renewals AI | Items tagged `product: "renewals"` + `product: "all"` |

Use `product: "all"` for settings that gate or affect every ELI AI product simultaneously. Use a specific product tag for settings that only tune one agent's behavior.

---

## The "exposing settings from other tabs" pattern

The privacy policy lives inside the Carrier Compliance tab. We also surface it on the Overview. That's intentional — the user should never have to know which tab owns which setting. They just see a prioritized list and work through it.

This same pattern applies anywhere a setting is critical enough to warrant top-of-list exposure, even if it lives deeper in the tab structure.

---

## Card copy guidelines

Card titles and descriptions should tell the user:
- What the setting does for **their residents or leasing teams**
- What happens if they skip it (delay risk, missing functionality)
- How much work is left (e.g., "8 properties missing")

Card copy should NOT include:
- Internal API names or endpoint references
- Technical system paths or database field names
- Engineering implementation details

The cards are a user experience, not a technical spec.

---

## Data source: `data/mock.ts`

All action items come from `NEEDS_ATTENTION` in `data/mock.ts`. The interface is:

```ts
NeedAttentionItem {
  id: string
  title: string
  why: string           // Why it matters — shown on the card body
  summary: string       // Short status line (e.g., "8 properties missing")
  severity: "critical" | "attention" | "default" | "waiting"
  product: "all" | "leasing" | "payments" | "maintenance" | "renewals"
  carrierCompliance?: boolean  // true = sorts above critical items
  progress?: { done, total, unit }
  entrataImported?: { count, path }  // pre-populated from Entrata
  defaultsApplied?: { count }        // filled with smart defaults
}
```

Hardcoded cards (not in mock.ts): Privacy Policy, Email Integration, IVR Setup. Those have dedicated state in `index.tsx` (`privacyPublished`, `emailComplete`, `ivrComplete`) because their completion triggers downstream effects (e.g., privacy unlocks the Twilio brand registration pipeline).

---

## Questions?

This prototype was designed by Brandon Bayles. For any questions about intended behavior, ordering decisions, or product logic — ask in the `#eli-plus-setup` Slack channel or open a Cursor chat in this workspace and ask directly. All design context is in this repo.
