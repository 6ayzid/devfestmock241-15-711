You are my contest build agent. Follow AGENTS.md strictly. The time budget is 90 minutes total. Work through the phases in order. STOP only at the two gates marked GATE.

BRIEF (verbatim, including sample data and output requirements):
<<<PASTE EVERYTHING FROM THE PAPER/SCREEN HERE>>>

PHASE 1 (≈5 min) PARSE
Create SPEC.md with:
1. Requirement Checklist: Every "must" and "should" from the brief as numbered items (R1, R2...), tagged MAIN or BONUS, copied from the brief's wording. Include required outputs, formats, and sample data fields.
2. Ambiguities & Assumptions: List anything unclear, each with your default simplest assumption.
3. Judging Signals: How the problem will be evaluated based on the rulebook and brief.
Output the 3 most important ambiguities as questions I can ask the organizers before the 15-minute window closes.

PHASE 2 (≈10 min) PLAN
Add to SPEC.md:
1. User & Core Flow: Entry → One primary action → Success state in 4 linear steps.
2. Screens: Max 3 views/tabs. Max 4 visible elements per container.
3. Data Model: Entities, fields, localStorage keys (`app:v1:`), and rich bilingual seed records.
4. M3E Design System: Seed color `#006874`, tonal surface tiers, Hind Siliguri typography rules.
5. i18n Key Map: Grouped by screen/feature.
6. Scope Cut: MAIN items first. BONUS items ranked by value/effort.
7. Build Order: Vertical slices S1..Sn, each with a one-line "done when" criteria.
GATE 1: Show me the plan in under 25 lines and WAIT for "go".

PHASE 3 (≈5 min) SCAFFOLD
1. Create Vite + React + TS project, install Tailwind CSS v4.
2. Configure index.html with Google Fonts ('Hind Siliguri' + 'Inter').
3. Create tokens.css (M3E surface tokens, Hind Siliguri typography, 48px touch targets).
4. Create useLocalStorage.ts (prefixed `app:v1:`) and i18n.ts (bilingual dictionary, Intl number/date formatters, UTF-8 CSV exporter).
5. Build app shell: 64px M3 Top App Bar with DIU branding, Light/Dark/System theme switcher, and segmented [ EN | বাংলা ] pill.
6. Verify `npm run build` passes with 0 errors. Commit with Rule 8.4 prompt format.

PHASE 4 (≈40 min) BUILD VERTICAL SLICES
For each slice S1..Sn:
- Implement data → logic → UI → wired state end-to-end.
- Run `npm run build`, fix any warnings or errors immediately.
- Test in the browser.
- Commit with:
  Line 1: Summary of what changed
  Line 2+: Prompt: "<the exact prompt used for this slice>"
- Check off matching R-items in SPEC.md. Complete all MAIN tasks before any BONUS items.
- Ensure first deploy is live on Vercel by minute 35 (PHASE 5).

PHASE 5 (≈5 min, by minute 35) FIRST DEPLOY
Verify public HTTPS URL on Vercel. Open the live URL, confirm it loads without login, tests clean with empty localStorage, and matches the latest commit.

PHASE 6 (T+70) FREEZE
GATE 2: Stop adding features. Say "freeze check" and WAIT for my "ok". Then run:
a) Requirement Audit: Check every R-item in SPEC.md against the running app. Mark DONE/PARTIAL/MISSING. Fix MISSING MAIN items first.
b) Bilingual Audit: Toggle to বাংলা. Verify all text, seed records, numbers, dates, and buttons render in natural Bengali. Verify Hind Siliguri has zero clipping.
c) State Audit: Test with cleared localStorage (empty state). Test invalid inputs (error state).
d) Impeccable Refusal Pass: Purge any emojis, unstyled `<select>` dropdowns, or 1px border slop.
e) Verify `npm run build` has 0 warnings or errors.

PHASE 7 (T+80) SHIP & SUBMIT
1. Overwrite README.md matching Rule 9.3:
   - Full Name & Registration Number
   - Public HTTPS Live Link (Vercel)
   - How to run (`npm install`, `npm run dev`, `npm run build`)
   - Completed Main Features & Bonus Features
   - Known Limitations
   - AI Tools Used (Antigravity)
   - Most Useful Prompt
   - 5-Line Architecture Summary for Judges
2. Confirm LICENSE is MIT.
3. Push final commit. Confirm Vercel live URL matches the final commit hash.
4. Output: Full Final Commit SHA, Repository URL, Live URL. STOP.
