import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Task, ColumnId } from './types';
import { INITIAL_TASKS } from './data/seed';
import { AddTaskForm } from './components/AddTaskForm';
import { Board } from './components/Board';
import './App.css';

const COLUMNS = [
  { id: 'now' as ColumnId, label: 'Now', description: 'Right now, no delay' },
  { id: 'soon' as ColumnId, label: 'Soon', description: 'Today or tomorrow' },
  { id: 'later' as ColumnId, label: 'Later', description: 'This week, insha Allah' },
];

function App() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [nextId, setNextId] = useState(5);
  const [dragOver, setDragOver] = useState<ColumnId | null>(null);
  const [now, setNow] = useState(Date.now());
  const [announcement, setAnnouncement] = useState('');
  const deleteTargetRef = useRef<ColumnId | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const tasksByColumn = useMemo(() => ({
    now: tasks.filter(t => t.column === 'now'),
    soon: tasks.filter(t => t.column === 'soon'),
    later: tasks.filter(t => t.column === 'later'),
  }), [tasks]);

  const addTask = useCallback((title: string) => {
    setTasks(prev => [...prev, {
      id: String(nextId),
      title,
      column: 'now' as ColumnId,
      createdAt: Date.now(),
    }]);
    setNextId(prev => prev + 1);
    setAnnouncement(`Added "${title}" to Now.`);
  }, [nextId]);

  const deleteTask = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    if (task) {
      deleteTargetRef.current = task.column;
      setAnnouncement('Task deleted.');
    }
  }, [tasks]);

  const moveTask = useCallback((id: string, to: ColumnId) => {
    const task = tasks.find(t => t.id === id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, column: to } : t));
    setDragOver(null);
    if (task) {
      const label = COLUMNS.find(c => c.id === to)?.label || to;
      setAnnouncement(`Moved to ${label}.`);
    }
  }, [tasks]);

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
        <p className="subtitle">Your daily pile, sorted.</p>
      </header>

      <AddTaskForm onAdd={addTask} />

      <Board
        tasksByColumn={tasksByColumn}
        columns={COLUMNS}
        now={now}
        dragOver={dragOver}
        onDelete={deleteTask}
        onMove={moveTask}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}

export default App;
