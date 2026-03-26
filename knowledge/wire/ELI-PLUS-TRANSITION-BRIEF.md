---
title: "ELI+ Transition Brief — Colleen-to-Entrata Integration Gap Analysis"
author: Jenny Mack
status: wip
version: 0.1.0
domains: [ELI+, AI, Implementation, Engineering, Payments, Maintenance, Leasing, Renewals, UX]
created: 2026-03-25
updated: 2026-03-26
wire-signals: [ELI-PLUS-IMPLEMENTATION-R1-1, ELI-PLUS-EXPERIENCE-EVAL]
---

# ELI+ Transition Brief — Colleen-to-Entrata Integration Gap Analysis

**Wire Signal:** ELI-PLUS-IMPLEMENTATION-R1-1, ELI-PLUS-EXPERIENCE-EVAL
**Domains:** ELI+, AI, Implementation, Engineering, Payments, Maintenance, Leasing, Renewals, UX
**Research by:** Jenny Mack (UX background, Cal Harris's team)
**Date:** 2026-03-25
**Status:** WIP — first pass, sourced from Guru, GitHub PR #19, Gong analysis, internal implementation guides

---

## Executive Readout

ELI+ is two systems pretending to be one. Entrata acquired Colleen AI in June 2024 for speed-to-market on AI agents (Leasing, Payments, Renewals, Maintenance). The product is live and generating revenue, but the integration is surface-level. Colleen's flat configuration model does not map cleanly to Entrata's hierarchical settings architecture — and instead of resolving this structurally, we built a sync workflow that is months late, not live, and inherently lossy.

**The core tension:** Entrata tells clients "we're all-in-one." Clients are starting to notice we aren't. 10,699 Gong implementation calls show 33.5% involve bugs/defects and 27.6% involve timeline delays — many traceable to the integration seams.

**UX lens Jenny brings:** Map where the declared product experience diverges from what actually happens, then build a phased plan to kill legacy Colleen processes and get ELI+ running on Entrata's logic as the single source of truth.

---

## Current-State Map

### Declared Behavior (what we tell clients)

- ELI+ is a native AI suite built into the Entrata OS
- 64+ automated workflows across 4 AI products
- Conversational context switching powered by a single data layer
- "All-in-one platform" — no fragmentation, no bolt-on feel
- Implementation takes 2-4 weeks depending on product

### Observed Behavior (what actually happens)

- ELI+ reads from a separate backend config store (Colleen Admin / "Calling Admin") — not Entrata's settings
- **44 settings** need reconciliation between the two systems; **0 are currently synced**
- 43% of settings are simple 1:1 maps, but 20% require complex derived logic and 20% have no Entrata equivalent at all
- 8 settings are high/critical risk if defaulted wrong (e.g., Payment Block Day, Grace Period, Emergency Phone Numbers)
- Pre-October 2025 clients show **0% completion** in OXP settings despite being live for over a year
- Maintenance AI can't interpret existing Entrata problem/location configs — demands pristine reformatted data (no fuzzy matching)
- Two separate Twilio instances with different SLAs (3-day vs 24-day campaign approval)
- Payments AI can only go live on the 2nd-5th of the month; activating later causes residents to get pre-legal warnings before being told they owe money
- Email integration requires per-property manual association — 50 properties × 4 products = 200 manual steps
- ~40% of clients use third-party websites without privacy policies, blocking Twilio registration

### Mismatch Summary

| Area | Declared | Actual | Severity |
|------|----------|--------|----------|
| **Settings architecture** | Native OS integration | Two separate config stores, zero synced | Critical |
| **Late payment logic** | Entrata defines grace periods, late fees, payment plans | Colleen stores a single flat value — can't represent Entrata's multi-level formulas | Critical |
| **Maintenance AI data** | Works with your existing setup | Forces clients to redo working configurations | High |
| **Implementation speed** | 2-4 weeks | 2+ months for new logos; calendar-locked for Payments AI | High |
| **"All-in-one" claim** | Seamless single platform | Two Twilio instances, two admin systems, manual bridges everywhere | Critical |
| **OXP readiness** | Settings completion visible to clients | Pre-Oct 2025 clients see 0% despite being fully live | High |
| **Payments AI timing** | Activate anytime | Must activate on 2nd-5th or messaging sequence breaks | Medium |

---

## Capability Comparison: Late Payment Handling

This is the clearest illustration of the Entrata-vs-Colleen divergence.

| Dimension | Entrata (How We Tell Clients) | Colleen (What Actually Runs) |
|-----------|-------------------------------|------------------------------|
| **User-facing promise** | Flexible late fee policies, grace periods, payment plans, delinquency management | Proactive AI outreach for rent collection with 48-72 hour cadence |
| **Late fee calculation** | Multi-level formulas at charge code, lease, property, and company levels — supports %, flat, tiered, grace period logic | Single "late fee day" number — flat, no hierarchy |
| **Grace period** | Derived from "First Day Late" minus 1, per formula, per property | Single integer stored in Colleen Admin — no derivation logic |
| **Payment block day** | Walk checkboxes 1-31 consecutively; first unchecked = block day (non-trivial) | Single value expected — mapping is fragile and risky |
| **Payment plans** | Repayment Agreements + Flex integration at property level | Bot negotiation policies define last day AI can suggest/approve plans |
| **Decision logic owner** | Entrata financial settings (hierarchical) | Colleen Admin (flat) — reads from sync that doesn't exist yet |
| **System of record** | Entrata Client Admin | Colleen Admin (Calling Admin) |
| **Exception handling** | Configurable per charge code, lease, property, company | "Needs office decision" flag — no granularity |
| **What breaks** | If Colleen reads wrong grace period → residents told they can pay when they can't; wrong payment block day → payments accepted after cutoff | Already happening at unknown scale |

**The problem in one sentence:** Entrata has a sophisticated, multi-level financial settings architecture. Colleen flattens it into single values. The sync between them doesn't exist. Clients experience the Colleen version while being sold the Entrata version.

---

## Gap Register (Top 12 — Prioritized)

| # | Area | Declared | Actual | Impact | Type | Evidence |
|---|------|----------|--------|--------|------|----------|
| 1 | Settings sync | Entrata is source of truth | 0 of 44 settings synced | Implementation failures, wrong AI behavior | Logic | Settings Audit, PR #19 |
| 2 | Late fee mapping | Complex multi-level formulas | Single flat value in Colleen | Wrong financial communications to residents | Logic | Problem Brief, Settings Audit |
| 3 | Maintenance AI data | Works with existing configs | Demands pristine data, no fuzzy matching | Clients refuse onboarding; trust damage | UX + Logic | Problem Brief, at least 1 client refused |
| 4 | OXP completion | Shows meaningful progress | Pre-Oct 2025 clients at 0% | "You've been live a year and show zero setup" | UX | OXP Settings Problem doc |
| 5 | Twilio dual instance | Single communication platform | Two accounts, different SLAs, double data entry | Manual work, inconsistency, scaling block | Transition | Twilio Challenges doc |
| 6 | Payments AI timing | Activate anytime | Must be 2nd-5th of month or messaging breaks | Clients have terminated Payments AI over this | UX + Logic | Workstreams doc, Paige transcript |
| 7 | Privacy policy blocker | Smooth Twilio registration | ~40% of clients blocked by missing privacy policies | Legal risk ($10K/violation fines), go-live delays | Transition | Workstreams doc |
| 8 | Email integration | One-time setup | 200 manual associations for a 50-property client | Client frustration, "Why am I doing this?" | UX | Paige transcript |
| 9 | Cross-team communication | Integrated product team | Israel + US teams on different assumptions | Half-baked features that add integration debt | Transition | Problem Brief |
| 10 | Payment block day | Correctly derived from settings | Must walk 31 checkboxes — no safe default exists | Wrong value = residents told they can pay when blocked | Logic | Settings Audit |
| 11 | Emergency phone numbers | Auto-populated | No default, must come from Entrata manually | Emergency calls drop if not configured | Logic | Settings Audit — Critical risk |
| 12 | Grace period derivation | Auto-populated from formulas | Derived from "First Day Late" minus 1, multi-formula | Too dangerous to default — wrong value = compliance risk | Logic | Settings Audit — High risk |

---

## Key Risks

### UX Risks
- Clients see 0% completion in OXP after being live for a year — destroys confidence
- Maintenance AI forces rework of configs that already work — contradicts "all-in-one" positioning
- Payment timing constraint is invisible to implementation teams — residents get hostile messages
- Email setup is 200 manual steps for mid-size clients — "absolutely hate it" per internal feedback

### Logic Risks
- Zero settings synced means AI products may be operating on stale or wrong data
- Late fee/grace period flattening can produce legally incorrect communications
- Payment Block Day has no safe default — incorrect value creates real financial exposure
- Emergency phone numbers have no default — missing config means emergency calls go nowhere

### Transition Risks
- Two Twilio instances with different SLAs — no decision made on which to standardize
- Privacy policy blocker affects ~40% of clients and has no Entrata-owned solution
- Cross-team communication (Israel/US) causes requirements to get lost in translation
- Catherine (CPO) wants zero-human Payments AI activation — current architecture can't deliver it

---

## Quantitative Evidence: 10,699 Implementation Calls

Brandon Bayles analyzed 10,699 Gong implementation calls and classified them by primary issue theme. This is the best quantitative signal we have for the scale of the ELI+ integration problem.

### Theme Breakdown

| # | Issue Theme | Calls | % of Classified | What It Tells Us |
|---|-------------|-------|-----------------|------------------|
| 1 | **Bug / defect (during or post impl)** | **3,874** | **33.5%** | One in three implementation calls involves a product defect. This is the dominant theme. |
| 2 | **Implementation timeline / delay** | **3,191** | **27.6%** | Clients are being told 2-4 weeks. Many experience 2+ months. Over a quarter of all calls discuss delays. |
| 3 | Permissions / access / setup | 1,421 | 12.3% | Setup friction from the dual-system architecture — clients can't get access right because the path is confusing. |
| 4 | Implementation cost / billing impact | 821 | 7.1% | Clients are raising cost concerns during implementation — a signal that perceived value is eroding before go-live. |
| 5 | Migration / data / cutover | 789 | 6.8% | Data movement between systems. Directly traceable to the Entrata-Colleen dual architecture. |
| 6 | Integration / mapping / technical | 614 | 5.3% | Technical mapping problems — settings that don't translate, APIs that don't connect, fields that don't exist. |
| 7 | Clear process / stepwise path | 585 | 5.1% | Clients don't understand what's happening or what comes next. The implementation experience is opaque. |
| 8 | UX / discoverability | 286 | 2.5% | Clients can't find things. Two ELI+ tabs, multiple admin surfaces, legacy vs. new paths. |

### What the Numbers Mean

**3,874 calls involving bugs/defects is the headline number.** But it requires context:

- This counts calls where bugs were *discussed*, not distinct bugs. A single defect could generate dozens of calls across multiple clients. The actual bug count is lower, but the *client impact surface* is 3,874 conversations.
- Combined, bugs (33.5%) and timeline delays (27.6%) account for **61.1% of all classified implementation calls**. Over 7,000 calls where the client experience was defined by something going wrong or taking too long.
- The bottom four themes (cost, migration, integration, process clarity) together account for 24.3% — and all four map directly to the dual-system architecture documented in this brief.
- UX/discoverability at 2.5% is deceptively small. It likely undercounts because clients experiencing UX confusion often describe it as a "bug" or "setup problem" rather than a navigation issue.

### The Observability Gap

**Nobody can answer "how many open bugs does ELI+ have?" today.** This is itself a finding.

- **No unified defect dashboard.** ELI+ bugs flow through Zendesk into Jira, but there is no label, component, or project that cleanly groups all ELI+ issues. Leadership cannot pull a single query to see the full picture.
- **Bugs are split across systems.** Some live in the Israel team's tracker, some in Entrata's Jira, some are resolved in Zendesk without ever becoming a Jira ticket. There is no single place to count.
- **Gong data is the loudest signal we have — and it's indirect.** 3,874 calls referencing bugs doesn't tell us how many distinct bugs exist, which products they affect, whether they're resolved, or what the trend line looks like.
- **Post-go-live bugs are invisible in this data.** The 10,699 calls are implementation calls. Bugs experienced by clients already live on ELI+ flow through a separate support path and are not captured here. The real total is higher.

### What This Means for the Recommendation

This data validates three things:

1. **The integration problem is not theoretical — it is already the dominant client experience during implementation.** One-third of all calls are about bugs. That's not an edge case. That's the baseline.
2. **Timeline delays are almost as large as bugs.** The 2-4 week promise versus 2+ month reality is showing up in 27.6% of calls. Clients are talking about it constantly.
3. **The lack of a defect dashboard is a governance failure.** We cannot manage what we cannot measure. A first step — before any technical fix — is getting a single view of all ELI+ defects across Zendesk, Jira, and the Israel team's tracker.

**Source:** Brandon Bayles, Gong call analysis (10,699 calls), Project Amplify PR #19, `01-Problem-Brief.md`.

---

## Recommendation

**Direction:** Make Entrata the single source of truth. Colleen's AI layer reads directly from Entrata settings via API — no sync workflow, no duplicate admin, no manual translation.

**Why this works:**
- Eliminates the root cause (two systems pretending to be one)
- Aligns with Catherine's vision of zero-human activation
- Protects the "all-in-one" market positioning
- Creates a clear path to $50M ARR target cited by Brandon Bayles

**Why now:**
- OXP is about to launch and will expose the 0% completion problem to every pre-Oct 2025 client
- 3-week go-live target from leadership requires automation that doesn't exist yet
- Clients are already terminating products (Payments AI) over implementation gaps
- Every month of coexistence-by-drift adds more integration debt

---

## Phased Path

### NOW (Weeks 1-4) — Stop the bleeding

1. **Run the 4-step reconciliation plan** to get pre-Oct 2025 clients to 80-90% settings completion before OXP launches (feature flag → auto-populate → backfill from onboarding forms → apply defaults)
2. **Document the Payments AI 2nd-5th timing constraint** and surface it in the go-live workflow so it's impossible to miss
3. **Decide which Twilio instance** to standardize on (recommendation: Entrata's — negotiate SLA from 24 to 3 days)
4. **Map the 8 high/critical-risk settings** and determine whether each can be safely defaulted or must block go-live until populated

### NEXT (Months 2-3) — Build the bridge

5. **Answer the key engineering question:** "What would it take for no human to ever interact with the Colleen Admin?" (meeting with Ron, Shad, Dan)
6. **Build read-only Entrata integration** for the 19 simple 1:1 settings (43% of total)
7. **Build derived-value logic** for the 9 complex settings (20% of total)
8. **Ship fuzzy matching for Maintenance AI** problem/location data (Phase 1 target: end of May per Brandon's timeline)
9. **Make email integration company-level** instead of per-property

### LATER (Months 4-6) — Complete takeover

10. **Eliminate the Colleen Admin** as a human-facing system — all config flows through Entrata
11. **Redesign Payments AI cadence** to be activation-relative instead of calendar-fixed
12. **Consolidate to one Twilio instance** with automated brand/campaign registration
13. **Evaluate Path C decision gate** (Q1 2027): Does the Colleen AI layer need fundamental rework, or can it serve as the execution layer with Entrata owning all logic?

---

## UX Value-Add (Jenny Mack's Contribution Angle)

1. **Journey mapping the implementation experience.** 10,699 Gong calls is a goldmine. Mapping the actual client journey vs. the intended journey to find the moments where trust breaks.

2. **Fixing the "two systems" feel.** Every place where terminology, timing, or UI surfaces the Colleen/Entrata seam is a UX problem that can be named and fixed — starting with client-facing settings, error states, and onboarding flows.

3. **Designing the OXP settings experience.** The 0% completion problem isn't just a data problem — it's a perception problem. Designing the client-facing experience so that even during reconciliation, clients see progress and context instead of a broken dashboard.

4. **Defining what "done" looks like for takeover.** Each Colleen process needs a clear "last day" and a clear handoff. Creating the transition playbook that tells everyone — engineering, CS, implementations — what the experience should be at each phase.

5. **Being the voice of the resident.** When the late fee logic is wrong, it's not an engineering bug — it's a resident getting a threatening message they shouldn't have received. Keeping that human impact front and center in every prioritization conversation.

---

## Evidence and Unknowns

### Confirmed (sourced from Guru + GitHub PR #19 + public sources)
- 44 settings audited, 0 synced
- 8 high/critical-risk settings identified
- 10,699 Gong calls analyzed with theme breakdown (see "Quantitative Evidence" section above for full detail)
- 3,874 implementation calls (33.5%) involved bugs/defects; 3,191 (27.6%) involved timeline delays
- No unified ELI+ defect dashboard exists — bugs are scattered across Zendesk, Jira, and the Israel team's tracker with no single query to see the full picture
- Pre-Oct 2025 clients show 0% OXP completion
- At least 1 client refused Maintenance AI onboarding due to data rework requirement
- Clients have terminated Payments AI due to timing-related message sequence errors
- Two Twilio instances with 3-day vs 24-day SLA
- ~40% of clients use third-party websites (privacy policy blocker)
- Catherine (CPO) wants zero-human Payments AI activation

### Likely but unconfirmed
- The settings sync workflow is permanently inadequate (structural mismatch, not just a bug list)
- More clients than reported have experienced wrong financial communications due to settings gaps
- The "build our own AI" question will need to be answered within 12 months
- The 3,874 bug-related calls undercount the real problem because post-go-live support bugs are tracked separately and not included in the Gong implementation data

### What to inspect next
- The actual Colleen Admin API capabilities (or lack thereof) — this determines the speed of automation
- Gong call recordings for specific client complaints about payment/late fee mismatches
- Current state of Don's ELI admin defaults work — is it on track?
- Leasing Center schema vs Entrata framework question (blocking Workstream 2)
- Revenue at risk from clients who have stalled or terminated due to implementation gaps
- Total open Jira bugs tagged to ELI+ products (requires: consistent labeling system + Jira access to query)
- Israel team's defect backlog — how many open bugs and where do they track them?

### Blocking questions for confident design decisions
- Does the Colleen Admin have an internal API, or is all configuration UI-only?
- What is the OXP launch date? (Hard deadline for reconciliation)
- Can Entrata legally help clients get privacy policies, or is that a liability we can't touch?
- Who owns the final decision on Twilio instance consolidation?

---

## People Map

| Person | Role | Why They Matter |
|--------|------|----------------|
| **Catherine Wong** | COO/CPO | Executive sponsor — wants zero-human activation; sets strategic direction |
| **Brandon Bayles** | DI-Setup & Configurations | Wrote the implementation knowledge base; deepest operational knowledge |
| **Ron, Shad, Dan** | Colleen/ELI Engineering (Israel) | Own the Colleen Admin; key to answering "can we automate this?" |
| **Don** | Colleen Engineering | ELI admin defaults work — critical path for go-live automation |
| **Paige** | Implementation/QA | Twilio escalation relationship; ground truth on client experience |
| **Itamar Roth** | Israel MD (former Colleen CEO) | Owns the Israel engineering team; bridge between Colleen and Entrata cultures |
| **Sara Watts** | Principal PM | Referenced in Facilities Pro / Maintenance AI |
| **Jaron** | Professional Services | Maintenance AI setup — knows the actual client-facing pain |

---

## Mini Glossary

| Term | What it means |
|------|---------------|
| **Colleen Admin / Calling Admin** | Same system — the backend config store that all four AI products read from. This is what needs to eventually go away. |
| **Settings Workflow** | Client-facing config UI in OXP showing completion %. Launched Oct 2025 but doesn't have data for older clients. |
| **OXP** | Operator Experience Platform — new client portal. When it launches, it exposes the settings gap to every client. |
| **10DLC** | 10-Digit Long Code — carrier-required SMS registration. The Twilio bottleneck. |
| **Reconciliation** | The 4-step plan to backfill settings data so OXP doesn't show 0% for live clients. |

---

## The Invisible Workflow Thesis — Why the Transition Matters Beyond Tech Debt

Everything above frames the problem as integration debt. It is — but there is a bigger idea underneath that changes how we should think about the solution.

**ELI+ is already an invisible workflow system.** Payments AI sends an SMS cadence — no portal. Renewals AI initiates outreach — no dashboard. Leasing AI schedules tours — no form. The resident's interface is a text message. The operator's interface is an exception queue. At its best, ELI+ is not a "tool" operators use. It is a system that runs, and surfaces to humans only when it needs a decision.

That is the product model worth protecting. It is also the product model that every gap in this brief undermines.

**The current problems are not UI failures — they are infrastructure failures that break an invisible system.** The 200 manual email associations are not a bad form design. They are evidence that the backstage infrastructure isn't silent enough to support the front-stage promise. The 0 synced settings are not a sync bug. They are evidence that two systems are pretending to be one, and the invisible layer has to be hand-wired every time. The calendar-locked Payments AI go-live is not a scheduling problem. It is evidence that the orchestration logic is hardcoded to a calendar instead of relative to an event.

**The distinction matters for how we design the fix.** If we frame this as "build better settings forms," we optimize the wrong thing. We make the backstage UI prettier while the real product — the invisible workflow — stays broken. The right frame is: "what must the infrastructure do so the invisible system works correctly, safely, and silently?"

**What changes when we get the infrastructure right:**

| Phase | Current Frame (Tech Debt) | Invisible Workflow Frame |
|-------|--------------------------|--------------------------|
| **NOW — Stop the bleeding** | Backfill settings data to hit 80-90% | Make the source of truth readable by the AI layer so it stops needing a human translator |
| **NEXT — Build the bridge** | Automate Colleen Admin config | Eliminate the backstage UI — settings flow from Entrata, not from a form |
| **LATER — Complete takeover** | Consolidate systems | The invisible system runs on one data source, one Twilio instance, one activation event — no scaffolding visible to anyone |
| **End state** | Catherine's zero-human activation | Contract signed → system reads Entrata settings → AI goes live → operator sees nothing unless the AI needs a decision |

**The goal is not to build better settings forms. The goal is to not need them.**

Every manual step, every per-property association, every calendar-locked activation window is a signal that the infrastructure isn't invisible yet. The transition plan above is a roadmap to get there. The invisible workflow thesis is the reason it matters.

For the full exploration of this concept — four models, design principles, comparison tables, and breakdown cases — see the companion document: `ELI-PLUS-INVISIBLE-WORKFLOW.md`.

---

*This brief was generated from: 20 Guru cards, PR #19 on entrata-product/project-amplify (15 documents, 1,589 lines from Brandon Bayles), public acquisition/Summit sources, and internal implementation guides. Research by Jenny Mack.*
