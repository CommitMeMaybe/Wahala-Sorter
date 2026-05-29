# Wahala Sorter — Sort the Pile

A drag-and-drop priority board for navigating daily chaos. Drop tasks into **Now, Soon, and Later** — clear your head without signing up for anything.

## Features

### Board
- **Three columns**: Now, Soon, Later — drag tasks between them
- **Drag and drop** with auto-scroll on touch edges
- **Multi-select**: long-press to enter selection mode, then bulk-move or bulk-delete
- **Pinch-to-zoom** (touch) / Ctrl+wheel (desktop) to scale the board
- **Undo**: Ctrl+Z restores the last deleted task, toast offers inline undo

### Task cards
- Inline title editing, expand/collapse panel
- Due date picker with overdue highlighting
- Estimated minutes
- Recurrence (daily, weekly, biweekly, monthly) — auto-creates next occurrence on completion
- Subtasks with nested checkboxes
- Tags — freeform comma-separated input
- Project assignment with color coding
- Notes field
- Column-specific keyboard shortcut (`1`/`2`/`3` to move)

### Landing page
5-section scrollable experience with premium snap-scrolling (Lenis):
- **Intro** — "Life spills everywhere. The board catches it all."
- **Chaos** — Physics-driven sticky notes that scatter from your cursor
- **Sorting** — Animated board showing how tasks sort into columns
- **Showcase** — Full board preview with task details
- **Final** — Call to action with "Start sorting" button
- 3D particle background (Three.js) with mouse-reactive parallax
- GSAP/ScrollTrigger animations throughout
- Progress bar and navigation dots

### Search & filters
- Real-time text search across titles and tags
- Project filter chips
- Toggle to show/hide completed tasks
- Responsive — mobile search panel slides down, desktop inline

### Data management
- **localStorage persistence** — everything saves automatically
- **Import/Export** — full JSON backup (tasks, trash, projects, settings)
- **PWA** — installable, service worker for offline access

### Sound effects
Procedural Web Audio API tones (no audio files):
- Task complete — C5→E5→G5 chime
- Task delete — 400Hz→300Hz buzz
- Task move — 660Hz click
- Task add — 440Hz→550Hz pop
- Toggle in Settings

### Settings
- Column labels and descriptions (rename Now/Soon/Later)
- Default sort order (created, due date, alphabetically, manual)
- Sound on/off
- Confetti on/off
- Week start day (Sunday/Monday)

### Onboarding
First-time overlay that explains the three columns with "Do this now / Do this next / Do this later".

### Keyboard shortcuts
| Shortcut | Action |
|----------|--------|
| Ctrl+= / Ctrl+- | Zoom in / out |
| Ctrl+0 | Reset zoom |
| Ctrl+Z | Undo last delete |
| Escape | Close drawer/modal/selection |

## Tech stack

| Layer | Technology |
|-------|-----------|
| UI | React 19, TypeScript 6 |
| Styling | Tailwind CSS 4 |
| Build | Vite 8 |
| Scroll | Lenis 1 (snap scrolling) |
| Animations | GSAP 3, ScrollTrigger, Framer Motion 12 |
| 3D | Three.js, @react-three/fiber, @react-three/drei |
| Testing | Vitest 4, Testing Library (React, Jest DOM, User Event) |
| PWA | Service Worker (custom), Web Manifest |

## Getting started

```bash
npm install
npm run dev        # development server
npm run build      # production build
npm run preview    # preview production build
npm test           # run tests (vitest)
npm run test:watch # watch mode
```

## Project structure

```
src/
├── main.tsx               # Entry point, hash routing (landing vs app)
├── App.tsx                # Main app state, all handlers, keyboard shortcuts
├── App.css                # App styles (corkboard theme, animations, responsive)
├── index.css              # Global CSS variables, Tailwind import, resets
├── LandingPage.tsx        # Snap-scroll landing page with progress bar + nav dots
├── types.ts               # All TypeScript interfaces + default settings factory
├── data/
│   └── seed.ts            # Initial seed tasks and projects
├── utils/
│   ├── storage.ts         # localStorage load/save helpers
│   ├── time.ts            # Date formatting, overdue check
│   ├── recurrence.ts      # Recurring task logic
│   ├── sounds.ts          # Web Audio API procedural sound effects
│   └── backup.ts          # JSON export/import (versioned)
├── components/
│   ├── Board.tsx          # Board layout (3 columns)
│   ├── Column.tsx         # Single column with drop zone
│   ├── TaskCard.tsx       # Task card with expand panel, inline editing
│   ├── AddTaskModal.tsx   # New task form with project/column selection
│   ├── AppDrawer.tsx      # Side drawer (home, export/import, trash, settings)
│   ├── SettingsDrawer.tsx # Settings panel with project management
│   ├── SearchBar.tsx      # Desktop search + filter bar
│   ├── FilterChips.tsx    # Project filter chips
│   ├── SubtaskList.tsx    # Subtask inline editor
│   ├── TagInput.tsx       # Tag editor
│   ├── DatePicker.tsx     # Due date/reminder date picker
│   ├── RecurrencePicker.tsx
│   ├── ProjectSelector.tsx
│   ├── Confetti.tsx       # Confetti burst on task completion
│   ├── WeekSummary.tsx    # Weekly stats card
│   ├── OnboardingOverlay.tsx
│   ├── Toast.tsx          # Toast notifications with undo actions
│   └── ErrorBoundary.tsx
├── landing/
│   ├── IntroScene.tsx     # Hook section
│   ├── ChaosScene.tsx     # Physics-driven floating notes
│   ├── SortingScene.tsx   # Animated column demo
│   ├── ShowcaseScene.tsx  # Full board preview
│   ├── FinalScene.tsx     # CTA + "Start sorting" button
│   ├── HandAnimation.tsx  # Animated hand dragging a task
│   ├── ThreeBackground.tsx # 3D particle background
│   ├── scrollState.ts     # Scroll progress shared state
│   └── scrollState.ts
├── lib/
│   └── suppressWarnings.ts
└── tests/
    ├── setup.ts
    ├── AddTaskModal.test.tsx
    └── TaskCard.test.tsx
```

## Configuration

All app settings are stored in localStorage under `wahala-settings`. Defaults:

| Setting | Default | Options |
|---------|---------|---------|
| columnOrder | `['now','soon','later']` | — |
| columnLabels | `{now:'Now', soon:'Soon', later:'Later'}` | any string |
| columnDescriptions | `{now:'Do this now', soon:'Do this next', later:'Do this later'}` | any string |
| defaultSort | `'created'` | created, due, alpha, manual |
| soundEnabled | `false` | boolean |
| confettiEnabled | `true` | boolean |
| weekStartDay | `1` (Monday) | 0 (Sunday), 1 (Monday) |
| onboardingDone | `false` | boolean |

To reset all data, clear localStorage or import a fresh backup.

## Browser support

All modern browsers. PWA install requires HTTPS (or localhost). Service worker registers on `window.load`.

## Architecture notes

- **Fully client-side** — no backend, no accounts, no cloud sync. `crypto.randomUUID()` for all IDs.
- **localStorage** is the only persistence layer — everything auto-saves via `useEffect`.
- **Recurring tasks** duplicate on completion via `nextOccurrence()` — the original gets `completedAt`, the copy is a new task.
- **Sound effects** are procedural Web Audio API oscillators — zero network requests, ~1 KB.
- **Backup format** is versioned (`EXPORT_VERSION = 1`) JSON that includes tasks, trash, projects, and settings.
- **Tests** use Vitest + jsdom with Testing Library (19 tests covering AddTaskModal and TaskCard).
- **Zoom** works via CSS `transform: scale(var(--zoom))` with touch pinch and Ctrl+wheel inputs.
