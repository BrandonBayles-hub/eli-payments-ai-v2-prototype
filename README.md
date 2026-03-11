# Product OS Workspace

This is your personal workspace -- where all your daily product work lives. Plans, **prototypes**, research, and engineering handoffs all happen here. Prototypes are built in this repo, not in the prototype sandbox.

## Control Center

Your workspace includes a visual **Control Center** -- a local web app where you can browse your prototypes, edit your context files, manage tasks, and see available skills.

### Running the Control Center

```bash
npm install    # first time only
npm run dev    # starts on http://localhost:5174
```

Open `http://localhost:5174` in your browser to see your dashboard.

---

## First Time Here?

Follow these steps to get productive:

### 1. Make sure the sibling repos are in place

Your workspace needs two other repos alongside it in the same parent folder:

```
your-projects-folder/entrata-product/
├── prototype-sandbox/      <-- Entrata design system and components (read-only reference)
├── product-spec-kit/       <-- Shared skills, templates, and onboarding (read-only reference)
└── YOUR-USERNAME-workspace/ <-- THIS REPO (you are here — prototypes are built here)
```

If you don't see all three, go back to the [Quick Start Guide](https://github.com/entrata-product/product-spec-kit/blob/main/onboarding/quick-start.md) and follow Steps 1-3.

### 2. Add all three repos to your Cursor workspace

1. Open this folder in Cursor (**File > Open Folder**)
2. **File > Add Folder to Workspace** -- add `prototype-sandbox`
3. **File > Add Folder to Workspace** -- add `product-spec-kit`
4. **File > Save Workspace As** -- save so you don't have to do this again

### 3. Tell the AI who you are

Open the Cursor chat panel and say:

> Help me set up my workspace. I'm [your name], a [your role] on the [your team] team. I work on [your product area].

The AI walks you through filling in your context files conversationally -- it asks the right questions and writes the files for you.

> **Fallback:** You can also fill in context through the Control Center UI (`http://localhost:5174/context`) or edit the markdown files directly in `context/`.

| File | What Gets Filled In | Why It Matters |
|------|-------------------|----------------|
| `context/me.md` | Your name, role, product area, focus areas | The AI personalizes plans and matches your domain |
| `context/product-area.md` | Your domain, users, metrics, current state | The AI grounds specs and prototypes in your actual product |

### 4. Create your first epic branch and start working

1. Click the branch name in the **bottom-left** of Cursor (it says `main`)
2. Type your epic name in kebab-case (e.g., `lease-file-audits`)
3. Select **Create new branch**
4. Open the chat and say: **"Help me plan my feature"**

The AI takes it from there.

---

## What's in This Workspace

```
src/                  -- Control Center app (React + Vite + Tailwind)
context/              -- Your identity and domain (fill these in first)
  me.md               -- Who you are, your team, how you work
  product-area.md     -- Your product domain, metrics, competitive context
prototypes/           -- YOUR PROTOTYPES LIVE HERE (created by /create-prototype)
templates/            -- Workspace-specific templates
  epic-branch-readme.md -- README template for each epic branch
scratch/              -- Temporary work, experiments, throwaway files
knowledge/            -- Reference materials you collect over time
.cursor/rules/        -- AI behavior rules (you don't need to edit these)
```

## Daily Workflow

| When | What to Do |
|------|-----------|
| **Start of day** | Run `npm run dev`, open the Control Center. **Check the dashboard for update banners** -- if product-spec-kit or prototype-sandbox have updates, pull them (Source Control > pick the repo > `...` > Pull). This keeps your skills, templates, and design system current. |
| **Working on a feature** | Switch to your epic branch, plan, build, iterate. Commit often. |
| **Building a prototype** | Say **"help me build a prototype"** in Cursor chat. The `create-prototype` skill scaffolds in `./prototypes/` using the design system. After building, say **"review my prototype"** to run the `design-critique` skill for a quality score. |
| **End of day** | Push your branch: Source Control > `...` > Push. Your work is backed up. |
| **Handing off to engineering** | Generate a PLACEMENT.md and handoff.md, commit, push, share the branch link. |

### Staying in Sync

The Control Center dashboard checks whether `product-spec-kit` and `prototype-sandbox` have new commits on `main`. When they do, you'll see an **"Updates available"** banner with instructions to pull. This is how new skills, templates, and design system changes reach you -- pull regularly so you're always working with the latest.

## Getting Help

**AI first** -- just tell Cursor what you need. Skills are discovered automatically from `product-spec-kit` and updated regularly. See the full list in the Control Center (`http://localhost:5174/skills`) or browse `../product-spec-kit/.cursor/skills/`.

Common examples:

| What You Say | What Happens |
|-------------|-------------|
| `/create-prototype Build a lease audit tool` | Scaffolds a full prototype in `./prototypes/` using the design system |
| `/design-critique Review my prototype` | Evaluates your prototype with a scored rubric (0-100) and actionable fixes |
| `/git-coach I need help with branches` | Teaches Git concepts interactively through Cursor's source control panel |
| `/update-workspace` | Pulls the latest template updates safely (when the sidebar shows updates) |

**Still stuck?**
- **Any question:** Just ask Cursor in the chat panel — describe your problem in plain English.
- **Git questions:** Type `/git-coach` in Cursor chat.
- **Technical issues:** Post in **#ask-it-us** on Slack.
- **Process questions:** Talk to your manager.

## Creating Your Own Skills

Want to build a personal skill that works across all your projects? Put it at:

```
~/.cursor/skills/your-skill-name/SKILL.md
```

This is your **personal** skill path -- it works in every project you open. If you build something the whole team could use, propose it to the Product Spec Kit via the [governance process](https://github.com/entrata-product/product-spec-kit/blob/main/governance/contribution-guide.md).

> **Important:** Never put files in `~/.cursor/skills-cursor/` -- that's reserved for Cursor's built-in skills.

## Staying Up to Date

There are **three things** to keep current:

### 1. Shared repos (daily)

Pull from `product-spec-kit` and `prototype-sandbox` at the start of each day. The Control Center sidebar shows green (current) or amber (pull needed) for each.

### 2. Workspace template (when notified)

Your workspace tracks the template repo as a Git remote called `upstream`. When the team pushes bug fixes, new UI features, or improved platform files, you'll see a **blue indicator** in the Control Center sidebar.

To update, type `/update-workspace` in Cursor chat. The skill previews what changed, merges safely, and resolves any conflicts. Your personal files (context, prototypes, tasks, scratch) are **never overwritten** — they're protected by `.gitattributes`.

Under the hood, it runs:

```bash
git fetch upstream
git merge upstream/main
```

If you don't have the `upstream` remote yet (older workspace), add it:

```bash
git remote add upstream git@github.com:entrata-product/pm-workspace-template.git
git config merge.ours.driver true
```

### 3. Dependencies (after workspace updates)

If `package.json` changes during a workspace update, run `npm install` to pick up new packages. The `/update-workspace` skill handles this automatically.

## For Maintainers

This template is the upstream source for every PM's workspace. When you push changes here, PMs pull them via `/update-workspace` or `git merge upstream/main`.

**What's safe to change:**
- `src/` (Control Center UI) — PMs don't edit these
- `AGENTS.md`, `.cursor/rules/` — AI behavior and context
- `vite.config.ts`, `package.json`, `tsconfig*.json` — build config
- `.gitattributes`, `.gitignore`, `.cursorignore` — repo config

**What's protected (PMs own these):**
- `context/` — personal identity, epics, tasks, memory
- `prototypes/` — their feature prototypes
- `scratch/`, `knowledge/` — personal notes and references

These are marked `merge=ours` in `.gitattributes`, so upstream merges never overwrite them.

**Before pushing:**
1. Test the merge locally — clone a PM workspace, add upstream, verify `git merge upstream/main` is clean
2. Write clear commit messages — PMs see them in the `/update-workspace` preview
3. Check the [Product Spec Kit MAINTENANCE.md](https://github.com/entrata-product/product-spec-kit/blob/main/MAINTENANCE.md) for the full cross-reference map
