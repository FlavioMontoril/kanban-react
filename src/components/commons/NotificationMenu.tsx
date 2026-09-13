import { useState } from "react";
import { Bell, Check, Trash2, Archive, X } from "lucide-react";
import { useNotificationStore } from "../../store/useNotificationStore";
import { Button } from "../ui/button";

export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead, clearAll } = useNotificationStore();

  const unreadCount = notifications.length;

  return (
    <div className="relative inline-block text-left">
      {/* Ícone com Badge */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center"
        title="Notificações"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold px-1 animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover / Dropdown de Notificações */}
      {isOpen && (
        <>
          {/* Overlay invisível para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50 overflow-hidden text-slate-800 dark:text-slate-100 transition-all">
            {/* Cabecalho */}
            <div className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Archive size={16} className="text-indigo-500" />
                <h3 className="text-sm font-semibold">Arquivamento Automático</h3>
                {unreadCount > 0 && (
                  <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="h-7 px-2 text-[11px] text-slate-500 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={12} className="mr-1" /> Limpar tudo
                  </Button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Lista de Notificações */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {unreadCount === 0 ? (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                  <Bell size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Nenhuma notificação no momento.</p>
                </div>
              ) : (
                notifications.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => markAsRead(task.id)}
                    className="group p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {task.code}
                        </span>
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {task.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {task.description || "Sem descrição."}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Tarefa cancelada e arquivada pelo sistema
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(task.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-500 transition p-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      title="Marcar como lida"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}