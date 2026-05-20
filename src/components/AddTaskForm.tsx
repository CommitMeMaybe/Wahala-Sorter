import { useState, type FormEvent } from 'react';

interface AddTaskFormProps {
  onAdd: (title: string) => void;
}

export function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const title = input.trim().slice(0, 200);
    if (!title) return;
    onAdd(title);
    setInput('');
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
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
  );
}
