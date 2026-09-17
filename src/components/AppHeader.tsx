import {
  ChevronRight,
  Eraser,
  LayoutGridIcon,
  Moon,
  PackagePlus,
  Search,
  Sun,
} from "lucide-react";
import { TabsViews } from "./commons/tasbs-views";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { STATUS_CONFIG } from "./kanbam/utils/task-status.config";
import { DateTasksWithRange } from "./commons/DateTasksWithRange";
import { Button } from "./ui/button";
import { NotificationMenu } from "./commons/NotificationMenu";
import type { TaskStatus } from "@/types/task";
import { useMemo, useRef, useState } from "react";
import { useTaskModalStore } from "@/store/useTaskModalStore";
import { useTasks } from "@/hooks/useTasks";

interface AppHeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export function AppHeader({ isDarkMode, toggleTheme }: AppHeaderProps) {
  const { openModal } = useTaskModalStore();
  const {
    selectedStatus,
    selectedView,
    search,
    dateRange,
    setStatus,
    setSearch,
    setDateRange,
    setCurrentPage,
    setSelectedView,
  } = useTasks();

  const [isBandejaAberta, setIsBandejaAberta] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Redireciona o scroll vertical da roda do mouse para scroll horizontal
  const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    if (e.deltaY !== 0) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  function onHandleSelectStatus(value: string | null) {
    const newStatus =
      value && value !== "Todos os Status" ? (value as TaskStatus) : null;
    setStatus(newStatus);
    setCurrentPage(0);
  }

  const totalFiltrosAtivos = useMemo(() => {
    let count = 0;
    if (search?.trim() !== "") count++;
    if (selectedStatus !== null) count++;
    if (dateRange?.from) count++;
    return count;
  }, [search, selectedStatus, dateRange]);

  const limparFiltros = () => {
    setSearch("");
    setStatus(null);
    setCurrentPage(0);
    setDateRange(undefined);
  };

  return (
    <header className="relative w-full p-3 sm:p-5">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
        {/* CONTAINER DA BANDEJA */}
        <div
          // onMouseEnter={() => setIsBandejaAberta(true)}
          // onMouseLeave={() => setIsBandejaAberta(false)}
          className="flex items-center justify-between shrink-0 w-auto min-h-[40px]"
        >
          <div
            className={cn(
              "flex items-center p-1 rounded-2xl border bg-card/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm overflow-hidden w-full sm:w-auto justify-between",
              "border-slate-200/80 dark:border-slate-800",
              "transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
              isBandejaAberta
                ? "gap-1.5 sm:gap-4 h-auto sm:h-11"
                : "gap-0 h-10 sm:h-11",
            )}
          >
            {/* CAMPOS EXPANSÍVEIS INTERNOS */}
            <div
              className={cn(
                "flex items-center transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                isBandejaAberta
                  ? "max-w-[calc(90vw-205px)] sm:max-w-[1250px] opacity-100 pr-1 sm:pr-2 pointer-events-auto"
                  : "max-w-0 opacity-0 pr-0 pointer-events-none",
              )}
            >
              <div
                ref={scrollContainerRef}
                onWheel={handleWheelScroll}
                className="flex items-center gap-1.5 sm:gap-2.5 pl-0.5 py-0.5 w-full overflow-x-auto custom-scrollbar-horizontal scroll-smooth"
              >
                <TabsViews value={selectedView} onSelect={setSelectedView} />

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
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

                <button
                  type="button"
                  onClick={() => openModal("create")}
                  title="Crie uma nova tarefa"
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                >
                  <PackagePlus size={18} />
                </button>

                {/* 1. Busca Global */}
                <div className="relative flex-1 min-w-[110px] sm:min-w-[200px] md:min-w-[240px]">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={search || ""}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(0);
                    }}
                    placeholder="Buscar..."
                    className="h-8 sm:h-8.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pl-8 pr-2 text-xs outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-700 shadow-xs"
                  />
                </div>

                {/* 2. Select Status */}
                <div className="flex items-center gap-3 shrink-0">
                  <Select
                    value={selectedStatus || "Todos os Status"}
                    onValueChange={onHandleSelectStatus}
                  >
                    <SelectTrigger className="w-28 sm:w-36 h-8 sm:h-8.5 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs shadow-xs cursor-pointer">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>

                    <SelectContent className="rounded-xl mt-12.5">
                      <SelectGroup>
                        <SelectLabel className="text-[11px] text-muted-foreground">
                          Filtro de Status
                        </SelectLabel>

                        <SelectItem
                          className="cursor-pointer text-xs font-medium rounded-lg"
                          value="Todos os Status"
                        >
                          Todos os Status
                        </SelectItem>

                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <SelectItem
                            className="cursor-pointer text-xs font-medium rounded-lg"
                            key={key}
                            value={key}
                          >
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* 3. DatePicker */}
                <div className="shrink-0">
                  <DateTasksWithRange date={dateRange} setDate={setDateRange} />
                </div>

                {/* 4. Limpar Filtros */}
                {totalFiltrosAtivos > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={limparFiltros}
                    title="Limpar Filtros"
                    className="h-8 sm:h-8.5 px-2 sm:px-2.5 gap-1.5 rounded-xl text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
                  >
                    <Eraser className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>

            <img
              src="/logotipo-kanban.svg"
              alt="Logo Kanbam"
              className="h-10 sm:h-12 w-auto object-contain"
            />

            {/* BOTÃO FIXO DA BANDEJA */}
            <Button
              variant="ghost"
              onClick={() => setIsBandejaAberta((prev) => !prev)}
              title="Filtros"
              className={cn(
                "h-8 sm:h-8.5 px-2.5 sm:px-3.5 gap-1.5 sm:gap-2 rounded-xl text-xs font-bold cursor-pointer shrink-0 transition-all duration-300 active:scale-95 hover:scale-110 ml-auto whitespace-nowrap",
                isBandejaAberta
                  ? "bg-slate-900 text-violet-400 hover:text-violet-900 dark:bg-slate-800 dark:text-violet-400 dark:hover:text-violet-400"
                  : "hover:bg-transparent dark:hover:bg-slate-800/60 text-slate-700 hover:text-violet-900 dark:text-violet-400 dark:hover:text-violet-400",
              )}
            >
              <LayoutGridIcon
                className={cn(
                  "size-4.5 opacity-60 transition-transform ",
                  isBandejaAberta
                    ? "rotate-[360deg] duration-[2000ms]"
                    : "rotate-0 duration-[2000ms]",
                )}
              />
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
            {/* NOTIFICAÇÃO FIXADA NO CANTO DIREITO (NO MOBILE E DESKTOP) */}
            <div className="right-3 top-3 sm:top-4 sm:-translate-y-0 flex items-center z-100">
              <NotificationMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
