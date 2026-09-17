import { useState, useCallback, useEffect, useRef } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import type { TaskRequestDTO, TaskStatus } from "@/types/task";
import { taskApi } from "@/services/taskService";
import { toast } from "sonner";
import type { UserResponse } from "@/types/user";
import { useTaskHistoryStore } from "@/store/useTaskHistories";
import { useViewStore } from "@/store/useViewStore";
import type { DateRange } from "react-day-picker";
import { useTaskMetricsStore } from "@/store/useTaskMetricsStore";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "response" in error) {
    const axiosErr = error as { response?: { data?: { message?: string } } };
    return axiosErr.response?.data?.message || fallback;
  }
  return fallback;
}

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

  const {
    metrics,
    loadingMetrics,
    errorMetrics,
    setMetrics,
    setLoadingMetrics,
    setErrorMetrics,
  } = useTaskMetricsStore();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  //Estado consolidado que passará pelo debounce (400ms)
  const [debouncedFilters, setDebouncedFilters] = useState({
    search,
    selectedStatus,
    dateRange,
  });

  const toastIdRef = useRef<string | number>("search-toast-id");

  //Debounce Global (Reseta o timer a cada mudança em qualquer filtro)
  useEffect(() => {
    const hasActiveFilters = Boolean(search || selectedStatus || dateRange);
    // Feedback imediato ao usuário enquanto ele digita
    if (hasActiveFilters) {
      // Usar 'id' fixo impede que o Sonner crie múltiplos cards empilhados
      toast.loading("Aguardando banco de dados...", {
        position: "bottom-center",
        id: toastIdRef.current,
        description: "A pesquisa iniciará em instantes.",
      });
    }

    const timer = setTimeout(() => {
      setDebouncedFilters({
        search,
        selectedStatus,
        dateRange,
      });
    }, 4000);

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
    } catch (err: unknown) {
      console.error("Erro ao carregar usuários:", err);
      return [];
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    setErrorMetrics(null);
    try {
      const data = await taskApi.findMetrics();
      setMetrics(data);
      return data;
    } catch (err: unknown) {
      const msg = getErrorMessage(
        err,
        "Erro ao carregar métricas das tarefas.",
      );
      setErrorMetrics(msg);
      return [];
    } finally {
      setLoadingMetrics(false);
    }
  }, [setMetrics, setLoadingMetrics, setErrorMetrics]);

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
        currentPage,
        size,
      );

      setTasks(response.content);
      setPageData(response);

      return response;
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao buscar tarefas paginadas."));
      setTasks([]);
      setPageData(null);
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters, size, currentPage, setTasks, setPageData]);

  // Buscar todas as tarefas
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await taskApi.findAll();

      setTasks(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao buscar tarefas."));
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [setTasks]);

  const fetchTasksHistories = useCallback(
    async (taskId: string) => {
      setLoading(false);
      setError(null);

      try {
        const data = await taskApi.findAllHistories(taskId);
        setTaskHistories(data);
        return data;
      } catch (err: unknown) {
        console.error("Erro ao carregar histórico:", err);
        return [];
      }
    },
    [setTaskHistories],
  );

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

      // Recarrega as métricas após alterar o status
      fetchMetrics();

      toast.success("Tarefa criada", {
        position: "top-left",
        description: "Tarefa foi criada com sucesso.",
      });
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Erro ao criar tarefa.");
      setError(msg);

      toast.error("Erro ao criar tarefa", {
        description: msg,
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

      // Recarrega as métricas após alterar o status
      fetchMetrics();

      toast.success("Status atualizado", {
        position: "top-left",
        description: `status atualizados para: "${targetStatus}".`,
      });
    } catch (err: unknown) {
      console.error("Falha ao atualizar status:", err);

      // Rollback
      moveTaskLocal(taskId, previousStatus);

      const message = getErrorMessage(
        err,
        "Não foi possível atualizar o status da tarefa.",
      );

      setError(message);

      toast.error("Não foi possível atualizar", {
        description: message,
      });
    }
  };

  //Efeito disparado APENAS quando o objeto debouncedFilters for atualizado
  // useEffect(() => {
  //   let isCancelled = false;

  //   queueMicrotask(() => {
  //     if (isCancelled) return;
  //     if (selectedView === "Workflows") {
  //       fetchTasksPaged();
  //     } else {
  //       fetchTasks();
  //     }
  //   });

  //   return () => {
  //     isCancelled = true;
  //   };
  // }, [selectedView, debouncedFilters, fetchTasksPaged, fetchTasks]);

  useEffect(() => {
    let isCancelled = false;

    const runFetch = async () => {
      // Atualiza para 'Buscando...' no mesmo card visual
      toast.loading("Buscando tarefas no servidor...", {
        position: "bottom-center",
        id: toastIdRef.current,
        description: "Carregando resultados...",
      });

      if (selectedView === "Workflows") {
        await fetchTasksPaged();
      } else {
        await fetchTasks();
      }

      // Se não foi cancelado por uma nova mudança, finaliza/dismiss no toast
      if (!isCancelled) {
        toast.dismiss(toastIdRef.current);
      }
    };

    queueMicrotask(() => {
      if (!isCancelled) {
        runFetch();
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [selectedView, debouncedFilters, fetchTasksPaged, fetchTasks]);

  return {
    tasks,
    users,
    metrics,
    loadingMetrics,
    errorMetrics,
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
    fetchTasksHistories,
    fetchUsers,
    fetchMetrics,
    setStatus,
    setSearch,
    createTask,
    moveTaskStatus,
  };
}
