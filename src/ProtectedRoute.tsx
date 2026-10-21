import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useAuth } from "./hooks/useAuth";
import { useEffect } from "react";

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  const { checkSession } = useAuth();

  useEffect(() => {
    checkSession();

    // Valida periodicamente a cada 15 segundos
    const interval = setInterval(() => {
      checkSession();
    }, 900000); // 15 minutos

    // Limpa o intervalo ao desmontar o componente
    return () => clearInterval(interval);
  }, [checkSession]);

  // 1. Enquanto valida o Cookie HttpOnly com o backend no F5, exibe o carregamento
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300">
        <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mb-3" />
        <span className="text-xs font-semibold tracking-wide">
          Validando sessão...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
