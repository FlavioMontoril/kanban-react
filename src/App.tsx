import "@svar-ui/react-kanban/style.css";
import { useState } from "react";
import { Kanban, Willow } from "@svar-ui/react-kanban";
import { useTaskStore } from "./store/useTaskStore";
import { KANBAN_COLUMNS, type Task, TaskStatus } from "./types/task";
import { TaskModal } from "./components/kanbam/TaskModal";
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Check,
} from "lucide-react";

export default function App() {
  const { tasks, addTask, updateTask, deleteTask, moveTask } = useTaskStore();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit" | "view";
    task: Task | null;
  }>({
    isOpen: false,
    mode: "create",
    task: null,
  });

  // Evento acionado ao mover o card entre colunas no SVAR
  const handleMoveCard = (event: any) => {
    const taskId = event.id || event.card?.id;
    const targetStatus = (event.targetColumnId || event.column) as TaskStatus;

    if (taskId && targetStatus) {
      moveTask(taskId, targetStatus);
    }
  };

  // Helper para obter a cor da borda lateral do card baseada no status
  const getStatusBorderColor = (status: TaskStatus) => {
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
      default:
        return "border-l-slate-200";
    }
  };

  // Cálculo das estatísticas rápidas do board
  const stats = {
    total: tasks.length,
    open: tasks.filter((t) => t.status === TaskStatus.OPEN).length,
    inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
    underReview: tasks.filter((t) => t.status === TaskStatus.UNDER_REVIEW)
      .length,
    done: tasks.filter((t) => t.status === TaskStatus.DONE).length,
    cancelado: tasks.filter((t) => t.status === TaskStatus.CANCELED).length,
  };

  // Customização do Card renderizado dentro do SVAR
  const customCardContent = ({ card }: { card: any }) => {
    const task = card as Task;
    const borderColor = getStatusBorderColor(task.status);

    return (
      <div
        className={`w-full p-4 bg-white border border-slate-200/80 border-l-4 ${borderColor} rounded-xl shadow-sm hover:shadow-md transition-all duration-250 flex flex-col gap-3 group relative overflow-hidden`}
      >
        <div className="flex justify-between items-start gap-2">
          <span className="font-bold text-[10px] tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            {task.code}
          </span>
          <div className="flex gap-0.5 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setModalState({ isOpen: true, mode: "view", task: task });
              }}
              className="hover:text-slate-700 hover:bg-slate-50 p-1 rounded-md transition-colors"
              title="Visualizar"
            >
              <Eye size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setModalState({ isOpen: true, mode: "edit", task: task });
              }}
              className="hover:text-indigo-600 hover:bg-indigo-50 p-1 rounded-md transition-colors"
              title="Editar"
            >
              <Edit size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteTask(task.id);
              }}
              className="hover:text-red-600 hover:bg-red-50 p-1 rounded-md transition-colors"
              title="Excluir"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Relator
          </p>
          <p className="text-sm font-medium text-slate-700 mt-0.5">
            {task.reporter}
          </p>
        </div>

        <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
          <span>
            Criado em {new Date(task.createdAt).toLocaleDateString("pt-BR")}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans antialiased text-slate-800">
      <div className="w-full mx-auto space-y-6">
        {/* Cabeçalho */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 bg-clip-text text-transparent">
              Kanban Board
            </h1>
            <div className="flex">
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Gerenciador de Tarefas Inteligente com SVAR & Zustand
              </p>
              <p className="text-sm text-slate-500 mt-1 font-bold">
                {` - Total: ${stats.total}`}
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              setModalState({ isOpen: true, mode: "create", task: null })
            }
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus size={18} /> Nova Tarefa
          </button>
        </header>

        {/* Painel de Métricas / Dashboard Rápido com Lucide Icons */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Card Aberto */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Check size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Aberto
              </p>
              <h3 className="text-xl font-black text-slate-800 mt-0.5">
                {stats.open}
              </h3>
            </div>
          </div>

          {/* Card Em Progresso */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Em Progresso
              </p>
              <h3 className="text-xl font-black text-slate-800 mt-0.5">
                {stats.inProgress}
              </h3>
            </div>
          </div>

          {/* Card Em Revisão */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
              <Eye size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Em Revisão
              </p>
              <h3 className="text-xl font-black text-slate-800 mt-0.5">
                {stats.underReview}
              </h3>
            </div>
          </div>

          {/* Card Concluído */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Concluído
              </p>
              <h3 className="text-xl font-black text-slate-800 mt-0.5">
                {stats.done}
              </h3>
            </div>
          </div>

          {/* Card Cancelado */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-xl text-red-600">
              <XCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Cancelado
              </p>
              <h3 className="text-xl font-black text-slate-800 mt-0.5">
                {stats.cancelado}
              </h3>
            </div>
          </div>
        </section>

        {/* Board Kanban */}
        <main className="bg-white p-6 min-h-screen rounded-2xl shadow-sm border border-slate-200/60">
          <Willow>
            <Kanban
              columns={KANBAN_COLUMNS}
              cards={tasks.map((task) => ({
                ...task,
                column: task.status,
              }))}
              dynamicData={true}
              cardContent={customCardContent}
              onMoveCard={handleMoveCard}
              onAddCard={({ column }: any) => {
                setModalState({
                  isOpen: true,
                  mode: "create",
                  task: {
                    id: "",
                    code: "",
                    reporter: "",
                    status: column as TaskStatus,
                    createdAt: new Date().toISOString(),
                  },
                });
              }}
            />
          </Willow>
        </main>
      </div>

      <TaskModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        task={modalState.task}
        onClose={() =>
          setModalState({ isOpen: false, mode: "create", task: null })
        }
        onSave={(formData) => {
          if (modalState.mode === "create") {
            addTask(formData);
          } else if (modalState.mode === "edit" && modalState.task) {
            updateTask(modalState.task.id, formData);
          }
        }}
      />
    </div>
  );
}
