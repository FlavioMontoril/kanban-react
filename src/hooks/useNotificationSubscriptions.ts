import { useEffect } from "react";
import { useWebSocket } from "@/providers/WebSocketProvider"; // Ajuste o caminho do seu Provider
import { useTaskStore } from "@/store/useTaskStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { toast } from "sonner";
import type { Task } from "@/types/task";

export function useNotificationSubscriptions() {
  const { isConnected, subscribe } = useWebSocket();
  const { removeTasksLocal } = useTaskStore();
  const { addNotifications } = useNotificationStore();

  useEffect(() => {
    if (!isConnected) return;

    // 1. Escuta a criação de tarefas
    const createSub = subscribe("/topic/task-created", (newTask: Task) => {
      addNotifications([newTask], "CREATED");
    });

    // 2. Escuta o arquivamento de tarefas
    const archiveSub = subscribe(
      "/topic/tasks-archived",
      (archivedTasks: Task[]) => {
        const archivedIds = archivedTasks.map((t) => t.id);
        removeTasksLocal(archivedIds);
        addNotifications(archivedTasks, "ARCHIVED");

        toast.info(`${archivedTasks.length} tarefa(s) foram arquivadas.`,);
      },
    );

    const changeStatus = subscribe(
      "/topic/task-status-changed",
      (changedStatus: Task) => {
        console.log("STATUS_CHANGED", changedStatus);
        addNotifications([changedStatus], "STATUS_CHANGED");
      },
    );

    // Limpeza automática das inscrições ao desmontar
    return () => {
      createSub?.unsubscribe();
      archiveSub?.unsubscribe();
      changeStatus?.unsubscribe();
    };
  }, [
    isConnected,
    subscribe,
    // addTaskLocal,
    removeTasksLocal,
    addNotifications,
  ]);
}
