import {
  X,
  FolderKanban,
  User,
  Calendar,
  Clock,
  FileText,
  Archive,
  CheckCircle2,
} from "lucide-react";
import { TaskStatus, type Task } from "@/types/task";
import { STATUS_CONFIG } from "@/components/kanbam/utils/task-status.config";
import { useAuth } from "@/hooks/useAuth";

interface TaskDetailsModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDetailsModal({
  task,
  isOpen,
  onClose,
}: TaskDetailsModalProps) {
  const { users } = useAuth();

  if (!isOpen || !task) return null;

  // Configuração de Status seguindo o mesmo padrão do Node
  const status = task.status
    ? STATUS_CONFIG[task.status]
    : STATUS_CONFIG[TaskStatus.OPEN];

  // Busca do nome do Relator e do Atribuído (User)
  const reporterName =
    users.find((u) => u.id === task.reporterId)?.name || "Não informado";
  
  const assignedUserName = task.userId
    ? users.find((u) => u.id === task.userId)?.name || "Usuário não encontrado"
    : "Não atribuído";

  // Formatação de datas
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Não informada";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border-2 border-violet-500 dark:border-violet-800 rounded-2xl w-full max-w-lg shadow-2xl relative flex flex-col overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal no mesmo tom violet do Node */}
        <div className="bg-violet-600 dark:bg-violet-700 h-12 px-4 flex items-center justify-between flex-none">
          <div className="flex items-center gap-2 text-white">
            <FolderKanban size={18} className="text-violet-200" />
            <span className="font-mono text-sm font-bold tracking-wider uppercase">
              {task.code || `#${task.id.slice(0, 6)}`}
            </span>
            {task.archived && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                <Archive size={10} /> Arquivado
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
            title="Fechar detalhe"
          >
            <X size={18} />
          </button>
        </div>

        {/* Conteúdo Principal */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[80vh] bg-slate-50/50 dark:bg-slate-900/50">
          
          {/* Título e Status Badge */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-snug">
                {task.title || "Sem título informado"}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${status.bg} ${status.text} shadow-xs`}
              >
                <span className="shrink-0">{status.icon}</span>
                <span>{status.label}</span>
              </span>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={13} />
              Descrição
            </label>
            <div className="p-3.5 bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-xl text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed min-h-[70px]">
              {task.description ? task.description : "Nenhuma descrição informada."}
            </div>
          </div>

          {/* Envolvidos (Relator e Responsável) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Relator */}
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                Relator
              </span>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
                <User size={14} className="text-violet-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                  {reporterName}
                </span>
              </div>
            </div>

            {/* Atribuído a */}
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                Responsável
              </span>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                  {assignedUserName}
                </span>
              </div>
            </div>
          </div>

          {/* Datas (Criação e Atualização) */}
          <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400 shrink-0" />
              <span>Criada em: {formatDate(task.createdAt)}</span>
            </div>

            {task.updatedAt && (
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-slate-400 shrink-0" />
                <span>Atualizada: {formatDate(task.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="p-3 bg-slate-100/60 dark:bg-slate-900/80 border-t border-slate-200/60 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}