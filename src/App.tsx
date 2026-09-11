import { toast, Toaster } from "sonner";
import KanbanBoard from "./components/kanbam/KanbanBoard";
import { TabsViews } from "./components/commons/tasbs-views";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  // ChevronLeft,
  ChevronRight,
  Eraser,
  Moon,
  Plus,
  Search,
  SlidersHorizontal,
  Sun,
} from "lucide-react";
import { useTasks } from "./hooks/useTasks";
import { TaskModal } from "./components/kanbam/TaskModal";
import { useTaskModalStore } from "./store/useTaskModalStore";
import { TableTask } from "./components/kanbam/TaskTable";
import { TaskFlow } from "./components/flow/TaskFlow";
import { useFlowStore } from "./components/flow/store/useFlowStore";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/ui/resizable";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useTaskStore } from "./store/useTaskStore";
import { cn } from "cn";
import { Button } from "./components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectLabel,
//   SelectTrigger,
//   SelectValue,
// } from "./components/ui/select";
import type { TaskStatus } from "./types/task";
import { STATUS_CONFIG } from "./components/kanbam/utils/border-color";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { DateTasksWithRange } from "./components/commons/DateTasksWithRange";
import type { DateRange } from "react-day-picker";
import { endOfDay, isAfter, isBefore, parseISO, startOfDay } from "date-fns";

// type optionsView = "kanban" | "Workflows" | string;

export default function App() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isBandejaAberta, setIsBandejaAberta] = useState<boolean>(false);
  const [searchTasksLocal, setSearchTasksLocal] = useState<string>("");
  // const [selectedView, setSelectedView] = useState<optionsView>(() => {
  //   return localStorage.getItem("view-mode") || "kanban";
  // });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("app-theme") === "dark";
  });

  const { removeTasksLocal } = useTaskStore();
  const { setSelectedTaskId, selectedTaskId } = useFlowStore();
  const { isOpen, mode, task, openModal, closeModal } = useTaskModalStore();
  const {
    tasks: dataTasks,
    users,
    selectedStatus,
    selectedView,
    // search,
    setStatus,
    // setSearch,
    setCurrentPage,
    setSelectedView,
    fetchUsers,
    fetchTasks,
    fetchTasksPaged,
    fetchTasksHistories,
  } = useTasks();
  useEffect(() => {
    // Conecta ao endpoint /ws configurado no Spring Boot
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      onConnect: () => {
        // Escuta as notificações de arquivamento
        client.subscribe("/topic/tasks-archived", (message) => {
          // 🎯 Log da mensagem completa do STOMP
          console.log("Mensagem WS recebida:", message);
          const archivedTaskIds: string[] = JSON.parse(message.body);
          toast.success(`Tarefa foi arquivada: [ID: ${archivedTaskIds}]`);
          console.log("IDs das tarefas arquivadas:", archivedTaskIds);
          removeTasksLocal(archivedTaskIds);
          // );
        });
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    let isMounted = true;

    if (selectedTaskId) {
      fetchTasksHistories(selectedTaskId).then(() => {
        if (!isMounted) return;
      });
    }

    return () => {
      isMounted = false; // Cancela atualizações de requisições antigas
    };
  }, [selectedTaskId, fetchTasksHistories]);

  // 1. Carrega as tarefas vindas do backend Spring Boot na montagem
  useEffect(() => {
    if (selectedView === "Workflows") {
      fetchTasksPaged();
    } else {
      fetchTasks();
    }
  }, [fetchTasks, fetchTasksPaged]);

  useEffect(() => {
    localStorage.setItem("view-mode", selectedView);
    if (selectedView !== "Workflows") {
      setSelectedTaskId(null);
      setStatus(null);
    }
  }, [selectedView]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const nextTheme = !prev;
      localStorage.setItem("app-theme", nextTheme ? "dark" : "light");
      return nextTheme;
    });
  };

  const totalFiltrosAtivos = useMemo(() => {
    let count = 0;
    if (searchTasksLocal?.trim() !== "") count++;
    if (selectedStatus !== null) count++;
    if (dateRange?.from) count++;
    return count;
  }, [searchTasksLocal, selectedStatus, dateRange]);

  const limparFiltros = () => {
    setSearchTasksLocal("");
    setStatus(null);
    setCurrentPage(0);
    setDateRange(undefined);
  };
  const tasks = Array.isArray(dataTasks) ? dataTasks : [];

  const filtrados = useMemo(() => {
    const q = searchTasksLocal.trim().toLowerCase();
    return tasks.filter((a) => {
      if (selectedStatus && a.status !== selectedStatus) return false;

      if (dateRange?.from && a.createdAt) {
        const dataCriacao = parseISO(a.createdAt);
        const inicio = startOfDay(dateRange.from);
        const fim = dateRange.to
          ? endOfDay(dateRange.to)
          : endOfDay(dateRange.from);

        if (isBefore(dataCriacao, inicio) || isAfter(dataCriacao, fim)) {
          return false;
        }
      }

      if (!q) return true;

      return [a.assignee, a.status, a.code, a.title, a.description, a.reporter]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [tasks, searchTasksLocal, selectedStatus, dateRange]);

  function onHandleSelectStatus(value: string | null) {
    // Se for "ALL" ou string vazia, define como null para buscar todos os status
    const newStatus =
      value && value !== "Todos os Status" ? (value as TaskStatus) : null;
    setStatus(newStatus);
    setCurrentPage(0);
  }

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col ">
        <Toaster position="top-center" richColors />
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <TabsViews value={selectedView} onSelect={setSelectedView} />
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={
                isDarkMode
                  ? "Alternar para Modo Claro"
                  : "Alternar para Modo Escuro"
              }
            >
              {isDarkMode ? (
                <Sun size={18} className="text-amber-400" />
              ) : (
                <Moon size={18} className="hover:text-black" />
              )}
            </button>

            <>
              {/* BANDEJA COM O BOTÃO DENTRO DO MESMO CONTAINER (COM ÍCONES NO MOBILE) */}
              <div className="flex items-center justify-end shrink-0 w-full sm:w-auto min-h-[36px]">
                <div
                  className={cn(
                    "flex items-center p-1 rounded-2xl h-10 sm:h-11 border bg-card/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm overflow-hidden w-full sm:w-auto justify-between sm:justify-end",
                    "border-slate-200/80 dark:border-slate-800",
                    "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    isBandejaAberta ? "gap-1.5 sm:gap-4" : "gap-0",
                  )}
                >
                  {/* CAMPOS EXPANSÍVEIS INTERNOS */}
                  <div
                    className={cn(
                      "flex items-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      isBandejaAberta
                        ? "max-w-[calc(100vw-80px)] sm:max-w-[750px] opacity-100 pr-1 sm:pr-2 pointer-events-auto"
                        : "max-w-0 opacity-0 pr-0 pointer-events-none",
                    )}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2.5 pl-0.5 py-0.5 w-full">
                      {/* 1. Busca Global (Texto/Placeholder responsivo) */}
                      <div className="relative flex-1 min-w-[120px] sm:min-w-[200px] md:min-w-[240px]">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                          type="search"
                          value={searchTasksLocal || ""}
                          onChange={(e) => {
                            setSearchTasksLocal(e.target.value);
                            setCurrentPage(0);
                          }}
                          placeholder="Buscar..."
                          className="h-8 sm:h-8.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pl-8 pr-2 text-xs outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-700 shadow-xs"
                        />
                      </div>

                      {/* 2. Select Tipo (Ajustado para mobile) */}

                      <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                        <Select
                          value={selectedStatus || "Todos os Status"}
                          onValueChange={onHandleSelectStatus}
                        >
                          <SelectTrigger className="w-full sm:w-36 h-9 sm:h-8.5 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs shadow-xs cursor-pointer">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>

                          <SelectContent className="rounded-xl mt-12.5">
                            <SelectGroup>
                              <SelectLabel className="text-[11px] text-muted-foreground">
                                Filtro de Status
                              </SelectLabel>

                              {/* Opção para resetar o filtro */}
                              <SelectItem
                                className="cursor-pointer text-xs font-medium rounded-lg"
                                value="Todos os Status"
                              >
                                Todos os Status
                              </SelectItem>

                              {Object.entries(STATUS_CONFIG).map(
                                ([key, config]) => (
                                  <SelectItem
                                    className="cursor-pointer text-xs font-medium rounded-lg"
                                    key={key}
                                    value={key}
                                  >
                                    {config.label}
                                  </SelectItem>
                                ),
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      {/* 3. DatePicker */}
                      <div className="shrink-0">
                        <DateTasksWithRange
                          date={dateRange}
                          setDate={setDateRange}
                        />
                      </div>

                      {/* 4. Limpar Filtros (Apenas ícone no mobile) */}
                      {totalFiltrosAtivos > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={limparFiltros}
                          title="Limpar Filtros"
                          className="h-8 sm:h-8.5 px-2 sm:px-2.5 gap-1.5 rounded-xl text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
                        >
                          <Eraser className="size-3.5" />
                          <span className="hidden sm:inline">Limpar</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* BOTÃO FIXO (Apenas ícone + badge no mobile, texto completo em telas maiores) */}
                  <Button
                    variant="ghost"
                    onClick={() => setIsBandejaAberta((prev) => !prev)}
                    title="Filtros"
                    className={cn(
                      "h-8 sm:h-8.5 px-2.5 sm:px-3.5 gap-1.5 sm:gap-2 rounded-xl text-xs font-bold cursor-pointer shrink-0 transition-all duration-300 active:scale-95 ml-auto whitespace-nowrap",
                      isBandejaAberta
                        ? "bg-slate-900 text-slate-100 dark:bg-slate-800 dark:text-slate-100"
                        : "hover:bg-transparent dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300",
                    )}
                  >
                    <SlidersHorizontal className="size-3.5 opacity-80" />
                    {/* Texto oculta no mobile */}
                    <span className="hidden sm:inline">Filtros</span>
                    <ChevronRight
                      className={cn(
                        "size-3.5 opacity-60 transition-transform duration-500",
                        isBandejaAberta ? "rotate-180" : "rotate-0",
                      )}
                    />
                    {totalFiltrosAtivos > 0 && (
                      <span className="flex h-3.5 sm:h-4 min-w-[14px] sm:min-w-[16px] items-center justify-center rounded-full bg-emerald-500 text-white text-[9px] sm:text-[10px] font-bold px-1">
                        {totalFiltrosAtivos}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </>
          </div>
          <button
            type="button"
            onClick={() => openModal("create")}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 text-sm rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus size={16} /> Nova Tarefa
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          {selectedView === "kanban" && <KanbanBoard tasks={filtrados} />}
          {selectedView === "Workflows" && (
            <ResizablePanelGroup
              key={selectedTaskId ? "split-mode" : "full-mode"}
              orientation="horizontal"
              className="min-h-[200px] w-full rounded-lg border"
            >
              <ResizablePanel
                defaultSize={selectedTaskId ? 30 : 100}
                minSize={500}
              >
                <TableTask data={filtrados} />
              </ResizablePanel>
              {selectedTaskId && (
                <>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize="70%">
                    <TaskFlow
                      data={tasks.find((t) => t.id === selectedTaskId)}
                    />
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          )}
        </div>
      </div>

      {/* Modal para Criação/Edição/Visualização */}
      <TaskModal
        isOpen={isOpen}
        mode={mode}
        users={users}
        task={task}
        onClose={closeModal}
      />
    </div>
  );
}
