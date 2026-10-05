# CONTEST RULES (Zero-Tolerance Violations)
- Frontend only. Zero backend servers, serverless functions, Firebase, Supabase, Appwrite, or remote databases. Persistence = localStorage only (prefixed `app:v1:`).
- All code written fresh in this repository. Starter = create-vite (React + TS). No pre-written templates or old codebases.
- Zero secrets or API keys in code or git. If an AI feature exists, the user types their key into the UI, and the app's core features must work 100% offline without AI.
- Full Bilingual Parity: Every user-visible string, button, badge, and sample seed record exists in both English and Bengali (bn/en) with an instant header toggle. Zero hardcoded strings.
- Commit Discipline (Rule 8.4): Commit at least once every 25 minutes (min 3 total). Every commit message format:
  Line 1: Concise summary of what changed
  Line 2+: Prompt: "<the exact prompt given to you>" (or "Manual edit")
  Never rewrite git history, never rebase pushed commits, never force push.
- Only external HTTPS CORS APIs allowed, and the app must function smoothly if they fail.
- Public HTTPS deployment (Vercel) must load without login in latest Chrome by T+90.

# STACK & ARCHITECTURE (Fixed)
- Vite + React 19 + TypeScript (Strict)
- Styling: Tailwind CSS v4 with Material 3 Expressive design tokens in tokens.css.
- Theming: Full Light / Dark / System mode toggle using M3 tonal surface tokens.
- Typography: 'Hind Siliguri' (Bengali, line-height: 1.75, letter-spacing: 0.015em) + 'Inter' (English). Google Fonts with system fallbacks. Never use congested Bengali typefaces.
- Icons: Crisp, authored inline SVGs (1.5px–2px stroke). STRICTLY FORBIDDEN: unicode emojis as icons (Kole Jain Mistake #1).
- State: React useState/useReducer + typed `useLocalStorage` hook with try/catch and safe defaults. Zero state libraries.
- Routing: Hash-based or single-page tabs. Static hosting safe.

# PONYTAIL ANTI-BLOAT GUARDRAILS (Senior Pragmatic Dev)
- "The best code is the code you never wrote."
- Follow the 7-step decision ladder before writing code:
  1. YAGNI: If the brief didn't explicitly mandate it, do not build it.
  2. Reuse: Use existing state and components before creating new ones.
  3. Native First: Leverage HTML5 native attributes (`type="date"`, form validation) over complex JS widgets.
  4. Max ~150 lines per component. Split only when necessary to eliminate true duplication.
  5. Zero unnecessary abstractions, zero barrel files (`index.ts` re-exports), zero helper utilities nobody called.

# MATERIAL 3 EXPRESSIVE DESIGN RULES (No Slop, Kole Jain Verified)
- Elevation via Tonal Surfaces, NEVER 1px Border Slop (Kole Jain Mistake #3):
  * Surface = background (`#fbfcfe` light / `#0e1415` dark)
  * Surface Container Low = task cards (`#f5f6f8` light / `#161c1d` dark)
  * Surface Container = app bar (`#eff1f2` light / `#1b2021` dark)
  * Surface Container High = active input dock (`#e9ebec` light / `#252b2c` dark)
  * Surface Container Highest = chips & tags (`#e3e5e7` light / `#303637` dark)
- FORBIDDEN: Native browser `<select>` with OS popovers (Kole Jain Mistake #4), backdrop-filter, blur, glass panels, gradient card backgrounds, neumorphism, glow effects, emoji icons.
- Replace dropdowns with M3 Filter Chips: Clickable tonal chips with active checkmark icons.
- Spacing & Shapes:
  * 4 / 8 / 12 / 16 / 24 / 32 / 48 grid.
  * Buttons = full pill (`rounded-full`, 48px height).
  * Cards = 20px–28px rounded corners (`rounded-[28px]`).
  * Chips = 12px squircle or pill.
- One Screen, One Job: Mobile-first and desktop-capable. Minimum touch targets = 48px on all interactive elements.
- Tactile Motion: Spring-based easing (`active:scale-[0.98]`, 200–350ms) on state changes.
- Designed States: Every screen must feature designed Empty, Loading, and Error states, plus natural completed task separation.

# DATA & LOCALSTORAGE RULES
- Keys prefixed `app:v1:` with versioning. Wrap all reads/writes in try/catch.
- Seed data comes from the problem brief. Must include rich bilingual records (English and Bengali). Provide a "Reset demo data" action.
- Provide export (UTF-8 BOM CSV / JSON) if the brief asks for data outputs.
- Localize all dates and numbers via `Intl` (`bn-BD` for Bengali, `en-US` for English).

# WORKFLOW RULES
- Follow the MASTER PROMPT phases in sequence.
- STOP and await user confirmation only at GATE 1 (Plan Approval) and GATE 2 (Freeze Check).
- Before claiming any task done: run `npm run build` and verify 0 TypeScript/bundler warnings or errors.
