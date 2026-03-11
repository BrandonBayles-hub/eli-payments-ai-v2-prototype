# Product OS Workspace -- Agent Context

You are working inside a **Product OS Workspace**, the personal working environment for an Entrata product manager. **This is where all prototypes, specs, plans, and handoff artifacts are created.**

## First-Run Detection

**Before doing anything else**, read `./context/me.md`. If it still contains placeholder text (`[Your Name]`, `<!-- Your full name`, or similar unfilled markers), this PM has not been onboarded yet.

**If context files have placeholders:** Invoke the `/first-run` skill immediately. This walks the PM through setup interactively. Do not wait for them to ask -- start the onboarding flow.

**If context files are filled in:** Proceed normally. Always read `./context/memory.md` at the start of a session — it contains the PM's accumulated preferences, decisions, and corrections.

## Memory

The file `./context/memory.md` is a running log of what you learn about this PM. When you discover something worth remembering — a preference, a decision, a correction, a recurring pattern — **append it to the appropriate section in `memory.md`**. Keep entries concise (one line each). The PM can also edit this file directly. Read it at the start of every session so you don't repeat mistakes or forget preferences.

## Architecture

This workspace is one of three sibling repos that form the Product OS:

```
../prototype-sandbox/     -- Entrata design system, UI components (READ-ONLY reference)
../product-spec-kit/      -- Shared skills, templates, onboarding, governance (READ-ONLY reference)
./                        -- THIS WORKSPACE: where the PM builds prototypes and does their daily work
```

All three must be added to the same Cursor multi-root workspace. Skills from `product-spec-kit` are discovered automatically by Cursor.

## Where Prototypes Live

**Prototypes are always built in this workspace** at `./prototypes/<feature-name>/`. The sandbox (`../prototype-sandbox/`) is the design system -- you read components and patterns from it, but never write files there. Each prototype lives on the PM's epic branch and gets committed/pushed from here.

**Importing sandbox components:** The workspace has Vite aliases for the sandbox:
- `@sandbox` → `../prototype-sandbox/src/`
- `@sandbox-components` → `../prototype-sandbox/src/components/`
- `@sandbox-lib` → `../prototype-sandbox/src/lib/`

Use these in prototype code: `import { Button } from '@sandbox-components/ui/Button'`. If a sandbox component isn't available, create a local version in the prototype folder.

## Control Center

This workspace includes a local web app (`src/`) that serves as the PM's visual control center. Run `npm run dev` to start it on `http://localhost:5174`. It shows prototypes, context files, tasks, and available skills. The Control Center auto-discovers prototypes from `./prototypes/*/metadata.json`.

## Staying Up to Date

This workspace tracks the template repo (`pm-workspace-template`) as a Git remote called `upstream`. When the template is updated with bug fixes, new features, or improved skills, the PM can pull those changes without losing their personal work.

- **Personal files are protected.** `.gitattributes` marks `context/`, `prototypes/`, `scratch/`, and `knowledge/` with `merge=ours` — they are never overwritten by upstream merges.
- **Platform files get updated.** `src/`, `AGENTS.md`, `.cursor/rules/`, `vite.config.ts`, `package.json` receive template improvements.
- **The Control Center shows when updates are available.** The sidebar sync indicator turns blue when the template has new commits.
- **To update:** Invoke `/update-workspace` or run `git fetch upstream && git merge upstream/main` in the terminal.

## How to Find Things

- **Skills** are discovered automatically from `../product-spec-kit/.cursor/skills/`. New skills are added regularly — check the Control Center's Skills page or browse the folder directly. Invoke any skill by typing `/skill-name` in Cursor chat.
- **Templates** are in `../product-spec-kit/artifacts/templates/` (`handoff-template.md`, `plan-template.md`)
- **Design system (read-only)** is in `../prototype-sandbox/` (`CLAUDE.md`, `COMPONENTS.md`, `docs/`)
- **PM context** is in `./context/` (`me.md`, `product-area.md`, `memory.md`, `tasks.md`)
- **Prototypes** are in `./prototypes/` (created by `/create-prototype`)

## Organization

- **`entrata-product`** is the GitHub organization for all product repos
- **`entrata`** is the engineering GitHub organization -- PMs do not have write access

## What NOT to Do

- Do NOT create prototypes in `../prototype-sandbox/` -- build them here in `./prototypes/`
- Do NOT modify files in `../product-spec-kit/` (that's governed by the board)
- Do NOT modify files in `../prototype-sandbox/` (that's the shared design system)
- Do NOT commit secrets, API keys, or tokens
- Do NOT push directly to main in shared repos
- Do NOT reference the `entrata` org in any content created here
