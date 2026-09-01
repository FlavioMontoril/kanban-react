import { useState, useCallback } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import type { TaskRequestDTO, TaskStatus } from "@/types/task";
import { taskApi } from "@/services/taskService";
import { toast } from "sonner";

export function useTasks() {
  const {
    tasks,
    setTasks,
    moveTaskLocal,
  } = useTaskStore();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar todas as tarefas
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await taskApi.findAll();
      setTasks(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Erro ao buscar tarefas."
      );
    } finally {
      setLoading(false);
    }
  }, [setTasks]);

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
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Erro ao criar tarefa."
      );

      toast.error("Erro ao criar tarefa", {
        description:
          err.response?.data?.message ||
          "Não foi possível criar a tarefa.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mover tarefa
  const moveTaskStatus = async (
    taskId: string,
    targetStatus: TaskStatus
  ) => {
    const currentTask = tasks.find(
      (task) => task.id === taskId
    );

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
    } catch (err: any) {
      console.error(
        "Falha ao atualizar status:",
        err
      );

      // ↩️ Rollback
      moveTaskLocal(taskId, previousStatus);

      const message =
        err.response?.data?.message ||
        "Não foi possível atualizar o status da tarefa.";

      setError(message);

      toast.error("Não foi possível atualizar", {
        description: message,
      });
    }
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    moveTaskStatus,
  };
}
