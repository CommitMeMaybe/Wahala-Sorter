import type { Project } from '../types';

interface Props {
  projects: Project[];
  value?: string;
  onChange: (id?: string) => void;
}

export function ProjectSelector({ projects, value, onChange }: Props) {
  return (
    <div className="project-selector">
      <label className="date-picker-label">Project</label>
      <div className="project-chips">
        <button className={`project-chip ${!value ? 'project-chip--active' : ''}`} onClick={() => onChange(undefined)}>
          None
        </button>
        {projects.map(p => (
          <button
            key={p.id}
            className={`project-chip ${value === p.id ? 'project-chip--active' : ''}`}
            style={{ '--chip-color': p.color } as React.CSSProperties}
            onClick={() => onChange(p.id)}
          >
            <span className="project-chip-dot" />
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
