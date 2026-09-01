import React, { useState, useEffect } from "react";
import type { Task, TaskRequestDTO } from "@/types/task";

interface TaskModalProps {
  isOpen: boolean;
  mode: "create" | "edit" | "view";
  task: Task | null;
  onClose: () => void;
  onSave: (data: TaskRequestDTO) => Promise<void> | void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  mode,
  task,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<TaskRequestDTO>({
    code: "",
    title: "",
    description: "",
    reporter: "",
    assignee: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    onClose();
  };

  const isReadOnly = mode === "view";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-xl space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {mode === "create" && "Nova Tarefa"}
          {mode === "edit" && "Editar Tarefa"}
          {mode === "view" && "Detalhes da Tarefa"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500">Código</label>
            <input
              type="text"
              required
              disabled={isReadOnly || mode === "edit"} // Código geralmente é imutável
              value={formData.code}
              placeholder="Ex: TASK-01"
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500">Título</label>
            <input
              type="text"
              required
              disabled={isReadOnly}
              value={formData.title}
              placeholder="Título da tarefa"
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500">Descrição</label>
            <textarea
              disabled={isReadOnly}
              value={formData.description}
              placeholder="Descrição detalhada..."
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500">Relator (Reporter)</label>
              <input
                type="text"
                required
                disabled={isReadOnly}
                value={formData.reporter}
                placeholder="Seu nome"
                onChange={(e) => setFormData({ ...formData, reporter: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500">Responsável (Assignee)</label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.assignee || ""}
                placeholder="Opcional"
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isReadOnly ? "Fechar" : "Cancelar"}
            </button>

            {!isReadOnly && (
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Salvar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};