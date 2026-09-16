import {
  CheckCircle2,
  Circle,
  Clock,
  Eye,
  Package,
  XCircle,
} from "lucide-react";
import { TaskStatus, type Task } from "../../../types/task";

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

export const getTaskStats = (tasks: Task[] = []) => {
  return {
    Todos: tasks.length,
    [TaskStatus.OPEN]: tasks.filter((t) => t.status === TaskStatus.OPEN).length,
    [TaskStatus.IN_PROGRESS]: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
    [TaskStatus.UNDER_REVIEW]: tasks.filter((t) => t.status === TaskStatus.UNDER_REVIEW).length,
    [TaskStatus.DONE]: tasks.filter((t) => t.status === TaskStatus.DONE).length,
    [TaskStatus.CANCELED]: tasks.filter((t) => t.status === TaskStatus.CANCELED).length,
  };
}

export const STATUS_CONFIG: Record<
  TaskStatus | "Todos",
  {
    label: string;
    badge: string;
    bg: string;
    text: string;
    qauntity: number;
    icon: React.ReactNode;
  }
> = {
  ["Todos"]: {
    label: "Todos",
    badge: "border-slate-500 bg-slate-300 w-auto p-1",
    bg: "bg-indigo-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800",
    qauntity: 0,
    text: "text-indigo-700 dark:text-indigo-300",
    icon: <Package size={12} className="stroke-[2.5]" />,
  },
  [TaskStatus.OPEN]: {
    label: "Aberta",
    badge: "border-indigo-500 bg-indigo-300 w-auto p-1",
    bg: "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800",
    qauntity: 0,
    text: "text-indigo-700 dark:text-indigo-300",
    icon: <Circle size={12} className="stroke-[2.5]" />,
  },
  [TaskStatus.IN_PROGRESS]: {
    label: "Em Progresso",
    badge: "border-amber-500 bg-amber-300 w-auto p-1",
    bg: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    qauntity: 0,
    icon: <Clock size={12} className="stroke-[2.5]" />,
  },
  [TaskStatus.UNDER_REVIEW]: {
    label: "Em Revisão",
    badge: "border-purple-500 bg-purple-300 w-auto p-1",
    bg: "bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800",
    text: "text-purple-700 dark:text-purple-300",
    qauntity: 0,
    icon: <Eye size={12} className="stroke-[2.5]" />,
  },
  [TaskStatus.DONE]: {
    label: "Concluído",
    badge: "border-emerald-500 bg-emerald-300 w-auto p-1",
    bg: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    qauntity: 0,
    icon: <CheckCircle2 size={12} className="stroke-[2.5]" />,
  },
  [TaskStatus.CANCELED]: {
    label: "Cancelado",
    badge: "border-red-500 bg-red-300 w-auto p-1",
    bg: "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-300",
    qauntity: 0,
    icon: <XCircle size={12} className="stroke-[2.5]" />,
  },
};
