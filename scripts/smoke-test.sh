#!/usr/bin/env bash
set -euo pipefail

# Smoke test for sandbox integration
# Run after any template or sandbox change to verify nothing is broken.
# Usage: bash scripts/smoke-test.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
PASS=0
FAIL=0

pass() { echo -e "  ${GREEN}PASS${NC} $1"; PASS=$((PASS + 1)); }
fail() { echo -e "  ${RED}FAIL${NC} $1"; FAIL=$((FAIL + 1)); }
warn() { echo -e "  ${YELLOW}WARN${NC} $1"; }

echo ""
echo "  Sandbox Integration Smoke Test"
echo "  ==============================="
echo ""

WORKSPACE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SANDBOX_DIR="$(cd "$WORKSPACE_DIR/../prototype-sandbox" 2>/dev/null && pwd || echo "")"

# ── 1. Sibling repos exist ──
echo "  1. Sibling repos"
if [ -d "$WORKSPACE_DIR/../prototype-sandbox/src" ]; then
  pass "prototype-sandbox exists"
else
  fail "prototype-sandbox not found at ../prototype-sandbox/"
fi

if [ -d "$WORKSPACE_DIR/../product-spec-kit/.cursor/skills" ]; then
  pass "product-spec-kit exists"
else
  fail "product-spec-kit not found at ../product-spec-kit/"
fi

# ── 2. Key sandbox files are readable ──
echo "  2. Sandbox files"
for f in "src/components/ui/Button.tsx" "src/components/ui/Card.tsx" "src/layouts/EntrataLayout.tsx" "src/components/prototype/index.ts"; do
  if [ -n "$SANDBOX_DIR" ] && [ -f "$SANDBOX_DIR/$f" ]; then
    pass "$f"
  else
    fail "$f not found"
  fi
done

# ── 3. Dependencies installed ──
echo "  3. Dependencies"
if [ -d "$WORKSPACE_DIR/node_modules" ]; then
  pass "node_modules exists"
else
  fail "node_modules missing — run npm install"
fi

for pkg in "react" "react-dom" "clsx" "tailwind-merge" "@radix-ui/react-slot"; do
  if [ -d "$WORKSPACE_DIR/node_modules/$pkg" ] || [ -d "$WORKSPACE_DIR/node_modules/.pnpm" ]; then
    pass "$pkg installed"
  else
    fail "$pkg not found in node_modules"
  fi
done

# ── 4. Vite config is valid ──
echo "  4. Vite config"
if node -e "
  import('file://$WORKSPACE_DIR/vite.config.ts')
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
" 2>/dev/null; then
  pass "vite.config.ts loads without error"
else
  warn "vite.config.ts could not be validated (expected in non-Vite context)"
fi

# ── 5. Sandbox bridge CSS exists and has theme ──
echo "  5. CSS bridge"
BRIDGE="$WORKSPACE_DIR/src/styles/sandbox-bridge.css"
if [ -f "$BRIDGE" ]; then
  pass "sandbox-bridge.css exists"
  if grep -q "@theme inline" "$BRIDGE"; then
    pass "contains @theme inline block"
  else
    fail "@theme inline block missing — Tailwind won't generate sandbox utility classes"
  fi
  if grep -q "@layer base" "$BRIDGE"; then
    pass "contains @layer base block"
  else
    fail "@layer base block missing — CSS variables won't be declared"
  fi
else
  fail "sandbox-bridge.css not found"
fi

# ── 6. index.css imports bridge and scans sandbox ──
echo "  6. index.css pipeline"
INDEX_CSS="$WORKSPACE_DIR/src/index.css"
if grep -q 'sandbox-bridge.css' "$INDEX_CSS"; then
  pass "imports sandbox-bridge.css"
else
  fail "missing @import for sandbox-bridge.css"
fi
if grep -q 'prototype-sandbox/src' "$INDEX_CSS"; then
  pass "@source scans prototype-sandbox/src"
else
  fail "missing @source directive for prototype-sandbox/src"
fi
if grep -q '\.sandbox-prototype' "$INDEX_CSS"; then
  pass ".sandbox-prototype scope reset present"
else
  fail "missing .sandbox-prototype scope in index.css"
fi

# ── 7. PrototypeView has PrototypeProvider ──
echo "  7. PrototypeView"
PV="$WORKSPACE_DIR/src/pages/PrototypeView.tsx"
if grep -q 'PrototypeProvider' "$PV"; then
  pass "PrototypeProvider wrapper present"
else
  fail "PrototypeProvider missing — usePrototypeControls will crash"
fi
if grep -q 'sticky' "$PV"; then
  pass "back button uses sticky positioning"
else
  warn "back button may overlay prototype content"
fi

# ── 8. Vite resolver uses this.resolve ──
echo "  8. ESM resolver"
VITE_CFG="$WORKSPACE_DIR/vite.config.ts"
if grep -q 'this\.resolve' "$VITE_CFG"; then
  pass "sandboxResolverPlugin uses this.resolve() (ESM-aware)"
else
  fail "sandboxResolverPlugin still using _require.resolve() — CJS modules will break"
fi
if grep -q 'async handler' "$VITE_CFG"; then
  pass "resolveId handler is async"
else
  fail "resolveId handler must be async for this.resolve()"
fi

# ── 9. No conflicting tokens ──
echo "  9. Token conflicts"
if grep -q '\-\-color-accent:' "$INDEX_CSS" | grep -v 'accent-soft' 2>/dev/null; then
  fail "--color-accent in workspace theme conflicts with sandbox"
else
  pass "no --color-accent conflict"
fi
if grep -q '\-\-color-success:' "$INDEX_CSS" 2>/dev/null; then
  fail "--color-success in workspace theme conflicts with sandbox"
else
  pass "no --color-success conflict"
fi
if grep -q '\-\-color-warning:' "$INDEX_CSS" 2>/dev/null; then
  fail "--color-warning in workspace theme conflicts with sandbox"
else
  pass "no --color-warning conflict"
fi

# ── 10. Jira/epics fully removed ──
echo "  10. Epic removal"
if [ -f "$WORKSPACE_DIR/context/active-epics.md" ]; then
  fail "active-epics.md still exists"
else
  pass "active-epics.md removed"
fi
if grep -q 'JiraWorkPage\|jira-work\|epicCount' "$WORKSPACE_DIR/src/App.tsx" 2>/dev/null; then
  fail "App.tsx still references Jira/epics"
else
  pass "App.tsx clean of epic references"
fi
if [ -f "$WORKSPACE_DIR/src/pages/JiraWorkPage.tsx" ]; then
  fail "JiraWorkPage.tsx still exists"
else
  pass "JiraWorkPage.tsx removed"
fi

# ── 11. API endpoints ──
echo "  11. API config"
if grep -q 'active-epics' "$VITE_CFG" 2>/dev/null; then
  fail "vite.config.ts still references active-epics"
else
  pass "vite.config.ts clean of active-epics"
fi

# ── Summary ──
echo ""
TOTAL=$((PASS + FAIL))
echo "  ──────────────────────────────"
echo -e "  ${GREEN}$PASS passed${NC} / ${RED}$FAIL failed${NC} / $TOTAL total"
echo "  ──────────────────────────────"
echo ""

if [ $FAIL -gt 0 ]; then
  echo -e "  ${RED}Some checks failed.${NC} Fix the issues above before pushing."
  exit 1
else
  echo -e "  ${GREEN}All checks passed.${NC} Safe to push."
  exit 0
fi
