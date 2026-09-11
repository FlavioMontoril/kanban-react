import { useState, useCallback, useEffect } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import type { TaskRequestDTO, TaskStatus } from "@/types/task";
import { taskApi } from "@/services/taskService";
import { toast } from "sonner";
import type { UserResponse } from "@/types/user";
import { useTaskHistoryStore } from "@/store/useTaskHistories";
import { useViewStore } from "@/store/useViewStore";

export function useTasks() {
  const { selectedView, setSelectedView } = useViewStore();
  const { setTaskHistories } = useTaskHistoryStore();
  const {
    tasks,
    pageData,
    currentPage,
    size,
    selectedStatus,
    search,
    setTasks,
    setSearch,
    moveTaskLocal,
    setPageData,
    setCurrentPage,
    setStatus,
  } = useTaskStore();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await taskApi.findAllUsers();
      setUsers(data);
      return data;
    } catch (error: any) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Erro ao carregar usuários");
      return [];
    }
  }, []);

  const fetchTasksPaged = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const stausFilter = selectedStatus || null;
      const response = await taskApi.findByStatusPaged(
        stausFilter,
        search,
        currentPage,
        size,
      );

      setTasks(response.content);
      setPageData(response);

      return response;
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Erro ao buscar tarefas paginadas.",
      );
      setTasks([]);
      setPageData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, search, size, setTasks, currentPage, setPageData]);

  // Buscar todas as tarefas
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await taskApi.findAll();

      setTasks(data);
    } catch (error: any) {
      setError(error.response?.data?.message || "Erro ao buscar tarefas.");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [setTasks]);

  const fetchTasksHistories = useCallback(async (taskId: string) => {
    setLoading(false);
    setError(null);

    try {
      const data = await taskApi.findAllHistories(taskId);
      setTaskHistories(data);
      return data;
    } catch (Erro: any) {
      console.error("Erro ao carregar usuários:", error);
      return [];
    }
  }, []);

  // Criar tarefa
  const createTask = async (formData: TaskRequestDTO) => {
    setLoading(true);
    setError(null);

    try {
      await taskApi.create(formData);
      await fetchTasks();

      toast.success("Tarefa criada", {
        description: "A tarefa foi criada com sucesso.",
      });
    } catch (error: any) {
      setError(error.response?.data?.message || "Erro ao criar tarefa.");

      toast.error("Erro ao criar tarefa", {
        description:
          error.response?.data?.message || "Não foi possível criar a tarefa.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mover tarefa
  const moveTaskStatus = async (taskId: string, targetStatus: TaskStatus) => {
    const currentTask = tasks.find((task) => task.id === taskId);

    if (!currentTask) {
      return;
    }

    if (currentTask.status === targetStatus) {
      return;
    }

    // Guarda o status atual para rollback
    const previousStatus = currentTask.status;

    // ⚡ Atualização otimista
    moveTaskLocal(taskId, targetStatus);

    try {
      // Atualiza o backend
      await taskApi.updateStatus(taskId, {
        status: targetStatus,
      });

      // Não fazemos fetchTasks() aqui.
      // O card já foi atualizado localmente.

      toast.success("Status atualizado", {
        description: `A tarefa foi movida para "${targetStatus}".`,
      });
    } catch (error: any) {
      console.error("Falha ao atualizar status:", error);

      // ↩️ Rollback
      moveTaskLocal(taskId, previousStatus);

      const message =
        error.response?.data?.message ||
        "Não foi possível atualizar o status da tarefa.";

      setError(message);

      toast.error("Não foi possível atualizar", {
        description: message,
      });
    }
  };

  // 🎯 Dispara Apenas para a Busca Paginada (Workflows) quando os filtros mudarem
  // useEffect(() => {
  //   if (selectedView !== "Workflows") return;
  //   const timer = setTimeout(() => {
  //     fetchTasksPaged();
  //   }, 300);

  //   return () => clearTimeout(timer);
  // }, [search, selectedStatus, currentPage, selectedView, fetchTasksPaged]);

  // 🎯 Escuta a troca de abas e os filtros
  useEffect(() => {
    if (selectedView === "Workflows") {
      const timer = setTimeout(() => {
        fetchTasksPaged();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      fetchTasks(); // Carrega todas as tarefas para o Kanban quando ativo
    }
  }, [selectedView, search, selectedStatus, currentPage, fetchTasksPaged, fetchTasks]);

  return {
    tasks,
    users,
    pageData,
    selectedStatus,
    selectedView,
    search,
    loading,
    error,
    currentPage,
    size,
    setPageData,
    setCurrentPage,
    setSelectedView,
    fetchTasks,
    fetchTasksPaged,
    fetchUsers,
    setStatus,
    setSearch,
    fetchTasksHistories,
    createTask,
    moveTaskStatus,
  };
}
