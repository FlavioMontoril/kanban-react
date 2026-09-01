export enum TaskStatus  {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  UNDER_REVIEW = 'UNDER_REVIEW',
  DONE = 'DONE',
  CANCELED = 'CANCELED'
}

export interface Task {
  id: string;
  code: string;
  title: string;
  description: string;
  status: TaskStatus;
  reporter: string;
  assignee: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export type TaskRequestDTO = Pick<Task, 'code' | 'title' | 'description' | 'reporter' | 'assignee'> & {
  assignee?: string | null;
};

export interface UpdateTaskStatusDTO {
  status: TaskStatus;
}

export const KANBAN_COLUMNS = [
  { id: TaskStatus.OPEN, label: 'Aberto' },
  { id: TaskStatus.IN_PROGRESS, label: 'Em Progresso' },
  { id: TaskStatus.UNDER_REVIEW, label: 'Em Revisão' },
  { id: TaskStatus.DONE, label: 'Concluído' },
  { id: TaskStatus.CANCELED, label: 'Cancelado' },
];