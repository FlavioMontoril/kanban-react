import { TaskStatus, type Task } from "@/types/task";

interface IEstatisticasTasks {
  tasks: Task[];
}

export function EstatisticasTasks({ tasks }: IEstatisticasTasks) {
  const stats = {
    total: tasks.length,
    open: tasks.filter((t) => t.status === TaskStatus.OPEN).length,
    inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
    underReview: tasks.filter((t) => t.status === TaskStatus.UNDER_REVIEW)
      .length,
    done: tasks.filter((t) => t.status === TaskStatus.DONE).length,
    cancelado: tasks.filter((t) => t.status === TaskStatus.CANCELED).length,
  };

  return (
    <section className="flex justify-center items-center px-4">
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300 px-4 py-2">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-500 ring-2 ring-slate-500/20" />
          <span>{stats.total} total</span>
        </span>

        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-blue-500/20" />
          <span>{stats.open} abertas</span>
        </span>

        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
          <span>{stats.inProgress} em progresso</span>
        </span>

        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-500 ring-2 ring-purple-500/20" />
          <span>{stats.underReview} em revisão</span>
        </span>

        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
          <span>{stats.done} concluídas</span>
        </span>

        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-500/20" />
          <span>{stats.cancelado} canceladas</span>
        </span>
      </div>
    </section>
  );
}
