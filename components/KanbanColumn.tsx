import { useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Status, Task } from "@/lib/types";
import { STATUS_BADGES, STATUS_COLORS, STATUS_LABELS } from "@/lib/types";
import AddCardForm, { AddCardFormHandle } from "@/components/AddCardForm";
import KanbanCard from "@/components/KanbanCard";

type KanbanColumnProps = {
  status: Status;
  tasks: Task[];
  onAdd: (status: Status, title: string) => void;
  onSelect: (task: Task) => void;
};

export default function KanbanColumn({ status, tasks, onAdd, onSelect }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column:${status}`,
    data: { type: "column", status }
  });
  const addRef = useRef<AddCardFormHandle | null>(null);

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-[520px] flex-col rounded-2xl border p-4 transition ${
        STATUS_COLORS[status]
      } ${isOver ? "bg-white/5" : "bg-transparent"}`}
    >
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">{STATUS_LABELS[status]}</p>
          <p className="text-lg font-semibold text-text">{STATUS_LABELS[status]}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${
              STATUS_BADGES[status]
            }`}
          >
            {tasks.length}
          </span>
          <button
            onClick={() => addRef.current?.focus()}
            className="rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted hover:text-text"
          >
            Add
          </button>
        </div>
      </header>

      <AddCardForm ref={addRef} onAdd={(title) => onAdd(status, title)} />

      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-3">
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} onClick={onSelect} />
          ))}
        </div>
      </SortableContext>
    </section>
  );
}
