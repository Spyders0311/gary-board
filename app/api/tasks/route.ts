import { NextResponse } from "next/server";
import { fetchTasksFile, parseTasksFile, saveTasksFile } from "@/lib/github";
import type { TasksPayload } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const file = await fetchTasksFile();
    const data = parseTasksFile(file);
    return NextResponse.json({ data, sha: file.sha });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { data: TasksPayload };
    if (!body?.data?.tasks) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const file = await fetchTasksFile();
    await saveTasksFile(body.data, file.sha);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
