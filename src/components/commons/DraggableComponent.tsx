import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useDraggable } from "@dnd-kit/core";
import { X } from "lucide-react";

export function DraggableComponent({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const [position, setPosition] = useState({ x: 300, y: 100 });
  const [visible, setVisible] = useState(true);

  const ref = useRef<HTMLDivElement | null>(null);

  // Guarda o deslocamento atual antes de soltar o clique
  const lastTransform = useRef(transform);
  if (transform) {
    lastTransform.current = transform;
  }

  const handlePointerUp = () => {
    const currentTransform = transform || lastTransform.current;
    if (!currentTransform || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;

    setPosition((prev) => ({
      x: Math.max(0, Math.min(prev.x + currentTransform.x, maxX)),
      y: Math.max(0, Math.min(prev.y + currentTransform.y, maxY)),
    }));

    lastTransform.current = null;
  };

  useEffect(() => {
    const handleResize = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - rect.width),
        y: Math.min(prev.y, window.innerHeight - rect.height),
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!visible) return null;

  const style: CSSProperties = {
    position: "fixed",
    top: position.y,
    left: position.x,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    cursor: isDragging ? "grabbing" : "grab",
    touchAction: "none",
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        ref.current = node;
      }}
      {...listeners}
      {...attributes}
      onPointerUp={handlePointerUp}
      data-stopwatch-id={id}
      style={style}
      className="flex group items-center justify-center z-100 focus:outline-none hover:drop-shadow-[0_4px_12px_rgba(59,130,246,0.8)] fixed"
    >
      <img
        src="/comentario.png"
        alt="comentario"
        className="h-10 sm:h-12 w-auto object-contain"
      />
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setVisible(false)}
        className="absolute invisible group-hover:visible top-0 -right-1  text-white bg-red-500 drop-shadow-[0_4px_10px_rgba(220,38,38,1)] h-4 rounded-full flex items-center cursor-pointer"
      >
        <X size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
}
