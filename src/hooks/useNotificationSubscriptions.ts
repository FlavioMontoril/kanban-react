import { useEffect } from "react";
import { useWebSocket } from "@/providers/WebSocketProvider"; // Ajuste o caminho do seu Provider
import { useTaskStore } from "@/store/useTaskStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { toast } from "sonner";
import type { Task } from "@/types/task";
import { useAuthWebSocket } from "@/providers/AuthWebSocketProvider";
import type { UserPresenceDTO } from "@/types/user";
import {
  showAuthPresenceToast,
  showGuestPresenceToast,
} from "@/components/commons/showAuthPresenceToast";
import { useUserStore } from "@/store/useUserStore";

export function useNotificationSubscriptions() {
  const { isConnected, subscribe } = useWebSocket();
  const { isConnected: isAuthConnected, subscribe: subscribeAuth } =
    useAuthWebSocket();
  const { removeTasksLocal, setTask } = useTaskStore();
  const { addNotifications, addPresenceNotification } = useNotificationStore();
  const { updateUserPresence } = useUserStore();

  useEffect(() => {
    if (!isConnected) return;

    console.log(
      "[useNotificationSubscriptions] 🟢 Inscrevendo nos tópicos do Kanban...",
    );

    // 1. Escuta a criação de tarefas
    const createSub = subscribe("/topic/task-created", (newTask: Task) => {
      console.log("[WEBSOCKET] Tarefa criada recebida:", newTask);
      setTask(newTask);
      addNotifications([newTask], "CREATED");
    });

    // 2. Escuta o arquivamento de tarefas
    const archiveSub = subscribe(
      "/topic/tasks-archived",
      (archivedTasks: Task[]) => {
        console.log("[WEBSOCKET] Tarefas arquivadas recebidas:", archivedTasks);
        const archivedIds = archivedTasks.map((t) => t.id);
        removeTasksLocal(archivedIds);
        addNotifications(archivedTasks, "ARCHIVED");

        toast.info(`${archivedTasks.length} tarefa(s) foram arquivadas.`);
      },
    );

    const changeStatus = subscribe(
      "/topic/task-status-changed",
      (changedStatus: Task) => {
        console.log("[WEBSOCKET] Alteração de status recebida:", changedStatus);
        setTask(changedStatus);
        addNotifications([changedStatus], "STATUS_CHANGED");
      },
    );

    // Limpeza automática das inscrições ao desmontar
    return () => {
      createSub?.unsubscribe();
      archiveSub?.unsubscribe();
      changeStatus?.unsubscribe();
    };
  }, [isConnected, subscribe, removeTasksLocal, addNotifications]);

  // 2. Subscrição da Auth API (Presença)
  useEffect(() => {
    if (!isAuthConnected) return;

    // Subscrição do tópico /topic/presence vindo da Auth API
    const presenceSub = subscribeAuth(
      "/topic/presence",
      (presenceData: UserPresenceDTO) => {
        updateUserPresence(presenceData);
        addPresenceNotification(presenceData, "CONNECTION");

        //Exibe o Popup de Entrada/Saída conforme a autenticação
        if (isAuthConnected) {
          showAuthPresenceToast(presenceData);
        } else {
          showGuestPresenceToast(presenceData, () => {
            window.location.href = "/login";
          });
        }
      },
    );

    return () => {
      presenceSub?.unsubscribe();
    };
  }, [
    isAuthConnected,
    subscribeAuth,
    updateUserPresence,
    addPresenceNotification,
  ]);
}
