import { useEffect, useState } from "react";
import type { Assignee, Priority, Status, Task } from "@/lib/types";

const priorities: Priority[] = ["critical", "high", "medium", "low"];
const assignees: Assignee[] = ["Kyle", "Gary", "Both"];
const statuses: Status[] = ["backlog", "todo", "inprogress", "done", "game-todo", "game-inprogress"];

const labels: Record<Status, string> = {
  backlog: "Backlog",
  todo: "To Do",
  inprogress: "In Progress",
  done: "Done",
  "game-todo": "Game To Do",
  "game-inprogress": "Game In Progress",
};

type CardModalProps = {
  task: Task;
  onClose: () => void;
  onSave: (updated: Task) => void;
  onDelete: (id: string) => void;
};

export default function CardModal({ task, onClose, onSave, onDelete }: CardModalProps) {
  const [draft, setDraft] = useState<Task>(task);

  useEffect(() => setDraft(task), [task]);

  const update = (patch: Partial<Task>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const save = () => {
    const cleanedTags = draft.tags
      .map((tag) => tag.trim())
      .filter(Boolean);
    onSave({ ...draft, tags: cleanedTags });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Task detail</p>
            <h2 className="text-2xl font-semibold text-text">{task.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-text"
          >
            Close
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            Title
            <input
              value={draft.title}
              onChange={(event) => update({ title: event.target.value })}
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text focus:border-blue/80 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Status
            <select
              value={draft.status}
              onChange={(event) => update({ status: event.target.value as Status })}
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text focus:border-blue/80 focus:outline-none"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {labels[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Priority
            <select
              value={draft.priority}
              onChange={(event) => update({ priority: event.target.value as Priority })}
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text focus:border-blue/80 focus:outline-none"
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            Assignee
            <select
              value={draft.assignee}
              onChange={(event) => update({ assignee: event.target.value as Assignee })}
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text focus:border-blue/80 focus:outline-none"
            >
              {assignees.map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 flex flex-col gap-2 text-sm">
          Description
          <textarea
            value={draft.description ?? ""}
            onChange={(event) => update({ description: event.target.value })}
            rows={4}
            className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text focus:border-blue/80 focus:outline-none"
          />
        </label>

        <label className="mt-4 flex flex-col gap-2 text-sm">
          Tags (comma-separated)
          <input
            value={draft.tags.join(", ")}
            onChange={(event) =>
              update({ tags: event.target.value.split(",").map((tag) => tag.trim()) })
            }
            className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text focus:border-blue/80 focus:outline-none"
          />
        </label>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              if (window.confirm("Delete this task?")) {
                onDelete(task.id);
              }
            }}
            className="rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-red-200"
          >
            Delete
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="rounded-full border border-gold/60 bg-gold/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-amber-100"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
