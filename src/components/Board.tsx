import type { Task, ColumnId, Column as ColumnType } from '../types';
import { Column as ColumnComponent } from './Column';

interface BoardProps {
  tasksByColumn: Record<ColumnId, Task[]>;
  columns: ColumnType[];
  now: number;
  dragOver: ColumnId | null;
  touchDragId: string | null;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  emptyMessages: Record<ColumnId, string>;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onMove: (id: string, to: ColumnId) => void;
  onClearColumn: (colId: ColumnId) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, col: ColumnId) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, col: ColumnId) => void;
  onTouchDragStart: (id: string) => void;
  onTouchDrop: (col: ColumnId) => void;
  onTouchDragCancel: () => void;
  onToggleSelect?: (id: string) => void;
}

export function Board({
  tasksByColumn,
  columns,
  now,
  dragOver,
  touchDragId,
  selectionMode,
  selectedIds,
  emptyMessages,
  onDelete,
  onEdit,
  onMove,
  onClearColumn,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onTouchDragStart,
  onTouchDrop,
  onTouchDragCancel,
  onToggleSelect,
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
            selectionMode={selectionMode}
            selectedIds={selectedIds}
            emptyMessage={emptyMessages[col.id]}
            onDelete={onDelete}
            onEdit={onEdit}
            onMove={onMove}
            onClearColumn={onClearColumn}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onTouchDragStart={onTouchDragStart}
            onTouchDrop={onTouchDrop}
            onTouchDragCancel={onTouchDragCancel}
            onToggleSelect={onToggleSelect}
          />
      ))}
    </div>
  );
}
