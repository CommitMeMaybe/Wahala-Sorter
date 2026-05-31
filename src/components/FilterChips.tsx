import type { Project } from '../types';

interface Props {
  projects: Project[];
  active?: string;
  onChange: (id?: string) => void;
}

export function FilterChips({ projects, active, onChange }: Props) {
  return (
    <nav className="filter-chips" aria-label="Project filters">
      <button
        className={`filter-chip ${!active ? 'filter-chip--active' : ''}`}
        onClick={() => onChange(undefined)}
        aria-pressed={!active}
      >
        All
      </button>
      {projects.map(p => (
        <button
          key={p.id}
          className={`filter-chip ${active === p.id ? 'filter-chip--active' : ''}`}
          style={{ '--chip-color': p.color } as React.CSSProperties}
          onClick={() => onChange(p.id)}
          aria-pressed={active === p.id}
        >
          <span className="project-chip-dot" />{p.name}
        </button>
      ))}
    </nav>
  );
}
