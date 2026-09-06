import { Draggable } from "@hello-pangea/dnd";
import { TaskStatus, type Task } from "@/types/task";
import { TaskHoverCard } from "../commons/TaskHoverCard";
import { TaskDropdownMenu } from "../commons/TaskDropdownMenuCard";
import { useTaskModalStore } from "@/store/useTaskModalStore";

interface TaskCardProps {
  task: Task;
  index: number;
}

const getBorderColor = (status: TaskStatus) => {
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
  }
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, index }) => {
  const { openModal } = useTaskModalStore();

  function handleSelectAction(action: "edit" | "delete" | "updateStatus") {
    if (action === "edit") {
      openModal("edit", task);
    }
    if (action === "delete") {
      openModal("updateStatus", task);
    }

    if (action === "updateStatus") {
      openModal("updateStatus", task);
    }
  }

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`w-full p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 border-l-4 ${getBorderColor(
            task.status,
          )} rounded-xl shadow-sm transition-all flex flex-col gap-3 group mb-3 select-none ${
            snapshot.isDragging
              ? "shadow-xl ring-2 ring-indigo-500/50 opacity-90"
              : "hover:shadow-md"
          }`}
        >
          <div className="flex justify-between items-start gap-2">
            <span className="font-bold text-[10px] tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
              {task.code}
            </span>
            <div className="flex gap-0.5 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity">
              <TaskHoverCard task={task} />
              <TaskDropdownMenu onSelectAction={handleSelectAction} />
            </div>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
              Relator
            </p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-0.5">
              {task.reporter}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500">
            <span>
              Criado em {new Date(task.createdAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
};
