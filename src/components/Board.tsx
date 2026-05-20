import type { Task, ColumnId, Column as ColumnType } from '../types';
import { Column as ColumnComponent } from './Column';

interface BoardProps {
  tasksByColumn: Record<ColumnId, Task[]>;
  columns: ColumnType[];
  now: number;
  dragOver: ColumnId | null;
  onDelete: (id: string) => void;
  onMove: (id: string, to: ColumnId) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, col: ColumnId) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, col: ColumnId) => void;
}

export function Board({
  tasksByColumn,
  columns,
  now,
  dragOver,
  onDelete,
  onMove,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
}: BoardProps) {
  const columnIds: ColumnId[] = columns.map(c => c.id);

  return (
    <div className="board">
      {columns.map(col => (
        <ColumnComponent
          key={col.id}
          column={col}
          tasks={tasksByColumn[col.id]}
          now={now}
          columnIds={columnIds}
          dragOver={dragOver}
          onDelete={onDelete}
          onMove={onMove}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
}
