import type { Task } from "@/types/task";
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Draggable,
  type DraggableProvided,
  type DroppableProvided,
} from "@hello-pangea/dnd";
import { TaskCardVirtualized } from "./TaskCardVirtualized";

interface VirtualizedTaskListProps {
  columnTasks: Task[];
  provided: DroppableProvided | DraggableProvided;
  isDraggingOver: boolean;
}
export function VirtualizedTaskList({
  columnTasks,
  provided,
  isDraggingOver,
}: VirtualizedTaskListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: columnTasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 152, // Altura média do TaskCard + espaçamento
    overscan: 5, // Pré-carrega 5 itens fora da visão para scroll fluido
  });

  return (
    <div
      ref={(el) => {
        // Conecta a ref do TanStack Virtual e a ref do DnD na mesma div
        parentRef.current = el;
        // Conecta o innerRef apenas se for a interface do Droppable
        if ("innerRef" in provided) {
          provided.innerRef(el);
        }
      }}
      // {...provided.droppableProps}
      {...("droppableProps" in provided ? provided.droppableProps : {})}
      className={`flex-1 h-full overflow-y-auto rounded-xl transition-colors p-1 custom-scrollbar ${
        isDraggingOver
          ? "bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-200 dark:ring-indigo-800"
          : ""
      }`}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {/* {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const task = columnTasks[virtualItem.index]; */}
        {/* // console.log("Renderizando item virtual:", virtualItem.index); return */}
        {/* ( */}
        {/* <div
              key={task.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            > */}
        {/* O Draggable envolve o card para permitir o arraste */}
        {/* <Draggable draggableId={task.id} index={virtualItem.index}>
                {(draggableProvided, snapshot) => (
                  <TaskCardVirtualized
                    task={task}
                    index={virtualItem.index}
                    provided={draggableProvided}
                    isDragging={snapshot.isDragging}
                  />
                )}
              </Draggable>
            </div>
          );
        })} */}
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const task = columnTasks[virtualItem.index];

          return (
            <div
              key={task.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <Draggable draggableId={task.id} index={virtualItem.index}>
                {(draggableProvided, snapshot) => {
                  // Quando o item está sendo arrastado, o renderClone assume a renderização flutuante.
                  return (
                    <TaskCardVirtualized
                      task={task}
                      index={virtualItem.index}
                      provided={draggableProvided}
                      isDragging={snapshot.isDragging}
                    />
                  );
                }}
              </Draggable>
            </div>
          );
        })}
      </div>
      {/* {provided.placeholder} */}
      {"placeholder" in provided && provided.placeholder}
    </div>
  );
}
