# Tinkering with Code: The "Delete Everything Else" Bug

## The Code Line
**File:** `src/App.tsx` (around line 45)

**Original:**
```tsx
setTasks(prev => prev.filter(t => t.id !== id));
```

**Change:**
```tsx
setTasks(prev => prev.filter(t => t.id === id));
```

## The Prediction
JavaScript's `Array.prototype.filter` creates a new array containing only the elements that return `true` for the provided condition. 

In the original code (`t.id !== id`), the logic says: "Keep every task where the ID does NOT match the one I clicked." This successfully filters out the clicked task, deleting it from the state.

If I change it to `t.id === id`, the logic violently reverses: "Keep ONLY the task where the ID exactly matches the one I clicked." 

**Prediction:** Clicking the delete button on a single task will suddenly delete **every other task on the board**, leaving only the task you intended to delete.

## The Actual Result
I started the dev server and hovered over the first task ("Call electrician about NEPA") in the "Now" column to reveal its delete button (`×`). 

Upon clicking the button, exactly as predicted, the three other tasks instantly vanished from the board. The "Call electrician" task was the only one left standing. 

## What the Gap Taught Me
This exercise highlights how deeply React relies on immutable data transformations (like `.filter()`) to derive the next state. A single character change (`!==` to `===`) radically alters the transformation rules. 

It also demonstrates why **unit tests are critical**. In a manual test, you might not notice a subtle bug if you're only checking "did the state change?" without verifying *how* it changed. Data mutation bugs are often silent, cascading, and catastrophic if left unchecked. A simple unit test asserting `expect(tasks.length).toBe(3)` after deleting one of four tasks would have instantly caught this regression.
