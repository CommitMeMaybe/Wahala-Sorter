# Wahala Sorter — Codebase Explanation

*Every single line explained like you're seven years old.*

---

## `index.html` — The Shop Door

**Line 1** — `<!doctype html>` — This tells the browser "Hey, this is a webpage!"

**Line 2** — `<html lang="en">` — Opens the shop. Says "our language is English."

**Line 3** — `<head>` — The top part of the page. Like the sign above the shop. You don't see it, but it's important.

**Line 4** — `<meta charset="UTF-8" />` — "We can write any letter from any language, even Yoruba and Hausa."

**Line 5** — `<meta name="viewport"...` — "Make this look right on a phone, tablet, or big computer screen."

**Line 6** — `<title>Wahala Sorter</title>` — This is the name that shows up on the browser tab. Like a nameplate.

**Line 7** — `<link rel="preconnect"` — "Hey browser, I'm going to need to talk to Google's font shop. Start connecting early so it's faster."

**Line 8** — Same for the font files.

**Line 9** — `<link href="..."` — This is where we actually BUY the fonts from Google. We get two fonts:
- **DM Sans** — the normal text letters
- **DM Serif Display** — the fancy heading letters with little feet (serifs)

**Line 11** — `<body>` — Opens the part you can actually see.

**Line 12** — `<div id="root"></div>` — An empty box. The React app will be born inside this box. The root of everything.

**Line 13** — `<script type="module" src="/src/main.tsx">` — "Browser, go fetch the file `main.tsx` and run it. That's where the magic starts."

---

## `src/main.tsx` — The Key That Starts the Car

**Line 1** — `import { StrictMode } from 'react'` — Get the StrictMode tool from React's toolbox. It checks for mistakes while we build.

**Line 2** — `import { createRoot } from 'react-dom/client'` — Get the tool that plants React inside a real webpage.

**Line 3** — `import './index.css'` — "Bring in the global styles." Like painting the walls before you put furniture in.

**Line 4** — `import App from './App.tsx'` — "Go get the App component from the App.tsx file."

**Lines 6-9** —
```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```
This means:
1. Find the empty `#root` div from the HTML
2. Plant React inside it
3. Wrap everything in StrictMode (like a helmet)
4. Put the `<App />` component inside — that's our whole app

---

## `src/types.ts` — The Dictionary

**Line 1** — `export type ColumnId = 'now' | 'soon' | 'later';`

We're saying: "There are only THREE possible names for a column. It must be `'now'`, `'soon'`, or `'later'`. Nothing else." Like saying your choices for breakfast are only bread, rice, or garri.

**Lines 3-8** — `export interface Task { ... }`

We're drawing a blueprint for what a "task" looks like. Every task must have:
- `id: string` — a name tag, like a ticket number. Every task gets its own.
- `title: string` — what the task says, like "Buy cement"
- `column: ColumnId` — which pile it lives in: Now, Soon, or Later
- `createdAt: number` — a timestamp. The computer's clock when you made it. We use this to say "5m ago"

**Lines 10-14** — `export interface Column { ... }`

Blueprint for a column:
- `id` — now/soon/later
- `label` — the name you see ("Now", "Soon", "Later")
- `description` — the small words underneath ("Right now, no delay")

---

## `src/App.tsx` — The Engine Room (all 148 lines)

### Lines 1-4: Getting Supplies

**Line 1** —
```tsx
import { useState, useCallback, type FormEvent } from 'react';
```
We're taking three things from React's toolbox:
- `useState` — a magic box that holds our data AND can change it. Like a jar of marbles. You can count the marbles, and you can add or remove marbles.
- `useCallback` — a wrapper that makes functions remember things so they don't slow down the computer for no reason.
- `type FormEvent` — a label for the "form submitted" event. Tells TypeScript what kind of event this is.

**Line 2** — `import type { Task, ColumnId } from './types';`

Grab our blueprints (types) from the dictionary file.

**Line 3** — `import './App.css';`

Bring in the styles that only apply to this App page.

### Lines 5-9: The Three Columns

```tsx
const COLUMNS = [
  { id: 'now', label: 'Now', description: 'Right now, no delay' },
  { id: 'soon', label: 'Soon', description: 'Today or tomorrow' },
  { id: 'later', label: 'Later', description: 'This week, insha Allah' },
];
```

A list of three column names. This is NOT stored in state because it never changes. It's just... true. Like the fact that the sun rises.

- "Now" = fire. Do this now. Don't wait.
- "Soon" = later today or tomorrow. You see it coming.
- "Later" = this week, God willing (insha Allah). On the back burner.

### Lines 11-20: The Clock Reader

```tsx
function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
```

This is a little robot that reads timestamps and says "how long ago?"

- `ts` = the number you give it (when the task was made)
- `Date.now()` = the current time right now
- `diff` = difference. Subtract birth-time from now-time = how many milliseconds old it is
- Divide by 60,000 (milliseconds in a minute) = how many minutes old
- If less than 1 minute old → "just now"
- If less than 60 minutes → "5m ago" (5 minutes ago)
- If less than 24 hours → "2h ago" (2 hours ago)
- Otherwise → "3d ago" (3 days ago)

### Line 22: The Ticket Counter

```tsx
let nextId = 5;
```

A number that goes up every time we make a new task. Starts at 5 because we already used 1, 2, 3, 4 for the example tasks. Like a counter at a shop: "Number 5, come in!"

### Lines 24-29: The Example Tasks

```tsx
const INITIAL_TASKS = [
  { id: '1', title: 'Call electrician about NEPA', column: 'now', createdAt: Date.now() - 1000 * 60 * 5 },
  ...
];
```

Four pre-made tasks so the app doesn't look empty when you first open it. Like a restaurant putting fake food in the window to show you what they sell.

Each one has:
- A ticket number (id)
- What to do (title)
- Which pile it's in (column)
- When it was made (createdAt) — using `Date.now() - some number` to make it seem like it was made a few minutes/hours ago

Task 1: "Call electrician about NEPA" — made 5 minutes ago. That's NEPA, the electricity company. Power is out. Classic Lagos.

Task 2: "Buy cement from Mike's depot" — 15 minutes ago. A builder needs cement.

Task 3: "Reply Mr. Adebayo about the quote" — 2 hours ago. Client waiting.

Task 4: "Pick up plumbing parts at Oyingbo" — 5 hours ago. Running errands.

### Lines 31-146: The App Component

**Line 31** — `function App() {`

We're defining the App. It's a function that returns a React component (a piece of screen).

#### Lines 32-34: The Three Magic Jars (State)

**Line 32** — `const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);`

Two things:
- `tasks` = the current list of tasks (read it whenever you need to know what's on the board)
- `setTasks` = the remote control that changes the list (point it at a new list and the screen updates)
- Starts with the 4 example tasks

**Line 33** — `const [input, setInput] = useState('');`

- `input` = whatever is currently typed in the text box (starts empty)
- `setInput` = change what's in the text box

**Line 34** — `const [dragOver, setDragOver] = useState<ColumnId | null>(null);`

- `dragOver` = which column has a task hovering over it right now (or null = none)
- Used to show the dashed border when you're dragging

#### Lines 36-42: The Add Task Handler

```tsx
const addTask = useCallback((e: FormEvent) => {
  e.preventDefault();
  const title = input.trim();
  if (!title) return;
  setTasks(prev => [...prev, { id: String(nextId++), title, column: 'now', createdAt: Date.now() }]);
  setInput('');
}, [input]);
```

When you press "Add" or hit Enter:

1. `e.preventDefault()` — "Stop the page from refreshing!" (Forms normally refresh the page. We don't want that.)

2. `const title = input.trim()` — Take what you typed and remove any extra spaces at the beginning or end. ("  hello  " becomes "hello")

3. `if (!title) return;` — If after trimming it's empty (you typed nothing), do nothing. Can't add an empty task.

4. `setTasks(prev => [...prev, newTask])` — Make a new list that has ALL the old tasks AND one new one at the end. The new task gets:
   - `id: String(nextId++)` — ticket number goes up by 1. First time: "5", next time: "6", etc.
   - `title` — what you typed
   - `column: 'now'` — new tasks always start in "Now"
   - `createdAt: Date.now()` — right now, this exact millisecond

5. `setInput('')` — Clear the text box so you can type again.

The `useCallback` wrapper with `[input]` means: "Only remake this function if `input` changes." Otherwise keep the old one. Saves computer energy.

#### Lines 44-46: The Delete Handler

```tsx
const deleteTask = useCallback((id: string) => {
  setTasks(prev => prev.filter(t => t.id !== id));
}, []);
```

When you click the × button:

1. Take the current list of tasks
2. `filter(t => t.id !== id)` — Go through every task. Keep only the ones whose `id` does NOT match the one we want to delete.
3. Like sifting sand. You hold the sieve and shake. The one we don't want falls through. The rest stay.

`useCallback` with `[]` means: "This function never needs to be remade. It works the same way forever."

#### Lines 48-51: The Move Handler

```tsx
const moveTask = useCallback((id: string, to: ColumnId) => {
  setTasks(prev => prev.map(t => t.id === id ? { ...t, column: to } : t));
  setDragOver(null);
}, []);
```

When you drop a task into a new column:

1. Go through every task
2. If the task's `id` matches the one being moved → make a COPY of it but with the new column name (`...t` means "copy everything about this task, then change `column`")
3. If it doesn't match → leave it as is
4. Remove the drag-over highlight

#### Lines 53-56: Drag Start Handler

```tsx
const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
  e.dataTransfer.setData('text/plain', id);
  e.dataTransfer.effectAllowed = 'move';
}, []);
```

When you start picking up a task with your mouse:

1. `setData('text/plain', id)` — Write the task's ID on a sticky note and attach it to the mouse cursor. When you drop it, we'll read this note.
2. `effectAllowed = 'move'` — Tell the browser "this thing is being MOVED, not copied."

#### Lines 58-62: Drag Over Handler

```tsx
const handleDragOver = useCallback((e: React.DragEvent, col: ColumnId) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  setDragOver(col);
}, []);
```

When you drag a task over a column:

1. `e.preventDefault()` — By default, the browser does NOT let you drop things. We have to say "YES, IT'S OKAY TO DROP HERE."
2. `dropEffect = 'move'` — Show the "moving" cursor icon
3. `setDragOver(col)` — Remember which column is being hovered over, so we can show the dashed border

#### Lines 64-66: Drag Leave Handler

```tsx
const handleDragLeave = useCallback(() => {
  setDragOver(null);
}, []);
```

When you drag the task AWAY from a column, remove the dashed border.

#### Lines 68-72: The Drop Handler

```tsx
const handleDrop = useCallback((e: React.DragEvent, col: ColumnId) => {
  e.preventDefault();
  const id = e.dataTransfer.getData('text/plain');
  if (id) moveTask(id, col);
}, [moveTask]);
```

When you LET GO of a task over a column:

1. `e.preventDefault()` — Stop the browser from doing its default thing
2. Read the sticky note from drag start to find out WHICH task we're holding
3. If there is an ID, call `moveTask` to move it to this column

#### Lines 74-145: The Screen (JSX)

This is what you SEE on the screen.

**Lines 75-81** — The header:
```tsx
<div className="app">
  <header className="header">
    <h1 className="title">Wahala Sorter</h1>
    <p className="subtitle">Your daily pile, sorted.</p>
  </header>
```
The big title at the top and the small words under it.

**Lines 83-94** — The add-task form:
```tsx
<form className="add-form" onSubmit={addTask}>
  <input
    className="add-input"
    placeholder="Add a new wahala..."
    value={input}
    onChange={e => setInput(e.target.value)}
    autoFocus
  />
  <button className="add-btn" type="submit" disabled={!input.trim()}>
    Add
  </button>
</form>
```

- A form with a text box and a button
- `value={input}` — The text box shows whatever is in our magic jar (`input`)
- `onChange={e => setInput(e.target.value)}` — Every time you type a letter, put the new text into the magic jar
- `autoFocus` — When the page loads, the cursor is already blinking in this box, ready to type
- `disabled={!input.trim()}` — If the box is empty, the button is greyed out and can't be clicked
- `onSubmit={addTask}` — When you press Enter or click Add, run `addTask`

**Lines 96-143** — The board with three columns:
```tsx
<div className="board">
  {COLUMNS.map(col => {
    const colTasks = tasks.filter(t => t.column === col.id);
    return (
      <div ...>
```

`COLUMNS.map(...)` — Go through our three columns (Now, Soon, Later). For each one, create a column on the screen.

`colTasks = tasks.filter(t => t.column === col.id)` — Look at ALL tasks. Only keep the ones that belong to THIS column. So for the "Now" column, only show tasks with `column: 'now'`.

**Lines 100-105** — The column box:
```tsx
<div
  key={col.id}
  className={`column column--${col.id}${dragOver === col.id ? ' column--drag-over' : ''}`}
  onDragOver={e => handleDragOver(e, col.id)}
  onDragLeave={handleDragLeave}
  onDrop={e => handleDrop(e, col.id)}
>
```

- `key={col.id}` — React needs a unique name tag for each column so it knows which is which
- `className` — Builds a class name like "column column--now" or "column column--soon column--drag-over" (if something is being dragged over it)
- Three event handlers for drag and drop: drag over, drag leave, drop

**Lines 107-113** — Column header:
```tsx
<div className="column-header">
  <div className="column-title-row">
    <h2 className="column-title">{col.label}</h2>
    <span className="column-count">{colTasks.length}</span>
  </div>
  <p className="column-desc">{col.description}</p>
</div>
```

Shows:
- The column name ("Now") in big letters
- A little number badge showing how many tasks are in this column (like "3")
- The description underneath ("Right now, no delay")

**Lines 115-139** — The column body (where tasks live):
```tsx
<div className="column-body">
  {colTasks.length === 0 && (
    <p className="empty-state">Empty. For now.</p>
  )}
  {colTasks.map(task => (
    <div
      key={task.id}
      className="task"
      draggable
      onDragStart={e => handleDragStart(e, task.id)}
    >
```

- If there are zero tasks in this column → show "Empty. For now." (not "nothing here" — "for now" implies it won't stay empty)
- For each task, create a task card
- `draggable` — This is what makes the task pick-up-able with your mouse
- `onDragStart` — When you start dragging, run handleDragStart

**Lines 126-137** — Inside each task card:
```tsx
<div className="task-content">
  <span className="task-title">{task.title}</span>
  <span className="task-meta">{formatTime(task.createdAt)}</span>
</div>
<button
  className="task-delete"
  onClick={() => deleteTask(task.id)}
  aria-label="Delete task"
>
  &times;
</button>
```

- Left side: The task text ("Call electrician about NEPA") + the timestamp ("5m ago")
- Right side: A × button that deletes the task. `aria-label="Delete task"` helps blind people using screen readers know what the button does. `&times;` is the HTML code for the × symbol.

---

## `src/index.css` — The Paint Job for the Whole House

**Lines 1-5** — The reset:
```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```
"Everything on the page: don't add weird spacing by default. Let ME control it." Like resetting all the factory settings.

**Lines 7-20** — The colour palette:
```css
:root {
  --bg: #F4EFEA;        /* warm cream - page background */
  --column-bg: #EAE2D9; /* slightly darker cream - column background */
  --card-bg: #FCFAF8;   /* almost white - task card */
  --text: #2E231E;      /* dark brown - main words */
  --text-soft: #7A6B62; /* lighter brown - small words, timestamps */
  --border: #DDD4CA;    /* tan - borders between things */
  --now: #C75B3A;       /* terracotta/rust - Now column accent */
  --now-soft: #F0DDD4;  /* light rust */
  --soon: #3F7D6A;      /* forest teal - Soon accent */
  --soon-soft: #DCEAE4; /* light teal */
  --later: #8A7B70;     /* warm grey-brown - Later accent */
  --later-soft: #E8E2DC;/* light taupe */
}
```

These are CSS variables (custom properties). Like colour buckets. We write `--bg` once, and every time we say `var(--bg)`, it means `#F4EFEA`. If we want to change the whole page colour, we change ONE number.

The colours are like Lagos earth and clay. Warm, not cold. No blue, no purple, no AI look.

**Lines 22-26** — html:
```css
html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```
Make text look smooth and clear on screens (not jaggy).

**Lines 28-33** — body:
```css
body {
  font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}
```
The whole page:
- Uses DM Sans font (or falls back to system fonts if Google doesn't load)
- Cream background
- Dark brown text
- At least as tall as the screen (`100vh` = 100% of the viewport height)

**Lines 35-37** — #root:
```css
#root {
  min-height: 100vh;
}
```
The div where React lives should also be at least as tall as the screen.

---

## `src/App.css` — The Furniture in Each Room

**Lines 1-5** — `.app`:
```css
.app {
  max-width: 960px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}
```
The whole app: 960 pixels wide at most. Centred on the page. Padding top and sides so it doesn't touch the edges.

**Lines 7-9** — `.header`:
Just 32px space below the header.

**Lines 11-18** — `.title`:
```css
.title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--text);
}
```
The "Wahala Sorter" title:
- Uses the fancy serif font (with feet)
- `clamp(2rem, 5vw, 3rem)` — "Be between 2 and 3 font-sizes big. On a phone, be smaller. On a big screen, be bigger." Like a rubber band.
- `line-height: 1.1` — Tight spacing between lines
- `letter-spacing: -0.02em` — Squeeze letters slightly closer together

**Lines 20-25** — `.subtitle`:
"Italic, soft brown, grows with the screen."

**Lines 27-31** — `.add-form`:
Flexbox layout. The input and button sit side by side with 8px gap. 36px space below.

**Lines 33-53** — `.add-input`:
The text box:
- Takes up remaining space (`flex: 1`)
- 12px padding inside for comfortable typing
- A 2px tan border
- `border-radius: 0` — SQUARE corners. No roundness. Flat design.
- When focused, the border turns terracotta (the Now colour)
- The placeholder text ("Add a new wahala...") is semi-transparent soft brown

**Lines 55-74** — `.add-btn`:
The Add button:
- Terracotta background + matching border
- White text, bold
- When disabled: faded to 35% opacity + "no clicking" cursor
- When hovered and not disabled: slightly faded (opacity 0.9)

**Lines 76-81** — `.board`:
```css
.board {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  align-items: start;
}
```
A grid with three equal columns. 16px gaps between them. `align-items: start` means each column starts at the top (if one is shorter, it doesn't stretch).

**Lines 83-92** — `.column`:
Tan background, at least 240px tall. When something is being dragged over it, a dashed dark brown outline appears (like "drop it here!").

**Lines 94-97** — `.column-header`:
Padding inside, a 2px tan line underneath separating the header from the body.

**Lines 99-103** — `.column-title-row`:
The title and the count badge sit side by side.

**Lines 105-110** — `.column-title`:
The column heading ("Now", "Soon", "Later") in the fancy serif font.

**Lines 112-118** — `.column-count`:
The little number badge. Small font, bold, white-ish background, soft brown text.

**Lines 120-124** — `.column-desc`:
Small description text underneath.

**Lines 126-132** — `.column-body`:
The area where tasks sit. 8px padding, tasks stacked vertically with 6px gaps, at least 80px tall so an empty column isn't completely flat.

**Lines 134-141** — `.empty-state`:
Italic, soft brown, centred, semi-transparent. Says "Empty. For now."

**Lines 143-145** — Column colours:
```css
.column:nth-child(1) .column-title { color: var(--now); }
.column:nth-child(2) .column-title { color: var(--soon); }
.column:nth-child(3) .column-title { color: var(--later); }
```
First column → terracotta title. Second → teal. Third → taupe. `nth-child(1)` = "the first child of its parent."

**Lines 147-156** — `.task`:
A task card:
- Flexbox layout (content on left, × button on right)
- 12px padding, white-ish background
- `cursor: grab` — the mouse hand changes to a "grab" hand
- `user-select: none` — you can't accidentally select the text while dragging
- When you're actively clicking: `cursor: grabbing` + slightly transparent

**Lines 158-166** — `.task-content`:
Left side of the task. `flex: 1` takes up all available space. `min-width: 0` lets it shrink if needed.

**Lines 168-173** — `.task-title`:
The task words. 0.9rem (a bit smaller than normal), with room for long words to break onto the next line.

**Lines 175-180** — `.task-meta`:
The timestamp. Tiny (0.7rem), soft brown, 4px above it.

**Lines 182-197** — `.task-delete`:
The × button. 24x24 pixels. Hidden (`opacity: 0`) until you hover over the task. Transparent background. Soft brown colour.

**Lines 199-205**:
When you hover over a task, its delete button appears. When you hover over the delete button itself, it turns terracotta (danger colour).

**Lines 207-220** — The phone rules:
```css
@media (max-width: 700px) {
  .app { padding: 28px 16px 60px; }
  .board { grid-template-columns: 1fr; gap: 12px; }
  .add-form { flex-direction: column; }
}
```
`@media (max-width: 700px)` — "If the screen is 700px wide or smaller (like a phone)":
- Less padding around the app
- The board stacks into ONE column instead of three
- The add form stacks (input on top, button below)

---

## The Big Picture

It's a **to-do board with three piles**: things you must do NOW, things you'll do SOON, and things you'll do LATER.

You type a task → it goes into "Now". You drag it to another pile if you realise it's not that urgent. You delete it when it's done.

Everything lives in the computer's memory. If you refresh the page, it goes back to the example tasks.

The colours are **warm like Lagos** — cream walls, terracotta roofs, green trees, brown earth. No cold blue. No AI purple. No glass. No shadows. Just flat, honest boxes that help you sort your wahala.
