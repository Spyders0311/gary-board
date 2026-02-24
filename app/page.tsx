import KanbanBoard from "@/components/KanbanBoard";

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-8 md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Gary Board</p>
          <h1 className="text-3xl font-semibold text-text md:text-4xl">
            Collaborative Kanban for Kyle & Gary
          </h1>
          <p className="max-w-2xl text-sm text-muted">
            Drag tasks across the tactical pipeline, edit details, and auto-save directly to GitHub.
          </p>
        </header>
        <KanbanBoard />
      </div>
    </main>
  );
}
