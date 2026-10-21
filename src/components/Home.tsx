// import {KanbanBoard} from "./kanbam/KanbanBoard";
// import { useEffect, useMemo, useState } from "react";
// import { useTasks } from "../hooks/useTasks";
// import { TaskModal } from "./kanbam/TaskModal";
// import { useTaskModalStore } from "../store/useTaskModalStore";
// import { TaskFlow } from "./flow/TaskFlow";
// import { useFlowStore } from "./flow/store/useFlowStore";
// import { endOfDay, isAfter, isBefore, parseISO, startOfDay } from "date-fns";
// import { AppHeader } from "./AppHeader";
// import { AnimatePresence } from "framer-motion";
// import { SplashScreen } from "./commons/SplashScreen";
// import { useAuth } from "@/hooks/useAuth";
// import { useAuthStore } from "@/store/useAuthStore";
// import { TaskSidebarList } from "./TaskSidebarList";
// import { PanelLeft } from "lucide-react";
// import { useBackgroundStore } from "@/store/useBackgroundStore";

// export function Home() {
//   const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
//     return localStorage.getItem("app-theme") === "dark";
//   });
//   const [showSplash, setShowSplash] = useState<boolean>(() => {
//     return !sessionStorage.getItem("has-seen-splash");
//   });

//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

//   const toggleTheme = () => {
//     setIsDarkMode((prev) => {
//       const nextTheme = !prev;
//       localStorage.setItem("app-theme", nextTheme ? "dark" : "light");
//       return nextTheme;
//     });
//   };

//   const { bgImage } = useBackgroundStore();
//   const { setSelectedTaskId, selectedTaskId } = useFlowStore();
//   const { isOpen, mode, task, closeModal } = useTaskModalStore();
//   const { users, fetchUsers, fetchRoles } = useAuth();
//   const { user } = useAuthStore();

//   const {
//     tasks: dataTasks,
//     // pageData,
//     selectedStatus,
//     selectedView,
//     search,
//     dateRange,
//     setStatus,
//     fetchTasksHistories,
//   } = useTasks();

//   useEffect(() => {
//     fetchUsers();
//     fetchRoles();
//   }, [fetchUsers, fetchRoles]);

//   useEffect(() => {
//     let isMounted = true;

//     if (selectedTaskId) {
//       fetchTasksHistories(selectedTaskId).then(() => {
//         if (!isMounted) return;
//       });
//     }

//     return () => {
//       isMounted = false; // Cancela atualizações de requisições antigas
//     };
//   }, [selectedTaskId, fetchTasksHistories]);

//   useEffect(() => {
//     localStorage.setItem("view-mode", selectedView);
//     if (selectedView !== "Workflows") {
//       setSelectedTaskId(null);
//       setStatus(null);
//     }
//   }, [selectedView, setSelectedTaskId, setStatus]);

//   useEffect(() => {
//     const root = document.documentElement;
//     if (isDarkMode) {
//       root.classList.add("dark");
//     } else {
//       root.classList.remove("dark");
//     }
//   }, [isDarkMode]);

//   const handleFinishSplash = () => {
//     // Marca na sessão que a splash já foi vista antes de escondê-la
//     sessionStorage.setItem("has-seen-splash", "true");
//     setShowSplash(false);
//   };

//   const tasks = useMemo(
//     () => (Array.isArray(dataTasks) ? dataTasks : []),
//     [dataTasks],
//   );

//   const filtrados = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return tasks.filter((a) => {
//       if (selectedStatus && a.status !== selectedStatus) return false;

//       if (dateRange?.from && a.createdAt) {
//         const dataCriacao = parseISO(a.createdAt);
//         const inicio = startOfDay(dateRange.from);
//         const fim = dateRange.to
//           ? endOfDay(dateRange.to)
//           : endOfDay(dateRange.from);

//         if (isBefore(dataCriacao, inicio) || isAfter(dataCriacao, fim)) {
//           return false;
//         }
//       }

//       if (!q) return true;

//       // Resolve os nomes de assignee e reporter através do array users
//       const assigneeName = users.find((u) => u.id === a.userId)?.name;
//       const reporterName = users.find((u) => u.id === a.reporterId)?.name;

//       return [
//         assigneeName,
//         a.status,
//         a.code,
//         a.title,
//         a.description,
//         reporterName,
//       ]
//         .filter(Boolean)
//         .join(" ")
//         .toLowerCase()
//         .includes(q);
//     });
//   }, [tasks, search, selectedStatus, dateRange]);

//   // Normaliza o selectedView para evitar falhas por maiúsculas/minúsculas
//   const isKanbanActive = selectedView?.toLowerCase() === "kanban";
//   const isFlowActive = selectedView?.toLowerCase() === "flow";

//   // Aplica o plano de fundo se houver imagem e estiver no Kanban ou Flow
//   const showBackground = (isKanbanActive || isFlowActive) && Boolean(bgImage);

//   return (
//     <>
//       <AnimatePresence mode="wait">
//         {showSplash && (
//           <SplashScreen key="splash-screen" onFinish={handleFinishSplash} />
//         )}
//       </AnimatePresence>
//       <section className={isDarkMode ? "dark" : ""}>
//         {/* <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col gap-3"> */}
//         <div
//           className={`h-screen overflow-hidden flex flex-col font-sans antialiased text-slate-800 dark:text-slate-100 transition-colors duration-300 ${
//             showBackground
//               ? "bg-cover bg-center bg-no-repeat bg-transparent"
//               : "bg-slate-50 dark:bg-slate-950"
//           }`}
//           style={
//             showBackground
//               ? { backgroundImage: `url("${bgImage}")` }
//               : undefined
//           }
//         >
//           <div className="absolute top-0 left-0 w-full z-50">
//             <div className="pointer-events-auto">
//               <AppHeader
//                 user={user!}
//                 isDarkMode={isDarkMode}
//                 toggleTheme={toggleTheme}
//               />
//             </div>
//           </div>
//           <main className="flex-1 min-h-0 overflow-hidden">
//             {selectedView === "kanban" && <KanbanBoard tasks={filtrados} />}
//             {selectedView === "flow" && (
//               <div className="absolute w-screen h-screen inset-0  overflow-hidden flex-1 min-h-0 flex flex-col bg-transparent">
//                 {/* 1. Canvas do React Flow Ocupando a Tela inteira em segundo plano */}
//                 <div className="w-full h-full">
//                   <TaskFlow
//                     data={tasks.find((t) => t.id === selectedTaskId)}
//                     isDarkMode={isDarkMode}
//                   />
//                 </div>

//                 {/* 2. Drawer / Bottom Sheet Retrátil na Parte Inferior */}
//                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-350 transition-all duration-300 ease-in-out">
//                   {isSidebarCollapsed ? (
//                     /* Botão / Pílula Flutuante para Reabrir quando Recolhido */
//                     <div className="flex justify-center">
//                       <button
//                         type="button"
//                         onClick={() => setIsSidebarCollapsed(false)}
//                         className="p-3 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-full shadow-2xl text-slate-700 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 hover:scale-105 transition-all flex items-center gap-2.5 text-xs font-bold cursor-pointer"
//                       >
//                         <PanelLeft
//                           size={18}
//                           className="text-violet-600 dark:text-violet-400 rotate-90"
//                         />
//                         <span>Abrir Painel de Tarefas</span>
//                         <span className="text-[10px] bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full font-extrabold">
//                           {filtrados.length}
//                         </span>
//                       </button>
//                     </div>
//                   ) : (
//                     /* Container do Bottom Sheet */
//                     <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all flex flex-col max-h-[320px]">
//                       <TaskSidebarList
//                         data={filtrados}
//                         // isCollapsed={isSidebarCollapsed}
//                         onToggleCollapse={() => setIsSidebarCollapsed(true)}
//                       />
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </main>
//         </div>

//         <TaskModal
//           isOpen={isOpen}
//           mode={mode}
//           users={users}
//           task={task}
//           onClose={closeModal}
//         />
//       </section>
//     </>
//   );
// }


import { KanbanBoard } from "./kanbam/KanbanBoard";
import { useEffect, useMemo, useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { TaskModal } from "./kanbam/TaskModal";
import { useTaskModalStore } from "../store/useTaskModalStore";
import { TaskFlow } from "./flow/TaskFlow";
import { useFlowStore } from "./flow/store/useFlowStore";
import { endOfDay, isAfter, isBefore, parseISO, startOfDay } from "date-fns";
import { AppHeader } from "./AppHeader";
import { AnimatePresence } from "framer-motion";
import { SplashScreen } from "./commons/SplashScreen";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/useAuthStore";
import { TaskSidebarList } from "./TaskSidebarList";
import { PanelLeft } from "lucide-react";
import { useBackgroundStore } from "@/store/useBackgroundStore";

export function Home() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("app-theme") === "dark";
  });
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return !sessionStorage.getItem("has-seen-splash");
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const nextTheme = !prev;
      localStorage.setItem("app-theme", nextTheme ? "dark" : "light");
      return nextTheme;
    });
  };

  const { bgImage } = useBackgroundStore();
  const { setSelectedTaskId, selectedTaskId } = useFlowStore();
  const { isOpen, mode, task, closeModal } = useTaskModalStore();
  const { users, fetchUsers, fetchRoles } = useAuth();
  const { user } = useAuthStore();

  const {
    tasks: dataTasks,
    // pageData,
    selectedStatus,
    selectedView,
    search,
    dateRange,
    setStatus,
    fetchTasksHistories,
  } = useTasks();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

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

  useEffect(() => {
    localStorage.setItem("view-mode", selectedView);
    if (selectedView !== "Workflows") {
      setSelectedTaskId(null);
      setStatus(null);
    }
  }, [selectedView, setSelectedTaskId, setStatus]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleFinishSplash = () => {
    // Marca na sessão que a splash já foi vista antes de escondê-la
    sessionStorage.setItem("has-seen-splash", "true");
    setShowSplash(false);
  };

  const tasks = useMemo(
    () => (Array.isArray(dataTasks) ? dataTasks : []),
    [dataTasks],
  );

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();
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

      // Resolve os nomes de assignee e reporter através do array users
      const assigneeName = users.find((u) => u.id === a.userId)?.name;
      const reporterName = users.find((u) => u.id === a.reporterId)?.name;

      return [
        assigneeName,
        a.status,
        a.code,
        a.title,
        a.description,
        reporterName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [tasks, search, selectedStatus, dateRange]);

  // Normaliza o selectedView para evitar falhas por maiúsculas/minúsculas
  const isKanbanActive = selectedView?.toLowerCase() === "kanban";
  const isFlowActive = selectedView?.toLowerCase() === "flow";

  // Aplica o plano de fundo se houver imagem e estiver no Kanban ou Flow
  const showBackground = (isKanbanActive || isFlowActive) && Boolean(bgImage);

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen key="splash-screen" onFinish={handleFinishSplash} />
        )}
      </AnimatePresence>
      <section className={isDarkMode ? "dark" : ""}>
        <div
          className={`fixed inset-0 w-full h-dvh max-h-dvh overflow-hidden flex flex-col font-sans antialiased text-slate-800 dark:text-slate-100 transition-colors duration-300 ${
            showBackground
              ? "bg-cover bg-center bg-no-repeat bg-transparent"
              : "bg-slate-50 dark:bg-slate-950"
          }`}
          style={
            showBackground
              ? { backgroundImage: `url("${bgImage}")` }
              : undefined
          }
        >
          {/* 1. AppHeader FIXO e FLUTUANTE no topo absoluto do Viewport */}
          <div className="fixed top-0 left-0 right-0 w-full z-50 pointer-events-auto">
            <AppHeader
              user={user!}
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
            />
          </div>

          <main className="flex-1 w-full h-full relative overflow-hidden">
            {selectedView === "kanban" && (
              <div className="w-full h-full pt-16 sm:pt-20">
                <KanbanBoard tasks={filtrados} />
              </div>
            )}

            {selectedView === "flow" && (
              <div className="relative w-full h-full overflow-hidden flex flex-col bg-transparent">
                {/* Canvas do React Flow Ocupando a Tela inteira em segundo plano */}
                <div className="w-full h-full">
                  <TaskFlow
                    data={tasks.find((t) => t.id === selectedTaskId)}
                    isDarkMode={isDarkMode}
                  />
                </div>

                {/* 2. Drawer / Bottom Sheet Retrátil FIXO na Parte Inferior com margem de segurança para Mobile */}
                <div className="fixed bottom-6 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] sm:w-[95%] max-w-3xl transition-all duration-300 ease-in-out pointer-events-auto">
                  {isSidebarCollapsed ? (
                    /* Botão / Pílula Flutuante para Reabrir quando Recolhido */
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => setIsSidebarCollapsed(false)}
                        className="px-4 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-full shadow-2xl text-slate-700 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 active:scale-95 hover:scale-105 transition-all flex items-center gap-2.5 text-xs font-bold cursor-pointer"
                      >
                        <PanelLeft
                          size={18}
                          className="text-violet-600 dark:text-violet-400 rotate-90"
                        />
                        <span>Abrir Painel de Tarefas</span>
                        <span className="text-[10px] bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full font-extrabold">
                          {filtrados.length}
                        </span>
                      </button>
                    </div>
                  ) : (
                    /* Container do Bottom Sheet */
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden transition-all flex flex-col max-h-[45vh] sm:max-h-[320px]">
                      <TaskSidebarList
                        data={filtrados}
                        // isCollapsed={isSidebarCollapsed}
                        onToggleCollapse={() => setIsSidebarCollapsed(true)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>

        <TaskModal
          isOpen={isOpen}
          mode={mode}
          users={users}
          task={task}
          onClose={closeModal}
        />
      </section>
    </>
  );
}