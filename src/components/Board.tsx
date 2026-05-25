import type { Task, ColumnId, Column as ColumnType } from '../types';
import { Column as ColumnComponent } from './Column';

interface BoardProps {
  tasksByColumn: Record<ColumnId, Task[]>;
  columns: ColumnType[];
  now: number;
  dragOver: ColumnId | null;
  touchDragId: string | null;
  emptyMessages: Record<ColumnId, string>;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onMove: (id: string, to: ColumnId) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, col: ColumnId) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, col: ColumnId) => void;
  onTouchDragStart: (id: string) => void;
  onTouchDrop: (col: ColumnId) => void;
  onTouchDragCancel: () => void;
}

export function Board({
  tasksByColumn,
  columns,
  now,
  dragOver,
  touchDragId,
  emptyMessages,
  onDelete,
  onEdit,
  onMove,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onTouchDragStart,
  onTouchDrop,
  onTouchDragCancel,
}: BoardProps) {
  const columnIds: ColumnId[] = columns.map(c => c.id);

  return (
    <div className={`board${touchDragId ? ' board--touch-dragging' : ''}`}>
      {columns.map(col => (
        <ColumnComponent
          key={col.id}
          column={col}
          tasks={tasksByColumn[col.id]}
          now={now}
          columnIds={columnIds}
          dragOver={dragOver}
          touchDragId={touchDragId}
          emptyMessage={emptyMessages[col.id]}
          onDelete={onDelete}
          onEdit={onEdit}
          onMove={onMove}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onTouchDragStart={onTouchDragStart}
          onTouchDrop={onTouchDrop}
          onTouchDragCancel={onTouchDragCancel}
        />
      ))}
    </div>
  );
}
