"use client";

import type { TasksPayload } from "@/lib/types";

const API_BASE = "https://api.github.com";
const REPO = "Spyders0311/gary-board";
const FILE_PATH = "tasks.json";
const TOKEN_KEY = "gary_board_token";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token.trim());
};

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export type GitHubFile = {
  sha: string;
  content: string;
};

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "Content-Type": "application/json",
});

export const fetchTasks = async (): Promise<{ data: TasksPayload; sha: string }> => {
  const token = getToken();
  if (!token) throw new Error("NO_TOKEN");

  const res = await fetch(`${API_BASE}/repos/${REPO}/contents/${FILE_PATH}`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (res.status === 401) throw new Error("INVALID_TOKEN");
  if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status}`);

  const file = (await res.json()) as GitHubFile;
  const decoded = atob(file.content.replace(/\n/g, ""));
  const data = JSON.parse(decoded) as TasksPayload;
  return { data, sha: file.sha };
};

export const saveTasks = async (payload: TasksPayload, sha: string): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error("NO_TOKEN");

  const content = btoa(unescape(encodeURIComponent(JSON.stringify(payload, null, 2))));

  const res = await fetch(`${API_BASE}/repos/${REPO}/contents/${FILE_PATH}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({
      message: "chore: update tasks via Gary Board",
      content,
      sha,
    }),
  });

  if (res.status === 401) throw new Error("INVALID_TOKEN");
  if (!res.ok) throw new Error(`GitHub save failed: ${res.status}`);
};
