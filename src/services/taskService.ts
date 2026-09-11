import type {
  PageResponse,
  Task,
  TaskRequestDTO,
  TaskStatus,
  UpdateTaskStatusDTO,
} from "@/types/task";
import { api } from "./api";
import type { UserResponse } from "@/types/user";
import type { TaskHistories } from "@/types/task-history";

export const taskApi = {
  findAllUsers: async (): Promise<UserResponse[]> => {
    const response = await api.get<UserResponse[]>("/v1/user");
    return response.data;
  },

  findAll: async (): Promise<Task[]> => {
    const response = await api.get<Task[]>("/v1/task");
    return response.data;
  },

  findByStatusPaged: async (
    status?: TaskStatus | null,
    search?: string | null,
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
    const response = await api.get<PageResponse<Task>>(
      `/v1/task/paged?${params.toString()}`,
    );
    return response.data;
  },

  // Criar uma nova tarefa
  create: async (data: TaskRequestDTO): Promise<void> => {
    await api.post("/v1/task/create", data);
  },

  // Atualizar/Mover o status da tarefa
  updateStatus: async (
    id: string,
    statusData: UpdateTaskStatusDTO,
  ): Promise<Task | null> => {
    const response = await api.patch<Task>(`/v1/task/${id}/status`, statusData);

    // Se o backend retornar HTTP 204 No Content (quando nada foi alterado)
    if (response.status === 204) {
      return null;
    }

    return response.data;
  },

  findAllHistories: async (taskId: string): Promise<TaskHistories[]> => {
    const response = await api.get(`/v1/tasks-histories/${taskId}`);
    return response.data;
  },
};
