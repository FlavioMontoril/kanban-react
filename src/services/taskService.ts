import type {
  PageResponse,
  Task,
  TaskRequestDTO,
  TaskStatus,
  UpdateTaskStatusDTO,
} from "@/types/task";
import { api } from "./api";

export const taskApi = {
  // Buscar todas as tarefas
  findAll: async (): Promise<Task[]> => {
    const response = await api.get<Task[]>("/v1/task");
    return response.data;
  },

  findByStatusPaged: async (
    status?: TaskStatus,
    page: number = 0,
    size: number = 10,
  ): Promise<PageResponse<Task>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (status) {
      params.append("status", status);
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
};
