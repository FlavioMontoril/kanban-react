import type { TaskStatus } from "./task";

export interface TaskHistories {
    id: string;
    previousStatus: TaskStatus;
    currentStatus: TaskStatus;
    movedAt: string;
}