# AIR Request Decision Framework

> **INTERNAL — Product Organization Only.** Not for distribution to AIR, Sales, Engineering, or other teams outside product.

> How to triage, decide, prioritize, commercialize, and communicate API integration requests from AIR Communities.

---

## 0. The Problem This Solves

### What's happening today

AIR Communities has a unique relationship with Entrata. They operate at scale, they push the platform harder than most customers, and they have direct access to product leadership. The result: they come to on-site meetings, sync calls, and ad hoc conversations expecting clear commitments on what Entrata will build and when it's coming. Product managers across multiple teams get pulled into these conversations — often without shared context on what's been promised, what's in flight, or what the commercial terms are.

Today, each AIR request is treated as a bespoke, one-off negotiation. A PM hears the request in a meeting, gives a response that ranges from "we'll look into it" to "we agree to partner on this," and that response lives in a CSV row or meeting notes. There is no shared framework for:

- **How to evaluate** whether something should be an API, a native feature, or a "use what exists" response
- **How to prioritize** across 15+ active requests spanning 6 product areas and 8+ PMs
- **How to price** — some items are offered free, some are "paid API offering," with no consistent model
- **How to communicate** — AIR gets different levels of specificity depending on who they talk to and when
- **How to say no** — or "not yet" — without damaging the relationship

### What this causes

- **Inconsistent commitments.** One PM says "we'll build it," another says "we're evaluating." AIR hears both and picks the one they prefer.
- **Surprise scope.** Engineering learns about commitments after they've been made in meetings, without input on feasibility or timeline.
- **No pricing leverage.** By the time someone asks "should we charge for this?", the capability has already been promised or delivered.
- **Meeting-driven roadmap.** Whoever is in the room when AIR asks gets put on the hook, regardless of whether it's the right priority for the product.
- **Repetitive status cycles.** The same items get re-discussed across meetings because there's no single source of truth on where things stand.

### What this framework changes

Every AIR request — past, present, and future — runs through the same decision process. Before anyone responds to AIR in a meeting, on-site, or over email, they can check the framework and give a consistent answer. The framework creates:

1. **A shared vocabulary** — 6 request classifications, 6 status labels, 4 priority tiers. Everyone uses the same words.
2. **A decision algorithm** — not judgment calls made under pressure in a conference room, but a repeatable process that separates "can we?" from "should we?" from "how do we price it?"
3. **A single tracker** — one artifact that travels to every AIR meeting, updated before every sync, owned by a coordinator (not distributed across 8 PMs).
4. **Guardrails on commitments** — no PM commits to scope, timeline, or pricing in a meeting without running it through classification and scoring first. The answer in the room is always: "Let me run this through our process and get back to you by [date]."
5. **Commercial clarity** — pricing expectations are set at the same time as scope, not after delivery.

The goal is simple: **AIR should get faster, clearer, more predictable answers — and Entrata should stop making commitments it hasn't evaluated.**

---

## 1. The Core Decision: API vs. Native

Every AIR request lands in one of four quadrants. The first question is never "can we build an API?" — it's "what is the right surface for this capability?"

### Decision Matrix

| | **AIR-only need** | **Market-wide need** |
|---|---|---|
| **Capability exists in Entrata UI** | **Expose** — wrap existing logic in a private API | **Productize** — build native feature, then optionally expose API |
| **Capability does NOT exist** | **Build private API** — scoped, paid, competitive moat | **Build native + public API** — platform investment |

### Decision Tree (per request)

```
1. Does native Entrata functionality already solve this?
   ├─ YES → Can AIR use the native UI workflow?
   │        ├─ YES → "Use existing native" — provision, train, close
   │        └─ NO (automation / scale / integration needed)
   │             → Expose private API wrapping existing logic
   └─ NO → Is this a need only AIR has, or would the market want it?
            ├─ AIR-ONLY → Build private API (paid, not public)
            └─ MARKET-WIDE → Build native feature first, then expose API
                             (native is the product; API is the delivery channel)
```

### Key Principles

- **Entrata must remain source of truth.** APIs never bypass core business logic (lease generation, inspection flows, renewal acceptance). If Entrata is the system of record, the API orchestrates _through_ Entrata, not around it.
- **Native-first when the capability serves the market.** If 50 other operators would benefit, don't build an API in a corner — build the feature natively and let the API be a programmatic interface to the same logic.
- **Private APIs are a moat.** When a capability would give competitors (third-party vendors, other proptech) equivalent power, keep it private and paid. This is an explicit competitive advantage (see: add pet/vehicle to current lease — no other vendor can do this today).
- **Don't let API requests define roadmap.** Some "API requests" are actually product gaps that should be prioritized on their own merit, not just because AIR asked.

---

## 2. Triage Algorithm

Run every new AIR request through this 5-step triage before committing to anything.

### Step 1: Classify the Request

| Classification | Definition | Example from CSV |
|---|---|---|
| **Already available** | API or native feature exists, just needs provisioning | Lease document re-generation, utility fee transparency |
| **Automation solved** | Native automation makes the API unnecessary | Rentable item move-in/move-out (automated, no API needed) |
| **Expose existing logic** | Internal logic exists but no API surface | Add pet/vehicle to current lease (sendApplication* APIs exist but are clunky) |
| **Net-new build** | Neither the logic nor the API exists today | Inspection creation API, contact distro list creation |
| **Blocked / dependent** | Requires a third party or another team to ship first | Open parking concept (Beans.AI dependent) |
| **Not feasible** | Business, legal, or architectural constraint prevents it | Central Service Software access |

### Step 2: Assess Priority

Three questions. Answer yes or no to each.

| Question | If YES |
|---|---|
| **Does this generate revenue or protect the contract?** | Moves up one tier |
| **Would not delivering this damage the AIR relationship?** | Moves up one tier |
| **Can we ship it with minimal engineering effort?** | Moves up one tier |

- 3 yes = P0 or P1
- 2 yes = P1 or P2
- 1 yes = P2 or P3
- 0 yes = P3 or decline

Use judgment within the tier. The point isn't a formula — it's forcing the three questions to be asked explicitly so the priority is defensible when someone asks "why is this P2 and not P1?"

### Step 3: Identify the Owner

Map each request to an existing PM and Jira component. From the CSV, the ownership is already clear:

| Domain | PM Owner | Jira Component Area |
|---|---|---|
| Lead to Lease / Document Execution | Paul D. / Britten R. | Leasing |
| Pet / Vehicle / Add-on APIs | Paul D. / Danner B. / Luke Mangum | Core Config / Leasing |
| Rentable Items & Amenities | Luke Mangum | Core Config |
| Inspections | Sara Watts | Facilities / Inspections |
| Message Center | Patrick Muir | Tools / Message Center |
| Renewals | Robert Jones | Leasing / Renewals |
| Customer Journey (GCLID) | Derek Hornberger | Marketing / Leasing |
| Lease Journey | Derek Hornberger | Leasing Journey |
| Lease Expiration Logic | Luke Mangum | Core Config |

### Step 4: Determine Delivery Vehicle

| Delivery vehicle | When to use | Pricing implication |
|---|---|---|
| **Provision existing** | Feature/API already built | No incremental cost (or standard API tier) |
| **Private API (paid)** | Competitive capability, AIR-specific | Custom pricing — negotiate per-endpoint or per-call |
| **Private API (included)** | Low effort, strengthens partnership, no moat risk | Included in partnership agreement |
| **Native feature + API** | Market-wide value, builds platform | Standard product pricing; API access may be add-on |
| **Declined** | Not feasible, not strategic | N/A |

### Step 5: Set Status and Communicate

| Status | Meaning | Communication Template |
|---|---|---|
| **Available now** | Provision and go | "This is ready. We'll provision access and share implementation details by [date]." |
| **In progress** | Actively being built | "We're building this for [release]. Here's the scope: [X]. We'll demo when ready." |
| **Scoping** | Committed but details TBD | "We've committed to this. Next step: scoping session with [PM] by [date]." |
| **Evaluating** | Exploring whether/how to do it | "We're evaluating the right approach. We'll share a recommendation by [date]." |
| **Declined** | Not doing it | "After review, we can't support this because [reason]. Here's the alternative: [X]." |
| **Blocked** | Dependent on external factor | "This is dependent on [Beans.AI / other team]. We'll update you when that unblocks." |

---

## 3. Prioritization Framework

### P0 — Ship Now (available or nearly ready)
- Already built, just needs provisioning
- Zero/minimal engineering effort
- Clears backlog and builds goodwill

**Examples from CSV:**
- Lease document re-generation (available today)
- Utility fee transparency (confirmed complete via getPropertyFees)
- Rentable item move-in automation (shipped, no API needed)
- Renewal offer acceptance API (built, ready to provision)

### P1 — Build Next (high value, scoped)
- High strategic score (>35)
- Engineering has capacity
- Clear scope and owner

**Examples from CSV:**
- Add pet/vehicle/add-on to current lease (purpose-built API — competitive moat)
- Create renewal offer with term filtering (fast-follow on existing API)
- Inspection creation API (if InspectionManager is contracted)

### P2 — Plan for Release (medium value, needs design)
- Market-wide value but requires native feature work first
- Multiple teams involved
- Needs scoping sessions

**Examples from CSV:**
- Message Center distro list + send APIs (throttle/pricing considerations)
- Mid-lease rentable item API (lease ID-based instead of application ID)
- Current resident add-on self-service (Homebody + ResidentPortal + Core Config)

### P3 — Monitor / Defer
- Blocked on dependencies
- Low strategic score
- Speculative or unclear requirements

**Examples from CSV:**
- Open parking concept (Beans.AI dependent)
- GCLID/GCID (pushed to R1, escalated)
- Additional premiums by rentable item (Beans.AI dependent)

---

## 4. Commercialization Model

**Product does not set pricing.** Product's role is to classify whether something is a private API (paid), a standard API (included), or a native feature — and to flag when something has competitive moat value that warrants commercial protection. The actual pricing, terms, and commercial negotiation with AIR is owned by Chase/Sales.

### What Product Decides

| Decision | Product owns | Chase/Sales owns |
|---|---|---|
| Should this be a private or public API? | Yes | — |
| Does AIR need to contract the underlying product? | Yes | — |
| Do we need usage limits/throttles? | Yes (recommend) | Yes (enforce in contract) |
| What does it cost? | — | Yes |
| What's the billable unit? | — | Yes |
| Contract terms and legal review? | — | Yes |

### Product Principles (what we control)

1. **Flag revenue-generating APIs to Chase/Sales.** When product classifies something as a private API, that's a signal to the commercial team: "this has value, price it accordingly." The pet/vehicle API is a clear example — no other vendor can do this today.
2. **Require the underlying product.** Inspection APIs require InspectionManager to be contracted. Renewal APIs assume the renewal module is active. Don't let API access bypass product licensing.
3. **Recommend usage limits for high-volume APIs.** Message Center APIs (distro lists, send message) need limits/throttles — flag this to Chase/Sales so it's reflected in the commercial terms.
4. **Automation that replaces an API request is a win.** The rentable item move-in/move-out automation eliminated the need for an API entirely. Best outcome: native automation > API.

### Handoff to Chase/Sales (per paid API)

When product classifies an API as "private (paid)," Jim sends Chase/Sales the following:

- [ ] API name and 1-sentence description
- [ ] Why it's private (competitive moat rationale)
- [ ] Whether underlying product contract is required
- [ ] Recommended usage limits/throttles (if any)
- [ ] Any pricing expectations already set with AIR (so Sales knows the starting position)

---

## 5. Communication Cadence

### Internal (Entrata)

| Audience | Frequency | Format | Content |
|---|---|---|---|
| PM owners | Weekly async | Slack thread or doc update | Status of their assigned items, blockers, decisions needed |
| Engineering leads | Bi-weekly | Sync or async brief | Upcoming API work, capacity needs, architecture questions |
| Catherine / Leadership | Monthly | 1-page summary | Tracker snapshot, decisions made (with rationale), items declined, items escalated |
| API team (Aaron, etc.) | As needed | Direct | Provisioning requests, implementation details, testing |

### Leadership Visibility and Escalation

The framework gives Catherine a clear audit trail of why decisions were made: what was classified as what, why something was prioritized P1 vs. P2, and why something was declined. The monthly summary from Jim should make it easy to scan decisions without having to be in every meeting.

**Escalations still happen.** This framework doesn't eliminate the need for leadership involvement — it reduces the noise so that when something does escalate, it's genuinely contentious and not just a status question that should have been answered at the PM level. AIR may still go around the framework and push directly to leadership. When that happens, Catherine can point back to the tracker: "Here's the current status and rationale. If you want to override the priority, here's what that trades off against."

### External (AIR)

| Cadence | Format | Content |
|---|---|---|
| Sync meetings (existing) | CSV-style tracker update | Status column updated, next steps clear, blockers called out |
| Between meetings | Email/Slack | Proactive updates when status changes (don't wait for the meeting) |
| Demos | When P1 items ship | Show the capability working; get sign-off before provisioning |

### Communication Templates

**"Available now" update:**
> [Feature] is ready. We've provisioned access to [API endpoint / native feature] in [environment]. Implementation details are [attached / linked]. Please confirm testing is successful by [date].

**"We're building it" update:**
> [Feature] is in active development targeting [release]. Scope: [1-2 sentence summary]. We'll demo the capability in [timeframe]. Any questions or adjustments before then?

**"We solved it differently" update:**
> After reviewing the request for [API], we found that [native automation / existing feature] accomplishes the same goal without requiring a custom API. Here's how it works: [brief explanation]. We'd like to walk you through it — can we schedule [time]?

**"Declined / not feasible" update:**
> We've reviewed the request for [feature] and unfortunately cannot support it because [business/technical/legal reason]. The closest alternative is [X]. We're happy to discuss how to work within that constraint.

---

## 6. Meeting Rules of Engagement

The most dangerous moment in the AIR relationship is a meeting where a PM is put on the spot. These rules apply to every AIR interaction — sync calls, on-site visits, hallway conversations, Slack threads.

### Before Any AIR Meeting

| Step | Who | What |
|---|---|---|
| **Update the tracker** | Meeting coordinator | Every item has a current status, owner, and next-step date. No stale rows. |
| **Brief the PMs attending** | Coordinator or VP | "Here's what AIR will likely ask about. Here's what you can and cannot commit to." |
| **Align on new request protocol** | All PMs | If AIR raises something new, the answer is always the deferral script (below). Never commit on the spot. |

### The Deferral Script (for new requests raised in meetings)

When AIR raises a new request in a meeting, the default response is:

> "That's a good use case. Let me take this back, run it through our evaluation process, and get you a clear answer on approach, timeline, and any commercial considerations by **[specific date, max 2 weeks out]**."

This is not stonewalling — it's professionalism. It protects both sides from commitments that haven't been evaluated.

**When a PM can go beyond the deferral:**
- The request maps to something already classified as "Available now" in the tracker — they can confirm availability and offer to provision
- The request is a clarification on something already "In progress" — they can share current status
- The PM is the explicit owner and has already scored/classified the item

**When a PM must use the deferral:**
- Any new request not yet in the tracker
- Any request that involves pricing or commercial terms
- Any request that would commit engineering resources or timelines
- Any request the PM doesn't own (even if they have an opinion)

### During the Meeting

| Rule | Why |
|---|---|
| **Walk the tracker top to bottom** | Forces structured updates instead of reactive discussion |
| **Status first, then details** | AIR hears the answer before the backstory |
| **Flag blockers explicitly** | "This is blocked on Beans.AI" is better than "we're still working on it" |
| **Capture new requests in the tracker live** | Don't let new items float in meeting notes — add them to the tracker with status "Evaluating" immediately |
| **Name the next step and date for every item** | No item leaves the meeting without "who does what by when" |

### After the Meeting

| Step | Who | Timeline |
|---|---|---|
| Update tracker with any status changes | Coordinator | Same day |
| Send meeting summary to AIR with status snapshot | Coordinator | Within 24 hours |
| Distribute new requests to PM owners for triage | Coordinator | Within 48 hours |
| Complete triage on new requests | Assigned PMs | Within 2 weeks (per deferral commitment) |

### Coordinator: Jim

**Jim spearheads the AIR coordination.** He doesn't own every request — PMs still own their domains — but he runs the process:

- Owns the tracker and keeps it current
- Briefs PMs before AIR meetings
- Runs the meeting agenda (tracker walkthrough)
- Sends the post-meeting summary
- Chases PMs who owe triage responses
- Escalates when items are stuck

**Product leader sign-off:** When Jim runs a new request through triage (classification, priority, delivery vehicle), the result gets signed off by the relevant product leader before it's communicated to AIR. Jim coordinates; product leaders approve. This keeps decisions grounded in product strategy, not just relationship management.

---

## 7. Anti-Patterns to Avoid

| Anti-Pattern | Why It's Dangerous | What to Do Instead |
|---|---|---|
| **Treating each request as bespoke** | No consistency, no leverage, no institutional memory; every meeting starts from scratch | Run every request through the same 5-step triage — the framework is the process, not the PM's judgment in the moment |
| **Committing in the room** | PM is under social pressure; scope/timeline/pricing haven't been evaluated | Use the deferral script; commit to a response date, not a response |
| **Saying "yes" without pricing** | Creates expectation of free access; hard to add cost later | Set pricing expectations in the same conversation where you commit to building |
| **Building an API when native solves it** | Wasted engineering effort, fragmented experience | Always check if native Entrata capability + training eliminates the need |
| **Public API for partner-only capability** | Gives competitors the same power; destroys moat | Default to private; only go public when it serves the market strategy |
| **Letting API requests drive roadmap** | Partner tail wags the product dog | Separate "API surface" decisions from "capability" decisions; capability should serve the market |
| **Vague "we'll look into it" responses** | Erodes trust, creates ambiguity | Every item leaves a meeting with a clear status, owner, and next step with a date |
| **Provisioning without confirming scope** | Feature may not match expectations | Always demo or provide implementation details before "go live" |

---

## 8. Running This Framework Going Forward

For every new AIR request:

1. **Classify** (Step 1) — what kind of request is this?
2. **Score** (Step 2) — how important is it?
3. **Assign** (Step 3) — who owns it?
4. **Decide** (Step 4) — API, native, or decline?
5. **Get pricing input** (Section 4) — Chase/Sales provides commercial terms
6. **Communicate** (Step 5) — clear status, owner, date
7. **Track** — Jim updates the tracker before every sync meeting

The goal is to walk into every AIR sync with zero ambiguity: every item has a status, an owner, a next step, and a date. This framework could eventually apply to other strategic partners, but right now AIR is where the inconsistency is costing us cycles and credibility. Fix AIR first.
