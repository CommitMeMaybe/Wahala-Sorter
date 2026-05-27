import type { Task } from '../types';

export const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Call electrician about NEPA', column: 'now', createdAt: Date.now() - 1000 * 60 * 5, recurrence: 'none', subtasks: [], tags: [], sortOrder: 0, notes: '' },
  { id: '2', title: 'Buy cement from Mike\'s depot', column: 'now', createdAt: Date.now() - 1000 * 60 * 15, recurrence: 'none', subtasks: [], tags: [], sortOrder: 1, notes: '' },
  { id: '3', title: 'Reply Mr. Adebayo about the quote', column: 'soon', createdAt: Date.now() - 1000 * 60 * 60 * 2, recurrence: 'none', subtasks: [], tags: [], sortOrder: 0, notes: '' },
  { id: '4', title: 'Pick up plumbing parts at Oyingbo', column: 'later', createdAt: Date.now() - 1000 * 60 * 60 * 5, recurrence: 'none', subtasks: [], tags: [], sortOrder: 0, notes: '' },
];

export const INITIAL_PROJECTS = [
  { id: 'p1', name: 'House', color: '#CC3333', sortOrder: 0 },
  { id: 'p2', name: 'Work', color: '#3A6B9F', sortOrder: 1 },
  { id: 'p3', name: 'Personal', color: '#6B4F3A', sortOrder: 2 },
];
