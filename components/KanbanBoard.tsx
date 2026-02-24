"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { Status, Task, TasksPayload } from "@/lib/types";
import { fetchTasks, saveTasks, setToken, getToken, clearToken } from "@/lib/github";
import KanbanColumn from "@/components/KanbanColumn";
import CardModal from "@/components/CardModal";
import Toast from "@/components/Toast";

const statusOrder: Status[] = ["backlog", "todo", "inprogress", "done"];

const groupByStatus = (tasks: Task[]) => {
  const grouped: Record<Status, Task[]> = { backlog: [], todo: [], inprogress: [], done: [] };
  tasks.forEach((t) => grouped[t.status].push(t));
  return grouped;
};

const flatten = (grouped: Record<Status, Task[]>) =>
  statusOrder.flatMap((s) => grouped[s]);

// ── Token Setup Screen ────────────────────────────────────────────────────────
function TokenSetup({ onSave }: { onSave: (token: string) => void }) {
  const [val, setVal] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!val.trim().startsWith("ghp_") && !val.trim().startsWith("github_pat_")) {
      setError("Token should start with ghp_ or github_pat_");
      return;
    }
    setToken(val.trim());
    onSave(val.trim());
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="text-2xl">⚙️</span>
          <div>
            <h2 className="text-lg font-bold text-white">Connect to GitHub</h2>
            <p className="text-sm text-muted">One-time setup. Token saves to your browser.</p>
          </div>
        </div>

        <div className="mb-5 rounded-lg border border-border bg-navy p-4 text-sm text-muted space-y-2">
          <p className="font-semibold text-text">How to get your token:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Go to <span className="text-gold">github.com → Settings → Developer settings</span></li>
            <li>Personal access tokens → Fine-grained tokens → Generate new token</li>
            <li>Repository access: <span className="text-gold">Spyders0311/gary-board</span></li>
            <li>Permissions: <span className="text-gold">Contents → Read and write</span></li>
            <li>Copy the token and paste below</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted">
              GitHub Token
            </label>
            <input
              type="password"
              value={val}
              onChange={(e) => { setVal(e.target.value); setError(""); }}
              placeholder="ghp_xxxx or github_pat_xxxx"
              className="w-full rounded-lg border border-border bg-navy px-4 py-3 text-sm text-white placeholder-muted outline-none focus:border-gold"
              required
            />
            {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-gold py-3 text-sm font-bold text-navy hover:bg-gold-light transition-colors"
          >
            Connect & Load Board →
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main Board ────────────────────────────────────────────────────────────────
export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selected, setSelected] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sha, setSha] = useState<string>("");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const skipSaveRef = useRef(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, sha } = await fetchTasks();
      setTasks(data.tasks ?? []);
      setSha(sha);
      setLastSavedAt(new Date().toISOString());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (msg === "NO_TOKEN") {
        setHasToken(false);
      } else if (msg === "INVALID_TOKEN") {
        clearToken();
        setHasToken(false);
        setToast({ message: "Token invalid — please reconnect", type: "error" });
      } else {
        setToast({ message: "Load failed — check connection", type: "error" });
      }
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (token) {
      setHasToken(true);
      loadTasks();
    } else {
      setHasToken(false);
      setLoading(false);
    }
  }, [loadTasks]);

  // Auto-save on task change
  useEffect(() => {
    if (!hasLoaded || !sha) return;
    if (skipSaveRef.current) { skipSaveRef.current = false; return; }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveTasks({ tasks }, sha);
        // Refresh sha after save
        const { sha: newSha } = await fetchTasks().then(r => r).catch(() => ({ sha }));
        setSha(newSha ?? sha);
        setLastSavedAt(new Date().toISOString());
        setToast({ message: "Saved ✓", type: "success" });
      } catch {
        setToast({ message: "Save failed", type: "error" });
      } finally {
        setSaving(false);
      }
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [tasks, hasLoaded, sha]);

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
      tags: [],
    };
    const grouped = groupByStatus(tasks);
    grouped[status] = [newTask, ...grouped[status]];
    setTasks(flatten(grouped));
  };

  const handleUpdate = (updated: Task) => {
    setTasks((cur) => cur.map((t) => t.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : t));
    setSelected(null);
  };

  const handleDelete = (id: string) => {
    setTasks((cur) => cur.filter((t) => t.id !== id));
    setSelected(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;
    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;
    const grouped = groupByStatus(tasks);
    const activeStatus = activeTask.status;

    if (overId.startsWith("column:")) {
      const targetStatus = overId.replace("column:", "") as Status;
      if (targetStatus === activeStatus) return;
      grouped[activeStatus] = grouped[activeStatus].filter((t) => t.id !== activeId);
      grouped[targetStatus] = [{ ...activeTask, status: targetStatus, updatedAt: new Date().toISOString() }, ...grouped[targetStatus]];
      setTasks(flatten(grouped));
      return;
    }

    const overTask = tasks.find((t) => t.id === overId);
    if (!overTask) return;
    const targetStatus = overTask.status;
    const sourceList = grouped[activeStatus].filter((t) => t.id !== activeId);
    const targetList = activeStatus === targetStatus ? sourceList : grouped[targetStatus].slice();
    const overIndex = targetList.findIndex((t) => t.id === overId);
    const insertIndex = overIndex === -1 ? targetList.length : overIndex;
    const updatedTask = { ...activeTask, status: targetStatus, updatedAt: new Date().toISOString() };
    const nextTarget = [...targetList];
    nextTarget.splice(insertIndex, 0, updatedTask);
    grouped[activeStatus] = sourceList;
    grouped[targetStatus] = nextTarget;
    setTasks(flatten(grouped));
  };

  const grouped = useMemo(() => groupByStatus(tasks), [tasks]);

  if (!hasToken) {
    return <TokenSetup onSave={() => { setHasToken(true); loadTasks(); }} />;
  }

  return (
    <section className="rounded-3xl border border-border bg-white/[0.02] p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gold" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted">
          {saving && <span className="text-gold animate-pulse">Saving to GitHub...</span>}
          {!saving && lastSavedAt && <span>Saved {new Date(lastSavedAt).toLocaleTimeString()}</span>}
          <button
            onClick={() => { clearToken(); setHasToken(false); setTasks([]); }}
            className="text-muted hover:text-red-400 transition-colors"
            title="Disconnect GitHub token"
          >
            Disconnect
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-4">
          {statusOrder.map((s) => (
            <div key={s} className="h-40 animate-pulse rounded-2xl border border-border bg-card/50" />
          ))}
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

      {selected && (
        <CardModal task={selected} onClose={() => setSelected(null)} onSave={handleUpdate} onDelete={handleDelete} />
      )}

      {toast && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </section>
  );
}
