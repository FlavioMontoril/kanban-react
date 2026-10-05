import { DndContext } from "@dnd-kit/core";
import { WebSocketProvider } from "./WebSocketProvider";
import { AuthWebSocketProvider } from "./AuthWebSocketProvider";
import type { ReactNode } from "react";

interface IAppProviders {
  children: ReactNode;
}

export function AppProviders({ children }: IAppProviders) {
  return (
    <WebSocketProvider>
      <AuthWebSocketProvider>
        <DndContext>
          {children}
        </DndContext>
      </AuthWebSocketProvider>
    </WebSocketProvider>
  );
}