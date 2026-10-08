import { useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  RotateCw,
  PlusCircle,
  Archive,
  Clock,
  Sparkles,
  Trash2,
  CheckCheck,
  Wifi,
  WifiOff,
  UserCheck,
} from "lucide-react";
import {
  useNotificationStore,
  type NotificationType,
} from "../../store/useNotificationStore";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getAvatarUrl } from "@/lib/getAvatarUrl";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

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
  CONNECTION: {
    label: "Sessão de utilizador",
    icon: <UserCheck size={15} className="text-blue-500" />,
    badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
};

function formatNotificationDate(dateString: string): string {
  if (!dateString) return "Agora";
  try {
    const parsedDate =
      typeof dateString === "string" ? parseISO(dateString) : dateString;
    return format(parsedDate, "dd/MM 'às' HH:mm", { locale: ptBR });
  } catch {
    return "Agora";
  }
}

export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "SYSTEM" | "PRESENCE">(
    "ALL",
  );
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { notifications, markAsRead, removeNotification, clearAll } =
    useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "SYSTEM") {
      return (
        item?.type === "CREATED" ||
        item?.type === "ARCHIVED" ||
        item?.type === "STATUS_CHANGED"
      );
    }
    if (activeTab === "PRESENCE") {
      return item?.type === "CONNECTION";
    }
    return true;
  });

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 8,
        left: Math.max(16, rect.right + window.scrollX - 360),
      });
    }
    setIsOpen((prev) => !prev);
  };

  const userName = notifications.map((item) => item.user?.name)?.[0];
  const userInitials = useMemo(() => {
    if (!userName) return "US";
    const parts = userName?.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }, [userName]);

  return (
    <div className="relative inline-block text-left shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        className="relative p-2 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 cursor-pointer flex items-center justify-center shrink-0 transition-all duration-300 active:scale-95 hover:scale-105 rounded-xl shadow-2xs"
        title="Notificações"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse px-1 shadow-xs">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-40 bg-transparent"
              onClick={() => setIsOpen(false)}
            />

            <div
              style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
              className="fixed z-50 w-[340px] sm:w-[380px] rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 transition-all animate-in fade-in zoom-in-95 duration-200"
            >
              {/* HEADER */}
              <div className="p-4 pb-2 flex items-center justify-between">
                <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Notificações
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Fechar"
                >
                  <RotateCw size={14} />
                </button>
              </div>

              {/* TABS DE FILTRO */}
              <div className="px-4 pb-3 flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("ALL")}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeTab === "ALL"
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    Todas
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-md bg-white dark:bg-slate-900 text-[10px] font-bold shadow-xs text-slate-600 dark:text-slate-400">
                      {notifications.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("SYSTEM")}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeTab === "SYSTEM"
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    Tarefas
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("PRESENCE")}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeTab === "PRESENCE"
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    Presença
                  </button>
                </div>

                {unreadCount >= 1 && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium shrink-0">
                    {`${unreadCount} não lida${unreadCount > 1 ? "s" : ""}`}
                  </span>
                )}
              </div>

              {/* LISTA DE NOTIFICAÇÕES */}
              <div className="max-h-[360px] overflow-y-auto px-2 space-y-2.5 pb-3 scrollbar-thin">
                {filteredNotifications.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 dark:text-slate-500">
                    <Bell size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-medium">
                      Nenhuma notificação encontrada.
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((item) => {
                    const isPresence =
                      item.type === "CONNECTION" || !!item.user;
                    const details =
                      eventDetails[item?.type] || eventDetails.CONNECTION;
                    const avatarUrl = getAvatarUrl(item.user?.avatar);

                    return (
                      <div
                        key={item?.id}
                        onClick={() => markAsRead(item?.id)}
                        className={`group relative p-3.5 rounded-2xl border transition cursor-pointer ${
                          item?.read
                            ? "border-slate-100 dark:border-slate-800/40 bg-slate-50/30 dark:bg-slate-900/40 opacity-60 hover:opacity-100"
                            : "border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/60 shadow-2xs hover:bg-slate-100/90 dark:hover:bg-slate-800/90"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* ÍCONE DINÂMICO */}
                          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-xs shrink-0 mt-0.5">
                            {isPresence ? (
                              item.user?.connected ? (
                                <Wifi size={15} className="text-emerald-500" />
                              ) : (
                                <WifiOff size={15} className="text-rose-500" />
                              )
                            ) : (
                              details.icon
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              {/* TÍTULO (NOME DO USUÁRIO OU TÍTULO DA TAREFA) */}
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug truncate">
                                  {isPresence
                                    ? item.user?.name || "Utilizador"
                                    : item.task?.title}
                                </h4>
                                {avatarUrl && (
                                  <Avatar
                                    // title={user.name}
                                    className="w-6 h-6"
                                  >
                                    <AvatarImage
                                      src={avatarUrl!}
                                      //  alt={user.name}
                                    />
                                    <AvatarFallback>
                                      {userInitials}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                              {/* INDICADOR DE LIDA */}
                              {item?.read ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/40 shrink-0">
                                  <CheckCheck size={10} />
                                  Lida
                                </span>
                              ) : (
                                <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 animate-pulse" />
                              )}
                            </div>

                            {/* DESCRIÇÃO DA NOTIFICAÇÃO */}
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                              {isPresence ? (
                                item.user?.connected ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    Entrou
                                  </span>
                                ) : (
                                  <span className="text-rose-500 font-medium">
                                    Desconectou-se
                                  </span>
                                )
                              ) : (
                                <>
                                  {details.label}{" "}
                                  {item?.type === "STATUS_CHANGED" && (
                                    <span className="font-semibold text-indigo-500">
                                      {item?.task?.status}
                                    </span>
                                  )}
                                </>
                              )}
                            </p>

                            {/* RODAPÉ DO CARD */}
                            <div className="flex items-center justify-between gap-2 mt-2">
                              {isPresence ? (
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                    item.user?.connected
                                      ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50"
                                      : "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50"
                                  }`}
                                >
                                  {item.user?.connected ? "ONLINE" : "OFFLINE"}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-sky-800/50">
                                  {item.task?.code}
                                </span>
                              )}

                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                <Clock size={10} />
                                {formatNotificationDate(item?.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* REMOVER NOTIFICAÇÃO */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(item?.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                              title="Remover notificação"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* FOOTER */}
              {notifications.length > 0 && (
                <div className="p-3 px-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 underline decoration-slate-300 dark:decoration-slate-700 underline-offset-4 transition cursor-pointer"
                  >
                    Limpar todas
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
