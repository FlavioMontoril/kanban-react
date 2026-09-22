import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import { WebSocketProvider } from "./providers/WebSocketProvider.tsx";
import { App } from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WebSocketProvider>
      <App />
    </WebSocketProvider>
  </StrictMode>,
);
