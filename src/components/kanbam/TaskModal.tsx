import React, {
  useState,
  useEffect,
  type MouseEvent,
  type ChangeEvent,
} from "react";
import { TaskStatus, type Task, type TaskRequestDTO } from "@/types/task";
import { MoveRight } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";

interface TaskModalProps {
  isOpen: boolean;
  mode: "create" | "edit" | "view" | "updateStatus";
  task: Task | null;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  mode,
  task,
  onClose,
}) => {
  const { createTask, moveTaskStatus } = useTasks();

  const [formData, setFormData] = useState<TaskRequestDTO>({
    code: "",
    title: "",
    description: "",
    reporter: "",
    assignee: "",
  });
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | null>(null);

  function handleSelectStatus(e: ChangeEvent<HTMLSelectElement>) {
    e.stopPropagation();
    const newStatus = e.target.value as TaskStatus;
    if (newStatus) {
      setSelectedStatus(newStatus);
    }
  }
  // Preenche o formulário se estiver no modo de edição ou visualização
  useEffect(() => {
    if (task) {
      setFormData({
        code: task.code,
        title: task.title,
        description: task.description,
        reporter: task.reporter,
        assignee: task.assignee || "",
      });
    } else {
      setFormData({
        code: "",
        title: "",
        description: "",
        reporter: "",
        assignee: "",
      });
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      if (mode === "create") {
        await createTask(formData);
      }

      if (mode === "updateStatus") {
        await moveTaskStatus(task?.id!, selectedStatus!);
      }
    } finally {
      onClose();
    }
  };

  const isReadOnly = mode === "view";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-xl space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {mode === "create" && "Nova Tarefa"}
          {mode === "edit" && "Editar Tarefa"}
          {mode === "view" && "Detalhes da Tarefa"}
          {mode === "updateStatus" && "Atualizar Status da Task"}
        </h2>
        {(mode === "edit" || mode === "create") && (
          <form onClick={() => handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-500">
                Código
              </label>
              <input
                type="text"
                required
                disabled={isReadOnly || mode === "edit"} // Código geralmente é imutável
                value={formData.code}
                placeholder="Ex: TASK-01"
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500">
                Título
              </label>
              <input
                type="text"
                required
                disabled={isReadOnly}
                value={formData.title}
                placeholder="Título da tarefa"
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500">
                Descrição
              </label>
              <textarea
                disabled={isReadOnly}
                value={formData.description}
                placeholder="Descrição detalhada..."
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Relator (Reporter)
                </label>
                <input
                  type="text"
                  required
                  disabled={isReadOnly}
                  value={formData.reporter}
                  placeholder="Seu nome"
                  onChange={(e) =>
                    setFormData({ ...formData, reporter: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Responsável (Assignee)
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={formData.assignee || ""}
                  placeholder="Opcional"
                  onChange={(e) =>
                    setFormData({ ...formData, assignee: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
                />
              </div>
            </div>
          </form>
        )}

        {mode === "updateStatus" && (
          <form onClick={() => handleSubmit} className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-500">Código</p>
              <span>{task?.code}</span>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500">Título</p>
              <span>{task?.title}</span>
            </div>

            <div className="flex justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Status atual
                </p>
                <span>{task?.status}</span>
              </div>
              <MoveRight />

              <div>
                <select onChange={(e) => handleSelectStatus(e)}>
                  <option value="" disabled hidden>
                    Selecione o novo status
                  </option>
                  {task?.status !== TaskStatus.OPEN && (
                    <option value={TaskStatus.OPEN}>Aberto</option>
                  )}

                  {task?.status !== TaskStatus.IN_PROGRESS && (
                    <option value={TaskStatus.IN_PROGRESS}>
                      Em Progresso
                    </option>
                  )}

                  {task?.status !== TaskStatus.UNDER_REVIEW && (
                    <option value={TaskStatus.UNDER_REVIEW}>
                      Em Revisão
                    </option>
                  )}

                  {task?.status !== TaskStatus.DONE && (
                    <option value={TaskStatus.DONE}>Concluído</option>
                  )}

                  {task?.status !== TaskStatus.CANCELED && (
                    <option value={TaskStatus.CANCELED}>Cancelado</option>
                  )}
                </select>
              </div>
            </div>
          </form>
        )}

        <div className="flex justify-end gap-2 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isReadOnly ? "Fechar" : "Cancelar"}
          </button>

          {!isReadOnly && (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Salvar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
