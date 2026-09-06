import { CheckCircle2, Circle, Clock, Eye, XCircle } from "lucide-react";
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

export const getIconColor = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.OPEN:
      return "text-indigo-500";
    case TaskStatus.IN_PROGRESS:
      return "text-amber-500";
    case TaskStatus.UNDER_REVIEW:
      return "text-purple-500";
    case TaskStatus.DONE:
      return "text-emerald-500";
    case TaskStatus.CANCELED:
      return "text-red-500";
  }
};

export const getIcon = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.OPEN:
      return <Circle size={18} />;
    case TaskStatus.IN_PROGRESS:
      return <Clock size={18} />;
    case TaskStatus.UNDER_REVIEW:
      return <Eye size={18} />;
    case TaskStatus.DONE:
      return <CheckCircle2 size={18} />;
    case TaskStatus.CANCELED:
      return <XCircle size={18} />;
  }
};

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  [TaskStatus.OPEN]: {
    label: "Aberta",
    bg: "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800",
    text: "text-indigo-700 dark:text-indigo-300",
    icon: <Circle size={12} className="stroke-[2.5]" />,
  },
  [TaskStatus.IN_PROGRESS]: {
    label: "Em Progresso",
    bg: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    icon: <Clock size={12} className="stroke-[2.5]" />,
  },
  [TaskStatus.UNDER_REVIEW]: {
    label: "Em Revisão",
    bg: "bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800",
    text: "text-purple-700 dark:text-purple-300",
    icon: <Eye size={12} className="stroke-[2.5]" />,
  },
  [TaskStatus.DONE]: {
    label: "Concluído",
    bg: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    icon: <CheckCircle2 size={12} className="stroke-[2.5]" />,
  },
  [TaskStatus.CANCELED]: {
    label: "Cancelado",
    bg: "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-300",
    icon: <XCircle size={12} className="stroke-[2.5]" />,
  },
};

