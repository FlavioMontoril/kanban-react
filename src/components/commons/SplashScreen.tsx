"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Workflow,
  BarChart3,
  ShieldCheck,
  Sparkles,
  Kanban,
} from "lucide-react";

const STEPS = [
  { label: "Carregando ambiente...", icon: Sparkles },
  { label: "Sincronizando quadros Kanban...", icon: Kanban },
  { label: "Mapeando nós de Workflow...", icon: Workflow },
  { label: "Consolidando métricas e relatórios...", icon: BarChart3 },
  { label: "Pronto para iniciar!", icon: ShieldCheck },
];

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  // Guarda a referência do callback para evitar problemas no setInterval
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    const startTime = performance.now();
    const duration = 5000; // 5 segundos cravados

    const timer = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const currentProgress = Math.min((elapsed / duration) * 100, 100);

      setProgress(currentProgress);

      // Atualiza os passos conforme a porcentagem
      if (currentProgress < 25) setCurrentStep(0);
      else if (currentProgress < 50) setCurrentStep(1);
      else if (currentProgress < 75) setCurrentStep(2);
      else if (currentProgress < 95) setCurrentStep(3);
      else setCurrentStep(4);

      if (currentProgress >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          onFinishRef.current();
        }, 200);
      }
    }, 30);

    return () => clearInterval(timer);
  }, []);

  const StepIcon = STEPS[currentStep].icon;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden selection:bg-none"
    >
      {/* Background Decorativo e Iluminação Gradiente */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 text-center space-y-8">
        {/* LOGO & BRANDING ANIMADO */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center space-y-3"
        >
          <div className="relative flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-500 shadow-2xl shadow-indigo-500/30">
            <Kanban className="w-10 h-10 text-white" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute inset-0 rounded-3xl border border-white/20 border-t-white/80"
            />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Kanbam{" "}
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              PRO
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Kanban, Workflows & Metrics Engine
          </p>
        </motion.div>

        {/* BARRA DE PROGRESSO & STATUS */}
        <div className="w-full space-y-3">
          <div className="relative w-full h-2 bg-slate-800/80 rounded-full overflow-hidden border border-slate-800">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 text-slate-300 font-medium"
              >
                <StepIcon className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span>{STEPS[currentStep].label}</span>
              </motion.div>
            </AnimatePresence>

            <span className="font-mono font-bold text-slate-400">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* RECURSOS EM DESTAQUE NA TRANSIÇÃO */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="grid grid-cols-3 gap-3 w-full pt-4 border-t border-slate-800/60 text-[10px] text-slate-400"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400">
              <Kanban className="w-3.5 h-3.5" />
            </span>
            <span>Kanban Board</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-purple-400">
              <Workflow className="w-3.5 h-3.5" />
            </span>
            <span>Workflows</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">
              <BarChart3 className="w-3.5 h-3.5" />
            </span>
            <span>Metrics</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
