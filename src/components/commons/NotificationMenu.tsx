import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  Check,
  RotateCw,
  PlusCircle,
  Archive,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  useNotificationStore,
  type NotificationType,
} from "../../store/useNotificationStore";

const eventDetails: Record<
  NotificationType,
  { label: string; icon: React.ReactNode; badgeBg: string }
> = {
  CREATED: {
    label: "Criada no sistema",
    icon: <PlusCircle size={15} className="text-emerald-500" />,
    badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  ARCHIVED: {
    label: "Arquivada",
    icon: <Archive size={15} className="text-amber-500" />,
    badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  STATUS_CHANGED: {
    label: "Status alterado",
    icon: <Sparkles size={15} className="text-indigo-500" />,
    badgeBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
};

export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "SYSTEM">("ALL");
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { notifications, markAsRead, clearAll } = useNotificationStore();
  const unreadCount = notifications.length;

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 8,
        left: Math.max(16, rect.right + window.scrollX - 360), // 360px de largura
      });
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative inline-block text-left shrink-0">
      {/* BOTÃO DISPARADOR DE NOTIFICAÇÕES */}
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        className="relative p-2.5 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 cursor-pointer flex items-center justify-center shrink-0 transition-all duration-300 active:scale-95 hover:scale-110"
        title="Notificações"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute bottom-5 left-5.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse px-1 shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* MENU MODAL COM DESIGN CARDS */}
      {isOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-40 bg-transparent"
              onClick={() => setIsOpen(false)}
            />

            <div
              style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
              className="fixed z-50 w-[340px] sm:w-[370px] rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 transition-all animate-in fade-in zoom-in-95 duration-200"
            >
              {/* HEADER DO MENU */}
              <div className="p-4 pb-2 flex items-center justify-between">
                <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Notifications
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Atualizar"
                >
                  <RotateCw size={14} />
                </button>
              </div>

              {/* TABS DE FILTRO NO ESTILO PILL */}
              <div className="px-4 pb-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("ALL")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeTab === "ALL"
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                >
                  All
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-md bg-white dark:bg-slate-900 text-[10px] font-bold shadow-xs text-slate-600 dark:text-slate-400">
                    {unreadCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("SYSTEM")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeTab === "SYSTEM"
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                >
                  System
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-md bg-white dark:bg-slate-900 text-[10px] font-bold shadow-xs text-slate-600 dark:text-slate-400">
                    {unreadCount}
                  </span>
                </button>
              </div>

              {/* LISTA DE CARDS DAS NOTIFICAÇÕES */}
              <div className="max-h-[360px] overflow-y-auto px-4 space-y-2.5 pb-3 scrollbar-thin">
                {unreadCount === 0 ? (
                  <div className="py-10 text-center text-slate-400 dark:text-slate-500">
                    <Bell size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-medium">Nenhuma notificação por aqui.</p>
                  </div>
                ) : (
                  notifications?.map((item) => {
                    const details = eventDetails[item?.type];
                    return (
                      <div
                        key={item.id}
                        onClick={() => markAsRead(item.id)}
                        className="group relative p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          {/* ÍCONE EM DESTAQUE CIRCULAR */}
                          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-xs shrink-0 mt-0.5">
                            {details.icon}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* TÍTULO DA TAREFA */}
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug truncate">
                              {item.task.title}
                            </h4>

                            {/* DESCRIÇÃO DA NOTIFICAÇÃO */}
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                              {details.label}{" "}
                              {item.type === "STATUS_CHANGED" && (
                                <span className="font-semibold text-indigo-500">
                                  {item.task.status}
                                </span>
                              )}
                            </p>

                            {/* TAGS PILL DO PROJETO / CÓDIGO */}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-sky-800/50">
                                {item.task.code}
                              </span>

                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                                <Clock size={10} />
                                Recente
                              </span>
                            </div>
                          </div>

                          {/* BOTÃO MARCAR COMO LIDA */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(item.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-500 transition p-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            title="Marcar como lida"
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* FOOTER COM AÇÕES PRINCIPAIS */}
              {unreadCount > 0 && (
                <div className="p-3 px-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 underline decoration-slate-300 dark:decoration-slate-700 underline-offset-4 transition cursor-pointer"
                  >
                    Mark all as read
                  </button>

                  <button
                    type="button"
                    onClick={clearAll}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs transition cursor-pointer"
                  >
                    Go to notification center
                  </button>
                </div>
              )}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}