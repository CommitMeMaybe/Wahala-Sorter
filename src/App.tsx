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
  const [now, setNow] = useState(() => Date.now());
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

  const deleteTask = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    if (task) {
      undoStack.current = task;
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
  }, [tasks, showToast, clearToast]);

  const editTask = useCallback((id: string, title: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, title } : t));
    showToast('Task updated.');
  }, [showToast]);

  const moveTask = useCallback((id: string, to: ColumnId) => {
    const task = tasks.find(t => t.id === id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, column: to } : t));
    setDragOver(null);
    if (task) {
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [showToast, clearToast]);

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

      <div className="board-actions">
        {COLUMNS.map(col => (
          <button
            key={col.id}
            className="board-action-btn"
            onClick={() => clearColumn(col.id)}
            disabled={tasksByColumn[col.id].length === 0}
            aria-label={`Clear ${col.label} column`}
          >
            Clear {col.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="popLayout">
        <Board
          key="board"
          tasksByColumn={tasksByColumn}
          columns={COLUMNS}
          now={now}
          dragOver={dragOver}
          emptyMessages={EMPTY_MESSAGES}
          onDelete={deleteTask}
          onEdit={editTask}
          onMove={moveTask}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
      </AnimatePresence>

      <Footer />

      <Toast toast={toast} />

      <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
        {toast?.message ?? ''}
      </div>
    </div>
  );
}

export default App;
