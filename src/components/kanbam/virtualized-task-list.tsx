import type { Task } from "@/types/task";
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { TaskCard } from "./TaskCard";


interface VirtualizedTaskListProps {
  columnTasks: Task[];
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
}
export function VirtualizedTaskList({ columnTasks, onView, onEdit }: VirtualizedTaskListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: columnTasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 152, // Altura média do TaskCard + espaçamento
    overscan: 5, // Pré-carrega 5 itens fora da visão para scroll fluido
  });

  return (
    <div
      ref={parentRef}
      className="flex-1 min-h-0 overflow-y-auto rounded-xl p-1 relative custom-scrollbar"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const task = columnTasks[virtualItem.index];

          return (
            <div
              key={virtualItem.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <TaskCard
                task={task}
                index={virtualItem.index}
                onView={onView}
                onEdit={onEdit}
                onDelete={() => {}}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}