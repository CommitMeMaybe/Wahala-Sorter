import type { Task } from '../types';

export const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Call electrician about NEPA', column: 'now', createdAt: Date.now() - 1000 * 60 * 5 },
  { id: '2', title: 'Buy cement from Mike\'s depot', column: 'now', createdAt: Date.now() - 1000 * 60 * 15 },
  { id: '3', title: 'Reply Mr. Adebayo about the quote', column: 'soon', createdAt: Date.now() - 1000 * 60 * 60 * 2 },
  { id: '4', title: 'Pick up plumbing parts at Oyingbo', column: 'later', createdAt: Date.now() - 1000 * 60 * 60 * 5 },
];
