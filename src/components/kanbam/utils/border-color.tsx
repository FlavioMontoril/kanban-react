import { TaskStatus } from "../../../types/task";

  // Helper para obter a cor da borda lateral do card baseada no status
  export const getStatusBorderColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.OPEN:
        return "border-l-indigo-500";
      case TaskStatus.IN_PROGRESS:
        return "border-l-amber-500";
      case TaskStatus.UNDER_REVIEW:
        return "border-l-purple-500";
      case TaskStatus.DONE:
        return "border-l-emerald-500";
      case TaskStatus.CANCELED:
        return "border-l-red-500";
      default:
        return "border-l-slate-200";
    }
  };