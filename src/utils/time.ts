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

export function isOverdue(ms?: number): boolean {
  if (!ms) return false;
  return Date.now() > ms;
}

export function getWeekStart(ts?: number): string {
  const d = ts ? new Date(ts) : new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
}
