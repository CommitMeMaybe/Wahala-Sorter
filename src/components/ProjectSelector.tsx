import type { Project } from '../types';

interface Props {
  projects: Project[];
  value?: string;
  onChange: (id?: string) => void;
}

export function ProjectSelector({ projects, value, onChange }: Props) {
  return (
    <div className="project-selector">
      <span className="date-picker-label">Project</span>
      <div className="project-chips" role="group" aria-label="Select project tag">
        <button
          className={`project-chip ${!value ? 'project-chip--active' : ''}`}
          onClick={() => onChange(undefined)}
          aria-pressed={!value}
        >
          None
        </button>
        {projects.map(p => (
          <button
            key={p.id}
            className={`project-chip ${value === p.id ? 'project-chip--active' : ''}`}
            style={{ '--chip-color': p.color } as React.CSSProperties}
            onClick={() => onChange(p.id)}
            aria-pressed={value === p.id}
          >
            <span className="project-chip-dot" />
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
