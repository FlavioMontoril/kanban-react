import { Kanban, Table, Workflow } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

type optionsView = "kanban" | "tabela" | "fluxo" | string;

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
        <TabsTrigger value="tabela" className="cursor-pointer">
          <Table />
          Tabela
        </TabsTrigger>
        <TabsTrigger value="fluxo" className="cursor-pointer">
          <Workflow />
          Fluxo
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
