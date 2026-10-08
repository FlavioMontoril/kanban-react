import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { WebSocketProvider } from "./WebSocketProvider";
import { AuthWebSocketProvider } from "./AuthWebSocketProvider";
import type { ReactNode } from "react";
import { GlobalChatListener } from "./GlobalChatListener";
import { useFloatingChatStore } from "@/store/useFloatingChatStore";

interface IAppProviders {
  children: ReactNode;
}

export function AppProviders({ children }: IAppProviders) {
  const updateRoomPosition = useFloatingChatStore(
    (state) => state.updateRoomPosition,
  );

  // Configura a distância mínima de 5px para ativar o arraste e não interferir nos cliques simples
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const activeId = String(active.id);

    // Se o elemento arrastado for um balão do chat flutuante
    if (activeId.startsWith("floating-bubble-")) {
      const roomId = activeId.replace("floating-bubble-", "");
      if (delta.x !== 0 || delta.y !== 0) {
        updateRoomPosition(roomId, delta.x, delta.y);
      }
    }
  };

  return (
    <WebSocketProvider>
      <AuthWebSocketProvider>
        <GlobalChatListener>
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            {children}
          </DndContext>
        </GlobalChatListener>
      </AuthWebSocketProvider>
    </WebSocketProvider>
  );
}
