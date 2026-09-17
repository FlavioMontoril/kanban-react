import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TaskStatus, type Task } from "@/types/task";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { STATUS_CONFIG } from "./utils/task-status.config";
import { useTasks } from "@/hooks/useTasks";
import { useFlowStore } from "../flow/store/useFlowStore";
import { TaskDropdownMenu } from "../commons/TaskDropdownMenuCard";
import { useTaskModalStore } from "@/store/useTaskModalStore";

interface ITaskTable {
  data: Task[];
}

export function TableTask({ data }: ITaskTable) {
  const { pageData, currentPage, size, loading, setCurrentPage } = useTasks();
  const { selectedTaskId, setSelectedTaskId } = useFlowStore();
  const { openModal } = useTaskModalStore();

  const [task, setTask] = useState<Task | null>(null);

  const stats = useMemo(() => {
    return {
      total: pageData?.totalElements,
      done: data.filter((t) => t.status === TaskStatus.DONE).length,
      inProgress: data.filter((t) => t.status === TaskStatus.IN_PROGRESS)
        .length,
    };
  }, [data, pageData?.totalElements]);

  const totalPages = pageData?.totalPage ?? 0;
  const isLastPage = currentPage + 1 === pageData?.totalPage;
  const totalTasksPages = Math.min(
    size * (currentPage + 1),
    pageData?.totalElements ?? data.length,
  );

  function handleSelectAction(action: "edit" | "delete" | "updateStatus") {
    if (action === "edit") openModal("edit", task);
    // if (action === "delete") openModal("delete", task);
    if (action === "updateStatus") openModal("updateStatus", task);
  }

  return (
    <div className="flex-1 h-full w-full bg-slate-50 dark:bg-slate-950 p-0 md:p-6 font-sans antialiased text-slate-800 dark:text-slate-100 transition-colors duration-200 overflow-hidden flex flex-col min-h-0">
      <div className="w-full mx-auto space-y-4 flex flex-col h-full overflow-hidden">
        {/* Container da Tabela com Scroll Independente */}
        <div className="flex-1 min-h-0 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader className="bg-slate-100/80 dark:bg-slate-800/50 sticky top-0 backdrop-blur-md z-10">
                <TableRow className="border-b border-slate-200/80 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="w-[120px] font-bold text-slate-700 dark:text-slate-200">
                    Código
                  </TableHead>
                  <TableHead className="w-[160px] font-bold text-slate-700 dark:text-slate-200">
                    Status
                  </TableHead>
                  <TableHead className="w-[200px] font-bold text-slate-700 dark:text-slate-200">
                    Título
                  </TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-200">
                    Relator
                  </TableHead>
                  <TableHead className="w-[60px] text-right font-bold text-slate-700 dark:text-slate-200">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-slate-400"
                    >
                      Nenhuma tarefa encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((task) => {
                    const status =
                      STATUS_CONFIG[task.status] ||
                      STATUS_CONFIG[TaskStatus.OPEN];

                    return (
                      <TableRow
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className={`border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${selectedTaskId === task.id && "bg-slate-50 border-blue-200 border-l-4"}`}
                      >
                        {/* Código/Tag da Tarefa */}
                        <TableCell className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {task.code || `#${task.id.slice(0, 6)}`}
                        </TableCell>

                        {/* Status em formato Badge */}
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.bg} ${status.text}`}
                          >
                            {status.label}
                          </span>
                        </TableCell>

                        {/* Título */}
                        <TableCell className="font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">
                          {task.title}
                        </TableCell>

                        {/* Relator */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center uppercase">
                              {(task.reporter || "U").slice(0, 2)}
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                              {task.reporter || "Não atribuído"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Ações */}
                        <TableCell
                          className="text-right"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTask(task);
                          }}
                        >
                          {task.status !== TaskStatus.CANCELED && (
                            <TaskDropdownMenu
                              onSelectAction={handleSelectAction}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <footer className="flex-none px-5 py-3 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200/60 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-4">
              <span>
                Página {currentPage + 1} de {totalPages} ({totalTasksPages} de{" "}
                {stats.total} itens)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 0 || loading}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                disabled={isLastPage || loading}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
