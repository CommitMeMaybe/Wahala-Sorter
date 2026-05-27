import type { Task, Recurrence } from '../types';

export function nextOccurrence(task: Task): Task | null {
  if (task.recurrence === 'none') return null;
  if (!task.completedAt) return null;

  const base = new Date(task.completedAt);
  let next: Date;
  switch (task.recurrence) {
    case 'daily': next = new Date(base); next.setDate(next.getDate() + 1); break;
    case 'weekly': next = new Date(base); next.setDate(next.getDate() + 7); break;
    case 'biweekly': next = new Date(base); next.setDate(next.getDate() + 14); break;
    case 'monthly': next = new Date(base); next.setMonth(next.getMonth() + 1); break;
    default: return null;
  }

  return {
    ...task,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    completedAt: undefined,
    column: 'now',
    dueDate: task.dueDate ? next.getTime() : undefined,
    sortOrder: 0,
    subtasks: task.subtasks.map(s => ({ ...s, done: false })),
  };
}

export function recurrenceLabel(r: Recurrence): string {
  switch (r) {
    case 'daily': return 'Every day';
    case 'weekly': return 'Every week';
    case 'biweekly': return 'Every 2 weeks';
    case 'monthly': return 'Every month';
    default: return 'No repeat';
  }
}
