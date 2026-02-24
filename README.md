# Gary Board

Gary Board is a clean, dark-themed kanban board for Kyle and Gary. Tasks live in `tasks.json` inside this repo and are persisted via the GitHub Contents API.

## UI Usage
- Drag cards between columns.
- Click a card to edit title, description, priority, assignee, status, or tags.
- Use the inline input at the top of each column to add a card (press Enter).
- Changes auto-save to GitHub with a short debounce.

## Gary CLI Access
Gary can read or update `tasks.json` directly via GitHub CLI.

```bash
# Read tasks

gh api repos/Spyders0311/gary-board/contents/tasks.json --jq '.content' | base64 -d | jq .

# Gary updates by editing and pushing tasks.json directly in workspace
```

## Environment Variables (Vercel)
Set these env vars for the GitHub Contents API integration:
- `GITHUB_TOKEN` (repo scope)
- `GITHUB_REPO` (example: `Spyders0311/gary-board`)
- `GITHUB_TASKS_PATH` (example: `tasks.json`)

## Local Dev
```bash
npm install
npm run dev
```
