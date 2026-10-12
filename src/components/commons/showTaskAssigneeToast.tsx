import { toast } from "sonner";
import { CheckCircle, Archive, X, ClipboardList, XCircle } from "lucide-react";
import type { Task, TaskStatus } from "@/types/task";
import type { NotificationType } from "@/store/useNotificationStore";

type EventConfigKey = "CREATED" | "STATUS_CHANGED" | "ARCHIVED" | "CANCELED";

interface EventConfig {
  label: string;
  icon: React.ReactNode;
  accent: string;
  pulse: string;
  dot: string;
}

// Mapeamento de tipo de evento → label e cor visual
const EVENT_CONFIG: Record<EventConfigKey, EventConfig> = {
  CREATED: {
    label: "Nova tarefa atribuída",
    icon: <ClipboardList className="w-5 h-5" />,
    accent: "bg-violet-500/10 border-violet-500/20 text-violet-400",
    pulse: "bg-violet-400",
    dot: "bg-violet-500",
  },
  STATUS_CHANGED: {
    label: "Status atualizado",
    icon: <CheckCircle className="w-5 h-5" />,
    accent: "bg-sky-500/10 border-sky-500/20 text-sky-400",
    pulse: "bg-sky-400",
    dot: "bg-sky-500",
  },
  CANCELED: {
    label: "Tarefa cancelada",
    icon: <XCircle className="w-5 h-5" />,
    accent: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    pulse: "bg-rose-400",
    dot: "bg-rose-500",
  },
  ARCHIVED: {
    label: "Tarefa arquivada",
    icon: <Archive className="w-5 h-5" />,
    accent: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    pulse: "bg-amber-400",
    dot: "bg-amber-500",
  },
};

/** Resolve a config visual correta cruzando tipo do evento + status da task */
function resolveConfig(
  type: Extract<NotificationType, "CREATED" | "STATUS_CHANGED" | "ARCHIVED">,
  taskStatus: TaskStatus,
): EventConfig {
  if (type === "STATUS_CHANGED" && taskStatus === "CANCELED") {
    return EVENT_CONFIG.CANCELED;
  }
  return EVENT_CONFIG[type];
}

interface ShowTaskAssigneeToastOptions {
  task: Task;
  type: Extract<NotificationType, "CREATED" | "STATUS_CHANGED" | "ARCHIVED">;
}

export function showTaskAssigneeToast({
  task,
  type,
}: ShowTaskAssigneeToastOptions) {
  const config = resolveConfig(type, task.status);

  if (!config) return;

  toast.custom((t) => (
    <div className="relative group flex items-center gap-3.5 w-full max-w-sm p-3.5 bg-slate-900/85 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] text-slate-100 transition-all duration-300 hover:border-white/20">
      {/* Ícone com indicador de status */}
      <div className="relative flex-shrink-0">
        <div
          className={`p-2.5 rounded-xl border backdrop-blur-md transition-colors ${config.accent}`}
        >
          {config.icon}
        </div>

        {/* Ponto com pulse animation */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.pulse} opacity-75`}
          />
          <span
            className={`relative inline-flex rounded-full h-3 w-3 ${config.dot}`}
          />
        </span>
      </div>

      {/* Conteúdo textual */}
      <div className="flex-1 min-w-0 pr-4">
        <p
          className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${config.accent.split(" ").find((c) => c.startsWith("text-")) ?? "text-slate-400"}`}
        >
          {config.label}
        </p>
        <p className="text-xs font-bold truncate text-slate-100">
          {task.title}
        </p>
        {type === "STATUS_CHANGED" && (
          <p className="text-xs text-slate-400 truncate mt-0.5">
            Novo status:{" "}
            <span className="text-slate-200 font-medium">{task.status}</span>
          </p>
        )}
        {type === "ARCHIVED" && (
          <p className="text-xs text-slate-400 truncate mt-0.5">
            Esta tarefa foi arquivada.
          </p>
        )}
      </div>

      {/* Botão fechar */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toast.dismiss(t);
        }}
        className="absolute top-2.5 right-2.5 p-1 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  ));
}
