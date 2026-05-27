import type { Task, ColumnId, ColumnConfig, Project } from '../types';
import { TaskCard } from './TaskCard';

interface ColumnProps {
  column: ColumnConfig;
  tasks: Task[];
  now: number;
  columnIds: ColumnId[];
  projects: Project[];
  dragOver: ColumnId | null;
  touchDragId: string | null;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  emptyMessage: string;
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
}

function sortTasks(tasks: Task[], mode: ColumnProps['sortMode']): Task[] {
  const copy = [...tasks];
  switch (mode) {
    case 'due': return copy.sort((a, b) => (a.dueDate ?? Infinity) - (b.dueDate ?? Infinity));
    case 'alpha': return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'manual': return copy.sort((a, b) => a.sortOrder - b.sortOrder);
    default: return copy.sort((a, b) => b.createdAt - a.createdAt);
  }
}

export function Column({ column, tasks, now, columnIds, projects, dragOver, touchDragId, selectionMode, selectedIds, emptyMessage, sortMode, onDelete, onEdit, onMove, onUpdate, onClearColumn, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop, onTouchDragStart, onTouchDrop, onTouchDragCancel, onToggleSelect }: ColumnProps) {
  const isDragOver = dragOver === column.id;
  const isEmpty = tasks.length === 0;
  const isTouchTarget = touchDragId !== null && !tasks.some(t => t.id === touchDragId);
  const sorted = sortTasks(tasks, sortMode);

  return (
    <div className={`column column--${column.id} ${isDragOver ? 'column--drag-over' : ''} ${isTouchTarget ? 'column--drop-target' : ''} ${isEmpty ? 'column--empty' : ''}`}
      role="group"
      aria-label={`${column.label} column with ${tasks.length} tasks`}
      onDragOver={e => onDragOver(e, column.id)}
      onDragLeave={onDragLeave}
      onDrop={e => onDrop(e, column.id)}
      onClick={isTouchTarget ? () => onTouchDrop(column.id) : undefined}
    >
      <div className="column-header">
        <div className="column-title-row">
          <h2 className="column-title">{column.label}</h2>
          <span className="column-count">{tasks.length}</span>
          <button className="column-clear-btn" onClick={() => onClearColumn(column.id)} disabled={tasks.length === 0} aria-label={`Clear ${column.label}`}>
            <svg viewBox="0 0 16 16" fill="none" width="13" height="13"><path d="M2 4h12M5 4V2.5a1 1 0 011-1h4a1 1 0 011 1V4M6 7v5M10 7v5M3 4l1 10a1 1 0 001 1h6a1 1 0 001-1l1-10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <p className="column-desc">{column.description}</p>
      </div>

      <div className="column-body" role="list">
        {sorted.length === 0 && <p className="empty-state">{emptyMessage}</p>}
        {sorted.map(task => (
          <TaskCard key={task.id} task={task} now={now} columns={columnIds} projects={projects} onDelete={onDelete} onEdit={onEdit} onMove={onMove} onUpdate={onUpdate}
            onDragStart={onDragStart} onDragEnd={onDragEnd} touchDragId={touchDragId} onTouchDragStart={onTouchDragStart} onTouchDragCancel={onTouchDragCancel}
            selectionMode={selectionMode} selected={selectedIds?.has(task.id)} onToggleSelect={onToggleSelect} />
        ))}
      </div>

      {isTouchTarget && (
        <div className="column-drop-hint" onClick={(e) => { e.stopPropagation(); onTouchDrop(column.id); }}>
          <span>Drop here &darr;</span>
        </div>
      )}
    </div>
  );
}
