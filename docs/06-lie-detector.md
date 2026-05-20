# Lie Detector: Wahala Sorter Edition

## The Statements

1. **[TRUE]** The `addTask` function is hardcoded so that any brand-new task you create is immediately sent to the "Now" column, regardless of the task's title.
2. **[TRUE]** The app relies entirely on native HTML5 drag-and-drop events (like `onDragStart` and `onDrop`) to move tasks around, rather than using a third-party drag-and-drop library.
3. **[TRUE]** The `×` delete button on a task card is completely invisible by default (opacity of 0) and only appears when your mouse actively hovers over the task.
4. **[LIE]** The app ensures that the "time ago" timestamps on tasks stay accurate by using a `setInterval` hook that automatically recalculates the time exactly every 60 seconds.
5. **[TRUE]** The application's internal ID counter for creating new tasks starts exactly at `5` because the app is pre-loaded with four initial demo tasks.

---

## The Guess

**User's Guess:** Statement 4 is a lie, everything else checks out. From the codebase, I could see 30 secs was used to have a max staleness of 30 secs.

---

## The Reveal

**You got it! Statement 4 is the lie!** 🏆 

However, your reasoning highlights a fascinating gap between *what the code should do* versus *what the code actually does* right now.

You recalled the `setInterval` logic perfectly—but that logic actually came from the **recommendations** in the `03-audit.md` file (which suggested ticking the clock every 30 seconds to save performance). 

If you look at the **actual, currently running code** in `App.tsx`:
```tsx
function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  // ...
}
```

There is **no** `setInterval` anywhere in the app! Instead, `Date.now()` is called directly inside `formatTime` on *every single render*. This means the app isn't waiting 30 or 60 seconds; it recalculates the time *every single time the screen redraws* (like when you type a letter in the input box, drag a card, or delete something). 

It's a huge performance trap that the audit caught. The fact that you remembered the 30-second fix means you have an excellent eye for the correct architectural solution! You definitely caught the lie.
