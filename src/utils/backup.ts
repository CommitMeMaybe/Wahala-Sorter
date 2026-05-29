import type { Task, Project, AppSettings } from '../types';

const EXPORT_VERSION = 1;

export interface BackupData {
  version: number;
  exportedAt: string;
  tasks: Task[];
  trash: Task[];
  projects: Project[];
  settings: AppSettings;
}

export function exportBackup(tasks: Task[], trash: Task[], projects: Project[], settings: AppSettings): void {
  const data: BackupData = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    tasks,
    trash,
    projects,
    settings,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wahala-sorter-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importBackup(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as BackupData;
        if (!data.version || !Array.isArray(data.tasks) || !Array.isArray(data.trash) || !Array.isArray(data.projects) || !data.settings) {
          reject(new Error('Invalid backup file format'));
          return;
        }
        resolve(data);
      } catch {
        reject(new Error('Could not parse backup file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
