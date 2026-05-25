import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Task, ColumnId } from './types';
import { INITIAL_TASKS } from './data/seed';
import { AddTaskForm } from './components/AddTaskForm';
import { Board } from './components/Board';
import { Toast, type ToastState } from './components/Toast';
import { Footer } from './components/Footer';
import { loadTasks, saveTasks, loadNextId, saveNextId } from './utils/storage';
import './App.css';

const COLUMNS = [
  { id: 'now' as ColumnId, label: 'Now', description: 'Right now, no delay' },
  { id: 'soon' as ColumnId, label: 'Soon', description: 'Today or tomorrow' },
  { id: 'later' as ColumnId, label: 'Later', description: 'This week, insha Allah' },
];

const EMPTY_MESSAGES: Record<ColumnId, string> = {
  now: 'Nothing urgent. Enjoy it while it lasts.',
  soon: 'Nothing pending. The calm before the storm.',
  later: 'Nothing on the back burner. Suspicious.',
};

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = loadTasks();
    return saved ?? INITIAL_TASKS;
  });
  const [nextId, setNextId] = useState(() => {
    const saved = loadNextId();
    return saved ?? 5;
  });
  const [dragOver, setDragOver] = useState<ColumnId | null>(null);
  const [touchDragId, setTouchDragId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(() => Date.now());
  const [zoom, setZoom] = useState(1);
  const [zoomFlashKey, setZoomFlashKey] = useState(0);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastKey = useRef(0);
  const toastTimer = useRef<number | undefined>(undefined);
  const undoStack = useRef<Task | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveNextId(nextId);
  }, [nextId]);

  const tasksByColumn = useMemo(() => ({
    now: tasks.filter(t => t.column === 'now'),
    soon: tasks.filter(t => t.column === 'soon'),
    later: tasks.filter(t => t.column === 'later'),
  }), [tasks]);

  const totalTasks = tasks.length;

  const clearToast = useCallback(() => {
    clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  const showToast = useCallback((message: string, action?: { label: string; onClick: () => void }) => {
    clearTimeout(toastTimer.current);
    toastKey.current += 1;
    setToast({ message, action, key: toastKey.current });
    toastTimer.current = setTimeout(() => {
      setToast(prev => prev && prev.key === toastKey.current ? { ...prev, closing: true } : prev);
      setTimeout(() => {
        setToast(prev => prev && prev.key === toastKey.current ? null : prev);
      }, 300);
    }, 5000);
  }, []);

  const addTask = useCallback((title: string) => {
    setTasks(prev => [...prev, {
      id: String(nextId),
      title,
      column: 'now' as ColumnId,
      createdAt: Date.now(),
    }]);
    setNextId(prev => prev + 1);
    showToast(`Pinned "${title}" to Now.`);
  }, [nextId, showToast]);

  const deleteTask = useCallback((id: string, silent?: boolean) => {
    const task = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    if (task) {
      undoStack.current = task;
      if (!silent) {
        showToast('Task trashed.', {
          label: 'Undo',
          onClick: () => {
            if (undoStack.current) {
              setTasks(prev => [...prev, undoStack.current!]);
              setNextId(prev => Math.max(prev, parseInt(undoStack.current!.id, 10) + 1));
              undoStack.current = null;
              clearToast();
              showToast('Task restored.');
            }
          },
        });
      }
    }
  }, [tasks, showToast, clearToast]);

  const editTask = useCallback((id: string, title: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, title } : t));
    showToast('Task updated.');
  }, [showToast]);

  const moveTask = useCallback((id: string, to: ColumnId, silent?: boolean) => {
    const task = tasks.find(t => t.id === id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, column: to } : t));
    setDragOver(null);
    if (task && !silent) {
      const label = COLUMNS.find(c => c.id === to)?.label || to;
      showToast(`Moved to ${label}.`);
    }
  }, [tasks, showToast]);

  const clearColumn = useCallback((col: ColumnId) => {
    const count = tasksByColumn[col].length;
    if (count === 0) return;
    setTasks(prev => prev.filter(t => t.column !== col));
    showToast(`Cleared ${count} task${count > 1 ? 's' : ''} from ${COLUMNS.find(c => c.id === col)?.label}.`);
  }, [tasksByColumn, showToast]);

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);
  const touchDragIdRef = useRef<string | null>(null);
  touchDragIdRef.current = touchDragId;
  const scrollDirRef = useRef(0);
  const scrollRafRef = useRef<number | undefined>(undefined);

  const doAutoScroll = useCallback(() => {
    const board = document.querySelector('.board') as HTMLElement | null;
    if (!board || scrollDirRef.current === 0) {
      scrollRafRef.current = undefined;
      return;
    }
    board.scrollLeft += scrollDirRef.current * 8;
    scrollRafRef.current = requestAnimationFrame(doAutoScroll);
  }, []);

  const setZoomSafe = useCallback((v: number) => {
    const clamped = Math.max(0.4, Math.min(1.45, +v.toFixed(2)));
    setZoom(clamped);
    setZoomFlashKey(k => k + 1);
  }, []);

  const zoomIn = useCallback(() => setZoomSafe(zoomRef.current + 0.15), [setZoomSafe]);
  const zoomOut = useCallback(() => setZoomSafe(zoomRef.current - 0.15), [setZoomSafe]);
  const zoomReset = useCallback(() => setZoom(1), []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = { dist: Math.hypot(dx, dy), zoom: zoomRef.current };
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const scale = newDist / pinchRef.current.dist;
      setZoomSafe(pinchRef.current.zoom * scale);
    }

    if (e.touches.length === 1 && touchDragIdRef.current) {
      const touch = e.touches[0];
      const edge = 40;
      let dir = 0;
      if (touch.clientX >= window.innerWidth - edge) dir = 1;
      else if (touch.clientX <= edge) dir = -1;

      if (dir !== scrollDirRef.current) {
        scrollDirRef.current = dir;
        if (dir !== 0 && scrollRafRef.current === undefined) {
          scrollRafRef.current = requestAnimationFrame(doAutoScroll);
        }
      }
    }
  }, [setZoomSafe, doAutoScroll]);

  const handleTouchEnd = useCallback(() => {
    pinchRef.current = null;
    scrollDirRef.current = 0;
    if (scrollRafRef.current !== undefined) {
      cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = undefined;
    }
  }, []);

  const zoomAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = zoomAreaRef.current;
    if (!el) return;
    el.classList.remove('zoom-area--flash');
    requestAnimationFrame(() => el.classList.add('zoom-area--flash'));
    const t = setTimeout(() => el.classList.remove('zoom-area--flash'), 250);
    return () => clearTimeout(t);
  }, [zoomFlashKey]);

  useEffect(() => {
    const el = document.getElementById('main-content');
    if (!el) return;
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd);
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    e.dataTransfer.setDragImage(el, rect.width / 2, rect.height / 2);
    el.classList.add('task--dragging');
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragOver(null);
    document.querySelectorAll('.task--dragging').forEach(el => el.classList.remove('task--dragging'));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, col: ColumnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(col);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, col: ColumnId) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) moveTask(id, col);
    handleDragEnd();
  }, [moveTask, handleDragEnd]);

  const handleTouchDragStart = useCallback((id: string) => {
    setTouchDragId(id);
  }, []);

  const handleTouchDrop = useCallback((col: ColumnId) => {
    if (touchDragId) {
      moveTask(touchDragId, col);
      setTouchDragId(null);
    }
  }, [touchDragId, moveTask]);

  const handleTouchDragCancel = useCallback(() => {
    setTouchDragId(null);
  }, []);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  }, []);

  const toggleSelectId = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const bulkMove = useCallback((to: ColumnId) => {
    const count = selectedIds.size;
    selectedIds.forEach(id => moveTask(id, to, true));
    setSelectedIds(new Set());
    setSelectionMode(false);
    const label = COLUMNS.find(c => c.id === to)?.label || to;
    showToast(`Moved ${count} task${count > 1 ? 's' : ''} to ${label}.`);
  }, [selectedIds, moveTask, showToast]);

  const bulkDelete = useCallback(() => {
    const count = selectedIds.size;
    selectedIds.forEach(id => deleteTask(id, true));
    setSelectedIds(new Set());
    setSelectionMode(false);
    showToast(`Deleted ${count} task${count > 1 ? 's' : ''}.`);
  }, [selectedIds, deleteTask, showToast]);

  const selectAll = useCallback(() => {
    setSelectedIds(prev => {
      if (prev.size === totalTasks) return new Set();
      return new Set(tasks.map(t => t.id));
    });
  }, [tasks, totalTasks]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '=') { e.preventDefault(); zoomIn(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') { e.preventDefault(); zoomOut(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') { e.preventDefault(); zoomReset(); return; }
      if (e.key === 'Escape' && selectionMode) { e.preventDefault(); toggleSelectionMode(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (undoStack.current) {
          setTasks(prev => [...prev, undoStack.current!]);
          setNextId(prev => Math.max(prev, parseInt(undoStack.current!.id, 10) + 1));
          undoStack.current = null;
          clearToast();
          showToast('Undo — task restored.');
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showToast, clearToast, selectionMode, toggleSelectionMode]);

  return (
    <div className="app" id="main-content" role="application" aria-label="Wahala Sorter priority board">
      <header className="header" role="banner">
        <div className="header-left">
          <span className="pin pin--red pin--wobble" aria-hidden="true" />
          <div>
            <h1 className="header-title">Wahala Sorter</h1>
            <span className="header-sub" aria-label="Evidence board mode">Evidence Board</span>
          </div>
        </div>
        <div className="header-right">
          <button
            className={`select-btn${selectionMode ? ' select-btn--active' : ''}`}
            onClick={toggleSelectionMode}
            aria-label={selectionMode ? 'Cancel selection' : 'Select multiple tasks'}
          >
            {selectionMode ? 'Cancel' : 'Select'}
          </button>
          <span className="task-summary" aria-label={`${totalTasks} total tasks`}>
            <span className="task-summary-count">{totalTasks}</span>
            <span className="task-summary-label">pinned</span>
          </span>
          <button
            className="back-btn"
            onClick={() => { window.location.hash = '' }}
            aria-label="Return to home page"
          >
            <span aria-hidden="true">&larr;</span> Home
          </button>
        </div>
      </header>

      <AddTaskForm onAdd={addTask} />

      {selectionMode && (
        <div className="bulk-bar">
          <span className="bulk-bar-count">{selectedIds.size} selected</span>
          <button className="bulk-bar-btn bulk-bar-btn--select-all" onClick={selectAll}>
            {selectedIds.size === totalTasks ? 'Deselect All' : 'Select All'}
          </button>
          <div className="bulk-bar-actions">
            {COLUMNS.map(col => (
              <button key={col.id} className={`bulk-bar-btn bulk-bar-btn--${col.id}`} onClick={() => bulkMove(col.id)} disabled={selectedIds.size === 0}>
                &rarr; {col.label}
              </button>
            ))}
            <button className="bulk-bar-btn bulk-bar-btn--delete" onClick={bulkDelete} disabled={selectedIds.size === 0}>
              &times; Delete
            </button>
          </div>
        </div>
      )}

      <div className="zoom-area" ref={zoomAreaRef} style={{ '--zoom': zoom } as React.CSSProperties}>
        <AnimatePresence mode="popLayout">
          <Board
            key="board"
            tasksByColumn={tasksByColumn}
            columns={COLUMNS}
            now={now}
            dragOver={dragOver}
            touchDragId={touchDragId}
            selectionMode={selectionMode}
            selectedIds={selectedIds}
            emptyMessages={EMPTY_MESSAGES}
            onDelete={deleteTask}
            onEdit={editTask}
            onMove={moveTask}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onTouchDragStart={handleTouchDragStart}
            onTouchDrop={handleTouchDrop}
            onTouchDragCancel={handleTouchDragCancel}
            onToggleSelect={toggleSelectId}
          />
        </AnimatePresence>
      </div>

      <div className="zoom-controls" role="group" aria-label="Zoom controls">
        <button className="zoom-btn" onClick={zoomOut} disabled={zoom <= 0.4} aria-label="Zoom out">&minus;</button>
        <button className="zoom-btn zoom-btn--reset" onClick={zoomReset} aria-label="Reset zoom">{Math.round(zoom * 100)}%</button>
        <button className="zoom-btn" onClick={zoomIn} disabled={zoom >= 1.45} aria-label="Zoom in">+</button>
      </div>

      <Footer />

      <Toast toast={toast} />

      <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
        {toast?.message ?? ''}
      </div>
    </div>
  );
}

export default App;
