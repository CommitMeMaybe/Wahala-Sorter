# Wahala Sorter — What's Changed

A running log of design improvements, bug fixes, and quality-of-life upgrades. Written for everyone, not just developers.

---

## Latest Updates

### March / April 2026

#### Trash Bin — Deleted Tasks Are No Longer Gone Forever
- When you delete a task, it now goes into a **Trash** bin instead of vanishing instantly.
- A trash can icon appears in the top-right header. It shows a red badge counting how many tasks are in the bin.
- Tap the icon to open a drawer listing all recently deleted tasks. Each one shows its title and which column it came from.
- **Restore** a task to bring it back to your board. **Empty Trash** clears the bin permanently.
- The quick "Undo" toast still works for the most recent deletion — using it also removes the task from the Trash.
- Your Trash survives page refreshes (saved in your browser's storage).

#### Readability — Text Is Easier to See
- Column titles ("Now", "Soon", "Later") were too faint against the cork board background. Their colors have been brightened to pass **WCAG AA accessibility guidelines** (minimum 4.5:1 contrast).
  - **Now** went from a dim red to a lighter rose.
  - **Soon** went from a muted blue to a brighter sky blue.
  - **Later** went from a muddy brown to a warm tan.
- Body text on the landing page was raised from 40% opacity to 70% so you don't have to squint.
- The tiny sticky-note labels in the "Chaos" section on the landing page grew from 7px / 9px to 10px / 11px.

#### Cinematic Blur — Smoother, Less Dizzying
- The blur effect on the landing page was over-eager: it started blurring content while it was still clearly visible, and the animation lagged behind on phones.
- **Now:** Blur only kicks in after a section has mostly scrolled past, and it's much gentler (1.5px max instead of 3px).
- The scroll-tied animation is snappier (scrub reduced from 1.2s to 0.3s), so it doesn't trail behind your finger on mobile.

#### Multi-Select — Select All & Escape
- While in selection mode, a **"Select All" / "Deselect All"** button appears in the action bar — handy when you have lots of tasks.
- Pressing the **Escape** key on your keyboard now cancels selection mode.

#### Bulk Actions — No More Toast Spam
- Moving or deleting multiple tasks at once used to fire a toast notification for *each* task, flooding your screen.
- Now you get **one toast** for the entire batch: "Moved 5 tasks to Soon."

#### Long-Press Drag — You Can See It Charging
- When you press and hold a task card to enter drag mode, a **progress bar** fills across the top of the card during the 400ms hold. Green-to-red gradient. Lets you see the action charging up before it triggers.
- On iOS, where vibration (`navigator.vibrate`) isn't supported, the visual bar is the only feedback — so it's more important now.

#### Touch-Friendly Targets
- Buttons that were too small for thumbs have been enlarged to at least **44px × 44px** (Apple's recommended minimum):
  - Select / Cancel button
  - Bulk action buttons (→ Now, → Soon, etc.)
  - Zoom controls (−, %, +)
  - Menu close button (×)
  - Selection checkboxes

#### Zoom — Now With Visual Feedback
- The zoom buttons and pinch-to-zoom work the same, but now the board flashes briefly when zoom changes so you can **see** the adjustment happen.

#### Keyboard Shortcuts You Might Have Missed
- **Enter** or **Space** on a focused task card — opens the edit field.
- **Escape** — cancels selection mode.
- **Ctrl+Z** — undo the last deletion (works even after the toast fades).

---

### Earlier Updates

#### Mobile-Friendly Board Layout
- On phones, the three columns (Now / Soon / Later) now scroll **horizontally** instead of stacking vertically — each column takes up about 82% of the screen width. Swipe left and right to browse.
- Empty columns have a **dashed colored outline** so you can see they exist even when empty (red for Now, blue for Soon, brown for Later).

#### Tap to Pop Up — Task Menu
- Tapping a task card on mobile opens a **bottom sheet** with options to move it to another column.
- The sheet slides up with a smooth animation. Tap the dark backdrop or the × to dismiss.

#### Long-Press to Drag (Mobile)
- Press and hold a task for 400ms. The card lifts (slightly bigger, deeper shadow). Then tap any column's **"Drop here ↓"** zone to drop it there.
- A 10px movement tolerance prevents accidental triggers while scrolling.

#### Landing Page — Sorting Demo + Hand Animation
- The "SortingScene" (section 3 on the landing page) shows a mini board with three columns. On mobile, the columns scroll horizontally. Cards enter with a staggered animation.
- The hand animation that demonstrates long-press was rewritten: press → lift → slide → tap-burst. It now works better on mobile screens.

#### Landing Page — Showcase
- The board preview in section 4 stacks into a single column on mobile (instead of forcing three cramped columns).

#### Landing Page — Text & Button Overlap
- Fixed layout issues where text and buttons overlapped on small screens.

#### Landing Page — Scroll Hint
- A subtle "← swipe to browse →" hint appears below the sorting demo on mobile.

#### Landing Page — Three.js Background Performance
- The 3D particle scene runs at lower quality on mobile to save battery (reduced pixel ratio).

---

### Known Quirks (Not Bugs, Just Notes)
- The Permissions-Policy warnings in Chrome's console are from the browser itself, not our code. Harmless.
- The Three.js "THREE.Clock" warning is from the 3D library catching up with the latest version. Suppressed — harmless.
- The board zoom uses the CSS `zoom` property for proper layout reflow (unlike `transform: scale` which would break popup positioning).
- Task menus render outside the zoom container using a portal — this prevents them from being clipped or mispositioned when zoomed.
