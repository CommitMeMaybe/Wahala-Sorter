import { useState, useCallback, type FormEvent } from 'react';
import type { Task, ColumnId } from './types';
import './App.css';

const COLUMNS: { id: ColumnId; label: string; description: string }[] = [
  { id: 'now', label: 'Now', description: 'Right now, no delay' },
  { id: 'soon', label: 'Soon', description: 'Today or tomorrow' },
  { id: 'later', label: 'Later', description: 'This week, insha Allah' },
];

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

let nextId = 5;

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Call electrician about NEPA', column: 'now', createdAt: Date.now() - 1000 * 60 * 5 },
  { id: '2', title: 'Buy cement from Mike\'s depot', column: 'now', createdAt: Date.now() - 1000 * 60 * 15 },
  { id: '3', title: 'Reply Mr. Adebayo about the quote', column: 'soon', createdAt: Date.now() - 1000 * 60 * 60 * 2 },
  { id: '4', title: 'Pick up plumbing parts at Oyingbo', column: 'later', createdAt: Date.now() - 1000 * 60 * 60 * 5 },
];

function App() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [input, setInput] = useState('');
  const [dragOver, setDragOver] = useState<ColumnId | null>(null);

  const addTask = useCallback((e: FormEvent) => {
    e.preventDefault();
    const title = input.trim();
    if (!title) return;
    setTasks(prev => [...prev, { id: String(nextId++), title, column: 'now', createdAt: Date.now() }]);
    setInput('');
  }, [input]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const moveTask = useCallback((id: string, to: ColumnId) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, column: to } : t));
    setDragOver(null);
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, col: ColumnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(col);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, col: ColumnId) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) moveTask(id, col);
  }, [moveTask]);

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">Wahala Sorter</h1>
        <p className="subtitle">
          Your daily pile, sorted.
        </p>
      </header>

      <form className="add-form" onSubmit={addTask}>
        <input
          className="add-input"
          placeholder="Add a new wahala..."
          value={input}
          onChange={e => setInput(e.target.value)}
          autoFocus
        />
        <button className="add-btn" type="submit" disabled={!input.trim()}>
          Add
        </button>
      </form>

      <div className="board">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.column === col.id);
          return (
            <div
              key={col.id}
              className={`column column--${col.id}${dragOver === col.id ? ' column--drag-over' : ''}`}
              onDragOver={e => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, col.id)}
            >
              <div className="column-header">
                <div className="column-title-row">
                  <h2 className="column-title">{col.label}</h2>
                  <span className="column-count">{colTasks.length}</span>
                </div>
                <p className="column-desc">{col.description}</p>
              </div>

              <div className="column-body">
                {colTasks.length === 0 && (
                  <p className="empty-state">Empty. For now.</p>
                )}
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    className="task"
                    draggable
                    onDragStart={e => handleDragStart(e, task.id)}
                  >
                    <div className="task-content">
                      <span className="task-title">{task.title}</span>
                      <span className="task-meta">{formatTime(task.createdAt)}</span>
                    </div>
                    <button
                      className="task-delete"
                      onClick={() => deleteTask(task.id)}
                      aria-label="Delete task"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
