import { GitMerge, Kanban } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

type optionsView = "kanban" | "Workflows" | string;

interface ITabsViews {
  value: optionsView;
  onSelect: (view: optionsView) => void;
}
export function TabsViews({ value, onSelect }: ITabsViews) {
  return (
    <Tabs value={value} onValueChange={(val) => onSelect(val as optionsView)}>
      <TabsList className="bg-slate-200 dark:bg-slate-900 border border-slate-200 gap-2">
        <TabsTrigger value="kanban" className="cursor-pointer ">
          <Kanban />
          Kanban
        </TabsTrigger>
        <TabsTrigger value="Workflows" className="cursor-pointer">
          <GitMerge />
          Workflows
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
