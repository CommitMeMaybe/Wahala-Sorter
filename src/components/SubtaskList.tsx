import { useState, useId } from 'react';
import type { Subtask } from '../types';

interface Props {
  subtasks: Subtask[];
  onChange: (st: Subtask[]) => void;
}

export function SubtaskList({ subtasks, onChange }: Props) {
  const [input, setInput] = useState('');
  const checklistInputId = useId();

  const add = () => {
    const v = input.trim();
    if (!v) return;
    onChange([...subtasks, { id: crypto.randomUUID(), title: v, done: false }]);
    setInput('');
  };

  const toggle = (id: string) => onChange(subtasks.map(s => s.id === id ? { ...s, done: !s.done } : s));
  const remove = (id: string) => onChange(subtasks.filter(s => s.id !== id));

  const doneCount = subtasks.filter(s => s.done).length;

  return (
    <div className="subtask-list">
      <div className="subtask-header">
        <span className="date-picker-label" id="checklist-title">Checklist {subtasks.length > 0 && `(${doneCount}/${subtasks.length})`}</span>
      </div>
      <div role="group" aria-labelledby="checklist-title" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {subtasks.map(s => (
          <div key={s.id} className="subtask-item">
            <button
              className={`subtask-check ${s.done ? 'subtask-check--done' : ''}`}
              onClick={() => toggle(s.id)}
              aria-label={s.title}
              role="checkbox"
              aria-checked={s.done}
            >
              {s.done && (
                <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <span className={`subtask-title ${s.done ? 'subtask-title--done' : ''}`} aria-hidden="true">
              {s.title}
            </span>
            <button
              className="subtask-remove"
              onClick={() => remove(s.id)}
              aria-label={`Remove checklist item "${s.title}"`}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <div className="subtask-add">
        <input
          id={checklistInputId}
          className="subtask-input"
          placeholder="Add item..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          aria-label="Add new checklist item"
        />
        <button className="subtask-add-btn" onClick={add} disabled={!input.trim()} aria-label="Add checklist item">+</button>
      </div>
    </div>
  );
}
