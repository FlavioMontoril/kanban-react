// import React, {
//   useState,
//   useEffect,
//   type MouseEvent,
//   type ChangeEvent,
// } from "react";
// import { TaskStatus, type Task, type TaskRequestDTO } from "@/types/task";
// import { MoveRight } from "lucide-react";
// import { useTasks } from "@/hooks/useTasks";
// import { AssigneeSelect } from "../commons/AssigneeSelect";
// import type { UserResponse } from "@/types/user";

// interface TaskModalProps {
//   isOpen: boolean;
//   mode: "create" | "edit" | "view" | "updateStatus";
//   task: Task | null;
//   users: UserResponse[];
//   onClose: () => void;
// }

// export const TaskModal: React.FC<TaskModalProps> = ({
//   isOpen,
//   mode,
//   task,
//   users,
//   onClose,
// }) => {
//   const { createTask, moveTaskStatus } = useTasks();

//   const [formData, setFormData] = useState<TaskRequestDTO>({
//     code: "",
//     title: "",
//     description: "",
//     reporter: "",
//     assignee: "",
//     userId: "",
//   });
//   const [selectedStatus, setSelectedStatus] = useState<TaskStatus | null>(null);

//   function handleSelectStatus(e: ChangeEvent<HTMLSelectElement>) {
//     e.stopPropagation();
//     const newStatus = e.target.value as TaskStatus;
//     if (newStatus) {
//       setSelectedStatus(newStatus);
//     }
//   }
//   // Preenche o formulário se estiver no modo de edição ou visualização
//   useEffect(() => {
//     if (task) {
//       setFormData({
//         code: task.code,
//         title: task.title,
//         description: task.description,
//         reporter: task.reporter,
//         assignee: task.assignee || "",
//         userId: task.userId || "",
//       });
//     } else {
//       setFormData({
//         code: "",
//         title: "",
//         description: "",
//         reporter: "",
//         assignee: "",
//         userId: "",
//       });
//     }
//   }, [task, isOpen]);

//   if (!isOpen) return null;

//   const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();
//     try {
//       if (mode === "create") {
//         await createTask(formData);
//       }

//       if (mode === "updateStatus") {
//         await moveTaskStatus(task?.id!, selectedStatus!);
//       }
//     } finally {
//       onClose();
//     }
//   };

//   const isReadOnly = mode === "view";

//   return (
//     <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
//       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-xl space-y-4">
//         <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
//           {mode === "create" && "Nova Tarefa"}
//           {mode === "edit" && "Editar Tarefa"}
//           {mode === "view" && "Detalhes da Tarefa"}
//           {mode === "updateStatus" && "Atualizar Status da Task"}
//         </h2>
//         {(mode === "edit" || mode === "create") && (
//           <form onClick={() => handleSubmit} className="space-y-3">
//             <div>
//               <label className="text-xs font-semibold text-slate-500">
//                 Código
//               </label>
//               <input
//                 type="text"
//                 required
//                 disabled={isReadOnly || mode === "edit"} // Código geralmente é imutável
//                 value={formData.code}
//                 placeholder="Ex: TASK-01"
//                 onChange={(e) =>
//                   setFormData({ ...formData, code: e.target.value })
//                 }
//                 className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
//               />
//             </div>

//             <div>
//               <label className="text-xs font-semibold text-slate-500">
//                 Título
//               </label>
//               <input
//                 type="text"
//                 required
//                 disabled={isReadOnly}
//                 value={formData.title}
//                 placeholder="Título da tarefa"
//                 onChange={(e) =>
//                   setFormData({ ...formData, title: e.target.value })
//                 }
//                 className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
//               />
//             </div>

//             <div>
//               <label className="text-xs font-semibold text-slate-500">
//                 Descrição
//               </label>
//               <textarea
//                 disabled={isReadOnly}
//                 value={formData.description}
//                 placeholder="Descrição detalhada..."
//                 onChange={(e) =>
//                   setFormData({ ...formData, description: e.target.value })
//                 }
//                 className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm h-24"
//               />
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="text-xs font-semibold text-slate-500">
//                   Relator (Reporter)
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   disabled={isReadOnly}
//                   value={formData.reporter}
//                   placeholder="Seu nome"
//                   onChange={(e) =>
//                     setFormData({ ...formData, reporter: e.target.value })
//                   }
//                   className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
//                 />
//               </div>

//               <div>
//                 <label className="text-xs font-semibold text-slate-500">
//                   Responsável (Assignee)
//                 </label>
//                 {/* <input
//                   type="text"
//                   disabled={isReadOnly}
//                   value={formData.assignee || ""}
//                   placeholder="Opcional"
//                   onChange={(e) =>
//                     setFormData({ ...formData, assignee: e.target.value })
//                   }
//                   className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
//                 /> */}
//                 <AssigneeSelect
//                   users={users}
//                   disabled={isReadOnly}
//                   value={formData.userId || ""}
//                   onChange={(selectedUserId) => {
//                     setFormData((prev) => ({
//                       ...prev,
//                       userId: selectedUserId,
//                       assignee:
//                         users.find((u) => u.id === selectedUserId)?.name || "",
//                     }));
//                   }}
//                 />
//               </div>
//             </div>
//           </form>
//         )}

//         {mode === "updateStatus" && (
//           <form onClick={() => handleSubmit} className="space-y-3">
//             <div>
//               <p className="text-xs font-semibold text-slate-500">Código</p>
//               <span>{task?.code}</span>
//             </div>

//             <div>
//               <p className="text-xs font-semibold text-slate-500">Título</p>
//               <span>{task?.title}</span>
//             </div>

//             <div className="flex justify-between gap-3">
//               <div>
//                 <p className="text-xs font-semibold text-slate-500">
//                   Status atual
//                 </p>
//                 <span>{task?.status}</span>
//               </div>
//               <MoveRight />

//               <div>
//                 <select onChange={(e) => handleSelectStatus(e)}>
//                   <option value="" disabled hidden>
//                     Selecione o novo status
//                   </option>
//                   {task?.status !== TaskStatus.OPEN && (
//                     <option value={TaskStatus.OPEN}>Aberto</option>
//                   )}

//                   {task?.status !== TaskStatus.IN_PROGRESS && (
//                     <option value={TaskStatus.IN_PROGRESS}>Em Progresso</option>
//                   )}

//                   {task?.status !== TaskStatus.UNDER_REVIEW && (
//                     <option value={TaskStatus.UNDER_REVIEW}>Em Revisão</option>
//                   )}

//                   {task?.status !== TaskStatus.DONE && (
//                     <option value={TaskStatus.DONE}>Concluído</option>
//                   )}

//                   {task?.status !== TaskStatus.CANCELED && (
//                     <option value={TaskStatus.CANCELED}>Cancelado</option>
//                   )}
//                 </select>
//               </div>
//             </div>
//           </form>
//         )}

//         <div className="flex justify-end gap-2 pt-3">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
//           >
//             {isReadOnly ? "Fechar" : "Cancelar"}
//           </button>

//           {!isReadOnly && (
//             <button
//               onClick={handleSubmit}
//               className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
//             >
//               Salvar
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

import React, {
  useState,
  useEffect,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { TaskStatus, type Task, type TaskRequestDTO } from "@/types/task";
import { MoveRight, FolderKanban, RefreshCw, Plus, Edit, Eye, X } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { AssigneeSelect } from "../commons/AssigneeSelect";
import type { UserResponse } from "@/types/user";
import { STATUS_CONFIG } from "@/components/kanbam/utils/border-color";

interface TaskModalProps {
  isOpen: boolean;
  mode: "create" | "edit" | "view" | "updateStatus";
  task: Task | null;
  users: UserResponse[];
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  mode,
  task,
  users,
  onClose,
}) => {
  const { createTask, moveTaskStatus } = useTasks();

  const [formData, setFormData] = useState<TaskRequestDTO>({
    code: "",
    title: "",
    description: "",
    reporter: "",
    assignee: "",
    userId: "",
  });
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | null>(null);

  useEffect(() => {
    if (task) {
      setFormData({
        code: task.code,
        title: task.title,
        description: task.description,
        reporter: task.reporter,
        assignee: task.assignee || "",
        userId: task.userId || "",
      });
      setSelectedStatus(null);
    } else {
      setFormData({
        code: "",
        title: "",
        description: "",
        reporter: "",
        assignee: "",
        userId: "",
      });
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "create") {
        await createTask(formData);
      }

      if (mode === "updateStatus" && selectedStatus) {
        await moveTaskStatus(task?.id!, selectedStatus);
      }
    } finally {
      onClose();
    }
  };

  const isReadOnly = mode === "view";
  const currentStatusConfig = task?.status ? STATUS_CONFIG[task.status] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Cabeçalho no padrão Flow */}
        <div className="bg-violet-600 dark:bg-violet-700 h-10 px-4 flex items-center justify-between flex-none">
          <div className="flex items-center gap-2 text-white">
            {mode === "create" && <Plus size={16} />}
            {mode === "edit" && <Edit size={16} />}
            {mode === "view" && <Eye size={16} />}
            {mode === "updateStatus" && <RefreshCw size={16} />}
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              {mode === "create" && "Nova Tarefa"}
              {mode === "edit" && `Editar: ${task?.code}`}
              {mode === "view" && `Detalhes: ${task?.code}`}
              {mode === "updateStatus" && `Mover Status: ${task?.code}`}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-5 bg-slate-50/50 dark:bg-slate-900/50">
          {(mode === "edit" || mode === "create" || mode === "view") && (
            <form id="task-form" onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isReadOnly || mode === "edit"}
                    value={formData.code}
                    placeholder="TASK-01"
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-mono font-semibold focus:outline-hidden focus:border-violet-500 transition-colors disabled:opacity-60"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-hidden focus:border-violet-500 transition-colors disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Descrição
                </label>
                <textarea
                  disabled={isReadOnly}
                  value={formData.description}
                  placeholder="Descreva os detalhes da tarefa..."
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-hidden focus:border-violet-500 transition-colors h-20 resize-none disabled:opacity-60 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Relator
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isReadOnly}
                    value={formData.reporter}
                    placeholder="Nome do relator"
                    onChange={(e) =>
                      setFormData({ ...formData, reporter: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium focus:outline-hidden focus:border-violet-500 transition-colors disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Responsável
                  </label>
                  <AssigneeSelect
                    users={users}
                    disabled={isReadOnly}
                    value={formData.userId || ""}
                    onChange={(selectedUserId) => {
                      setFormData((prev) => ({
                        ...prev,
                        userId: selectedUserId,
                        assignee:
                          users.find((u) => u.id === selectedUserId)?.name || "",
                      }));
                    }}
                  />
                </div>
              </div>
            </form>
          )}

          {mode === "updateStatus" && (
            <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="font-mono text-[10px] font-bold text-violet-500 uppercase tracking-wider">
                  {task?.code}
                </span>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                  {task?.title}
                </h4>
              </div>

              <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Atual
                  </span>
                  {currentStatusConfig && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium border ${currentStatusConfig.bg} ${currentStatusConfig.text}`}
                    >
                      {currentStatusConfig.icon}
                      {currentStatusConfig.label}
                    </span>
                  )}
                </div>

                <MoveRight className="text-slate-400 shrink-0 mt-3" size={16} />

                <div className="flex flex-col gap-1 min-w-[130px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Novo Status
                  </span>
                  <select
                    value={selectedStatus || ""}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setSelectedStatus(e.target.value as TaskStatus)
                    }
                    className="w-full px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-[11px] font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-violet-500 cursor-pointer"
                  >
                    <option value="" disabled>
                      Selecione...
                    </option>
                    {Object.values(TaskStatus)
                      .filter((s) => s !== task?.status)
                      .map((statusKey) => (
                        <option key={statusKey} value={statusKey}>
                          {STATUS_CONFIG[statusKey]?.label || statusKey}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </form>
          )}

          {/* Rodapé de Ações */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isReadOnly ? "Fechar" : "Cancelar"}
            </button>

            {!isReadOnly && (
              <button
                type="submit"
                form="task-form"
                disabled={mode === "updateStatus" && !selectedStatus}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                Salvar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};