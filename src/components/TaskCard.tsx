import { useMemo } from 'react'
import type { Task, ColumnId } from '../types';
import { formatTime } from '../utils/time';

interface TaskCardProps {
  task: Task;
  now: number;
  columns: ColumnId[];
  onDelete: (id: string) => void;
  onMove: (id: string, to: ColumnId) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

export function TaskCard({ task, now, columns, onDelete, onMove, onDragStart }: TaskCardProps) {
  const idx = columns.indexOf(task.column);
  const rot = useMemo(() => `${(Math.random() - 0.5) * 1.5}deg`, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' && idx < columns.length - 1) {
      e.preventDefault();
      onMove(task.id, columns[idx + 1]);
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      e.preventDefault();
      onMove(task.id, columns[idx - 1]);
    }
  };

  const handleDelete = () => onDelete(task.id);

  return (
    <div
      className="task"
      draggable
      tabIndex={0}
      role="listitem"
      style={{ '--task-rot': rot } as React.CSSProperties}
      onDragStart={e => onDragStart(e, task.id)}
      onKeyDown={handleKeyDown}
      aria-label={`Task: ${task.title}. In ${task.column} column. Press left or right arrow to move.`}
    >
      <div className="task-content">
        <span className="task-title">{task.title}</span>
        <span className="task-meta">{formatTime(task.createdAt, now)}</span>
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
