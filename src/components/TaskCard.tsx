import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { Task, ColumnId, Project } from '../types';
import { formatTime, formatDate, isOverdue } from '../utils/time';
import { DatePicker } from './DatePicker';
import { RecurrencePicker } from './RecurrencePicker';
import { ProjectSelector } from './ProjectSelector';
import { TagInput } from './TagInput';
import { SubtaskList } from './SubtaskList';

interface TaskCardProps {
  task: Task;
  now: number;
  columns: ColumnId[];
  projects: Project[];
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onMove: (id: string, to: ColumnId) => void;
  onUpdate: (id: string, patch: Partial<Task>) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  touchDragId?: string | null;
  onTouchDragStart?: (id: string) => void;
  onTouchDragCancel?: () => void;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function TaskCard({ task, now, columns, projects, onDelete, onEdit, onMove, onUpdate, onDragStart, onDragEnd, touchDragId, onTouchDragStart, onTouchDragCancel, selectionMode, selected, onToggleSelect }: TaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const longPressTimer = useRef<number | undefined>(undefined);
  const longPressStartPos = useRef<{ x: number; y: number } | null>(null);
  const longPressInterval = useRef<number | undefined>(undefined);
  const longPressFired = useRef(false);

  const idx = columns.indexOf(task.column);
  const rot = useMemo(() => `${(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 1.5}deg`, []);

  const isLifted = touchDragId === task.id;
  const isStacked = touchDragId !== null && touchDragId !== task.id && selected;
  const overdue = isOverdue(task.dueDate) && !task.completedAt;
  const project = projects.find(p => p.id === task.projectId);

  useEffect(() => {
    if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
  }, [editing]);

  const clearLongPress = useCallback(() => {
    setLongPressProgress(0);
    if (longPressTimer.current !== undefined) { clearTimeout(longPressTimer.current); longPressTimer.current = undefined; }
    if (longPressInterval.current !== undefined) { clearInterval(longPressInterval.current); longPressInterval.current = undefined; }
    longPressStartPos.current = null;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isLifted) return;
    const touch = e.touches[0];
    longPressStartPos.current = { x: touch.clientX, y: touch.clientY };
    setLongPressProgress(0);
    longPressInterval.current = window.setInterval(() => setLongPressProgress(prev => Math.min(prev + 50 / 400, 1)), 50);
    longPressTimer.current = window.setTimeout(() => {
      longPressFired.current = true;
      if (selectionMode) { onTouchDragStart?.(task.id); navigator.vibrate?.(10); }
      else onToggleSelect?.(task.id);
      clearLongPress();
    }, 400);
  }, [task.id, onTouchDragStart, onToggleSelect, selectionMode, isLifted, clearLongPress]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (longPressStartPos.current) {
      const touch = e.touches[0];
      if (Math.abs(touch.clientX - longPressStartPos.current.x) > 10 || Math.abs(touch.clientY - longPressStartPos.current.y) > 10) clearLongPress();
    }
  }, [clearLongPress]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const fired = longPressFired.current;
    clearLongPress();
    if (fired) e.preventDefault();
    longPressFired.current = false;
  }, [clearLongPress]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (editing) return;
    if (e.key === 'ArrowRight' && idx < columns.length - 1) { e.preventDefault(); onMove(task.id, columns[idx + 1]); }
    else if (e.key === 'ArrowLeft' && idx > 0) { e.preventDefault(); onMove(task.id, columns[idx - 1]); }
    else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); onDelete(task.id); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDoubleClick(); }
  };

  const handleDoubleClick = () => { setEditValue(task.title); setEditing(true); };

  const commitEdit = () => {
    const trimmed = editValue.trim().slice(0, 200);
    if (trimmed && trimmed !== task.title) onEdit(task.id, trimmed);
    setEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); commitEdit(); }
    else if (e.key === 'Escape') setEditing(false);
  };

  const handleDelete = () => onDelete(task.id);

  const handleDragStartInner = (e: React.DragEvent) => { onDragStart(e, task.id); };

  const handleTap = () => {
    if (selectionMode) { onToggleSelect?.(task.id); return; }
    if (window.innerWidth <= 700) {
      if (isLifted) { onTouchDragCancel?.(); return; }
      if (touchDragId) return;
      setShowMenu(true);
    }
  };

  const handleMove = (to: ColumnId) => { onMove(task.id, to); setShowMenu(false); };

  const handleSelectClick = (e: React.MouseEvent) => { e.stopPropagation(); onToggleSelect?.(task.id); };

  const otherColumns = columns.filter(c => c !== task.column);

  const doneSubtasks = task.subtasks.filter(s => s.done).length;

  return (
    <div className={`task ${isLifted ? 'task--lifted' : ''} ${selectionMode ? 'task--selectable' : ''} ${selected ? 'task--selected' : ''} ${isStacked ? 'task--stacked' : ''} ${overdue ? 'task--overdue' : ''} ${task.completedAt ? 'task--completed' : ''}`}
      draggable={!selectionMode}
      tabIndex={0}
      role="listitem"
      style={{ '--task-rot': rot } as React.CSSProperties}
      onDragStart={handleDragStartInner}
      onDragEnd={onDragEnd}
      onKeyDown={handleKeyDown}
      onDoubleClick={selectionMode ? undefined : handleDoubleClick}
      onClick={selectionMode ? (() => { if (!isLifted) onToggleSelect?.(task.id); }) : handleTap}
      onTouchStart={(!selectionMode || selected) ? handleTouchStart : undefined}
      onTouchMove={(!selectionMode || selected) ? handleTouchMove : undefined}
      onTouchEnd={(!selectionMode || selected) ? handleTouchEnd : undefined}
      aria-label={`Task: ${task.title}. In ${task.column} column.`}
    >
      {selectionMode && (
        <button
          type="button"
          className="task-check"
          onClick={handleSelectClick}
          role="checkbox"
          aria-checked={selected}
          aria-label={`${selected ? 'Deselect' : 'Select'} task "${task.title}"`}
        >
          <div className={`task-check-box ${selected ? 'task-check-box--checked' : ''}`}>
            {selected && <svg viewBox="0 0 12 12" fill="none" className="task-check-icon"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
        </button>
      )}
      <div className="task-content">
        {editing ? (
          <input ref={inputRef} className="task-edit-input" value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={commitEdit} onKeyDown={handleEditKeyDown} maxLength={200} aria-label="Edit task title" />
        ) : (
          <>
            <div className="task-title-row">
              {project && <span className="task-project-dot" style={{ background: project.color }} title={project.name} />}
              <span className="task-title">{task.title}</span>
            </div>
            <div className="task-meta-row">
              <span className="task-meta">{formatTime(task.createdAt, now)}</span>
              {task.dueDate && <span className={`task-due ${overdue ? 'task-due--overdue' : ''}`}>{formatDate(task.dueDate)}</span>}
              {doneSubtasks > 0 && <span className="task-subtask-count">{doneSubtasks}/{task.subtasks.length}</span>}
              {task.recurrence !== 'none' && <span className="task-recurrence-icon" title={`Repeats ${task.recurrence}`}>&#x1F503;</span>}
            </div>
            {task.tags.length > 0 && (
              <div className="task-tags">{task.tags.map(t => <span key={t} className="task-tag">{t}</span>)}</div>
            )}
          </>
        )}
      </div>

      {!selectionMode && !editing && (
        <div className="task-actions">
          <button className="task-expand-btn" onClick={e => { e.stopPropagation(); setExpanded(!expanded); }} aria-label={expanded ? 'Collapse' : 'Expand'}>
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14" style={{ transform: expanded ? 'rotate(180deg)' : '' }}>
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="task-delete" onClick={handleDelete} aria-label={`Delete "${task.title}"`}>&times;</button>
        </div>
      )}

      {expanded && !editing && !selectionMode && (
        <div className="task-details" onClick={e => e.stopPropagation()}>
          <div className="task-details-section">
            <DatePicker dueDate={task.dueDate} reminderTime={task.reminderTime} onChange={(due, rem) => onUpdate(task.id, { dueDate: due, reminderTime: rem })} />
          </div>
          <div className="task-details-section">
            <RecurrencePicker value={task.recurrence} onChange={r => onUpdate(task.id, { recurrence: r })} />
          </div>
          <div className="task-details-section">
            <ProjectSelector projects={projects} value={task.projectId} onChange={id => onUpdate(task.id, { projectId: id })} />
          </div>
          <div className="task-details-section">
            <TagInput tags={task.tags} onChange={tags => onUpdate(task.id, { tags })} />
          </div>
          <div className="task-details-section">
            <SubtaskList subtasks={task.subtasks} onChange={st => onUpdate(task.id, { subtasks: st })} />
          </div>
          <div className="task-details-section">
            <label className="date-picker-label">Notes</label>
            <textarea className="task-notes-input" rows={2} value={task.notes} onChange={e => onUpdate(task.id, { notes: e.target.value })} placeholder="Add notes..." />
          </div>
          <div className="task-details-section">
            <label className="date-picker-label">Est. minutes</label>
            <input className="task-est-input" type="number" min={0} step={5} value={task.estimatedMinutes || ''} onChange={e => onUpdate(task.id, { estimatedMinutes: e.target.value ? parseInt(e.target.value) : undefined })} placeholder="0" />
          </div>
          {!task.completedAt && (
            <button className="task-complete-btn" onClick={e => { e.stopPropagation(); onUpdate(task.id, { completedAt: Date.now() }); }}>
              &#10003; Mark done
            </button>
          )}
        </div>
      )}

      {longPressProgress > 0 && longPressProgress < 1 && <div className="task-longpress-progress" style={{ '--progress': longPressProgress } as React.CSSProperties} />}

      {showMenu && createPortal(
        <div className="task-menu-overlay" onClick={() => setShowMenu(false)}>
          <div className="task-menu" onClick={e => e.stopPropagation()}>
            <div className="task-menu-header">
              <span className="task-menu-heading">Move to...</span>
              <button className="task-menu-close" onClick={() => setShowMenu(false)} aria-label="Close">&times;</button>
            </div>
            <p className="task-menu-prompt">{task.title}</p>
            <div className="task-menu-actions">
              {otherColumns.map(colId => (
                <button key={colId} className={`task-menu-btn task-menu-btn--${colId}`} onClick={() => handleMove(colId)}>
                  <span className="task-menu-btn-indicator" />
                  <span>{(columns.find(c => c === colId) ?? '').charAt(0).toUpperCase() + (columns.find(c => c === colId) ?? '').slice(1)}</span>
                  <span className="task-menu-btn-arrow">&rarr;</span>
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
