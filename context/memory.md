# Memory

> This is a running log of what the AI has learned about you and how you work. It grows over time as you interact with Cursor. Think of it as the AI's notes about your preferences, patterns, and decisions.
>
> **You can edit this directly** — add things you want the AI to always remember, or remove things that are no longer true.

## Preferences

- When working on the ELI guided setup comparison, **start both dev servers**: original `eli-guided-setup` on **http://localhost:3001** and `eli-guided-setup-accessible` on **http://localhost:3002** (run both with `npm run dev` from each folder). If ports are busy, free 3001/3002 first so ports stay fixed (`strictPort` is on for both).

<!-- Things the AI learns about how you like to work. Examples: -->
<!-- - I prefer bullet points over long paragraphs -->
<!-- - Always show me the plan before building -->
<!-- - I like seeing 2-3 options before committing to an approach -->

## Decisions

<!-- Key decisions you've made that the AI should remember. Examples: -->
<!-- - We decided to use tab navigation instead of a sidebar for the audit tool -->
<!-- - Engineering prefers we hand off prototypes with PLACEMENT.md, not PRs -->
<!-- - Our team uses "resident" not "tenant" in all copy -->

## Patterns

<!-- Recurring things the AI should know about your workflow. Examples: -->
<!-- - I usually work on one epic at a time -->
<!-- - I demo prototypes to my team every Thursday -->
<!-- - I commit at the end of each work session, not continuously -->

## Corrections

- Netlify sites with visitor password protection return HTTP 401 to unauthenticated requests (e.g. `musical-griffin-399619.netlify.app`). That is not a broken deploy—the in-IDE/automated browser cannot see the real app without the site password. For public or agent review, disable access control on that site or use an unprotected deploy preview; share `https://` links (http 301s to https).

<!-- Things the AI got wrong that it should not repeat. Examples: -->
<!-- - Don't use the old Entrata color palette (#1a73e8), use the design system tokens -->
<!-- - My product area is Resident Portal, not Resident Experience -->
<!-- - Stop suggesting CLI commands — I use the Source Control UI -->
