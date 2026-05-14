# Audit: Wahala Sorter

A line-by-line look at what's wrong, what could break, and what violates the rules
of clean code. Each issue comes with a fix and the reasoning behind it so you
understand *why* the fix matters, not just what to type.

---

## Vulnerabilities

### [V1] The ID Counter Is a Loaded Gun Pointed at Your Foot

**File:** `src/App.tsx:22`

```tsx
let nextId = 5;
```

**What's wrong:** This is a mutable variable living at module scope. It sits
outside React's state management, which means React has no idea it exists. If
the `App` component unmounts and remounts (which React StrictMode does in
development, and which can happen during hot module reloading), `nextId` keeps
its old value instead of resetting. The counter drifts. IDs get larger and
larger with no good reason.

More importantly, module-level mutable state is a testing nightmare. If you
write a test that creates a few tasks, the next test starts with whatever
`nextId` was left at. Tests become order-dependent. That's the kind of bug
that takes three hours to find and makes you want to quit programming.

**The fix:** Move the ID generation into React state alongside the tasks.

```tsx
const [nextId, setNextId] = useState(5);
```

Then in `addTask`:

```tsx
setTasks(prev => [...prev, {
  id: String(nextId),
  title,
  column: 'now',
  createdAt: Date.now()
}]);
setNextId(prev => prev + 1);
```

**Why this works:** Now the ID counter lives inside React's lifecycle. If the
component remounts, it resets to 5. If you SSR or test it, every fresh render
gets a clean counter. It's predictable, testable, and doesn't leak state
between renders.

---

### [V2] No Input Sanitisation on Task Title

**File:** `src/App.tsx:38-40`

```tsx
const title = input.trim();
if (!title) return;
setTasks(prev => [...prev, { id: String(nextId++), title, ... }]);
```

**What's wrong:** React escapes JSX by default, so XSS through `{task.title}`
(at line 127) isn't a direct threat *today*. But the code stores whatever the
user types with zero validation beyond trimming whitespace. A user could paste
a 50,000-character string, or invisible Unicode control characters, or
something that breaks the layout. The guard at line 39 only checks for empty
strings—it says nothing about maximum length or content quality.

This is defence in depth: rely on React's escaping, sure, but also don't let
junk into your state in the first place.

**The fix:** Add a maximum length.

```tsx
const title = input.trim().slice(0, 200);
if (!title) return;
```

**Why this works:** `slice(0, 200)` caps the title at 200 characters before it
ever touches state. The user doesn't need to know—they just can't type past
200 characters (and if you're feeling fancy, you show a character counter so
they're not confused). This prevents absurdly long strings from causing layout
breakage, memory issues, or rendering hangs.

---

## Performance Traps

### [P1] Every Render Re-filters Every Task Three Times

**File:** `src/App.tsx:98`

```tsx
const colTasks = tasks.filter(t => t.column === col.id);
```

**What's wrong:** This line lives inside the `.map()` that renders the three
columns. On every single render, every single task is iterated three times
(once per column) to pick out which tasks belong where. With four tasks like
we have now, that's twelve iterations—nothing. But the code doesn't scale. A
user with 200 tasks will burn through 600 iterations per rendering. On every
keystroke. On every drag event.

Worse, `formatTime` at line 128 calls `Date.now()` every render, which means
every render produces a new value. React cannot skip re-rendering because the
output is always technically "different" from the last time. So every state
change triggers a full re-filter, re-format, and re-render of every single
task.

**The fix:** Memoize the task groupings so they only recompute when the tasks
actually change.

```tsx
const tasksByColumn = useMemo(() => ({
  now: tasks.filter(t => t.column === 'now'),
  soon: tasks.filter(t => t.column === 'soon'),
  later: tasks.filter(t => t.column === 'later'),
}), [tasks]);
```

Then in the render:

```tsx
{COLUMNS.map(col => {
  const colTasks = tasksByColumn[col.id];
  // ...
})}
```

**Why this works:** `useMemo` skips the filtering unless `tasks` has actually
changed. Typing in the input field, hovering over a button, or dragging past a
column won't trigger re-filtering. The three arrays are computed once and
reused until a task is added, deleted, or moved. For 200 tasks, that's the
difference between 600 filtering operations per render and 0.

---

### [P2] formatTime Fires on Every Render With No Cache

**File:** `src/App.tsx:11-20`

```tsx
function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  // ...
}
```

**What's wrong:** Two problems in one small function. First, `Date.now()` is
called on every render, producing a new value every millisecond. This alone
defeats any React rendering optimisation because the output is never the same
between renders. Second, there's no cache—if a task was created at timestamp
`X`, asking `formatTime(X)` five times in one second gives you five slightly
different strings ("5m ago", still "5m ago" but computed fresh every time).

For a board with four tasks, this is harmless. For forty tasks on a slow
device, every render triggers forty `Date.now()` calls and forty string
computations that all return the same answer.

**The fix:** Pull `Date.now()` out once per render and pass it in, and
consider a simple cache.

Two approaches. The lightweight one:

```tsx
function formatTime(ts: number, now: number): string {
  const diff = now - ts;
  // ... same logic ...
}
```

Then in the component:

```tsx
const now = useMemo(() => Date.now(), []);
// But this would never update, so really:
const [now, setNow] = useState(Date.now());
useEffect(() => {
  const id = setInterval(() => setNow(Date.now()), 30000);
  return () => clearInterval(id);
}, []);
```

**Why this works:** The `Date.now()` call is decoupled from rendering. The
clock ticks every 30 seconds (not every millisecond), and all timestamps
update together in a single render. Tasks that weren't re-added keep their
formatted string for the full 30-second window. Fewer renders, less work, same
result.

---

### [P3] Anonymous Function Created on Every Render in JSX

**File:** `src/App.tsx:88, 124, 132`

```tsx
onChange={e => setInput(e.target.value)}
onDragStart={e => handleDragStart(e, task.id)}
onClick={() => deleteTask(task.id)}
```

**What's wrong:** Each of these arrow functions is a brand new function object
on every render. React sees "oh, the onChange prop changed" and has to
reconcile. For event handlers on the same elements, this is usually fine—the
DOM diffing is cheap. But inside the `.map()` at line 119, every single task
card gets a fresh `onDragStart` and `onClick` on every render. If you have 50
tasks, that's 100 new functions created and thrown away per render.

**The fix:** Use `useCallback` with the task ID embedded in a data attribute.

```tsx
const handleDelete = useCallback((e: React.MouseEvent) => {
  const id = e.currentTarget.dataset.taskId;
  if (id) deleteTask(id);
}, [deleteTask]);
```

Then in JSX:

```tsx
<button data-task-id={task.id} onClick={handleDelete} ...>
```

**Why this works:** One function is created once and reused for every delete
button. The task ID is read from the DOM attribute instead of being captured
in a closure. This pattern uses a single stable function reference across all
task cards, eliminating the per-render function allocations.

---

### [P4] Dead CSS Variables Cluttering the Stylesheet

**File:** `src/index.css:15, 17, 19`

```css
--now-soft: #F0DDD4;
--soon-soft: #DCEAE4;
--later-soft: #E8E2DC;
```

These three variables are defined but never used anywhere in the codebase.
They're noise. Every developer who reads this file will wonder "where are
these used? Should I use them? Did I miss something?" and then they'll grep
the codebase and come up empty.

**The fix:** Delete them.

```css
--now: #C75B3A;
--soon: #3F7D6A;
--later: #8A7B70;
```

**Why this works:** Unused code is a cognitive tax. Every line you keep has to
be read, understood, and maintained. If someone later needs soft variants,
they can add them back with intention and a use case.

---

## Accessibility Misses

### [A1] Drag and Drop Doesn't Work With a Keyboard

**File:** `src/App.tsx:100-105, 120-124`

**What's wrong:** HTML5 native drag and drop (`draggable`, `onDragStart`,
`onDrop`, etc.) is mouse-only. It doesn't work with the keyboard, screen
readers, switch devices, or voice control. A user who can't use a mouse simply
cannot move tasks between columns. They can add tasks, they can delete them,
but they're stuck with everything in "Now" forever.

This is the single biggest accessibility failure in the app because it locks
out an entire category of users from a core feature.

**The fix:** Add keyboard handlers to each task for moving between columns.
The simplest approach is arrow keys or context-menu buttons per task.

```tsx
const handleKeyDown = useCallback((e: React.KeyboardEvent, id: string, currentCol: ColumnId) => {
  const cols: ColumnId[] = ['now', 'soon', 'later'];
  const idx = cols.indexOf(currentCol);
  if (e.key === 'ArrowRight' && idx < cols.length - 1) {
    moveTask(id, cols[idx + 1]);
  } else if (e.key === 'ArrowLeft' && idx > 0) {
    moveTask(id, cols[idx - 1]);
  }
}, [moveTask]);
```

Attach to the task div:

```tsx
<div
  className="task"
  draggable
  tabIndex={0}
  role="listitem"
  onDragStart={e => handleDragStart(e, task.id)}
  onKeyDown={e => handleKeyDown(e, task.id, task.column)}
  aria-label={`Task: ${task.title}. In ${task.column} column. Press left or right arrow to move.`}
>
```

**Why this works:** `tabIndex={0}` makes the task focusable by keyboard.
ArrowLeft and ArrowRight move the task between columns. Screen readers hear
the `aria-label` which tells them what the task is and how to move it. The
core feature is now available to everyone, regardless of input device.

---

### [A2] No Live Region — Screen Reader Users Don't Know Things Changed

**File:** `src/App.tsx:74-145`

**What's wrong:** When a task is added, deleted, or moved, the screen changes
visually but a screen reader has no idea anything happened. The user hits
"Add", hears nothing new, and has to manually navigate the page to discover
their task appeared. If they're using a screen reader and drag a task to
"Later", they might never find it.

**The fix:** Add an `aria-live` region that announces changes.

```tsx
const [announcement, setAnnouncement] = useState('');

// In addTask:
setAnnouncement(`Added "${title}" to Now.`);

// In deleteTask:
setAnnouncement('Task deleted.');

// In moveTask:
setAnnouncement(`Moved to ${toLabel}.`);
```

In the JSX:

```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {announcement}
</div>
```

**Why this works:** `aria-live="polite"` tells the screen reader to announce
the content change when it's done reading whatever it's currently saying. It
doesn't interrupt. `aria-atomic="true"` means announce the whole string, not
just the part that changed. The user hears "Added 'Call electrician' to Now"
without having to search the page. If you want to hide it visually, add a
`.sr-only` class (`position: absolute; width: 1px; height: 1px; overflow:
hidden;`).

---

### [A3] Focus Disappears When a Task Is Deleted

**File:** `src/App.tsx:44-46`

**What's wrong:** When you click the delete button on a task, the task element
is removed from the DOM. The browser doesn't know where to put focus next. On
some browsers, focus resets to the top of the page. On others, it disappears
entirely. A keyboard user who just deleted a task now has to tab through the
entire page to get back to where they were.

**The fix:** Move focus to a sensible target after deletion.

```tsx
const deleteTask = useCallback((id: string) => {
  setTasks(prev => {
    const newTasks = prev.filter(t => t.id !== id);
    // Focus the column header after delete
    setTimeout(() => {
      const columnEl = document.querySelector(`[data-column="${id}"]`);
      if (columnEl) (columnEl as HTMLElement).focus();
    }, 0);
    return newTasks;
  });
}, []);
```

A cleaner approach uses a ref to the column container, but even a simple
`querySelector` targeting the nearest remaining task or column is better than
dropping focus into the void.

**Why this works:** Focus management is one of the least-visible but most
important accessibility concerns. Without it, keyboard and screen reader users
get lost. Moving focus to the column header (or the next task, or the add
input) keeps their place in the app's navigation. They don't have to start
over.

---

### [A4] The Delete Button Could Say Which Task It Deletes

**File:** `src/App.tsx:133`

```tsx
aria-label="Delete task"
```

**What's wrong:** A screen reader user navigating through a column hears
"Delete task" on every single card. They have no idea *which* task they're
about to delete. They have to navigate back to the task title, memorise it,
then come back to the button.

**The fix:** Make the aria-label specific.

```tsx
aria-label={`Delete "${task.title}"`}
```

**Why this works:** "Delete 'Call electrician about NEPA'" tells the user
exactly what will happen. They can confidently press the button or move on.
This adds literally zero code complexity—it's a template string change—but it
turns a guess into a guarantee.

---

### [A5] Hover-Only Delete Button Is Invisible on Touch

**File:** `src/App.css:199-201`

```css
.task:hover .task-delete {
  opacity: 1;
}
```

**What's wrong:** On touch devices (phones, tablets), there is no hover. The
delete button stays invisible forever. A user on a phone can see tasks but
cannot figure out how to delete them. They might try long-pressing, they might
give up. Either way, the feature is broken for them.

**The fix:** Always show the delete button on small screens, or always show it
and rely on it being subtle.

Simplest approach: remove the hover requirement.

```css
.task-delete {
  opacity: 0.4; /* visible but quiet */
}

.task:hover .task-delete,
.task-delete:focus-visible {
  opacity: 1;
}
```

For touch-friendly behaviour:

```css
@media (hover: hover) {
  .task-delete {
    opacity: 0;
  }
  .task:hover .task-delete {
    opacity: 1;
  }
}

@media (hover: none) {
  .task-delete {
    opacity: 0.4;
  }
}
```

**Why this works:** `@media (hover: hover)` targets devices that support hover
(desktop with a mouse). `@media (hover: none)` targets touch devices. On
phone, the delete button is always visible at 40% opacity—subtle but
discoverable. On desktop, the original hover behaviour is preserved. Everyone
can delete tasks.

---

### [A6] Colour Contrast Fails for Small Text

**File:** `src/App.css:121-124`, `index.css:12`

```css
/* Column description */
.column-desc {
  font-size: 0.8rem;
  color: var(--text-soft); /* #7A6B62 on #EAE2D9 */
}

/* The --text-soft variable itself */
--text-soft: #7A6B62;
```

**What's wrong:** The column description is 0.8rem (about 12.8px) and uses
`#7A6B62` on `#EAE2D9`. The contrast ratio is approximately **4.1:1**. WCAG AA
requires 4.5:1 for text under 18px (or 14px bold). This fails.

The empty state text ("Empty. For now.") is even worse. It uses `#7A6B62` at
0.6 opacity, which blends with the column background (`#EAE2D9`) to produce an
effective colour around `#A79A91`. The contrast ratio against `#EAE2D9` is
roughly **2:1**—a fail by any standard.

**The fix:** Darken `--text-soft` to meet the 4.5:1 ratio, and don't rely on
opacity for text legibility.

```css
--text-soft: #5F5148; /* darker than #7A6B62 */

.empty-state {
  /* Remove opacity-based lightening */
  opacity: 1;
}
```

Alternative: keep the soft look but ensure it passes contrast:

```css
--text-soft: #6B5B52; /* contrast ratio ≈ 5.2:1 on #EAE2D9 */
```

**Why this works:** WCAG contrast ratios aren't arbitrary—they account for the
fact that 1 in 12 men has some form of colour vision deficiency. Text that's
too light against its background becomes unreadable in bright sunlight, on
cheap screens, or for older eyes. Darkening the "soft" colour by one step
preserves the visual hierarchy (you can still tell it's less important text)
while making it readable by everyone.

---

## Violated Software Engineering Principles

### [S1] App.tsx Does Everything — Single Responsibility Violation

**File:** `src/App.tsx` (all 148 lines)

**What's wrong:** The `App` component is responsible for:
1. Storing all application state (`useState` calls at lines 32-34)
2. Handling all business logic (`addTask`, `deleteTask`, `moveTask` at 36-51)
3. Handling all drag and drop events (53-72)
4. Rendering the page header (76-81)
5. Rendering the add form (83-94)
6. Rendering the column layout (96-143)
7. Rendering each column's header (107-113)
8. Rendering each task card (119-138)
9. Formatting timestamps (11-20)
10. Defining seed data (24-29)
11. Managing the ID counter (22)

That's eleven responsibilities in one function. This is the opposite of Single
Responsibility. If you need to change how a task card looks, you touch the
same file that manages the ID counter and handles drag events. If you change
the timestamp format, you touch the same file that renders the columns. Every
change risks breaking something unrelated.

**The fix:** Split into separate component files.

```
src/
  components/
    Board.tsx          # the three-column grid
    Column.tsx         # a single column (header + body)
    TaskCard.tsx       # a single draggable task
    AddTaskForm.tsx    # the input + add button
  utils/
    time.ts            # formatTime and related helpers
  data/
    seed.ts            # INITIAL_TASKS
  types.ts             # stays as-is
  App.tsx              # wires state into component tree
```

**Why this works:** Each file has one reason to change. `TaskCard.tsx` changes
when the card design changes. `Column.tsx` changes when column layout changes.
`time.ts` changes when timestamp logic changes. `App.tsx` becomes a thin
orchestrator that passes state and handlers down. Changes are isolated,
testable, and don't cause surprise breakage in unrelated parts of the app.

---

### [S2] formatTime and Seed Data Don't Belong in the App Component

**File:** `src/App.tsx:11-20, 22, 24-29`

**What's wrong:** Two separate concerns live in the wrong place.

`formatTime` (lines 11-20) is a utility function. It has nothing to do with
React components, state management, or event handling. It belongs in a
utility file so it can be imported, tested, and reused without dragging in
the entire React component tree.

`INITIAL_TASKS` (lines 24-29) is seed data. It's test data, not application
logic. It belongs in a data file or a fixture file.

`let nextId = 5` (line 22) is state management infrastructure. It's neither a
component nor a utility—it's an implementation detail of ID generation.

**The fix:** Extract each concern into its own file.

```tsx
// src/utils/time.ts
export function formatTime(ts: number): string {
  // ...
}

// src/data/seed.ts
import type { Task } from '../types';
export const INITIAL_TASKS: Task[] = [ /* ... */ ];
```

**Why this works:** Testability. You can write a unit test for `formatTime`
without mounting a React component. You can test `INITIAL_TASKS` shape
independently. The App component shrinks, and each piece of the codebase has a
clear home.

---

### [S3] No Error Boundary — One Crash Kills the Whole App

**File:** `src/main.tsx:6-9`

```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**What's wrong:** There is no error boundary anywhere in the component tree.
If `formatTime` throws because of an unexpected timestamp, if a `map()`
iteration hits a null value, if any JavaScript error occurs inside any
component during rendering, the entire app unmounts and the user sees a white
screen. No fallback. No error message. Nothing.

React's philosophy is "fail gracefully." Error boundaries are the mechanism
for that.

**The fix:** Create a minimal error boundary component.

```tsx
// src/components/ErrorBoundary.tsx
import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something broke.</h2>
          <p style={{ color: '#7A6B62' }}>The app ran into trouble. Try refreshing.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
```

Wrap the app:

```tsx
<StrictMode>
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
</StrictMode>
```

**Why this works:** An error boundary catches rendering errors in the
component tree below it. Instead of a white screen, the user gets a message.
The error is logged (you can add `console.error` or a reporting service in
`componentDidCatch`). The rest of the browser is still functional—the user can
close the tab, copy a URL, or refresh. A white screen feels like the
internet is broken. A friendly error message feels like an app that cares.

---

### [S4] formatTime Is Impure — It Depends on a Moving Target

**File:** `src/App.tsx:11-20`

```tsx
function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  // ...
}
```

**What's wrong:** `formatTime` claims to be a function that takes a timestamp
and returns a string. But it secretly depends on `Date.now()`, which is a
global, mutable, ever-changing value. Calling `formatTime(x)` at two different
milliseconds can return two different strings. This makes the function
non-deterministic, untestable without mocking, and unpredictable.

A pure function—given the same input, always returns the same output—is one of
the most fundamental software engineering principles. `formatTime` violates
it.

**The fix:** Make the function honestly pure by passing the current time as a
parameter.

```tsx
function formatTime(ts: number, now: number): string {
  const diff = now - ts;
  // ...
}
```

**Why this works:** Now `formatTime(1234567890, 1234567890)` always returns
"just now" no matter when you call it. Every test is deterministic. Every call
is predictable. The impurity moves up to the caller, which decides when to
sample `Date.now()`—and the caller is the component that manages rendering,
so it makes sense for the impurity to live there, not in a utility function.

---

### [S5] nth-child Selectors Are Fragile

**File:** `src/App.css:143-145`

```css
.column:nth-child(1) .column-title { color: var(--now); }
.column:nth-child(2) .column-title { color: var(--soon); }
.column:nth-child(3) .column-title { color: var(--later); }
```

**What's wrong:** These selectors assume that the first `.column` in the DOM
is "Now", the second is "Soon", and the third is "Later." This happens to be
true because of the `COLUMNS` array order in `App.tsx:5-9`. But the link
between the array order and the CSS colour is invisible. If someone
reorders the `COLUMNS` array alphabetically, adds a fourth column, or wraps
columns in a different container, the colours break silently.

The `nth-child` selector is a time bomb. The relationship between the data
(column labels) and the presentation (column colours) is implicit and fragile.

**The fix:** Use a data attribute or CSS class that reflects the column ID.

```tsx
// In App.tsx JSX:
className={`column column--${col.id}`}
```

```css
.column--now .column-title { color: var(--now); }
.column--soon .column-title { color: var(--soon); }
.column--later .column-title { color: var(--later); }
```

**Why this works:** The connection between the column ID and its colour is
now explicit and self-documenting. `.column--now` is "the now column" by name,
not by position. If you reorder the array, add columns, or nest them
differently, the colours follow the correct column every time. The nth-child
dependency is eliminated.

---

### [S6] Orphaned Asset in public/

**File:** `public/icons.svg`

**What's wrong:** The `icons.svg` file was left behind by the Vite template.
It's 5KB of SVG sprite definitions for social media icons that the app doesn't
use. It gets copied into the build output on every build, adding unnecessary
weight and clutter.

**The fix:** Delete it.

```bash
rm public/icons.svg
```

**Why this works:** Every file in the project has a maintenance cost. Someone
will wonder what `icons.svg` is for, check if it's used, search for
references, and waste time. Deleting unused files keeps the project clean,
the build lean, and the developers sane.

---

## Summary of Issues by Severity

### Must Fix
| # | Issue | Impact |
|---|---|---|
| A1 | Drag and drop is mouse-only | Core feature inaccessible to keyboard/screen reader users |
| A3 | Focus disappears after delete | Keyboard users get lost |
| A5 | Delete button invisible on touch | Phone users can't delete tasks |
| S3 | No error boundary | One crash kills the entire app |
| S5 | nth-child selectors fragile | Reordering columns silently breaks colours |

### Should Fix
| # | Issue | Impact |
|---|---|---|
| A2 | No live region for announcements | Screen reader users miss state changes |
| A4 | Non-descriptive delete label | Screen reader users guess which task they're deleting |
| A6 | Low colour contrast on small text | Fails WCAG AA, hard to read in sunlight |
| P1 | Re-filtering on every render | Wastes CPU cycles, doesn't scale |
| S1 | App.tsx does everything | Hard to maintain, test, or reason about |
| S2 | formatTime in wrong file | Untestable without React, mixed concerns |

### Nice to Fix
| # | Issue | Impact |
|---|---|---|
| V1 | Module-level mutable ID counter | Tests become order-dependent, IDs drift |
| V2 | No input length limit | Potential layout breakage with very long titles |
| P2 | formatTime calls Date.now() every render | Unnecessary work, prevents memoization |
| P3 | Anonymous functions in JSX map | Small allocations, adds up at scale |
| P4 | Dead CSS variables | Confusing to maintainers |
| S4 | Impure formatTime | Non-deterministic, harder to test |
| S6 | Orphaned icons.svg | Unnecessary build bloat |

---

*An app that works for you but not for someone who can't use a mouse, can't
see well, or uses a phone isn't finished. These fixes turn a functioning demo
into a tool people can actually rely on.*
