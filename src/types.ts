export type ColumnId = 'now' | 'soon' | 'later';

export type Recurrence = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  column: ColumnId;
  createdAt: number;
  dueDate?: number;
  estimatedMinutes?: number;
  recurrence: Recurrence;
  projectId?: string;
  parentId?: string;
  subtasks: Subtask[];
  tags: string[];
  completedAt?: number;
  sortOrder: number;
  notes: string;
  reminderTime?: number; // epoch ms when to notify
}

export interface Project {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
}

export interface ColumnConfig {
  id: ColumnId;
  label: string;
  description: string;
}

export interface AppSettings {
  columnOrder: ColumnId[];
  columnLabels: Record<ColumnId, string>;
  columnDescriptions: Record<ColumnId, string>;
  defaultSort: 'created' | 'due' | 'alpha' | 'manual';
  soundEnabled: boolean;
  confettiEnabled: boolean;
  weekStartDay: 0 | 1; // sunday or monday
  onboardingDone: boolean;
}

export interface WeekSummary {
  weekStart: string;
  completed: number;
  added: number;
  streaks: number;
}

export function defaultSettings(): AppSettings {
  return {
    columnOrder: ['now', 'soon', 'later'],
    columnLabels: { now: 'Now', soon: 'Soon', later: 'Later' },
    columnDescriptions: { now: 'Burning. Do it now.', soon: 'Coming up. Don\'t drop it.', later: 'Distant. But not forgotten.' },
    defaultSort: 'created',
    soundEnabled: false,
    confettiEnabled: true,
    weekStartDay: 1,
    onboardingDone: false,
  };
}
