"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { Status, Task, TasksPayload } from "@/lib/types";
import KanbanColumn from "@/components/KanbanColumn";
import CardModal from "@/components/CardModal";
import Toast from "@/components/Toast";

const statusOrder: Status[] = ["backlog", "todo", "inprogress", "done"];

const groupByStatus = (tasks: Task[]) => {
  const grouped: Record<Status, Task[]> = {
    backlog: [],
    todo: [],
    inprogress: [],
    done: []
  };
  tasks.forEach((task) => grouped[task.status].push(task));
  return grouped;
};

const flatten = (grouped: Record<Status, Task[]>) =>
  statusOrder.flatMap((status) => grouped[status]);

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selected, setSelected] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );
  const [hasLoaded, setHasLoaded] = useState(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const skipSaveRef = useRef(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to load tasks");
      }
      const json = (await res.json()) as { data: TasksPayload };
      setTasks(json.data.tasks ?? []);
      setLastSavedAt(new Date().toISOString());
    } catch (error) {
      setToast({ message: "Load failed", type: "error" });
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (!hasLoaded) return;
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/tasks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: { tasks } })
        });
        if (!res.ok) {
          throw new Error("Save failed");
        }
        setLastSavedAt(new Date().toISOString());
        setToast({ message: "Saved ✓", type: "success" });
      } catch (error) {
        setToast({ message: "Save failed", type: "error" });
      } finally {
        setSaving(false);
      }
    }, 800);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [tasks, hasLoaded]);

  const handleAdd = (status: Status, title: string) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description: "",
      status,
      priority: "medium",
      assignee: "Kyle",
      createdAt: now,
      updatedAt: now,
      tags: []
    };

    const grouped = groupByStatus(tasks);
    grouped[status] = [newTask, ...grouped[status]];
    setTasks(flatten(grouped));
  };

  const handleUpdate = (updated: Task) => {
    const now = new Date().toISOString();
    setTasks((current) =>
      current.map((task) => (task.id === updated.id ? { ...updated, updatedAt: now } : task))
    );
    setSelected(null);
  };

  const handleDelete = (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
    setSelected(null);
  };

  const grouped = useMemo(() => groupByStatus(tasks), [tasks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    const activeTask = tasks.find((task) => task.id === activeId);
    if (!activeTask) return;

    const groupedTasks = groupByStatus(tasks);
    const activeStatus = activeTask.status;

    if (overId.startsWith("column:")) {
      const targetStatus = overId.replace("column:", "") as Status;
      if (targetStatus === activeStatus) return;
      groupedTasks[activeStatus] = groupedTasks[activeStatus].filter((task) => task.id !== activeId);
      groupedTasks[targetStatus] = [
        { ...activeTask, status: targetStatus, updatedAt: new Date().toISOString() },
        ...groupedTasks[targetStatus]
      ];
      setTasks(flatten(groupedTasks));
      return;
    }

    const overTask = tasks.find((task) => task.id === overId);
    if (!overTask) return;

    const targetStatus = overTask.status;
    const sourceList = groupedTasks[activeStatus].filter((task) => task.id !== activeId);
    const targetList =
      activeStatus === targetStatus
        ? sourceList
        : groupedTasks[targetStatus].slice();

    const overIndex = targetList.findIndex((task) => task.id === overId);
    const insertIndex = overIndex === -1 ? targetList.length : overIndex;

    const updatedTask = {
      ...activeTask,
      status: targetStatus,
      updatedAt: new Date().toISOString()
    };

    const nextTarget = [...targetList];
    nextTarget.splice(insertIndex, 0, updatedTask);

    groupedTasks[activeStatus] = sourceList;
    groupedTasks[targetStatus] = nextTarget;

    setTasks(flatten(groupedTasks));
  };

  return (
    <section className="rounded-3xl border border-border bg-white/2 p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-gold" />
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Status</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          {saving ? "Saving..." : ""}
          {lastSavedAt ? `Last saved ${new Date(lastSavedAt).toLocaleTimeString()}` : ""}
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card/50 p-8 text-sm text-muted">
          Loading tasks...
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid gap-4 lg:grid-cols-4">
            {statusOrder.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={grouped[status]}
                onAdd={handleAdd}
                onSelect={setSelected}
              />
            ))}
          </div>
        </DndContext>
      )}

      <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <span>{saving ? "Saving to GitHub..." : "Ready"}</span>
        <span>
          {lastSavedAt
            ? `Last saved ${new Date(lastSavedAt).toLocaleString()}`
            : "Not saved yet"}
        </span>
      </footer>

      {selected ? (
        <CardModal
          task={selected}
          onClose={() => setSelected(null)}
          onSave={handleUpdate}
          onDelete={handleDelete}
        />
      ) : null}

      {toast ? (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      ) : null}
    </section>
  );
}
