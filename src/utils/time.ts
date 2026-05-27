export function formatTime(ts: number, now: number): string {
  const diff = now - ts;
  if (diff < 0) return 'just now';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function formatDate(ms?: number): string {
  if (!ms) return '';
  const d = new Date(ms);
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

export function formatDateFull(ms?: number): string {
  if (!ms) return '';
  const d = new Date(ms);
  return d.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTimeHM(ms?: number): string {
  if (!ms) return '';
  const d = new Date(ms);
  return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}

export function isOverdue(ms?: number): boolean {
  if (!ms) return false;
  return Date.now() > ms;
}

export function isToday(ms: number): boolean {
  const d = new Date(ms);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

export function isThisWeek(ms: number): boolean {
  const d = new Date(ms);
  const t = new Date();
  const startOfWeek = new Date(t);
  startOfWeek.setDate(t.getDate() - t.getDay() + (t.getDay() === 0 ? -6 : 1));
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return d >= startOfWeek && d < endOfWeek;
}

export function getWeekStart(ts?: number): string {
  const d = ts ? new Date(ts) : new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
}
