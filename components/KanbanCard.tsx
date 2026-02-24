import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import type { Task } from "@/lib/types";
import { PRIORITY_STYLES } from "@/lib/types";

type KanbanCardProps = {
  task: Task;
  onClick: (task: Task) => void;
};

const assigneeStyle: Record<Task["assignee"], string> = {
  Kyle: "border-blue/60 text-blue-100",
  Gary: "border-gold/60 text-amber-100",
  Both: "border-emerald-400/50 text-emerald-100"
};

export default function KanbanCard({ task, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", status: task.status }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={`rounded-xl border border-border bg-card p-4 shadow-card transition hover:shadow-glow ${
        isDragging ? "opacity-70" : "opacity-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] ${
            PRIORITY_STYLES[task.priority]
          }`}
        >
          {task.priority}
        </span>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] ${
            assigneeStyle[task.assignee]
          }`}
        >
          {task.assignee}
        </span>
      </div>

      <h3 className="mt-3 text-sm font-semibold text-text">{task.title}</h3>
      {task.description ? (
        <p className="mt-2 line-clamp-2 text-xs text-muted">{task.description}</p>
      ) : null}

      {task.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
