import { useRef, type ChangeEvent, type MouseEvent } from "react";
import { useBackgroundStore } from "@/store/useBackgroundStore";
import { toast } from "sonner";
import { ImageIcon, Upload, RotateCcw, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface BackgroundSelectorProps {
  /** Opção para estilização customizada do botão acionador (opcional) */
  triggerClassName?: string;
}

export function BackgroundSelector({
  triggerClassName,
}: BackgroundSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    bgImage,
    customOption,
    setBgImage,
    setCustomBgImage,
    removeCustomBgImage,
  } = useBackgroundStore();

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Formato inválido", {
          description: "Por favor, selecione um ficheiro de imagem válido.",
        });
        return;
      }
      setCustomBgImage(file);
      toast.success("Plano de fundo atualizado!");
    }
    e.target.value = "";
  };

  const handleRemoveCustomBg = (e: MouseEvent) => {
    e.stopPropagation();
    removeCustomBgImage();
    toast.success("Imagem removida com sucesso!");
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      <Popover>
        <PopoverTrigger>
          <button
            type="button"
            className={
              triggerClassName ||
              `flex items-center p-2 rounded-xl text-xs font-medium transition-all shadow-sm cursor-pointer ${
                bgImage
                  ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md dark:hover:bg-slate-800 border border-white/20 text-slate-800 dark:text-slate-100"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              }`
            }
            title="Plano de Fundo"
          >
            <ImageIcon size={18} />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 space-y-1 z-50"
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">
            Plano de Fundo
          </p>

          {/* Botão de carregar do Computador */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-left px-2 py-2 rounded-lg text-xs flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-semibold transition-colors border border-indigo-200/50 dark:border-indigo-800/50 cursor-pointer"
          >
            <Upload size={14} />
            <span>
              {customOption ? "Trocar foto do PC..." : "Enviar foto do PC..."}
            </span>
          </button>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          <div className="space-y-1">
            {/* Opção 1: Padrão */}
            <button
              type="button"
              onClick={() => setBgImage(null)}
              className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                bgImage === null
                  ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              <span>Padrão (Sem Imagem)</span>
              <RotateCcw size={12} className="opacity-60 shrink-0" />
            </button>

            {/* Opção 2: Imagem Personalizada */}
            {customOption && (
              <div
                onClick={() => setBgImage(customOption.url)}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  bgImage === customOption.url
                    ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="truncate max-w-[160px]">
                  {customOption.label}
                </span>

                <button
                  type="button"
                  onClick={handleRemoveCustomBg}
                  title="Eliminar foto"
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
