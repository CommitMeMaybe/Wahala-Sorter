import type { Recurrence } from '../types';
import { recurrenceLabel } from '../utils/recurrence';

interface Props {
  value: Recurrence;
  onChange: (v: Recurrence) => void;
}

const OPTIONS: Recurrence[] = ['none', 'daily', 'weekly', 'biweekly', 'monthly'];

export function RecurrencePicker({ value, onChange }: Props) {
  return (
    <div className="recurrence-picker">
      <label className="date-picker-label">Repeat</label>
      <div className="recurrence-chips">
        {OPTIONS.map(r => (
          <button key={r} className={`recurrence-chip ${value === r ? 'recurrence-chip--active' : ''}`} onClick={() => onChange(r)}>
            {recurrenceLabel(r)}
          </button>
        ))}
      </div>
    </div>
  );
}
