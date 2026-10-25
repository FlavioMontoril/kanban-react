import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans text-slate-800 dark:text-slate-100">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900/50">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Algo deu errado
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ocorreu uma falha inesperada na interface. Você pode tentar recarregar a aplicação.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-left text-xs text-slate-600 dark:text-slate-300 font-mono break-all max-h-28 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="pt-2">
              <Button
                onClick={this.handleReset}
                className="w-full gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs cursor-pointer shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                Recarregar Aplicação
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
