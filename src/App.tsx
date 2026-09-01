import { Toaster } from "sonner";
import KanbanBoard from "./components/kanbam/KanbanBoard";

export default function App() {
  return (
    <>
      <Toaster position="top-center" richColors />

      <KanbanBoard />
    </>
  );
}
