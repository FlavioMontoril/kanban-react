import { Info } from "lucide-react";
import type { Task } from "@/types/task";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

interface TaskHoverCardProps {
  task: Task;
}

export function TaskHoverCard({ task }: TaskHoverCardProps) {
  return (
    <HoverCard delay={200} closeDelay={100}>
      <HoverCardTrigger
        // onClick={() => onView(task)}
        className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center"
      >
        <Info size={16} />
      </HoverCardTrigger>

      <HoverCardContent
        align="start"
        side="bottom"
        className="w-80 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl z-[9999] space-y-3"
      >
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className="text-[10px] font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
            Detalhes Rápidos
          </span>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {task.code || task.id}
          </h4>
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase">
              Título
            </p>
            <p className="font-medium text-slate-700 dark:text-slate-200 line-clamp-2">
              {task.title}
            </p>
          </div>

          {task.description && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase">
                Descrição
              </p>
              <p className="text-slate-500 dark:text-slate-400 line-clamp-3 italic">
                {task.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase">
                Relator
              </p>
              <p className="font-medium text-slate-700 dark:text-slate-300">
                {task.reporter || "Não informado"}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase">
                Responsável
              </p>
              <p className="font-medium text-slate-700 dark:text-slate-300">
                {task.assignee || "Não atribuído"}
              </p>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
