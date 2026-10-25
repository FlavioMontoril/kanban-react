import { toast } from "sonner";
import { UserCheck, UserX, ArrowRight, X, Radio } from "lucide-react";
import type { UserPresenceDTO } from "@/types/user";

// 🔵 NOTIFICAÇÃO PARA USUÁRIOS LOGADOS
export function showAuthPresenceToast(presence: UserPresenceDTO) {
  const isConnected = presence?.connected;

  toast.custom((t) => (
    <div className="relative group flex items-center gap-3.5 w-full max-w-sm p-3.5 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] text-slate-100 transition-all duration-300 hover:border-white/20">
      {/* Container do Ícone com Indicador do Estado */}
      <div className="relative flex-shrink-0">
        <div
          className={`p-2.5 rounded-xl border backdrop-blur-md transition-colors ${
            isConnected
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          {isConnected ? (
            <UserCheck className="w-5 h-5" />
          ) : (
            <UserX className="w-5 h-5" />
          )}
        </div>
        {/* Ponto Indicador (Pulse animation) */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          {isConnected && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-3 w-3 ${
              isConnected ? "bg-emerald-500" : "bg-rose-500"
            }`}
          ></span>
        </span>
      </div>

      {/* Dados do Utilizador */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[10px] font-bold uppercase tracking-widest ${
              isConnected ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isConnected ? "Online" : "Offline"}
          </span>
        </div>
        <p className="text-sm font-semibold truncate text-slate-100 leading-snug">
          {presence?.name || "Utilizador Anónimo"}
        </p>
      </div>

      {/* Botão de Fechar Discreto */}
      <button
        onClick={() => toast.dismiss(t)}
        className="absolute top-2.5 right-2.5 p-1 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  ));
}

// 🟣 NOTIFICAÇÃO PARA USUÁRIOS DESLOGADOS (CONVIDADOS/VISITANTES)
export function showGuestPresenceToast(
  presence: UserPresenceDTO,
  onLoginClick: () => void
) {
  const isConnected = presence?.connected;

  toast.custom((t) => (
    <div className="relative group flex items-center justify-between gap-3 w-full max-w-md p-3.5 bg-gradient-to-r from-slate-950/90 to-indigo-950/40 backdrop-blur-2xl border border-indigo-500/20 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] text-slate-100">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="flex-shrink-0 p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl backdrop-blur-md">
          <Radio className="w-5 h-5 animate-pulse text-indigo-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
            Atividade em tempo real
          </p>
          <p className="text-sm font-medium truncate text-slate-200">
            Um membro acabou de{" "}
            <span
              className={
                isConnected
                  ? "text-emerald-400 font-semibold"
                  : "text-rose-400 font-semibold"
              }
            >
              {isConnected ? "entrar" : "sair"}
            </span>
          </p>
        </div>
      </div>

      {/* Ação de Login / Call to Action */}
      <button
        onClick={() => {
          toast.dismiss(t);
          onLoginClick();
        }}
        className="group/btn flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/40 whitespace-nowrap active:scale-95"
      >
        <span>Entrar</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
      </button>
    </div>
  ));
}