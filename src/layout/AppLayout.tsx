// import { DraggableComponent } from "@/components/commons/DraggableComponent";
// import { useFlowStore } from "@/components/flow/store/useFlowStore";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

export function AppLayout() {
  // const { selectedTaskId } = useFlowStore();

  return (
    <div>
      <Toaster position="top-center" richColors />
      <Outlet />
      {/* {selectedTaskId && <DraggableComponent id={selectedTaskId!} />} */}
    </div>
  );
}
