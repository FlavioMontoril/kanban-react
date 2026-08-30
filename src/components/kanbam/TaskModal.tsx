import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { type Task, TaskStatus } from '../../types/task';

interface TaskModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view';
  task?: Task | null;
  onClose: () => void;
  onSave: (data: { reporter: string; status: TaskStatus }) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, mode, task, onClose, onSave }) => {
  const [reporter, setReporter] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.OPEN);

  useEffect(() => {
    if (task && (mode === 'edit' || mode === 'view')) {
      setReporter(task.reporter);
      setStatus(task.status);
    } else {
      setReporter('');
      setStatus(TaskStatus.OPEN);
    }
  }, [task, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ reporter, status });
    onClose();
  };

  const isReadOnly = mode === 'view';

  // Helper para mapeamento legível de status
  const getStatusLabel = (s: TaskStatus) => {
    switch (s) {
      case TaskStatus.OPEN: return 'Aberto';
      case TaskStatus.IN_PROGRESS: return 'Em Progresso';
      case TaskStatus.UNDER_REVIEW: return 'Em Revisão';
      case TaskStatus.DONE: return 'Concluído';
      case TaskStatus.CANCELED: return 'Cancelado';
      default: return s;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 relative transform transition-transform duration-300 scale-100">
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-extrabold mb-5 text-slate-800 tracking-tight">
          {mode === 'create' && 'Nova Tarefa'}
          {mode === 'edit' && `Editar Tarefa (${task?.code})`}
          {mode === 'view' && `Detalhes da Tarefa (${task?.code})`}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Relator
            </label>
            <input
              type="text"
              required
              disabled={isReadOnly}
              value={reporter}
              onChange={(e) => setReporter(e.target.value)}
              placeholder="Ex: João Silva"
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500 font-medium text-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              disabled={isReadOnly}
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500 font-medium text-slate-800 text-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_16px_center] bg-no-repeat"
            >
              {Object.values(TaskStatus).map((s) => (
                <option key={s} value={s}>
                  {getStatusLabel(s)}
                </option>
              ))}
            </select>
          </div>

          {isReadOnly && task && (
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-2 mt-5">
              <p className="flex justify-between">
                <span className="font-semibold text-slate-400">ID único:</span> 
                <span className="font-mono text-slate-600">{task.id}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-semibold text-slate-400">Criado em:</span> 
                <span className="text-slate-600">{new Date(task.createdAt).toLocaleString('pt-BR')}</span>
              </p>
              {task.updatedAt && (
                <p className="flex justify-between">
                  <span className="font-semibold text-slate-400">Atualizado em:</span> 
                  <span className="text-slate-600">{new Date(task.updatedAt).toLocaleString('pt-BR')}</span>
                </p>
              )}
            </div>
          )}

          {!isReadOnly && (
            <div className="flex justify-end gap-3 pt-5 border-t border-slate-50 mt-5">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 font-semibold text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 font-semibold text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-100 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
              >
                Salvar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};