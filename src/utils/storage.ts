import type { Task, Project, AppSettings } from '../types';
import { defaultSettings } from '../types';

const TASKS_KEY = 'wahala-tasks';
const TRASH_KEY = 'wahala-trash';
const PROJECTS_KEY = 'wahala-projects';
const SETTINGS_KEY = 'wahala-settings';

function migrateTask(t: Record<string, unknown>): Task {
  return {
    id: t.id as string,
    title: t.title as string,
    column: (t.column as Task['column']) || 'now',
    createdAt: (t.createdAt as number) || Date.now(),
    dueDate: (t.dueDate as number) || undefined,
    estimatedMinutes: (t.estimatedMinutes as number) || undefined,
    recurrence: (t.recurrence as Task['recurrence']) || 'none',
    projectId: (t.projectId as string) || undefined,
    parentId: (t.parentId as string) || undefined,
    subtasks: Array.isArray(t.subtasks) ? t.subtasks as Task['subtasks'] : [],
    tags: Array.isArray(t.tags) ? t.tags as string[] : [],
    completedAt: (t.completedAt as number) || undefined,
    sortOrder: (t.sortOrder as number) ?? 0,
    notes: (t.notes as string) || '',
    reminderTime: (t.reminderTime as number) || undefined,
  };
}

export function loadTasks(): Task[] | null {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.map(migrateTask);
  } catch {
    return null;
  }
}

export function saveTasks(tasks: Task[]) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch { /* storage may be full */ }
}

export function loadTrash(): Task[] {
  try {
    const raw = localStorage.getItem(TRASH_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(migrateTask);
  } catch {
    return [];
  }
}

export function saveTrash(tasks: Task[]) {
  try {
    localStorage.setItem(TRASH_KEY, JSON.stringify(tasks));
  } catch { /* storage may be full */ }
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Project[];
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]) {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch { /* storage may be full */ }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings();
    return { ...defaultSettings(), ...JSON.parse(raw) };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(s: AppSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch { /* storage may be full */ }
}


