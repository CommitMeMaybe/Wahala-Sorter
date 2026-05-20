import type { Task, ColumnId, Column as ColumnType } from '../types';
import { TaskCard } from './TaskCard';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  now: number;
  columnIds: ColumnId[];
  dragOver: ColumnId | null;
  onDelete: (id: string) => void;
  onMove: (id: string, to: ColumnId) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, col: ColumnId) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, col: ColumnId) => void;
}

export function Column({
  column,
  tasks,
  now,
  columnIds,
  dragOver,
  onDelete,
  onMove,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
}: ColumnProps) {
  return (
    <div
      className={`column column--${column.id}${dragOver === column.id ? ' column--drag-over' : ''}`}
      role="list"
      aria-label={`${column.label} column`}
      onDragOver={e => onDragOver(e, column.id)}
      onDragLeave={onDragLeave}
      onDrop={e => onDrop(e, column.id)}
    >
      <div className="column-header">
        <div className="column-title-row">
          <h2 className="column-title">{column.label}</h2>
          <span className="column-count" aria-label={`${tasks.length} tasks`}>{tasks.length}</span>
        </div>
        <p className="column-desc">{column.description}</p>
      </div>

      <div className="column-body">
        {tasks.length === 0 && (
          <p className="empty-state">Empty. For now.</p>
        )}
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            now={now}
            columns={columnIds}
            onDelete={onDelete}
            onMove={onMove}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </div>
  );
}
