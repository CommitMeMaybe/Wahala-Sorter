// Board component for Wahala Sorter
import type { Task, ColumnId, ColumnConfig, Project } from '../types';
import { Column as ColumnComponent } from './Column';

interface BoardProps {
  tasksByColumn: Record<ColumnId, Task[]>;
  columns: ColumnConfig[];
  now: number;
  projects: Project[];
  dragOver: ColumnId | null;
  touchDragId: string | null;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  emptyMessages: Record<ColumnId, string>;
  sortMode: 'created' | 'due' | 'alpha' | 'manual';
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onMove: (id: string, to: ColumnId) => void;
  onUpdate: (id: string, patch: Partial<Task>) => void;
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
  onDragTouchMove?: (id: string, clientX: number) => void;
}

export function Board({
  tasksByColumn,
  columns,
  now,
  projects,
  dragOver,
  touchDragId,
  selectionMode,
  selectedIds,
  emptyMessages,
  sortMode,
  onDelete,
  onEdit,
  onMove,
  onUpdate,
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
  onDragTouchMove,
}: BoardProps) {
  const columnIds: ColumnId[] = columns.map(c => c.id);

  return (
    <div
      className={`board ${touchDragId ? 'board--touch-dragging' : ''}`}
    >
      {columns.map((col: ColumnConfig) => (
        <ColumnComponent
          key={col.id}
          column={col}
          tasks={tasksByColumn[col.id]}
          now={now}
          columnIds={columnIds}
          projects={projects}
          dragOver={dragOver}
          touchDragId={touchDragId}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          emptyMessage={emptyMessages[col.id]}
          sortMode={sortMode}
          onDelete={onDelete}
          onEdit={onEdit}
          onMove={onMove}
          onUpdate={onUpdate}
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
          onDragTouchMove={onDragTouchMove}
        />
      ))}
    </div>
  );
}
