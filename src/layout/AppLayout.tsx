import { DraggableComponent } from "@/components/commons/DraggableComponent";
import { useFloatingChatStore } from "@/store/useFloatingChatStore";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "sonner";

export function AppLayout() {
  const activeRooms = useFloatingChatStore((state) => state.activeRooms);
  const location = useLocation();

  // Verifica se o utilizador está em qualquer subrota do /chat
  const isChatRoute = location.pathname.startsWith("/chat");

  return (
    <div>
      <Toaster position="top-center" richColors />
      <Outlet />
      {/* Renderiza um balão arrastável para cada sala de conversa ativa */}
      {/* {activeRooms.map((room) => (
        <DraggableComponent
          key={room.id}
          id={`floating-bubble-${room.id}`}
          room={room}
        />
      ))} */}
      {/* Passa o index para calcular o espaçamento inicial das bolhas */}
      {!isChatRoute && activeRooms.map((room, index) => (
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
