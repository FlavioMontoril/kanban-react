import { TaskStatus, type PageResponse, type Task } from "@/types/task";

interface IEstatisticasTasks {
  tasks: Task[] | PageResponse<Task> | null;
}

export function EstatisticasTasks({ tasks }: IEstatisticasTasks) {
  const taskList = Array.isArray(tasks) ? tasks : (tasks?.content ?? []);
  const total = Array.isArray(tasks)
    ? tasks.length
    : (tasks?.totalElements ?? 0);
    
  const stats = {
    total,
    open: taskList.filter((t) => t.status === TaskStatus.OPEN).length,
    inProgress: taskList.filter((t) => t.status === TaskStatus.IN_PROGRESS)
      .length,
    underReview: taskList.filter((t) => t.status === TaskStatus.UNDER_REVIEW)
      .length,
    done: taskList.filter((t) => t.status === TaskStatus.DONE).length,
    cancelado: taskList.filter((t) => t.status === TaskStatus.CANCELED).length,
  };

  const tarefasValidas = stats.total - stats.cancelado;
  const progressPercentage =
    tarefasValidas > 0 ? Math.round((stats.done / tarefasValidas) * 100) : 0;

  // Configurações do SVG dinâmico
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  return (
    // <section className="flex justify-center items-center">
    //   <div className="flex flex-col items-center">
    //     <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300 px-3">
    //       <span className="flex items-center gap-1">
    //         <span className="w-2 h-2 rounded-full bg-slate-500 ring-2 ring-slate-500/20" />
    //         <span>{stats.total} total</span>
    //       </span>

    //       <span className="flex items-center gap-1">
    //         <span className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-blue-500/20" />
    //         <span>{stats.open} abertas</span>
    //       </span>

    //       <span className="flex items-center gap-1">
    //         <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
    //         <span>{stats.inProgress} em progresso</span>
    //       </span>

    //       <span className="flex items-center gap-1">
    //         <span className="w-2 h-2 rounded-full bg-purple-500 ring-2 ring-purple-500/20" />
    //         <span>{stats.underReview} em revisão</span>
    //       </span>

    //       <span className="flex items-center gap-1">
    //         <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
    //         <span>{stats.done} concluídas</span>
    //       </span>

    //       <span className="flex items-center gap-1">
    //         <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-500/20" />
    //         <span>{stats.cancelado} canceladas</span>
    //       </span>
    //     </div>
    //     {/* Barra de Progresso */}
    //     <Progress value={progressPercentage} className="w-full max-w-[200px] sm:max-w-md md:max-w-[280px] transition-all duration-300 my-3">
    //       <ProgressLabel>Concluídos</ProgressLabel>
    //       <ProgressValue />
    //     </Progress>
    //   </div>
    // </section>

    <section className="flex justify-center items-center">
      <div className="flex flex-col md:flex-row items-center gap-6 w-full max-w-2xl px-4">
        {/* Círculo de Progresso Responsivo */}
        <div className="relative flex items-center justify-center w-30 h-30 sm:w-28 sm:h-28 md:w-32 md:h-32 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
            {/* Círculo de Fundo (Trilho) */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Círculo de Progresso (Preenchimento) */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              className="stroke-emerald-500 transition-all duration-500 ease-out"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          {/* Valor de Porcentagem no Centro */}
          <div className="absolute flex flex-col items-center justify-center text-slate-700 dark:text-slate-200">
            <span className="text-sm sm:text-base md:text-lg font-bold">
              {progressPercentage}%
            </span>
            <div className="flex flex-col text-[10px] text-slate-500 font-medium leading-none">
              {stats.done > 1 && <span className="text-center">{stats.done}</span>}
              <span className="text-[10px] text-slate-500 font-medium">
                {`Concluído${stats.done > 1 ? "s" : ""}`}
              </span>
            </div>
          </div>
        </div>

        {/* Estatísticas numéricas */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
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

          {/* <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
            <span>{stats.done} concluídas</span>
          </span> */}

          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-500/20" />
            <span>{stats.cancelado} canceladas</span>
          </span>
        </div>
      </div>
    </section>
  );
}
