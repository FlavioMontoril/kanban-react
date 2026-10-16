import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GitMerge, Kanban } from "lucide-react";

type optionsView = "kanban" | "flow" | string;

interface ITabsViews {
  value: optionsView;
  onSelect: (view: optionsView) => void;
}

const VIEW_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  kanban: { label: "Kanban", icon: <Kanban size={15} /> },
  flow: { label: "Flow", icon: <GitMerge size={15} /> },
};

export function SelectViewMode({ value, onSelect }: ITabsViews) {
  const currentViewInfo = VIEW_LABELS[value] || {
    label: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
    icon: null,
  };

  return (
    <Select value={value} onValueChange={(val) => onSelect(val as optionsView)}>
      <SelectTrigger className="h-8.5 w-full rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs shadow-xs font-semibold cursor-pointer relative">
        <SelectValue>
          <div className="flex items-center gap-2">
            {currentViewInfo.icon}
            <span>{currentViewInfo.label}</span>
          </div>
        </SelectValue>
      </SelectTrigger>

      <SelectContent className="rounded-lg absolute -right-20">
        <SelectItem
          value="flow"
          className="cursor-pointer text-xs font-semibold"
        >
          <div className="flex items-center gap-2">
            <GitMerge size={14} />
            <span>Flow</span>
          </div>
        </SelectItem>

        <SelectItem
          value="kanban"
          className="cursor-pointer text-xs font-semibold"
        >
          <div className="flex items-center gap-2">
            <Kanban size={14} />
            <span>Kanban</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
