export enum TaskStatus  {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  UNDER_REVIEW = 'UNDER_REVIEW',
  DONE = 'DONE',
  CANCELED = 'CANCELED'
}

export interface Task {
  id: string;          // Mapeado como string/number no SVAR
  code: string;        // TSK-1001
  status: TaskStatus;  // Identificador da coluna no SVAR
  reporter: string;
  createdAt: string;
  updatedAt?: string;
  user_id?: string;
}

export const KANBAN_COLUMNS = [
  { id: TaskStatus.OPEN, label: 'Aberto' },
  { id: TaskStatus.IN_PROGRESS, label: 'Em Progresso' },
  { id: TaskStatus.UNDER_REVIEW, label: 'Em Revisão' },
  { id: TaskStatus.DONE, label: 'Concluído' },
  { id: TaskStatus.CANCELED, label: 'Cancelado' },
];