import { TasksPayload } from "@/lib/types";

const apiBase = "https://api.github.com";

const getEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing ${key} environment variable`);
  }
  return value;
};

export type GithubFileResponse = {
  sha: string;
  content: string;
  encoding: "base64";
};

export const fetchTasksFile = async (): Promise<GithubFileResponse> => {
  const repo = getEnv("GITHUB_REPO");
  const path = getEnv("GITHUB_TASKS_PATH");
  const token = getEnv("GITHUB_TOKEN");

  const res = await fetch(`${apiBase}/repos/${repo}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json"
    },
    cache: "no-store"
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`GitHub fetch failed: ${res.status} ${message}`);
  }

  return (await res.json()) as GithubFileResponse;
};

export const parseTasksFile = (file: GithubFileResponse): TasksPayload => {
  const decoded = Buffer.from(file.content, "base64").toString("utf-8");
  return JSON.parse(decoded) as TasksPayload;
};

export const saveTasksFile = async (payload: TasksPayload, sha: string) => {
  const repo = getEnv("GITHUB_REPO");
  const path = getEnv("GITHUB_TASKS_PATH");
  const token = getEnv("GITHUB_TOKEN");
  const content = Buffer.from(JSON.stringify(payload, null, 2)).toString("base64");

  const res = await fetch(`${apiBase}/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json"
    },
    body: JSON.stringify({
      message: "Update tasks",
      content,
      sha
    })
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`GitHub update failed: ${res.status} ${message}`);
  }

  return res.json();
};
