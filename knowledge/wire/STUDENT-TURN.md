# STUDENT-TURN — Wire Response: Competitive Landscape & Capability Assessment

**Wire Signal:** STUDENT-TURN
**Published:** 2026-03-25
**Priority:** High — need before this leasing season
**Domains:** Facilities, Leasing, Student Housing, Competitive
**Research by:** Cal Harris
**Date:** 2026-03-25
**Status:** WIP — agent-generated with minimal human-in-the-loop review

---

## Executive Summary

Student Turn is a compressed, high-volume annual cycle (July–August) of mass move-outs, unit turnovers, and mass move-ins for student housing operators. Two purpose-built competitors — **EZ Turn (EZOS)** and **Student247 (formerly Turnable, acquired by Leonardo247)** — have carved out a niche by solving the orchestration layer that Entrata's platform tools don't natively provide. Chase has confirmed with student operators that they would quickly cancel these competitors if Entrata had an offering. The opportunity is real and the timing is urgent — Turn 2026 begins in ~4 months.

---

## Competitive Landscape

### EZ Turn (EZOS)

| Attribute | Detail |
|---|---|
| **Founded by** | Chase Minnifield (CEO), Lincoln Ogata (COO) |
| **HQ** | Lexington, KY |
| **Product** | Web portal + mobile app for student housing operations |
| **Key clients** | University of Kentucky, USC, and student housing operators of all sizes |

**Core capabilities:**
- Turn process automation and orchestration (end-to-end)
- Quarterly inspections management
- Scheduling and task assignment
- Communication hub for students and service providers
- Vendor management with invoice tracking (approved vs. non-approved work)
- Statistics and analytics tracking
- Mobile-first — field teams use the app on-site during turn

**Competitive positioning:** EZOS positions itself as "one system for all of student housing" — it wraps facilities, leasing, accounting, and portfolio supervision into a student-specific workflow. The differentiator is purpose-built orchestration: they don't just track individual work orders or inspections, they manage the entire turn as a coordinated project across units, vendors, and staff.

---

### Student247 (formerly Turnable) — by Leonardo247

| Attribute | Detail |
|---|---|
| **Acquired by** | Leonardo247 (January 2024) |
| **Product** | Cloud-based turn management platform with API integrations |
| **Pricing** | Custom (not publicly listed) |
| **Upcoming** | Leo247.io platform launching April 2026; upgraded Dynamic Forms and Work Orders (Jan 2026) |

**Core capabilities:**
- Pre-inspections and budgeting
- Turn phase tracking (cleaning, painting, go-backs)
- Vendor services and invoicing
- Quality checks and inspection walks
- Key returns and holdover tracking
- Budget and expense tracking per unit and per turn
- Real-time analytics and portfolio reporting
- Configurable workflows with role-based permissions
- API integrations with leading PMS platforms (including Entrata)

**Competitive positioning:** Student247 is a turn-specific orchestration layer that sits on top of the PMS. Leonardo247's broader maintenance/operations platform gives them depth in inspection workflows, recurring maintenance, and compliance. The acquisition of Turnable was explicitly about solving the "spreadsheets and clipboards" problem that student operators face during turn season.

---

### What Competitors Solve That We Don't (The Gap)

Both competitors provide a **turn orchestration layer** — a unified project-management view of the entire turn lifecycle across all units:

| Capability | EZ Turn | Student247 | Entrata Today |
|---|:-:|:-:|:-:|
| End-to-end turn project view (all units, all phases) | Yes | Yes | **No** — fragmented across Make Ready Board, inspections, and bulk tools |
| Turn-specific budgeting & expense tracking per unit | Yes | Yes | **No** — no turn-level cost tracking |
| Vendor coordination with invoice reconciliation | Yes | Yes | **Partial** — vendor management exists but not turn-scoped |
| Turn phase tracking (cleaning, paint, carpet, go-backs) | Yes | Yes | **Partial** — Make Ready Board tracks subtasks but lacks configurable phases |
| Real-time analytics dashboard for turn progress | Yes | Yes | **No** — we rely on New Relic for system metrics, not business analytics |
| Mobile-first field experience | Yes | Yes | **Partial** — Facilities App exists but not turn-optimized |
| Pre-turn planning & timeline management | Yes | Yes | **No** |
| Cross-property portfolio turn reporting | Yes | Yes | **No** |
| Turn-specific inspection workflows | Partial | Yes | **Partial** — InspectionManager exists, but not integrated into a turn project view |
| Holdover / key return tracking | No | Yes | **No** |

---

## Entrata's Current Student Turn Capabilities

### What We Have (Strengths)

**1. Bulk Operations at Scale**
The crown jewel. Our bulk tools handle massive transaction volumes:
- Bulk Move-Out: Greystar processed 1.87K in 24 hours; Scion processed 38,766 total in Turn 2025
- Bulk Move-In: Landmark did 2.56K individual move-ins in a single day
- Bulk Place on Notice, Bulk Unit Assignment
- Performance tested: ~1.9K move-ins/hour, ~1K move-outs/hour with <1% failure rate

**2. Make Ready Board**
- Tracks unit turnover status (VR, NR, VU, NU)
- Shows progress with subtask columns (cleaning, paint, etc.)
- Filterable by property, unit, status
- Inspection column integration with InspectionManager
- Days-left countdown per unit
- Move-in/move-out date visibility

**3. InspectionManager**
- Move-in and move-out inspection workflows
- Configurable inspection templates
- Mobile inspection capability
- Integration with Make Ready Board

**4. Facilities App (Mobile)**
- Field teams can manage work orders on-site
- Inspection capabilities
- Vendor management

**5. Student-Specific Features**
- By-the-bed leasing
- Bulk Unit Assignment Board
- Group matching / roommate matching
- Academic-year lease cycles
- Student Housing (AI) — DEV-257531, completed
- Move-In Reviews Auto-Process Agent — DEV-257344, completed
- Move-Out Auto-Process Agent — DEV-257345, completed
- CSV-to-Move-In Agent (L3) — DEV-266691, new

**6. Performance & Reliability**
- Dedicated Student Turn performance testing team (Anna Devasundaram)
- Dedicated Slack channels (#student-turn-performance-testing, #student_turn_2025, #r-and-d-student-turn-2025)
- Server auto-scaling for peak days
- Turn 2025 was described as "boring" with no client complaints and 100% ticket resolution — the best possible outcome

### What We Lack (Gaps)

**1. Turn Orchestration Layer**
We have the individual tools (bulk ops, make ready, inspections) but no unified "Turn Project" view that ties them together. Operators can't see "here are all 500 units that need to turn, here's where each one is in the pipeline, and here's my overall progress."

**2. Turn-Specific Business Analytics**
From the Turn 2025 retro: "We relied on New Relic for specific, detailed data reporting, which isn't the best tool for business analytics and strategic planning." We track system performance, not turn performance.

**3. Pre-Turn Planning**
No tools for planning the turn timeline, setting budgets per unit, or scheduling vendor work in advance. Properties use external spreadsheets.

**4. Turn Cost Tracking**
No way to track turn costs per unit (labor, materials, vendor invoices) and compare against budget. This is a major differentiator for competitors.

**5. On-Site Training & Tool Awareness**
From the Turn 2025 on-site visits retro: "Properties were using printed spreadsheets instead of the system for check-ins. High staff turnover meant many employees were not properly trained. Site teams simply didn't know something existed, didn't have access, or hadn't been trained effectively."

**6. Turn-Specific Inspection Workflows**
InspectionManager handles inspections generically. There's no turn-aware inspection flow that automatically triggers the right inspections at the right time based on the turn timeline.

**7. Holdover & Key Return Tracking**
No dedicated workflow for managing key returns during mass move-out days.

**8. Cross-Property Portfolio Turn Dashboard**
No way for regional managers to see turn progress across all properties in their portfolio at a glance.

---

## Turn 2025 Retrospective Insights

The Turn 2025 retro (Sara Lencheck, September 2025) provides critical intelligence:

### What Went Well
- Bulk ops performance significantly improved due to engineering optimizations (deadlock fix reduced processing from ~24 min to 7 seconds)
- System stability — automated server upscaling worked flawlessly
- 100% resolution rate on support tickets
- "Boring" = success

### What Went Poorly
- Inspection creation issues during turn
- Inaccurate data for move-in/move-out
- Lack of tools for lease buyouts
- Reliance on New Relic for business data

### On-Site Visit Findings
- Properties using printed spreadsheets instead of Entrata for check-ins
- Staff didn't know bulk tools, BUA board, or renewal transfer workflows existed
- Wi-Fi password distribution and roommate request management were pain points
- High turnover = poor training = outside-the-system workarounds

### Planned Improvements
- Single source of truth in Domo for key data (replaces New Relic)
- New architecture for concurrency and decoupled bulk actions
- Smart alerts in Slack for system escalations
- Cost-optimized server scaling

---

## Strategic Assessment: Could We Approach This Like Lease File Audit?

The Wire signal asks this explicitly. The answer is **yes, and the approach is arguably stronger here:**

| Dimension | Lease File Audit | Student Turn |
|---|---|---|
| Data advantage | PDF extraction + ledger reconciliation | We already own all the data — leases, units, inspections, work orders, make readies, vendors |
| AI opportunity | Extract and reconcile | Orchestrate, predict, and optimize |
| Customer demand | Strong (revenue leakage) | Very strong — operators confirmed they'd cancel competitors |
| Competitive urgency | Growing awareness | Active competitors with paying customers already using our data |
| Implementation path | New capability | Extension of existing capabilities (Make Ready, Inspections, Bulk Ops) |
| Timeline pressure | Medium | **High** — Turn 2026 starts July 2026 (~4 months) |

### Proposed Approach

**Phase 1: Turn Project View (Pre-Turn 2026)**
- Unified dashboard showing all units in the turn pipeline with phase tracking
- Built on top of existing Make Ready Board and InspectionManager data
- Real-time progress visibility across the entire property
- This is the "must have" to compete with EZ Turn / Student247

**Phase 2: Turn Intelligence (Turn 2026 or Post)**
- AI-powered turn planning: predict turn duration per unit based on historical data
- Automated vendor scheduling based on predicted availability
- Budget vs. actual cost tracking per unit
- Portfolio-level turn analytics in Domo
- Smart alerts for at-risk units (falling behind timeline)

**Phase 3: Turn Automation (Post Turn 2026)**
- Automated inspection triggering based on turn phase completion
- AI-recommended vendor assignments based on work type, availability, and cost
- Predictive maintenance integration — units that will need more work get flagged early
- Integration with ELI+ for resident communication during turn

---

## Key People & Resources

| Person | Role | Relevance |
|---|---|---|
| Sara Lencheck | Student Turn Program Lead | Runs the annual turn program, owns retrospective, coordinates cross-functional |
| Sara Watts | Facilities Product | Owns Make Ready Board, Inspections, Facilities App |
| Chase (referenced in signal) | CS / Sales | Confirmed operator willingness to cancel competitors |
| Anna Devasundaram | Performance Testing | Owns student turn performance testing |
| Preetam Yadav | Engineering Leadership | Interested in recalibrating SLAs |

| Resource | Link |
|---|---|
| Turn 2025 Retro Summary | [Google Doc](https://docs.google.com/document/d/1bttMlOGmOTNkH8nZxUcL63KUipdqjaFBeOB6UAF1dy8/edit?usp=sharing) |
| Turn 2025 Retro Recording | [Google Drive](https://drive.google.com/file/d/1LR5ioOb0xPLqnAS-NKODzSVhVffx7Xsi/view?usp=sharing) |
| Turn 2025 Workbook | [Google Sheets](https://docs.google.com/spreadsheets/d/1ZutU_oRpcGhFONSFvla6G044rTXz5KzB6hkrx_-vmvk/edit?gid=5308004#gid=5308004) |
| Engineering Turn Support Logs | [Google Sheets](https://docs.google.com/spreadsheets/d/1YMho0VYC_0260z_OWHvU2t1U0EEpgi8HsMIrRYWPUJo/edit?gid=1112718438#gid=1112718438) |
| NR Turn Dashboard | [New Relic](https://one.newrelic.com/dashboards/detail/MzY2OTYyNXxWSVp8REFTSEJPQVJEfGRhOjYyOTQ0NDE) |
| Jira Student Turn Dashboard | [Jira](https://entrata.atlassian.net/jira/dashboards/10858) |
| Entrata Student Guru Card | [Guru](https://app.getguru.com/card/cLzEr4oi/EntrataStudent) |
| Make Ready Board Guru Card | [Guru](https://app.getguru.com/card/caE7Gr5i/Getting-to-Know-the-Make-Ready-Board) |
| #student-turn-performance-testing | Slack channel |
| #r-and-d-student-turn-2025 | Slack channel |

---

## Relevant Jira Epics

| Key | Summary | Status | Priority |
|---|---|---|---|
| DEV-157698 | Student Turn Project (Theseus) | In progress | — |
| DEV-257531 | Student Housing (AI) | Done | P2 |
| DEV-257344 | Move-In Reviews Auto-Process Agent | Done | P0 |
| DEV-257345 | Move-Out Auto-Process Agent | Done | P0 |
| DEV-266691 | CSV-to-Move-In Agent (L3) | New | P2 |
| DEV-271566 | AMQP connection closures — Student Turn Bulk Notice perf testing | Closed | P2 |
| DEV-274882 | Student Housing: distinct renewal status definitions vs conventional | New | P0 |

---

## Bottom Line

We have the raw infrastructure advantage — no competitor can match our bulk operations scale, our system-of-record data, or our end-to-end resident lifecycle. What we're missing is the orchestration layer that turns individual tools into a coordinated turn management experience. The competitors aren't winning because they're better at any single thing — they're winning because they provide a unified turn project view that we don't.

The Lease File Audit analogy is apt: we own all the data, we have all the primitives, and the competitors are essentially building on top of our platform via API. If we build the orchestration layer natively, we have an unfair advantage — we can integrate deeper, move faster, and offer it as part of the platform rather than as an add-on.

**Timeline urgency is real.** Turn 2026 starts mid-July. If we want something usable for this leasing season, we need to move fast. A "Turn Project Dashboard" MVP — even if it's just a unified view of Make Ready + Inspections + Bulk Op status per unit — would be enough to start the conversation with operators who are paying for EZ Turn or Student247 today.

---

## Proposal: Sara Watts — Timeboxed Phase 1 Sprint

**Proposed by:** Cal Harris & Mark (2026-03-25)

Cal and Mark are proposing that **Sara Watts** take on the initial phase of this signal, timeboxed to deliver **before Monday (2026-03-31)**. This gives Sara an opportunity to deliver in the new high-velocity way — using the Wire workflow to move from signal to tangible output in days, not weeks. Sara owns the Facilities product area (Make Ready Board, Inspections, Facilities App), which makes her the natural owner for the turn orchestration layer this signal calls for.
