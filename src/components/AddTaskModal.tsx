import { useState, useRef, type FormEvent } from 'react';
import type { Project, ColumnId } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface Props {
  open: boolean;
  projects: Project[];
  onClose: () => void;
  onAdd: (title: string, projectId?: string, column?: ColumnId) => void;
}

const COLUMNS: { id: ColumnId; label: string }[] = [
  { id: 'now', label: 'Now — burning' },
  { id: 'soon', label: 'Soon — coming up' },
  { id: 'later', label: 'Later — distant' },
];

export function AddTaskModal({ open, projects, onClose, onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState<string | undefined>();
  const [column, setColumn] = useState<ColumnId>('now');
  const modalRef = useRef<HTMLDivElement>(null);

  // Hook up the focus trap to keep keyboard interactions within the modal sheet when open
  useFocusTrap(modalRef, open);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const t = title.trim().slice(0, 200);
    if (!t) return;
    onAdd(t, projectId, column);
    setTitle('');
    setProjectId(undefined);
    setColumn('now');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-sheet"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Add task"
        ref={modalRef}
      >
        <div className="modal-handle" />
        <div className="modal-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="modal-title" style={{ margin: 0 }}>New Wahala</h2>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Close modal">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            className="modal-input"
            placeholder="What's the wahala?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
            maxLength={200}
            aria-label="What is the wahala?"
          />
          <div className="modal-section">
            <label className="modal-label">Project</label>
            <div className="modal-chips" role="group" aria-label="Select Project">
              <button
                type="button"
                className={`modal-chip ${!projectId ? 'modal-chip--active' : ''}`}
                onClick={() => setProjectId(undefined)}
                aria-pressed={!projectId}
              >
                None
              </button>
              {projects.map(p => (
                <button
                  type="button"
                  key={p.id}
                  className={`modal-chip ${projectId === p.id ? 'modal-chip--active' : ''}`}
                  style={{ '--chip-color': p.color } as React.CSSProperties}
                  onClick={() => setProjectId(p.id)}
                  aria-pressed={projectId === p.id}
                >
                  <span className="project-chip-dot" />{p.name}
                </button>
              ))}
            </div>
          </div>
          <div className="modal-section">
            <label className="modal-label">Column</label>
            <div className="modal-chips" role="group" aria-label="Select Column">
              {COLUMNS.map(c => (
                <button
                  type="button"
                  key={c.id}
                  className={`modal-chip modal-chip--col ${column === c.id ? 'modal-chip--active' : ''}`}
                  onClick={() => setColumn(c.id)}
                  aria-pressed={column === c.id}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <button className="modal-submit" type="submit" disabled={!title.trim()}>Pin it</button>
        </form>
      </div>
    </div>
  );
}
