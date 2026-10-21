import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-[#070714] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Luzes de fundo/Gradients para combinar com a tela escura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-900/15 rounded-full blur-3xl pointer-events-none" />

      {/* Container Principal */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto">
        {/* Logo Kanbam */}
        <div className="mb-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 mb-3 border border-purple-400/20">
            {/* Ícone representando as barras do Kanban / Kanbam */}
            <div className="flex gap-1.5 items-end h-8">
              <span className="w-2 h-5 bg-white rounded-full"></span>
              <span className="w-2 h-8 bg-white rounded-full"></span>
              <span className="w-2 h-6 bg-white rounded-full"></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Kanbam
            </h1>
            <span className="bg-purple-900/80 text-purple-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-purple-500/30">
              PRO
            </span>
          </div>
          <p className="text-xs text-purple-300/70 mt-1">
            Kanban, Workflows & Metrics Engine
          </p>
        </div>

        {/* Indicador de Erro 404 */}
        <div className="my-4 relative">
          <span className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 tracking-wider select-none">
            404
          </span>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
        </div>

        {/* Título e Descrição */}
        <h2 className="text-xl font-semibold text-gray-100 mt-2 mb-2">
          Página não encontrada
        </h2>
        <p className="text-sm text-gray-400 mb-8 max-w-xs leading-relaxed">
          A página que você está procurando foi movida, excluída ou não existe
          no fluxo do seu quadro.
        </p>

        {/* Botão para Navegar para a Home ("/") */}
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-medium text-sm rounded-xl transition-all duration-200 shadow-lg shadow-purple-700/30 border border-purple-500/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Home className="w-4 h-4" />
          <span>Voltar para o Início</span>
        </Link>
      </div>

      {/* Footer discreto no estilo da aplicação */}
      <footer className="absolute bottom-6 text-xs text-gray-600 flex items-center gap-4">
        <span>Kanban Board</span>
        <span>•</span>
        <span>Workflows</span>
        <span>•</span>
        <span>Metrics</span>
      </footer>
    </div>
  );
}
