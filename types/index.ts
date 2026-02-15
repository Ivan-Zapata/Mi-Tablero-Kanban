export type Status = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: Status;
  position: number;
}

export interface Column {
  id: Status;
  title: string;
}
