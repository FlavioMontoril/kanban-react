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
import { useFloatingChatStore } from "@/store/useFloatingChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { GlobalChatListener } from "./GlobalChatListener";

interface IAppProviders {
  children: ReactNode;
}

export function AppProviders({ children }: IAppProviders) {
  const updateRoomPosition = useFloatingChatStore(
    (state) => state.updateRoomPosition
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const activeId = String(active.id);

    if (activeId.startsWith("floating-bubble-")) {
      const roomId = activeId.replace("floating-bubble-", "");
      const userId = useAuthStore.getState().user?.id;

      if (delta.x !== 0 || delta.y !== 0) {
        updateRoomPosition(userId, roomId, delta.x, delta.y);
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