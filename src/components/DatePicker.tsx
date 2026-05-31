import { useId } from 'react';

interface Props {
  dueDate?: number;
  reminderTime?: number;
  onChange: (dueDate?: number, reminderTime?: number) => void;
}

export function DatePicker({ dueDate, reminderTime, onChange }: Props) {
  const dateStr = dueDate ? new Date(dueDate).toISOString().slice(0, 10) : '';
  const timeStr = dueDate ? new Date(dueDate).toTimeString().slice(0, 5) : '';
  
  const baseId = useId();
  const dateId = `${baseId}-date`;
  const timeId = `${baseId}-time`;
  const remindId = `${baseId}-remind`;

  const handleDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) { onChange(undefined, undefined); return; }
    const ms = new Date(val + (timeStr ? `T${timeStr}` : 'T23:59')).getTime();
    onChange(ms, reminderTime);
  };

  const handleTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val || !dateStr) return;
    const ms = new Date(`${dateStr}T${val}`).getTime();
    onChange(ms, reminderTime);
  };

  const handleReminder = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!dueDate) return;
    const val = e.target.value;
    if (!val) { onChange(dueDate, undefined); return; }
    const d = new Date(dueDate);
    const [h, m] = val.split(':').map(Number);
    d.setHours(h, m, 0, 0);
    onChange(dueDate, d.getTime());
  };

  const clear = () => onChange(undefined, undefined);

  return (
    <div className="date-picker">
      <div className="date-picker-row">
        <label htmlFor={dateId} className="date-picker-label">Due</label>
        <input id={dateId} type="date" className="date-picker-input" value={dateStr} onChange={handleDate} />
        {dateStr && (
          <input
            id={timeId}
            type="time"
            className="date-picker-input date-picker-input--time"
            value={timeStr}
            onChange={handleTime}
            aria-label="Due time"
          />
        )}
        {dateStr && <button className="date-picker-clear" onClick={clear} aria-label="Clear due date">&times;</button>}
      </div>
      {dueDate && (
        <div className="date-picker-row">
          <label htmlFor={remindId} className="date-picker-label">Remind</label>
          <input
            id={remindId}
            type="time"
            className="date-picker-input"
            value={reminderTime ? new Date(reminderTime).toTimeString().slice(0, 5) : ''}
            onChange={handleReminder}
          />
        </div>
      )}
    </div>
  );
}
