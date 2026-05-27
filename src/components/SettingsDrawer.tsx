import type { AppSettings, Project } from '../types';

interface Props {
  open: boolean;
  settings: AppSettings;
  projects: Project[];
  onClose: () => void;
  onUpdate: (s: AppSettings) => void;
  onAddProject: () => void;
  onRemoveProject: (id: string) => void;
  onRenameProject: (id: string, name: string) => void;
}

const SORT_OPTIONS: { value: AppSettings['defaultSort']; label: string }[] = [
  { value: 'created', label: 'Created' },
  { value: 'due', label: 'Due date' },
  { value: 'alpha', label: 'Alphabetical' },
  { value: 'manual', label: 'Manual' },
];

export function SettingsDrawer({ open, settings, projects, onClose, onUpdate, onAddProject, onRemoveProject, onRenameProject }: Props) {
  if (!open) return null;
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Settings">
        <div className="drawer-header">
          <h2 className="drawer-title">Settings</h2>
          <button className="drawer-close" onClick={onClose} aria-label="Close settings">&times;</button>
        </div>

        <div className="drawer-body">
          <section className="settings-section">
            <h3 className="settings-section-title">Columns</h3>
            {settings.columnOrder.map(id => (
              <div key={id} className="settings-row">
                <label className="settings-label">{id.charAt(0).toUpperCase() + id.slice(1)} label</label>
                <input className="settings-input" value={settings.columnLabels[id]} onChange={e => onUpdate({ ...settings, columnLabels: { ...settings.columnLabels, [id]: e.target.value } })} />
              </div>
            ))}
          </section>

          <section className="settings-section">
            <h3 className="settings-section-title">Default sort</h3>
            <div className="settings-chips">
              {SORT_OPTIONS.map(o => (
                <button key={o.value} className={`settings-chip ${settings.defaultSort === o.value ? 'settings-chip--active' : ''}`} onClick={() => onUpdate({ ...settings, defaultSort: o.value })}>
                  {o.label}
                </button>
              ))}
            </div>
          </section>

          <section className="settings-section">
            <h3 className="settings-section-title">Projects</h3>
            {projects.map(p => (
              <div key={p.id} className="settings-row">
                <span className="project-chip-dot" style={{ background: p.color }} />
                <input className="settings-input" value={p.name} onChange={e => onRenameProject(p.id, e.target.value)} />
                <button className="settings-remove-btn" onClick={() => onRemoveProject(p.id)} aria-label={`Remove project ${p.name}`}>&times;</button>
              </div>
            ))}
            <button className="settings-add-btn" onClick={onAddProject}>+ Add project</button>
          </section>

          <section className="settings-section">
            <h3 className="settings-section-title">Preferences</h3>
            <label className="settings-toggle-row">
              <span>Sound effects</span>
              <input type="checkbox" checked={settings.soundEnabled} onChange={e => onUpdate({ ...settings, soundEnabled: e.target.checked })} />
            </label>
            <label className="settings-toggle-row">
              <span>Confetti on completion</span>
              <input type="checkbox" checked={settings.confettiEnabled} onChange={e => onUpdate({ ...settings, confettiEnabled: e.target.checked })} />
            </label>
          </section>
        </div>
      </div>
    </div>
  );
}
