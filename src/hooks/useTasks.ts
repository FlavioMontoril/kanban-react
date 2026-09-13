import { useState, useCallback, useEffect } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import type { TaskRequestDTO, TaskStatus } from "@/types/task";
import { taskApi } from "@/services/taskService";
import { toast } from "sonner";
import type { UserResponse } from "@/types/user";
import { useTaskHistoryStore } from "@/store/useTaskHistories";
import { useViewStore } from "@/store/useViewStore";
import type { DateRange } from "react-day-picker";

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
    dateRange,
    setTasks,
    setSearch: setStoreSearch,
    setDateRange: setStoreDateRange,
    moveTaskLocal,
    setPageData,
    setCurrentPage,
    setStatus: setStoreStatus,
  } = useTaskStore();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  //Estado consolidado que passará pelo debounce (400ms)
  const [debouncedFilters, setDebouncedFilters] = useState({
    search,
    selectedStatus,
    dateRange,
    currentPage,
  });

  //Debounce Global (Reseta o timer a cada mudança em qualquer filtro)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({
        search,
        selectedStatus,
        dateRange,
        currentPage,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [search, selectedStatus, dateRange, currentPage]);

  // Wrappers para resetar a página ao filtrar
  const setSearch = useCallback(
    (newSearch: string) => {
      setStoreSearch(newSearch);
      setCurrentPage(0); // Volta para a primeira página ao pesquisar
    },
    [setStoreSearch, setCurrentPage],
  );

  const setStatus = useCallback(
    (newStatus: TaskStatus | null) => {
      setStoreStatus(newStatus);
      setCurrentPage(0); // Volta para a primeira página ao mudar status
    },
    [setStoreStatus, setCurrentPage],
  );

  // Wrapper para resetar a página ao mudar o filtro de data
  const setDateRange = useCallback(
    (range: DateRange | undefined) => {
      setStoreDateRange(range);
      setCurrentPage(0); // Volta para a primeira página
    },
    [setStoreDateRange, setCurrentPage],
  );

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
      const statusFilter = debouncedFilters.selectedStatus || null;
      const startDate = debouncedFilters.dateRange?.from ?? null;
      const endDate = debouncedFilters.dateRange?.to ?? null;

      const response = await taskApi.findByStatusPaged(
        statusFilter,
        debouncedFilters.search,
        startDate,
        endDate,
        debouncedFilters.currentPage,
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
  }, [debouncedFilters, size, setTasks, setPageData]);

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
    } catch (error: any) {
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
      // Recarrega a view correta onde o usuário se encontra
      if (selectedView === "Workflows") {
        await fetchTasksPaged();
      } else {
        await fetchTasks();
      }

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

  // 5. Efeito disparado APENAS quando o objeto debouncedFilters for atualizado
  useEffect(() => {
    let isCancelled = false;

    if (selectedView === "Workflows") {
      if (!isCancelled) {
        fetchTasksPaged();
      }
    } else {
      fetchTasks();
    }

    return () => {
      isCancelled = true;
    };
  }, [selectedView, debouncedFilters, fetchTasksPaged, fetchTasks]);

  return {
    tasks,
    users,
    pageData,
    selectedStatus,
    selectedView,
    search,
    dateRange,
    loading,
    error,
    currentPage,
    size,
    setPageData,
    setDateRange,
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
