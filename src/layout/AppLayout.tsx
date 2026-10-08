// src/components/layouts/AppLayout.tsx
import { DraggableComponent } from "@/components/commons/DraggableComponent";
import { useNotificationSubscriptions } from "@/hooks/useNotificationSubscriptions";
import { useAuthStore } from "@/store/useAuthStore";
import { useFloatingChatStore } from "@/store/useFloatingChatStore";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "sonner";

export function AppLayout() {
  useNotificationSubscriptions();
  const { user } = useAuthStore();
  const location = useLocation();

  const isChatRoute = location.pathname.startsWith("/chat");

  // Garante que só lê as activeRooms pertencentes estritamente ao user.id logado
  const activeRooms = useFloatingChatStore(
    (state) => (user?.id ? state.userStates[String(user.id)]?.activeRooms : undefined)
  ) ?? [];

  return (
    <div>
      <Toaster position="top-center" richColors />
      <Outlet />
      {!isChatRoute &&
        activeRooms.map((room, index) => (
          <DraggableComponent
            key={room.id}
            id={`floating-bubble-${room.id}`}
            room={room}
            index={index}
          />
        ))}
    </div>
  );
}