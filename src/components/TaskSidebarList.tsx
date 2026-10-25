import { useMemo, useState } from "react";
import { TaskStatus, type Task } from "@/types/task";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { useTaskModalStore } from "@/store/useTaskModalStore";
import { useAuth } from "@/hooks/useAuth";
import { useFlowStore } from "./flow/store/useFlowStore";
import { STATUS_CONFIG } from "./kanbam/utils/task-status.config";
import { TaskDropdownMenu } from "./commons/TaskDropdownMenuCard";

interface ITaskSidebarListProps {
  data: Task[];
  // isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function TaskSidebarList({
  data,
  // isCollapsed,
  onToggleCollapse,
}: ITaskSidebarListProps) {
  const { pageData, currentPage, loading, setCurrentPage } = useTasks();
  const { selectedTaskId, setSelectedTaskId } = useFlowStore();
  const { openModal } = useTaskModalStore();
  const { users } = useAuth();

  const [activeTaskForMenu, setActiveTaskForMenu] = useState<Task | null>(null);

  const stats = useMemo(() => {
    return {
      total: pageData?.totalElements ?? data.length,
      done: data.filter((t) => t.status === TaskStatus.DONE).length,
      inProgress: data.filter((t) => t.status === TaskStatus.IN_PROGRESS)
        .length,
    };
  }, [data, pageData?.totalElements]);

  const totalPages = pageData?.totalPage ?? 1;
  const isLastPage = currentPage + 1 === totalPages;

  function handleSelectAction(action: "edit" | "delete" | "updateStatus") {
    if (action === "edit") openModal("edit", activeTaskForMenu);
    if (action === "updateStatus") openModal("updateStatus", activeTaskForMenu);
  }

  return (
    <aside className="w-full flex flex-col min-h-0 font-sans select-none">
      {/* Header do Bottom Sheet */}
      <div className="px-5 py-2.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 h-10 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100 tracking-tight">
            Tarefas no Fluxo
          </span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300">
            {stats.total}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Controles de Paginação Compactos */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>
              Página {currentPage + 1} de {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 0 || loading}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                disabled={isLastPage || loading}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            title="Minimizar Painel"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <ChevronDown size={18} />
          </button>
        </div>
      </div>

      {/* Lista Horizontal de Cards */}
      <div className="p-4 overflow-x-auto flex items-center gap-3 custom-scrollbar [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
        {data.length === 0 ? (
          <div className="w-full py-6 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <AlertCircle size={24} className="mb-1 opacity-50" />
            <p className="text-xs font-medium">Nenhuma tarefa encontrada.</p>
          </div>
        ) : (
          data.map((taskItem) => {
            const isSelected = selectedTaskId === taskItem.id;
            const status =
              STATUS_CONFIG[taskItem.status] || STATUS_CONFIG[TaskStatus.OPEN];
            const reporterName =
              users.find((u) => u.id === taskItem.reporterId)?.name ||
              "Não atribuído";

            return (
              <div
                key={taskItem.id}
                onClick={() => setSelectedTaskId(taskItem.id)}
                className={`group relative min-w-[240px] max-w-[280px] p-3.5 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-violet-50/90 dark:bg-violet-950/40 border-violet-400 dark:border-violet-600 shadow-md ring-2 ring-violet-400/20"
                    : "bg-white dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/80"
                }`}
              >
                {/* Linha Topo: Código & Status */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[11px] font-bold text-violet-600 dark:text-violet-400">
                    {taskItem.code || `#${taskItem.id.slice(0, 6)}`}
                  </span>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status.bg} ${status.text}`}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Título Principal */}
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {taskItem.title}
                </h4>

                {/* Rodapé: Relator + Ações */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[9px] flex items-center justify-center uppercase shrink-0">
                      {reporterName.slice(0, 2)}
                    </div>
                    <span className="truncate max-w-[120px] font-medium">
                      {reporterName}
                    </span>
                  </div>

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTaskForMenu(taskItem);
                    }}
                    className="shrink-0"
                  >
                    {taskItem.status !== TaskStatus.CANCELED && (
                      <TaskDropdownMenu onSelectAction={handleSelectAction} />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
