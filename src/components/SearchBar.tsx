import type { Project } from '../types';

interface Props {
  query: string;
  onQuery: (q: string) => void;
  projectFilter?: string;
  onProjectFilter: (id?: string) => void;
  projects: Project[];
  showCompleted: boolean;
  onShowCompleted: (v: boolean) => void;
}

export function SearchBar({ query, onQuery, projectFilter, onProjectFilter, projects, showCompleted, onShowCompleted }: Props) {
  return (
    <div className="search-bar">
      <div className="search-input-wrap">
        <svg className="search-icon" viewBox="0 0 16 16" fill="none" width="14" height="14"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        <input className="search-input" placeholder="Search tasks..." value={query} onChange={e => onQuery(e.target.value)} />
        {query && <button className="search-clear" onClick={() => onQuery('')} aria-label="Clear search">&times;</button>}
      </div>
      <div className="search-aux">
        <select className="search-select" value={projectFilter || ''} onChange={e => onProjectFilter(e.target.value || undefined)} aria-label="Filter by project">
          <option value="">All projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button className={`search-toggle ${showCompleted ? 'search-toggle--active' : ''}`} onClick={() => onShowCompleted(!showCompleted)} title={showCompleted ? 'Hide completed' : 'Show completed'}>
          {showCompleted ? 'Hide done' : 'Show done'}
        </button>
      </div>
    </div>
  );
}
