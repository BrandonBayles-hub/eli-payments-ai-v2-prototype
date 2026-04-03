# Maintenance AI — Top 5 Issues a Pre-Go-Live Validation Layer Would Have Caught

**Author:** Cal Harris
**Date:** 2026-04-02
**Sources:** Jira (39 tickets), Zendesk (25 tickets), ~100 Slack channels, incident reports, ELI+ Transition Brief, ELI+ Issue Landscape, Project Amplify wire signals

---

## Executive Summary

After reviewing the full Maintenance AI issue inventory, five issues trace back to missing automated validation — not to any team's execution. Every one shares the same root cause: no system-enforced checks before go-live, no safety gates on critical settings, and no unified activation/deactivation mechanism. These are tooling and process design gaps, not performance gaps.

These issues have already produced a formal legal termination notice (Burkentine), emergency dispatch failures (Aster at Lely Resort), and at least one client refusal to onboard Maintenance AI entirely.

---

## 1. Emergency Calls Going to the Office Instead of On-Call / CallMax

**What happened:** At Burkentine (Abbey Place), after-hours emergency calls routed to the property office instead of the emergency answering service (CallMax). Residents with real emergencies hit a voicemail during nights and weekends.

**Why the system didn't catch it:** After-hours routing and emergency contact numbers are per-property settings that must be configured before go-live. There is no safe default — if the emergency number field is empty, calls go nowhere or fall back to office hours behavior. The transition brief confirms this is one of the **8 high/critical-risk settings** with no safe default. No automated check exists to flag this before activation.

**What would have caught it:** A **safety gate** that blocks Maintenance AI go-live on any property without a verified emergency contact number. The prototype checklist models this as `isSafetyGate: true` on the `emergency_contacts` item — but the actual go-live workflow doesn't enforce it today.

**Evidence:** SLACK-MAI-9 (Abbey Place), DEV-272759, DEV-272752, Transition Brief (critical-risk settings), ZD (Aster at Lely Resort emergency dispatch failure)

---

## 2. Maintenance AI Section Not Visible / Settings Page Greyed Out

**What happened:** Bayshore Properties could not see the Maintenance AI section in the ELI+ Console at all (ZD-673448, urgent). Separately, at least 6 other clients (REPAG, General Management Services, HHHunt, Flaherty & Collins, Burkentine, Triton) reported ELI+ settings pages greyed out or not appearing after contracting.

**Why the system didn't catch it:** The settings visibility depends on a provisioning chain — contract exists in Client Admin, feature flags enabled, user permissions synced, Colleen Admin shells created. If any step is incomplete or out of order, the client sees nothing. There is no health check that confirms the settings page is accessible before marking a property as "live."

**What would have caught it:** An automated **provisioning validation** that runs after contract issuance and confirms: (a) feature flags are on, (b) Colleen shells exist, (c) admin users are synced, (d) settings page renders. Block the workflow from proceeding until validation passes.

**Evidence:** ZD-673448, ELI+ Issue Landscape Section 3 (6+ clients), DEV-265017

---

## 3. Chatbot Still Active After Maintenance AI Disabled

**What happened:** When Burkentine requested Maintenance AI be turned off (March 31, after the wrong-resident incident), the chatbot remained active on the resident portal. Residents went through the entire maintenance request flow only to receive an error at the end telling them to call their office. Bob Duclos flagged it; engineering had to manually disable properties via code because disabling the contract doesn't disable the chatbot.

**Why the system didn't catch it:** There is no unified disable flow. The "off switch" only touches the contract layer — it doesn't cascade to the chatbot, SMS, or voice channels. This means there's also no unified "on switch" that validates all channels are ready before go-live.

**What would have caught it:** A **single activation/deactivation toggle** that controls all channels (contract, chatbot, SMS, voice, email) in one action. During go-live, this same toggle would serve as the validation gate — if it can't cleanly turn off, it shouldn't cleanly turn on.

**Evidence:** `#burkentine-eli-discussion` (Bob Duclos, Manish Ranjan, Nathan Smileye — March 31), ELI+ Issue Landscape Section 3

---

## 4. Phone Number Validation Failures Blocking Setup

**What happened:** Multiple clients (Wizard City, Castle Black, Springwood, Green Dragon, Blackwater) had Maintenance AI setup fail because phone numbers didn't pass E164 validation during the Client Admin sync step. The numbers existed in Entrata but were formatted incorrectly for the Colleen Admin ingestion. Separately, DEV-265017 documents a phone number validation issue that blocked the "Turn On Maintenance AI" workflow entirely.

**Why the system didn't catch it:** Phone numbers are entered in various formats across Entrata properties. The Colleen Admin expects E164 format. There is no pre-flight format validation or auto-correction — so setup simply fails silently or blocks with a cryptic error.

**What would have caught it:** A **pre-sync data quality check** that validates all phone numbers against E164 format before attempting the CA sync, with auto-correction for common formatting issues (missing country code, parentheses, dashes) and clear error messages for genuinely invalid numbers.

**Evidence:** SLACK-MAI-3, DEV-265017, DEV-270340 (invalid phone blocks WO creation), DEV-236282 (phone format fixes — resolved)

---

## 5. Problem/Location Categories Force Client to Redo Working Configurations

**What happened:** Maintenance AI cannot interpret existing Entrata problem/location configurations. Instead of fuzzy-matching against what clients already have set up, it demands pristine, reformatted data in its own structure. At least one client refused to onboard Maintenance AI entirely because of this. Brandon Bayles flagged this as a growth strategy blocker on the Amplify wire.

**Why the system didn't catch it:** There is no automated compatibility check between a client's existing Entrata Facilities configuration and Maintenance AI's expected data structure. The mismatch is discovered mid-setup, after the client has already committed time and resources. The rework requirement contradicts the "all-in-one platform" positioning.

**What would have caught it:** A **pre-setup compatibility scan** that runs against the client's existing problem/location taxonomy and produces a report: (a) categories that map 1:1, (b) categories that need minor adjustment, (c) categories with no match. This converts a surprise mid-setup into a known scope item during the sales/scoping phase.

**Evidence:** Transition Brief (Gap #3, severity High), `project-amplify/wire/signals.md` (MAINTENANCE-AI-GROWTH-STRATEGY — "problem/location rebuild has caused client refusal to onboard"), ELI+ Issue Landscape (Burkentine)

---

## The Pattern: What These 5 Have in Common

Every one of these issues shares the same root cause structure:

| Pattern | How It Shows Up |
|---|---|
| **No validation before go-live** | Settings are empty, phone numbers are wrong, categories don't match — and nobody checks until a resident hits the problem |
| **No safety gates** | Critical settings (emergency numbers, after-hours routing) have no enforcement mechanism that blocks activation |
| **No unified on/off switch** | Turning a product "on" doesn't guarantee all channels are ready; turning it "off" doesn't guarantee all channels stop |
| **No pre-flight compatibility check** | The implementation team discovers data mismatches mid-implementation instead of during scoping |
| **No automated provisioning chain** | Every step (shells, flags, users, settings, phone numbers) is manual and unvalidated |

---

## What Would Fix This Systematically

Rather than patching each issue individually, a single architectural intervention would address all five:

**An automated pre-go-live checklist with hard gates.** Before Maintenance AI can be activated on any property:

1. Emergency contact number is populated and validated — **hard gate**
2. After-hours routing is configured — **hard gate**
3. Phone numbers pass E164 validation — auto-correct or block
4. Settings page is visible and populated — provisioning health check
5. Problem/location categories are mapped — compatibility report
6. Facilities Pro routing does not conflict — automated check
7. All channels (chatbot, SMS, voice) are provisioned and tied to the same activation toggle

This is exactly what the `eli-plus-implementation-tracker` prototype models — but it doesn't exist in production yet.

---

## Reference: Issue-to-Jira Mapping

| Issue | Key Jira / Zendesk IDs |
|---|---|
| Emergency routing | DEV-272759, DEV-272752, DEV-272730, DEV-273232, SLACK-MAI-9 |
| Settings not visible | ZD-673448, DEV-265017 |
| Chatbot disable gap | No Jira (process gap — #burkentine-eli-discussion) |
| Phone validation | DEV-265017, DEV-270340, DEV-236282, SLACK-MAI-3 |
| Problem/location rebuild | Transition Brief Gap #3, MAINTENANCE-AI-GROWTH-STRATEGY wire signal |
