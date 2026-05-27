import { useState, type KeyboardEvent } from 'react';

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: Props) {
  const [input, setInput] = useState('');

  const add = (t: string) => {
    const v = t.trim().toLowerCase().replace(/\s+/g, '-');
    if (!v || tags.includes(v)) return;
    onChange([...tags, v]);
    setInput('');
  };

  const remove = (t: string) => onChange(tags.filter(x => x !== t));

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input); }
    if (e.key === 'Backspace' && !input && tags.length) remove(tags[tags.length - 1]);
  };

  return (
    <div className="tag-input">
      <label className="date-picker-label">Tags</label>
      <div className="tag-chips">
        {tags.map(t => (
          <span key={t} className="tag-chip">
            {t}
            <button className="tag-chip-remove" onClick={() => remove(t)} aria-label={`Remove tag ${t}`}>&times;</button>
          </span>
        ))}
        <input className="tag-input-field" placeholder={tags.length ? '' : 'Add tag...'} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} onBlur={() => input && add(input)} />
      </div>
    </div>
  );
}
