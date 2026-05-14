# Audit Cross-Check: What the First Audit Missed

The first audit (`03-audit.md`) did an excellent job catching critical accessibility issues (like keyboard drag-and-drop) and fundamental React performance traps. However, a second pass of the codebase reveals several subtle but critical UX flaws, HTML5 Drag & Drop edge cases, and modern web standards violations that slipped through the cracks. 

Here is what was missed:

---

## Drag & Drop Edge Cases

### [M1] Uneven Drop Zones (The `align-items` Trap)

**File:** `src/App.css:76-81`

```css
.board {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: start;
}
```

**What's wrong:** `align-items: start` tells the grid items (the columns) to shrink-wrap to their content height. If the "Now" column has 10 tasks, it might be 800px tall. If the "Soon" column is empty, it stops at its `min-height` of 240px. If a user tries to drag a task from "Now" to the empty space *below* the 240px mark in "Soon", the drop will silently fail because the `.column` container doesn't physically exist down there.

**The fix:** Remove `align-items: start;` from `.board`. 

**Why this works:** Removing it falls back to the default `stretch` behavior for CSS Grid. It forces all columns to be exactly as tall as the tallest column in the row. This guarantees that the drop zone for every column goes all the way to the bottom of the board, regardless of how many tasks are inside it.

---

### [M2] Drag Highlight Flickering (The `onDragLeave` Trap)

**File:** `src/App.tsx:64-66, 104`

```tsx
const handleDragLeave = useCallback(() => {
  setDragOver(null);
}, []);
```

**What's wrong:** In HTML5 Drag and Drop, events bubble and fire rapidly. If a user drags a card into a column, `dragenter` fires on the column, and the dashed highlight appears. But as they move the mouse *over an existing task* inside that column, the browser fires `dragleave` on the parent column. This triggers `setDragOver(null)`, which removes the highlight. A fraction of a second later, the event bubbles up and turns it back on. The result? The column highlight violently flickers on and off as you move the mouse around inside the drop zone.

**The fix:** The simplest CSS-only fix is to disable pointer events on the children while dragging. 

Add to `App.css`:
```css
.board--dragging .task {
  pointer-events: none;
}
```
*(You would also need to toggle a `.board--dragging` class on the board during a drag in `App.tsx`)*.

**Why this works:** If the children (`.task`) have `pointer-events: none`, the browser pretends they don't exist for mouse/drag events. The only element that receives `dragenter` and `dragleave` is the `.column` itself, completely eliminating the flicker.

---

## Usability & Accessibility Misses

### [M3] Overzealous `user-select: none` Prevents Copy/Paste

**File:** `src/App.css:155`

```css
.task {
  /* ... */
  user-select: none;
}
```

**What's wrong:** Applying `user-select: none` to the entire task card stops the text from being accidentally highlighted during a drag. However, it *also* stops the user from intentionally highlighting the task title to copy and paste it into an email, a chat, or another app. You've solved a minor visual annoyance by breaking fundamental browser functionality.

**The fix:** Remove `user-select: none` from `.task`. If text highlighting during drag is a problem, apply `user-select: none` only to the `<body>` during the `dragstart` event, and remove it on `dragend`.

**Why this works:** It respects user agency. Text on the web should always be selectable unless it's a button or an icon. 

---

### [M4] Hostile `autoFocus` on Page Load

**File:** `src/App.tsx:89`

```tsx
<input
  className="add-input"
  autoFocus
  // ...
/>
```

**What's wrong:** `autoFocus` instantly yanks the browser's focus to the input field the millisecond the page loads. For screen reader users, this is incredibly disorienting. It forces the screen reader to skip the `<h1>` page title and the subtitle, dropping the user into a text box with zero context about what website they are on or what the app does. 

**The fix:** Delete the `autoFocus` prop.

**Why this works:** Web accessibility relies on predictable navigation. Let the user load the page, hear the title, and naturally press `Tab` to reach the input field.

---

### [M5] No `<label>` for the Form Input

**File:** `src/App.tsx:84-90`

**What's wrong:** The `add-input` has a `placeholder` ("Add a new wahala..."), but no `<label>` or `aria-label`. Placeholders are explicitly forbidden by WCAG from replacing labels because they disappear the moment the user types a single character. Once text is entered, a cognitively impaired user (or a screen reader) loses the context of what that field is for.

**The fix:** Add a visually hidden label or an `aria-label`.

```tsx
<input
  aria-label="New task title"
  placeholder="Add a new wahala..."
  // ...
/>
```

**Why this works:** The screen reader will announce "New task title, edit text" regardless of whether the field is empty or filled, preserving context permanently.

---

### [M6] Focus Indicators Removed Without Replacement

**File:** `src/App.css:42`

```css
.add-input {
  outline: none;
}
.add-input:focus {
  border-color: var(--now);
}
```

**What's wrong:** The code actively destroys the browser's default focus ring (`outline: none`) and tries to replace it by changing the border color from light brown (`#DDD4CA`) to terracotta (`#C75B3A`). This color change is subtle and completely vanishes in Windows High Contrast mode. Furthermore, `.add-btn` has no custom focus styles at all.

**The fix:** Restore standard focus outlines.

```css
.add-input:focus-visible,
.add-btn:focus-visible {
  outline: 2px solid var(--now);
  outline-offset: 2px;
}
```

**Why this works:** A thick, offset outline provides undeniable visual proof of where the keyboard focus is. `focus-visible` ensures mouse users don't see the ring when clicking, keeping the UI clean for them while remaining accessible for keyboard users.

---

## Code Cleanliness

### [M7] Unused TypeScript Definitions

**File:** `src/types.ts:10-14` & `src/App.tsx:5`

**What's wrong:** The `types.ts` file explicitly defines an interface for columns:
```ts
export interface Column {
  id: ColumnId;
  label: string;
  description: string;
}
```
But `App.tsx` completely ignores it and creates a messy inline type instead:
```ts
const COLUMNS: { id: ColumnId; label: string; description: string }[] = [ ... ]
```

**The fix:** Import and use the `Column` type in `App.tsx`:
```ts
import type { Task, ColumnId, Column } from './types';

const COLUMNS: Column[] = [ ... ]
```

**Why this works:** It DRYs up the code. If the shape of a Column ever changes, you only have to update it in the rulebook (`types.ts`), and the rest of the app will instantly respect the new definition.

---

### [M8] Re-inventing Relative Time

**File:** `src/App.tsx:11-20`

```tsx
function formatTime(ts: number): string {
  // Manual math for mins, hrs, days...
  return `${days}d ago`;
}
```

**What's wrong:** The app manually calculates time deltas and hardcodes English strings. If the app ever needs to be translated, or if edge-cases around pluralization arise, this bespoke math will become a maintenance burden. 

**The fix:** Use the browser's native `Intl.RelativeTimeFormat` API.

**Why this works:** It delegates localization, pluralization, and edge-cases directly to the browser's optimized native C++ engine, removing bugs and reducing the need to write custom logic.
