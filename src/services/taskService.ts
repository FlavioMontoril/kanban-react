import type {
  PageResponse,
  Task,
  TaskMetrics,
  TaskRequestDTO,
  TaskStatus,
  UpdateTaskStatusDTO,
} from "@/types/task";
import { api } from "./api";
import type { UserResponse } from "@/types/user";
import type { TaskHistories } from "@/types/task-history";

export const taskApi = {
  findAllUsers: async (): Promise<UserResponse[]> => {
    const response = await api.get<UserResponse[]>("/api-kanban/user");
    return response.data;
  },

  findAll: async (): Promise<Task[]> => {
    const response = await api.get<Task[]>("/api-kanban/task");
    return response.data;
  },

  findByStatusPaged: async (
    status?: TaskStatus | null,
    search?: string | null,
    startDate?: string | Date | null,
    endDate?: string | Date | null,
    page: number = 0,
    size: number = 20,
  ): Promise<PageResponse<Task>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (status) {
      params.append("status", status);
    }
    if (search && search.trim() !== "") {
      params.append("search", search.trim());
    }
    if (startDate) {
      const formattedStart =
        startDate instanceof Date
          ? startDate.toISOString().split("T")[0]
          : startDate;
      params.append("startDate", formattedStart);
    }

    if (endDate) {
      const formattedEnd =
        endDate instanceof Date ? endDate.toISOString().split("T")[0] : endDate;
      params.append("endDate", formattedEnd);
    }
    const response = await api.get<PageResponse<Task>>(
      `/api-kanban/task/paged?${params.toString()}`,
    );
    return response.data;
  },

  // Criar uma nova tarefa
  create: async (data: TaskRequestDTO): Promise<void> => {
    await api.post("/api-kanban/task/create", data);
  },

  findMetrics: async (): Promise<TaskMetrics[]> => {
    const response = await api.get<TaskMetrics[]>("/api-kanban/task/metrics");
    return response.data;
  },

  // Atualizar/Mover o status da tarefa
  updateStatus: async (
    id: string,
    statusData: UpdateTaskStatusDTO,
  ): Promise<Task | null> => {
    const response = await api.patch<Task>(`/api-kanban/task/${id}/status`, statusData);

    // Se o backend retornar HTTP 204 No Content (quando nada foi alterado)
    if (response.status === 204) {
      return null;
    }

    return response.data;
  },

  findAllHistories: async (taskId: string): Promise<TaskHistories[]> => {
    const response = await api.get(`/api-kanban/tasks-histories/${taskId}`);
    return response.data;
  },
};
