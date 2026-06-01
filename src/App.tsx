import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Task, ColumnId, AppSettings } from './types';
import { INITIAL_TASKS, INITIAL_PROJECTS } from './data/seed';
import { Board } from './components/Board';
import { Toast, type ToastState } from './components/Toast';
import { SearchBar } from './components/SearchBar';
import { FilterChips } from './components/FilterChips';
import { AddTaskModal } from './components/AddTaskModal';
import { AppDrawer } from './components/AppDrawer';
import { SettingsDrawer } from './components/SettingsDrawer';
import { OnboardingOverlay } from './components/OnboardingOverlay';
import { WeekSummaryCard } from './components/WeekSummary';
import { Confetti } from './components/Confetti';
import { loadTasks, saveTasks, loadTrash, saveTrash, loadProjects, saveProjects, loadSettings, saveSettings } from './utils/storage';
import { nextOccurrence } from './utils/recurrence';
import { getWeekStart } from './utils/time';
import { playTaskComplete, playTaskDelete, playTaskMove, playTaskAdd } from './utils/sounds';
import { exportBackup, importBackup } from './utils/backup';
import './App.css';

const COLUMNS: ColumnId[] = ['now', 'soon', 'later'];

const EMPTY_MESSAGES: Record<ColumnId, string> = {
  now: 'Nothing urgent right now. Enjoy it while it lasts.',
  soon: 'Nothing on the horizon yet.',
  later: 'Nothing set aside. Is that right?',
};

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks() ?? INITIAL_TASKS);
  const [trashBin, setTrashBin] = useState<Task[]>(() => loadTrash());
  const [projects, setProjects] = useState(() => {
    const saved = loadProjects();
    return saved.length ? saved : INITIAL_PROJECTS;
  });
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [showTrash, setShowTrash] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [dragOver, setDragOver] = useState<ColumnId | null>(null);
  
  const [touchDragId, setTouchDragId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(() => Date.now());
  const [zoom, setZoom] = useState(1);
  const [zoomFlashKey, setZoomFlashKey] = useState(0);
  const toastKey = useRef(0);
  const toastTimer = useRef<number | undefined>(undefined);
  const undoStack = useRef<Task | null>(null);

  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState<string | undefined>();
  const [showCompleted, setShowCompleted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(!settings.onboardingDone);
  const [confettiKey, setConfettiKey] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(id); }, []);
  useEffect(() => { saveTasks(tasks); }, [tasks]);
  useEffect(() => { saveTrash(trashBin); }, [trashBin]);
  useEffect(() => { saveProjects(projects); }, [projects]);
  useEffect(() => { saveSettings(settings); }, [settings]);

  const tasksByColumn = useMemo(() => {
    const filtered = tasks.filter(t => {
      if (t.completedAt && !showCompleted) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !t.tags.some(tag => tag.includes(q))) return false;
      }
      if (projectFilter && t.projectId !== projectFilter) return false;
      return true;
    });
    return {
      now: filtered.filter(t => t.column === 'now'),
      soon: filtered.filter(t => t.column === 'soon'),
      later: filtered.filter(t => t.column === 'later'),
    };
  }, [tasks, search, projectFilter, showCompleted]);

  const totalTasks = tasks.length;
  const selectionMode = selectedIds.size > 0;

  const clearToast = useCallback(() => { clearTimeout(toastTimer.current); setToast(null); }, []);
  const showToast = useCallback((message: string, action?: { label: string; onClick: () => void }) => {
    clearTimeout(toastTimer.current);
    toastKey.current += 1;
    setToast({ message, action, key: toastKey.current });
    toastTimer.current = window.setTimeout(() => {
      setToast(prev => prev && prev.key === toastKey.current ? { ...prev, closing: true } : prev);
      setTimeout(() => setToast(prev => prev && prev.key === toastKey.current ? null : prev), 300);
    }, 5000);
  }, []);

  const applyRecurrence = useCallback((task: Task) => {
    const next = nextOccurrence(task);
    if (next) setTasks(prev => [...prev, next]);
  }, []);

  const addTask = useCallback((title: string, projectId?: string, column?: ColumnId) => {
    const col = column || 'now';
    setTasks(prev => {
      const maxOrder = prev.filter(t => t.column === col).length;
      return [...prev, {
        id: crypto.randomUUID(), title, column: col, createdAt: Date.now(),
        recurrence: 'none', subtasks: [], tags: [], sortOrder: maxOrder, notes: '',
        projectId,
      }];
    });
    if (settings.soundEnabled) playTaskAdd();
    showToast(`Pinned "${title}" to ${settings.columnLabels[col]}.`);
  }, [showToast, settings]);

  const deleteTask = useCallback((id: string, silent?: boolean) => {
    const task = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    if (task) {
      undoStack.current = task;
      setTrashBin(prev => [task, ...prev]);
      if (settings.soundEnabled) playTaskDelete();
      if (!silent) showToast('Gone. To the archive.', {
        label: 'Undo',
        onClick: () => {
          if (undoStack.current) {
            setTasks(prev => [...prev, undoStack.current!]);
            setTrashBin(prev => prev.filter(t => t.id !== undoStack.current!.id));
            undoStack.current = null;
            clearToast();
            showToast('Back from the dead.');
          }
        },
      });
    }
  }, [tasks, showToast, clearToast, settings]);

  const editTask = useCallback((id: string, title: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, title } : t));
    showToast('Title updated.');
  }, [showToast]);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
    if (patch.completedAt) {
      const task = tasks.find(t => t.id === id);
      if (task) applyRecurrence(task);
      if (settings.confettiEnabled) setConfettiKey(k => k + 1);
      if (settings.soundEnabled) playTaskComplete();
      showToast('Done!');
    }
  }, [tasks, applyRecurrence, settings]);

  const moveTask = useCallback((id: string, to: ColumnId, silent?: boolean) => {
    const task = tasks.find(t => t.id === id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, column: to } : t));
    setDragOver(null);
    if (settings.soundEnabled) playTaskMove();
    if (task && !silent) showToast(`Slotted into ${settings.columnLabels[to]}.`);
  }, [tasks, showToast, settings]);

  const clearColumn = useCallback((colId: ColumnId) => {
    const toRemove = tasks.filter(t => t.column === colId);
    toRemove.forEach(t => { undoStack.current = t; setTrashBin(prev => [t, ...prev]); });
    setTasks(prev => prev.filter(t => t.column !== colId));
    showToast(`Wiped ${settings.columnLabels[colId]}.`, {
      label: 'Undo',
      onClick: () => {
        setTasks(prev => [...prev, ...toRemove]);
        setTrashBin(prev => prev.filter(t => !toRemove.find(r => r.id === t.id)));
        clearToast();
        showToast('Column revived.');
      },
    });
  }, [tasks, showToast, clearToast, settings.columnLabels]);

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);
  const setZoomSafe = useCallback((v: number) => {
    setZoom(Math.max(0.4, Math.min(1.45, +v.toFixed(2))));
    setZoomFlashKey(k => k + 1);
  }, []);

  const zoomIn = useCallback(() => setZoomSafe(zoomRef.current + 0.15), [setZoomSafe]);
  const zoomOut = useCallback(() => setZoomSafe(zoomRef.current - 0.15), [setZoomSafe]);
  const zoomReset = useCallback(() => setZoomSafe(1), [setZoomSafe]);

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
      setZoomSafe(pinchRef.current.zoom * (Math.hypot(dx, dy) / pinchRef.current.dist));
    }
  }, [setZoomSafe]);
  const handleTouchEnd = useCallback(() => {
    pinchRef.current = null;
  }, []);
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoomSafe(zoomRef.current - e.deltaY * 0.002); }
  }, [setZoomSafe]);

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
    const el = zoomAreaRef.current;
    if (!el) return;
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('wheel', handleWheel);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel]);

  // --- rAF-based auto-scroll for touch drag ---
  const touchPosRef = useRef<{ x: number } | null>(null);
  const autoScrollRafRef = useRef<number | undefined>(undefined);
  const autoScrollDirRef = useRef(0);
  const autoScrollBoardRef = useRef<HTMLElement | null>(null);

  const handleDragTouchMove = useCallback((_id: string, clientX: number) => {
    touchPosRef.current = { x: clientX };
  }, []);

  const autoScrollLoop = useCallback(() => {
    const board = autoScrollBoardRef.current;
    if (!board) { autoScrollRafRef.current = undefined; return; }
    if (touchPosRef.current === null) {
      autoScrollRafRef.current = requestAnimationFrame(autoScrollLoop);
      return;
    }
    const edgeZone = window.innerWidth * 0.25;
    const x = touchPosRef.current.x;
    let dir = 0;
    let speed = 0;
    if (x >= window.innerWidth - edgeZone) {
      dir = 1;
      speed = 8 + ((x - (window.innerWidth - edgeZone)) / edgeZone) * 24;
    } else if (x <= edgeZone) {
      dir = -1;
      speed = 8 + ((edgeZone - x) / edgeZone) * 24;
    }
    if (dir !== autoScrollDirRef.current) {
      autoScrollDirRef.current = dir;
      if (dir === 0) board.style.scrollSnapType = '';
      else board.style.scrollSnapType = 'none';
    }
    if (dir !== 0) board.scrollLeft += dir * Math.round(speed);
    autoScrollRafRef.current = requestAnimationFrame(autoScrollLoop);
  }, []);

  useEffect(() => {
    if (touchDragId) {
      autoScrollBoardRef.current = document.querySelector('.board') as HTMLElement | null;
      touchPosRef.current = null;
      autoScrollDirRef.current = 0;
      autoScrollRafRef.current = requestAnimationFrame(autoScrollLoop);
    } else {
      if (autoScrollRafRef.current !== undefined) {
        cancelAnimationFrame(autoScrollRafRef.current);
        autoScrollRafRef.current = undefined;
      }
      touchPosRef.current = null;
      autoScrollDirRef.current = 0;
      const b = autoScrollBoardRef.current || document.querySelector('.board') as HTMLElement | null;
      if (b) b.style.scrollSnapType = '';
      autoScrollBoardRef.current = null;
    }
    return () => {
      if (autoScrollRafRef.current !== undefined) {
        cancelAnimationFrame(autoScrollRafRef.current);
        autoScrollRafRef.current = undefined;
      }
    };
  }, [touchDragId, autoScrollLoop]);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    e.dataTransfer.setDragImage(el, rect.width / 2, rect.height / 2);
    el.classList.add('task--dragging');
    document.querySelector('.board')?.classList.add('board--dragging');
  }, []);
  const handleDragEnd = useCallback(() => {
    setDragOver(null);
    document.querySelectorAll('.task--dragging').forEach(el => el.classList.remove('task--dragging'));
    document.querySelector('.board')?.classList.remove('board--dragging');
  }, []);
  const handleDragOver = useCallback((e: React.DragEvent, col: ColumnId) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(col); }, []);
  const handleDragLeave = useCallback(() => setDragOver(null), []);
  const handleDrop = useCallback((e: React.DragEvent, col: ColumnId) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id) moveTask(id, col); handleDragEnd(); }, [moveTask, handleDragEnd]);
  const handleTouchDragStart = useCallback((id: string) => setTouchDragId(id), []);
  const handleTouchDrop = useCallback((col: ColumnId) => {
    if (touchDragId) {
      if (selectedIds.has(touchDragId)) {
        const count = selectedIds.size;
        selectedIds.forEach(id => moveTask(id, col, true));
        setSelectedIds(new Set());
        showToast(`${count} task${count > 1 ? 's' : ''} moved to ${settings.columnLabels[col]}.`);
      } else moveTask(touchDragId, col);
      setTouchDragId(null);
    }
  }, [touchDragId, moveTask, selectedIds, showToast, settings.columnLabels]);
  const handleTouchDragCancel = useCallback(() => setTouchDragId(null), []);
  const toggleSelectId = useCallback((id: string) => setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; }), []);
  const bulkMove = useCallback((to: ColumnId) => {
    const count = selectedIds.size;
    selectedIds.forEach(id => moveTask(id, to, true));
    setSelectedIds(new Set());
    showToast(`${count} task${count > 1 ? 's' : ''} moved to ${settings.columnLabels[to]}.`);
  }, [selectedIds, moveTask, showToast, settings.columnLabels]);
  const bulkDelete = useCallback(() => {
    const count = selectedIds.size;
    selectedIds.forEach(id => deleteTask(id, true));
    setSelectedIds(new Set());
    showToast(`${count} task${count > 1 ? 's' : ''} gone.`);
  }, [selectedIds, deleteTask, showToast]);
  const selectAll = useCallback(() => setSelectedIds(prev => prev.size === totalTasks ? new Set() : new Set(tasks.map(t => t.id))), [tasks, totalTasks]);

  const restoreFromTrash = useCallback((task: Task) => {
    setTasks(prev => [...prev, task]);
    setTrashBin(prev => prev.filter(t => t.id !== task.id));
    showToast(`"${task.title}" climbed back out.`);
  }, [showToast]);
  const clearTrash = useCallback(() => {
    const count = trashBin.length;
    setTrashBin([]);
    showToast(`Trash emptied (${count} task${count > 1 ? 's' : ''} gone).`);
  }, [trashBin, showToast]);

  const updateSettings = useCallback((s: AppSettings) => setSettings(s), []);
  const addProject = useCallback(() => {
    const id = crypto.randomUUID();
    setProjects(prev => [...prev, { id, name: 'New Project', color: ['#CC3333', '#3A6B9F', '#6B4F3A', '#4A7A4A', '#8B5CF6'][prev.length % 5], sortOrder: prev.length }]);
  }, []);
  const removeProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.map(t => t.projectId === id ? { ...t, projectId: undefined } : t));
  }, []);
  const renameProject = useCallback((id: string, name: string) => setProjects(prev => prev.map(p => p.id === id ? { ...p, name } : p)), []);
  const finishOnboarding = useCallback(() => { setShowOnboarding(false); setSettings(s => ({ ...s, onboardingDone: true })); }, [setSettings]);

  const handleExport = useCallback(() => {
    exportBackup(tasks, trashBin, projects, settings);
    showToast('Backup downloaded.');
  }, [tasks, trashBin, projects, settings, showToast]);

  const handleImport = useCallback((file: File) => {
    importBackup(file).then(data => {
      setTasks(data.tasks);
      setTrashBin(data.trash);
      setProjects(data.projects);
      setSettings(data.settings);
      showToast(`Imported ${data.tasks.length} tasks from backup.`);
    }).catch(err => {
      showToast(err.message || 'Import failed.');
    });
  }, [showToast]);

  const computeWeekStats = (tasksList: Task[]) => {
    const map = new Map<string, { completed: number; added: number }>();
    for (const t of tasksList) {
      if (t.completedAt) { const w = getWeekStart(t.completedAt); const e = map.get(w) || { completed: 0, added: 0 }; e.completed++; map.set(w, e); }
      const w = getWeekStart(t.createdAt); const e = map.get(w) || { completed: 0, added: 0 }; e.added++; map.set(w, e);
    }
    return Array.from(map.entries()).map(([ws, v]) => ({ weekStart: ws, ...v, streaks: 0 })).sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  };
  const weekStats = useMemo(() => computeWeekStats(tasks), [tasks]);
  const currentWeek = weekStats.length > 0 ? weekStats[weekStats.length - 1] : null;

  useEffect(() => {
    const hk = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '=') { e.preventDefault(); zoomIn(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') { e.preventDefault(); zoomOut(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') { e.preventDefault(); zoomReset(); return; }
      if (e.key === 'Escape') {
        if (selectionMode) { setSelectedIds(new Set()); return; }
        if (showSettings) { setShowSettings(false); return; }
        if (showAddModal) { setShowAddModal(false); return; }
        if (showDrawer) { setShowDrawer(false); return; }
        if (showMobileSearch) { setShowMobileSearch(false); return; }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (undoStack.current) {
          setTasks(prev => [...prev, undoStack.current!]);
          setTrashBin(prev => prev.filter(t => t.id !== undoStack.current!.id));
          undoStack.current = null;
          clearToast();
          showToast('Pulled back from the void.');
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', hk);
    return () => window.removeEventListener('keydown', hk);
  }, [showToast, clearToast, selectionMode, zoomIn, zoomOut, zoomReset, showSettings, showAddModal, showDrawer, showMobileSearch]);

  return (
    <div className="app" id="main-content" role="application" aria-label="Wahala Sorter priority board">
      <Confetti active={confettiKey > 0} key={confettiKey} />

      <header className="header" role="banner">
        <div className="header-left">
          <span className="pin pin--red pin--wobble" aria-hidden="true" />
          <div>
            <h1 className="header-title">Wahala Sorter</h1>
            <span className="header-sub" aria-label="The Board">The Board</span>
          </div>
        </div>
        <div className="header-right">
          <button className="header-icon-btn" onClick={() => setShowDrawer(true)} aria-label="Menu" title="Menu">
            <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
          <button className="header-icon-btn" onClick={() => setShowMobileSearch(s => !s)} aria-label={showMobileSearch ? 'Close search' : 'Open search'}>
            <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
          <span className="task-summary desktop-only" aria-label={`${totalTasks} total tasks`}>
            <svg className="task-summary-icon" viewBox="0 0 16 16" fill="none" width="12" height="12"><path d="M10 2l4 4-2 2a4 4 0 01-1 3l-1 1-5-5 1-1a4 4 0 013-1l2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 12l-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <span className="task-summary-count">{totalTasks}</span>
          </span>
        </div>
      </header>

      {showMobileSearch && (
        <div className="mobile-search">
          <div className="search-input-wrap">
            <svg className="search-icon" viewBox="0 0 16 16" fill="none" width="14" height="14"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <input className="search-input" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
            {search && <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear">&times;</button>}
          </div>
        </div>
      )}

      <SearchBar query={search} onQuery={setSearch} projectFilter={projectFilter} onProjectFilter={setProjectFilter} projects={projects} showCompleted={showCompleted} onShowCompleted={setShowCompleted} />

      <FilterChips projects={projects} active={projectFilter} onChange={setProjectFilter} />

      {selectionMode && (
        <div className="bulk-bar">
          <span className="bulk-bar-count">{selectedIds.size} selected</span>
          <button className="bulk-bar-btn bulk-bar-btn--select-all" onClick={selectAll}>{selectedIds.size === totalTasks ? 'Deselect All' : 'Select All'}</button>
          <div className="bulk-bar-actions">
            {COLUMNS.map(col => (
              <button key={col} className={`bulk-bar-btn bulk-bar-btn--${col}`} onClick={() => bulkMove(col)} disabled={selectedIds.size === 0}>&rarr; {settings.columnLabels[col]}</button>
            ))}
            <button className="bulk-bar-btn bulk-bar-btn--delete" onClick={bulkDelete} disabled={selectedIds.size === 0}>&times; Delete</button>
          </div>
        </div>
      )}

      <div className="zoom-area" ref={zoomAreaRef} style={{ '--zoom': zoom } as React.CSSProperties}>
        <Board key="board" tasksByColumn={tasksByColumn} columns={COLUMNS.map(c => ({ id: c, label: settings.columnLabels[c], description: settings.columnDescriptions[c] }))}
          now={now} projects={projects} dragOver={dragOver} touchDragId={touchDragId} selectionMode={selectionMode} selectedIds={selectedIds}
          emptyMessages={EMPTY_MESSAGES} sortMode={settings.defaultSort}
          onDelete={deleteTask} onEdit={editTask} onMove={moveTask} onUpdate={updateTask} onClearColumn={clearColumn}
          onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          onTouchDragStart={handleTouchDragStart} onTouchDrop={handleTouchDrop} onTouchDragCancel={handleTouchDragCancel} onToggleSelect={toggleSelectId} onDragTouchMove={handleDragTouchMove} />
      </div>

      {currentWeek && <WeekSummaryCard {...currentWeek} />}

      <button className="fab" onClick={() => setShowAddModal(true)} aria-label="Add task">
        <svg viewBox="0 0 24 24" fill="none" width="24" height="24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
      </button>

      <div className="zoom-controls" role="group" aria-label="Zoom controls">
        <button className="zoom-btn" onClick={zoomOut} disabled={zoom <= 0.4} aria-label="Zoom out">&minus;</button>
        <button className="zoom-btn zoom-btn--reset" onClick={zoomReset} aria-label="Reset zoom">{Math.round(zoom * 100)}%</button>
        <button className="zoom-btn" onClick={zoomIn} disabled={zoom >= 1.45} aria-label="Zoom in">+</button>
      </div>

      {showTrash && trashBin.length > 0 && (
        <div className="trash-overlay" onClick={() => setShowTrash(false)}>
          <div className="trash-drawer" onClick={e => e.stopPropagation()}>
            <div className="trash-header"><h2 className="trash-title">Trash</h2><button className="trash-close" onClick={() => setShowTrash(false)} aria-label="Close">&times;</button></div>
            <p className="trash-sub">{trashBin.length} deleted task{trashBin.length > 1 ? 's' : ''}</p>
            <div className="trash-list">
              {trashBin.map(task => (
                <div key={task.id} className="trash-item">
                  <div className="trash-item-content"><span className="trash-item-title">{task.title}</span><span className="trash-item-meta">{task.column}</span></div>
                  <button className="trash-restore-btn" onClick={() => restoreFromTrash(task)}>Restore</button>
                </div>
              ))}
            </div>
            <button className="trash-clear-btn" onClick={() => clearTrash()}>Empty Trash</button>
          </div>
        </div>
      )}

      <AddTaskModal open={showAddModal} projects={projects} onClose={() => setShowAddModal(false)} onAdd={addTask} />
      <AppDrawer open={showDrawer} showCompleted={showCompleted} weekSummary={currentWeek} trashCount={trashBin.length}
        onClose={() => setShowDrawer(false)} onShowCompleted={setShowCompleted}
        onOpenSettings={() => setShowSettings(true)} onOpenTrash={() => setShowTrash(true)}
        onGoHome={() => { window.location.hash = '' }}
        onExport={handleExport} onImport={handleImport} />
      <SettingsDrawer open={showSettings} settings={settings} projects={projects} onClose={() => setShowSettings(false)}
        onUpdate={updateSettings} onAddProject={addProject} onRemoveProject={removeProject} onRenameProject={renameProject} />
      <OnboardingOverlay open={showOnboarding} onDone={finishOnboarding} />
      <Toast toast={toast} />
    </div>
  );
}

export default App;
