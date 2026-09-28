import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import { WebSocketProvider } from "./providers/WebSocketProvider.tsx";
import { App } from "./App.tsx";
import { AuthWebSocketProvider } from "./providers/AuthWebSocketProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WebSocketProvider>
      <AuthWebSocketProvider>
        <App />
      </AuthWebSocketProvider>
    </WebSocketProvider>
  </StrictMode>,
);
