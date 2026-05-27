import { useState, type FormEvent } from 'react';
import type { Project, ColumnId } from '../types';

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
      <div className="modal-sheet" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Add task">
        <div className="modal-handle" />
        <h2 className="modal-title">New Wahala</h2>
        <form onSubmit={handleSubmit}>
          <input className="modal-input" placeholder="What's the wahala?" value={title} onChange={e => setTitle(e.target.value)} autoFocus maxLength={200} />
          <div className="modal-section">
            <label className="modal-label">Project</label>
            <div className="modal-chips">
              <button type="button" className={`modal-chip ${!projectId ? 'modal-chip--active' : ''}`} onClick={() => setProjectId(undefined)}>None</button>
              {projects.map(p => (
                <button type="button" key={p.id} className={`modal-chip ${projectId === p.id ? 'modal-chip--active' : ''}`} style={{ '--chip-color': p.color } as React.CSSProperties} onClick={() => setProjectId(p.id)}>
                  <span className="project-chip-dot" />{p.name}
                </button>
              ))}
            </div>
          </div>
          <div className="modal-section">
            <label className="modal-label">Column</label>
            <div className="modal-chips">
              {COLUMNS.map(c => (
                <button type="button" key={c.id} className={`modal-chip modal-chip--col ${column === c.id ? 'modal-chip--active' : ''}`} onClick={() => setColumn(c.id)}>
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
