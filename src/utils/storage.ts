import type { Task } from '../types';

const TASKS_KEY = 'wahala-tasks';
const NEXT_ID_KEY = 'wahala-next-id';
const TRASH_KEY = 'wahala-trash';

export function loadTasks(): Task[] | null {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Task[];
  } catch {
    return null;
  }
}

export function saveTasks(tasks: Task[]) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    /* storage may be full or unavailable */
  }
}

export function loadNextId(): number | null {
  try {
    const raw = localStorage.getItem(NEXT_ID_KEY);
    if (!raw) return null;
    return parseInt(raw, 10);
  } catch {
    return null;
  }
}

export function saveNextId(id: number) {
  try {
    localStorage.setItem(NEXT_ID_KEY, String(id));
  } catch {
    /* storage may be full or unavailable */
  }
}

export function loadTrash(): Task[] {
  try {
    const raw = localStorage.getItem(TRASH_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Task[];
  } catch {
    return [];
  }
}

export function saveTrash(tasks: Task[]) {
  try {
    localStorage.setItem(TRASH_KEY, JSON.stringify(tasks));
  } catch {
    /* storage may be full or unavailable */
  }
}
