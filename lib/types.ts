export type Status = "backlog" | "todo" | "inprogress" | "done";
export type Priority = "critical" | "high" | "medium" | "low";
export type Assignee = "Kyle" | "Gary" | "Both";

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  assignee: Assignee;
  createdAt: string;
  updatedAt: string;
  tags: string[];
};

export type TasksPayload = {
  tasks: Task[];
};

export const STATUS_LABELS: Record<Status, string> = {
  backlog: "Backlog",
  todo: "To Do",
  inprogress: "In Progress",
  done: "Done"
};

export const STATUS_COLORS: Record<Status, string> = {
  backlog: "border-muted/40",
  todo: "border-blue/60",
  inprogress: "border-gold/60",
  done: "border-emerald-500/50"
};

export const STATUS_BADGES: Record<Status, string> = {
  backlog: "bg-slate-600/30 text-slate-200",
  todo: "bg-blue/30 text-blue-100",
  inprogress: "bg-gold/30 text-amber-100",
  done: "bg-emerald-500/25 text-emerald-100"
};

export const PRIORITY_STYLES: Record<Priority, string> = {
  critical: "bg-red-500/25 text-red-200 border-red-500/40",
  high: "bg-orange-500/25 text-orange-200 border-orange-500/40",
  medium: "bg-yellow-400/20 text-yellow-100 border-yellow-400/40",
  low: "bg-emerald-500/20 text-emerald-100 border-emerald-500/40"
};
