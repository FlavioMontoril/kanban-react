import { useEffect } from "react";
import { useWebSocket } from "@/providers/WebSocketProvider"; // Ajuste o caminho do seu Provider
import { useTaskStore } from "@/store/useTaskStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { toast } from "sonner";
import type {
  Task,
  TaskChangeArchivedPayload,
  TaskChangeStatusPayload,
  TaskCreatedEventPayload,
} from "@/types/task";
import { useAuthWebSocket } from "@/providers/AuthWebSocketProvider";
import type { UserPresenceDTO } from "@/types/user";
import {
  showAuthPresenceToast,
  showGuestPresenceToast,
} from "@/components/commons/showAuthPresenceToast";
import { useUserStore } from "@/store/useUserStore";
import { showTaskAssigneeToast } from "@/components/commons/showTaskAssigneeToast";
import { useAuthStore } from "@/store/useAuthStore";

export function useNotificationSubscriptions() {
  const { isConnected, subscribe } = useWebSocket();
  const { isConnected: isAuthConnected, subscribe: subscribeAuth } =
    useAuthWebSocket();
  const { removeTasksLocal, setTask } = useTaskStore();
  const { addNotifications, addPresenceNotification } = useNotificationStore();
  const { updateUserPresence } = useUserStore();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!isConnected) return;

    console.log(
      "[useNotificationSubscriptions] 🟢 Inscrevendo nos tópicos do Kanban...",
    );

    // 1. Escuta a criação de tarefas
    const createSub = subscribe(
      "/topic/task-created",
      (payload: TaskCreatedEventPayload) => {
        console.log("[WEBSOCKET] Tarefa criada recebida:", payload);

        const { createdTask, triggeredId } = payload;

        setTask(createdTask);
        addNotifications([createdTask], "CREATED");

        // Exibe o toast apenas para o participante que NÃO executou a ação.
        const currentUser = triggeredId == user?.id;

        if (!currentUser) {
          showTaskAssigneeToast({ task: createdTask, type: "CREATED" });
        }
      },
    );

    // 2. Escuta o arquivamento de tarefas
    const archiveSub = subscribe(
      "/topic/tasks-archived",
      (payload: TaskChangeArchivedPayload) => {
        console.log("[WEBSOCKET] Tarefas arquivadas recebidas:", payload);

        const { archivedTasks, triggeredId } = payload;

        if (!archivedTasks || archivedTasks.length === 0) return;

        const archivedIds = archivedTasks.map((t) => t.id);
        removeTasksLocal(archivedIds);
        addNotifications(archivedTasks, "ARCHIVED");

        // Verifica se a ação foi acionada pelo usuário logado
        // Como o arquivamento vem do @Scheduled do backend, triggeredId será null, logo isActionMadeByMe será false
        const isActionMadeByMe = Boolean(
          triggeredId && triggeredId === user?.id,
        );

        if (!isActionMadeByMe) {
          // toast.info(
          //   `${archivedTasks.length} tarefa(s) foram arquivadas pelo sistema.`,
          // );
          // Exibe o toast apenas para o participante que NÃO executou o arquivamento.
          archivedTasks.forEach((task) => {
            const currentUserIsAssignee = task.userId === user?.id;
            const currentUserIsReporter = task.reporterId === user?.id;

            if (!currentUserIsAssignee || !currentUserIsReporter) {
              showTaskAssigneeToast({ task, type: "ARCHIVED" });
            }
          });
        }
      },
    );

    const changeStatus = subscribe(
      "/topic/task-status-changed",
      (payload: TaskChangeStatusPayload) => {
        console.log("[WEBSOCKET] Alteração de status recebida:", payload);
        const { changeStatus: updatedTask, triggeredId } = payload;
        setTask(updatedTask);
        addNotifications([updatedTask], "STATUS_CHANGED");

        // Exibe o toast apenas para o participante que NÃO executou a ação.
        const currentUser = triggeredId == user?.id;
        if (!currentUser) {
          showTaskAssigneeToast({
            task: updatedTask,
            type: "STATUS_CHANGED",
          });
        }
      },
    );

    // Limpeza automática das inscrições ao desmontar
    return () => {
      createSub?.unsubscribe();
      archiveSub?.unsubscribe();
      changeStatus?.unsubscribe();
    };
  }, [isConnected, subscribe, user, removeTasksLocal, addNotifications]);

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
