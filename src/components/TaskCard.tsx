import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { Task, ColumnId } from '../types';
import { formatTime } from '../utils/time';

interface TaskCardProps {
  task: Task;
  now: number;
  columns: ColumnId[];
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onMove: (id: string, to: ColumnId) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  touchDragId?: string | null;
  onTouchDragStart?: (id: string) => void;
  onTouchDragCancel?: () => void;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

const COL_LABEL: Record<ColumnId, string> = { now: 'Now', soon: 'Soon', later: 'Later' };

export function TaskCard({ task, now, columns, onDelete, onEdit, onMove, onDragStart, onDragEnd, touchDragId, onTouchDragStart, onTouchDragCancel, selectionMode, selected, onToggleSelect }: TaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const [showMenu, setShowMenu] = useState(false);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const longPressTimer = useRef<number | undefined>(undefined);
  const longPressStartPos = useRef<{ x: number; y: number } | null>(null);
  const longPressInterval = useRef<number | undefined>(undefined);

  const idx = columns.indexOf(task.column);
  const rot = useMemo(() => `${(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 1.5}deg`, []);

  const isLifted = touchDragId === task.id;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const clearLongPress = useCallback(() => {
    setLongPressProgress(0);
    if (longPressTimer.current !== undefined) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = undefined;
    }
    if (longPressInterval.current !== undefined) {
      clearInterval(longPressInterval.current);
      longPressInterval.current = undefined;
    }
    longPressStartPos.current = null;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isLifted) return;
    const touch = e.touches[0];
    longPressStartPos.current = { x: touch.clientX, y: touch.clientY };
    setLongPressProgress(0);
    const step = 50;
    longPressInterval.current = window.setInterval(() => {
      setLongPressProgress(prev => Math.min(prev + step / 400, 1));
    }, step);
    longPressTimer.current = window.setTimeout(() => {
      if (onTouchDragStart) {
        onTouchDragStart(task.id);
        navigator.vibrate?.(10);
      }
      clearLongPress();
    }, 400);
  }, [task.id, onTouchDragStart, isLifted, clearLongPress]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (longPressStartPos.current) {
      const touch = e.touches[0];
      const dx = touch.clientX - longPressStartPos.current.x;
      const dy = touch.clientY - longPressStartPos.current.y;
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        clearLongPress();
      }
    }
  }, [clearLongPress]);

  const handleTouchEnd = useCallback(() => {
    clearLongPress();
  }, [clearLongPress]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (editing) return;
    if (e.key === 'ArrowRight' && idx < columns.length - 1) {
      e.preventDefault();
      onMove(task.id, columns[idx + 1]);
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      e.preventDefault();
      onMove(task.id, columns[idx - 1]);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      onDelete(task.id);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDoubleClick();
    }
  };

  const handleDoubleClick = () => {
    setEditValue(task.title);
    setEditing(true);
  };

  const commitEdit = () => {
    const trimmed = editValue.trim().slice(0, 200);
    if (trimmed && trimmed !== task.title) {
      onEdit(task.id, trimmed);
    }
    setEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      setEditing(false);
    }
  };

  const handleDelete = () => onDelete(task.id);

  const handleDragStartInner = (e: React.DragEvent) => {
    onDragStart(e, task.id);
  };

  const handleTap = () => {
    if (selectionMode) {
      onToggleSelect?.(task.id);
      return;
    }
    if (window.innerWidth <= 700) {
      if (isLifted) {
        onTouchDragCancel?.();
        return;
      }
      if (touchDragId) return;
      setShowMenu(true);
    }
  };

  const handleMove = (to: ColumnId) => {
    onMove(task.id, to);
    setShowMenu(false);
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect?.(task.id);
  };

  const otherColumns = columns.filter(c => c !== task.column);

  return (
    <div
      className={`task${isLifted ? ' task--lifted' : ''}${selectionMode ? ' task--selectable' : ''}${selected ? ' task--selected' : ''}`}
      draggable={!selectionMode}
      tabIndex={0}
      role="listitem"
      style={{ '--task-rot': rot } as React.CSSProperties}
      onDragStart={handleDragStartInner}
      onDragEnd={onDragEnd}
      onKeyDown={handleKeyDown}
      onDoubleClick={selectionMode ? undefined : handleDoubleClick}
      onClick={selectionMode ? () => onToggleSelect?.(task.id) : handleTap}
      onTouchStart={selectionMode ? undefined : handleTouchStart}
      onTouchMove={selectionMode ? undefined : handleTouchMove}
      onTouchEnd={selectionMode ? undefined : handleTouchEnd}
      aria-label={`Task: ${task.title}. In ${task.column} column. Press left or right arrow to move, Enter to edit.${selectionMode ? ' Tap to select.' : ''}`}
    >
      {selectionMode && (
        <div className="task-check" onClick={handleSelectClick}>
          <div className={`task-check-box${selected ? ' task-check-box--checked' : ''}`}>
            {selected && <svg viewBox="0 0 12 12" fill="none" className="task-check-icon"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
        </div>
      )}
      <div className="task-content">
        {editing ? (
          <input
            ref={inputRef}
            className="task-edit-input"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleEditKeyDown}
            maxLength={200}
            aria-label="Edit task title"
          />
        ) : (
          <>
            <span className="task-title">{task.title}</span>
            <span className="task-meta">{formatTime(task.createdAt, now)}</span>
          </>
        )}
      </div>
      {longPressProgress > 0 && longPressProgress < 1 && (
        <div
          className="task-longpress-progress"
          style={{ '--progress': longPressProgress } as React.CSSProperties}
        />
      )}
      {!selectionMode && (
        <button
          className="task-delete"
          onClick={handleDelete}
          aria-label={`Delete "${task.title}"`}
        >
          &times;
        </button>
      )}

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
                <button
                  key={colId}
                  className={`task-menu-btn task-menu-btn--${colId}`}
                  onClick={() => handleMove(colId)}
                >
                  <span className="task-menu-btn-indicator" />
                  <span>{COL_LABEL[colId]}</span>
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
