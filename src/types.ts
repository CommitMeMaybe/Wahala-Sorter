export type ColumnId = 'now' | 'soon' | 'later';

export interface Task {
  id: string;
  title: string;
  column: ColumnId;
  createdAt: number;
}

export interface Column {
  id: ColumnId;
  label: string;
  description: string;
}
