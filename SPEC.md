# Smart Escape - Specification Document (SPEC.md)

## 1. Requirement Checklist

### Main Requirements (Mandatory)
- [x] **[R1 - MAIN] JSON Validation & Import**: Load default `building.json` and allow user upload of external JSON. Validate schema (2-60 nodes, 1-150 undirected edges, >=1 room/junction, >=1 exit, unique IDs, matching initial_state types). Reject malformed/inconsistent files with clear bilingual error messages. [DONE]
- [x] **[R2 - MAIN] Interactive Map Visualization**: Render 2D SVG canvas displaying all nodes and edges at supplied coordinates. Readable labels, distinct visual styles for room, junction, and exit types, and visible corridor costs. [DONE]
- [x] **[R3 - MAIN] Start Selection & Dijkstra Routing**: User can select any unblocked room or junction as start point. Calculate lowest-cost route to an accessible open exit based on sum of edge costs. Display node sequence, destination exit, and total cost. [DONE]
- [x] **[R4 - MAIN] Deterministic Tie-Breaking**: When multiple exits or paths have equal minimum cost:
  1. Lexicographically smallest exit ID.
  2. Lexicographically smallest sequence of node IDs. [DONE]
- [x] **[R5 - MAIN] Dynamic Hazard Simulation**: Interactive toggle to block/unblock rooms and junctions, block/unblock corridors, and close/reopen exits. Visually distinguish normal, blocked, active route, and start/exit states. [DONE]
- [x] **[R6 - MAIN] Reactive Recalculation & Reset**: Instantly recalculate route on any start point or hazard change without reimporting. "Reset" button restores original `initial_state` from the loaded file. [DONE]
- [x] **[R7 - MAIN] Edge Case & Failure State Handling**:
  - If no exit is reachable: explicitly display "No route available" / "কোনো পথ উপলব্ধ নেই".
  - If selected start node is blocked: explicitly display "Starting location blocked" / "শুরুর স্থান অবরুদ্ধ".
  - Correctly handle disconnected graphs and closed exits as intermediate points. [DONE]
- [x] **[R8 - MAIN] Full Bilingual Parity (EN & BN)**: 100% bilingual UI with instant header toggle [ EN | বাংলা ]. Covers all UI labels, buttons, statuses, errors, tooltips, instructions, and seed descriptions. Localized numbers (`Intl` `bn-BD`) and dates. Zero hardcoded English strings. [DONE]
- [x] **[R9 - MAIN] M3E Design System & Accessibility**: Material 3 Expressive tokens (seed `#006874`), tonal elevation surfaces without 1px border slop, 'Hind Siliguri' + 'Inter' typography, 48px touch targets, zero emojis (pure SVGs), and no native OS `<select>` popovers (M3 filter chips only). [DONE]

### Bonus / Extension Requirements
- [x] **[R10 - BONUS] Route Walkthrough / Step-by-Step Playback**: Animated evacuation step navigation highlighting each corridor step along the computed escape route. [DONE]
- [x] **[R11 - BONUS] Quick Verification Scenarios**: 1-click execution and verification of all 5 official problem statement test checks. [DONE]
- [x] **[R12 - BONUS] Map Export (PNG) & CSV Export**: One-click high-res canvas PNG export and UTF-8 BOM CSV route telemetry export for Windows Excel. [DONE]
- [x] **[R13 - BONUS] High Contrast / Accessibility Mode**: M3 Light/Dark/System tonal surface switching with 48px minimum touch targets. [DONE]

---

## 2. Ambiguities & Assumptions

1. **Ambiguity 1 (JSON Upload vs Session State)**: Does uploading a new custom JSON replace the active simulation permanently or allow switching back to the practice building?
   * *Assumption*: Provide an active dataset switcher with default "East Annex - Practice Building" and user "Custom Upload", with ability to reset to default at any time.
2. **Ambiguity 2 (Corridor Interaction)**: How should corridors be toggled as blocked/unblocked?
   * *Assumption*: Allow clicking directly on the SVG corridor lines/cost chips on the map, plus an expandable Hazard Control panel with chip toggles for rooms, junctions, corridors, and exits.
3. **Ambiguity 3 (Ties in Sequence Comparison)**: When comparing equal-cost paths to the same exit, how is lexicographical sequence evaluated?
   * *Assumption*: Array comparison index-by-index comparing node ID strings (e.g. `['R1', 'C1'] < ['R1', 'C3']`), standard Dijkstra priority queue tie-breaker.

---

## 3. Judging Signals & Verification Matrix

- **Sample Verification Tests (Section 4.1)**:
  - *Baseline*: Start R1 $\rightarrow$ `R1 - C1 - C2 - E1` (cost: 7)
  - *Blocked C2*: Start R1 $\rightarrow$ `R1 - C1 - C3 - C4 - E2` (cost: 11)
  - *Exits Closed (E1 & E2)*: Start R1 $\rightarrow$ "No route available"
  - *Different Start*: Start R2 $\rightarrow$ `R2 - C3 - C4 - E2` (cost: 7)
  - *Blocked Start*: Start R1, then block R1 $\rightarrow$ "Starting location blocked"
- **Clean Architecture**: Single-page React 19 + TypeScript, Tailwind CSS v4, tokens.css, useLocalStorage (`app:v1:`), zero external server dependencies.
- **Bangla Parity**: Zero untranslated strings, `bn-BD` numerals (১২৩৪), typography with zero clipping in Hind Siliguri.
- **Submission Deliverables**: Git commits every $\le 30$ mins with prompts, MIT License, Section 9.3 README, baseline & reroute screenshots, live Vercel deployment.

---

## 4. User & Core Flow (4 Linear Steps)

1. **Step 1 (Select Start)**: User clicks a room or junction on the interactive map or from the start selector chip dock.
2. **Step 2 (Instant Route Calculation)**: Dijkstra solver identifies the lowest-cost exit, highlights the safe evacuation path in green/teal, and reveals step count, total cost, and node sequence.
3. **Step 3 (Simulate Hazards)**: User clicks nodes or corridors to simulate obstructions or close exits; route recomputes in real time with smooth transitions.
4. **Step 4 (Verify / Export / Reset)**: User inspects step breakdown, checks alternative options, exports map diagram if needed, or clicks Reset to restore baseline state.

---

## 5. Screen & Layout Structure (Max 3 Views / Clean M3 Tabs)

- **View 1: Evacuation Simulator (Main)**:
  - Header: M3 64px Top App Bar (DIU Smart Escape, Theme Toggle, Language Pill, Reset Button).
  - Main Panel: Interactive 2D SVG Building Map with pan/zoom/fit, interactive node cards, corridor lines with cost tags, dynamic path highlights, and hazard markers.
  - Active Dock: Current route summary badge (Exit, Total Cost, Status Banner: "Safe Route" / "Starting location blocked" / "No route available").
- **View 2: Hazard & Route Inspector (Split / Drawer)**:
  - Start node selector chips.
  - Hazard toggles (Filter chips for Blocked Rooms/Junctions, Blocked Corridors, Closed Exits).
  - Step-by-step route breakdown and playback controls.
- **View 3: Dataset Manager (Modal / Sheet)**:
  - File uploader (drag & drop JSON).
  - Schema validation report with immediate feedback.
  - Default dataset restore button.

---

## 6. Data Model & Storage

### Types
```typescript
export type NodeType = 'room' | 'junction' | 'exit';

export interface BuildingNode {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
}

export interface BuildingEdge {
  id: string;
  from: string;
  to: string;
  cost: number;
}

export interface InitialState {
  blocked_nodes: string[];
  blocked_edges: string[];
  closed_exits: string[];
}

export interface BuildingData {
  building: string;
  nodes: BuildingNode[];
  edges: BuildingEdge[];
  initial_state: InitialState;
}

export interface RouteResult {
  status: 'FOUND' | 'NO_ROUTE' | 'START_BLOCKED';
  path: string[];          // Sequence of node IDs
  edgeIds: string[];      // Sequence of traversed edge IDs
  totalCost: number;
  targetExitId: string | null;
}
```

### LocalStorage Keys (`app:v1:`)
- `app:v1:language`: `'en' | 'bn'`
- `app:v1:theme`: `'light' | 'dark' | 'system'`
- `app:v1:building_data`: Stored `BuildingData` (falls back to bundled `building.json`)
- `app:v1:active_hazards`: Current `{ blockedNodes, blockedEdges, closedExits }`
- `app:v1:start_node`: Current selected start node ID (`'R1'`)

---

## 7. Material 3 Expressive Design System

- **Seed Color**: `#006874` (Deep Teal / Cyan)
- **Surfaces**:
  - Light: Surface `#fbfcfe`, Container Low `#f5f6f8`, Container `#eff1f2`, Container High `#e9ebec`, Container Highest `#e3e5e7`
  - Dark: Surface `#0e1415`, Container Low `#161c1d`, Container `#1b2021`, Container High `#252b2c`, Container Highest `#303637`
- **Typography**:
  - Bengali: `Hind Siliguri`, `line-height: 1.75`, `letter-spacing: 0.015em`
  - English: `Inter`, system-ui
- **Components**:
  - Buttons: 48px height, `rounded-full`, tonal background
  - Cards: `rounded-[24px]`
  - Chips: M3 Filter Chips with active checkmark, no native `<select>` dropdowns!
  - Icons: Author inline SVGs with 1.5–2px stroke. Zero emojis.

---

## 8. Build Order & Vertical Slices

- **S1 (Scaffold & Shell)**: Vite + React 19 + TS + Tailwind v4 + M3E tokens + Header with theme and EN/বাংলা switcher.
- **S2 (Data & Dijkstra Engine)**: Bundled `building.json` loader, schema validator, Dijkstra pathfinding with exact tie-breaking and failure state detection.
- **S3 (Interactive SVG Map)**: Render nodes and edges at coordinates, custom node markers (room/junction/exit), corridor cost tags, route path illumination.
- **S4 (Hazard Interaction & Controls)**: Start selector chips, click-to-block nodes & corridors, close exits, instant recalculation, and reset to initial state.
- **S5 (Audit, Edge Cases & Verification)**: Run the 5 problem statement test cases, audit bilingual bn-BD numerals and translations, verify empty state.
- **S6 (Polish & Optional Extensions)**: Route step walkthrough, PNG map export, Section 9.3 README, MIT License, baseline and rerouting screenshots.
