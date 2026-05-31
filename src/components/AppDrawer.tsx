import { useRef } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface Props {
  open: boolean;
  showCompleted: boolean;
  weekSummary?: { weekStart: string; completed: number; added: number } | null;
  trashCount: number;
  onClose: () => void;
  onShowCompleted: (v: boolean) => void;
  onOpenSettings: () => void;
  onOpenTrash: () => void;
  onGoHome: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export function AppDrawer({ open, showCompleted, weekSummary, trashCount, onClose, onShowCompleted, onOpenSettings, onOpenTrash, onGoHome, onExport, onImport }: Props) {
  const importRef = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Hook up the focus trap to keep keyboard interactions within the drawer sheet when open
  useFocusTrap(drawerRef, open);

  if (!open) return null;

  return (
    <div className="drawer-overlay drawer-overlay--bottom" onClick={onClose}>
      <div
        className="drawer-sheet"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        ref={drawerRef}
      >
        <div className="modal-handle" />
        <div className="drawer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(44, 24, 16, 0.08)', paddingBottom: '8px' }}>
          <h2 className="drawer-title" style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, color: '#2C1810' }}>Menu</h2>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Close menu" style={{ color: '#2C1810', background: 'rgba(44, 24, 16, 0.06)' }}>&times;</button>
        </div>
        <div className="drawer-sheet-body">
          {weekSummary && (
            <div className="drawer-section">
              <div className="drawer-section-label">This week</div>
              <div className="drawer-week-stats">
                <span>{weekSummary.completed} done</span>
                <span>{weekSummary.added} added</span>
              </div>
            </div>
          )}

          <div className="drawer-section">
            <button className="drawer-item" onClick={() => { onShowCompleted(!showCompleted); onClose(); }} aria-pressed={showCompleted}>
              <span className="drawer-item-icon">{showCompleted ? '◉' : '○'}</span>
              <span>{showCompleted ? 'Hide completed' : 'Show completed'}</span>
            </button>
          </div>

          <div className="drawer-section">
            <button className="drawer-item" onClick={() => { onOpenTrash(); onClose(); }}>
              <span className="drawer-item-icon">&#x1F5D1;</span>
              <span>Trash {trashCount > 0 && `(${trashCount})`}</span>
            </button>
          </div>

          <div className="drawer-section">
            <button className="drawer-item" onClick={() => { onOpenSettings(); onClose(); }}>
              <svg viewBox="0 0 16 16" fill="none" width="16" height="16" className="drawer-item-icon"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.5 2.5l1.5 1.5M12 12l1.5 1.5M2.5 13.5l1.5-1.5M12 4l1.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <span>Settings</span>
            </button>
          </div>

          <div className="drawer-section">
            <div className="drawer-section-label">Data</div>
            <button className="drawer-item" onClick={() => { onExport(); onClose(); }}>
              <svg viewBox="0 0 16 16" fill="none" width="16" height="16" className="drawer-item-icon"><path d="M8 1v10M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>Export backup</span>
            </button>
            <button className="drawer-item" onClick={() => importRef.current?.click()}>
              <svg viewBox="0 0 16 16" fill="none" width="16" height="16" className="drawer-item-icon"><path d="M8 11V1M4 5l4-4 4 4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>Import backup</span>
            </button>
            <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { onImport(f); onClose(); } }} />
          </div>

          <div className="drawer-section">
            <button className="drawer-item" onClick={onGoHome}>
              <span className="drawer-item-icon">&larr;</span>
              <span>Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
