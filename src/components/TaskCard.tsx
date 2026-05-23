import { useMemo, useState, useRef, useEffect } from 'react'
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
}

export function TaskCard({ task, now, columns, onDelete, onEdit, onMove, onDragStart, onDragEnd }: TaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const idx = columns.indexOf(task.column);
  const rot = useMemo(() => `${(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 1.5}deg`, []);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

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

  return (
    <div
      className="task"
      draggable
      tabIndex={0}
      role="listitem"
      style={{ '--task-rot': rot } as React.CSSProperties}
      onDragStart={handleDragStartInner}
      onDragEnd={onDragEnd}
      onKeyDown={handleKeyDown}
      onDoubleClick={handleDoubleClick}
      aria-label={`Task: ${task.title}. In ${task.column} column. Press left or right arrow to move, Enter to edit.`}
    >
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
      <button
        className="task-delete"
        onClick={handleDelete}
        aria-label={`Delete "${task.title}"`}
      >
        &times;
      </button>
    </div>
  );
}
