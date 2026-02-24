# PRD: Gary Board — Collaborative Kanban for Kyle & Gary

## What it is
A clean, dark-themed kanban board web app. Kyle uses the browser UI. Gary (AI) updates tasks by pushing to `tasks.json` in the GitHub repo. Data lives in the repo itself via GitHub Contents API — no external database required.

## Tech Stack
- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- @dnd-kit/core + @dnd-kit/sortable for drag-and-drop
- GitHub Contents API for persistence (read/write tasks.json)
- Deploy target: Vercel

## Color Scheme
Dark tactical — match 10-8video.com branding:
- Background: #08101f (dark navy)
- Card background: #0f1e36
- Border: rgba(30,77,140,0.35)
- Gold accent: #c8a84b
- Blue accent: #2563b0
- Text: #dce4f0
- Muted text: #7a8da8

## Data Model — tasks.json
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Task title",
      "description": "Optional details",
      "status": "backlog|todo|inprogress|done",
      "priority": "critical|high|medium|low",
      "assignee": "Kyle|Gary|Both",
      "createdAt": "ISO date",
      "updatedAt": "ISO date",
      "tags": ["game", "website", "marketing"]
    }
  ]
}
```

## Columns
1. **Backlog** (grey) — ideas, not started
2. **To Do** (blue) — ready to work on
3. **In Progress** (gold) — actively being worked on
4. **Done** (green) — completed

## Priority Colors (badge on card)
- 🔴 Critical — red
- 🟠 High — orange
- 🟡 Medium — yellow
- 🟢 Low — green/dim

## Features

### Core (must have)
- Drag cards between columns (dnd-kit)
- Click card to open detail modal (edit title, description, priority, assignee, tags)
- Add new card button in each column header
- Delete card (with confirm)
- Priority badge on each card
- Assignee chip on each card (Kyle / Gary / Both)
- Tag chips on card
- Auto-save to GitHub (debounced 800ms after any change)
- Loading state while saving
- Last saved timestamp in footer

### UI Details
- Column header shows card count badge
- Cards show: title, priority badge, assignee, tags, truncated description
- "Add card" inline input at top of column — press Enter to save
- Card modal: full edit form (title, description, priority, assignee, tags as comma-separated input)
- Smooth drag animation
- Toast notification: "Saved ✓" after successful GitHub save, "Save failed" on error

### GitHub Persistence
- API route: `app/api/tasks/route.ts`
  - GET: fetch tasks.json from GitHub repo via Contents API, return parsed JSON
  - PUT: update tasks.json via GitHub Contents API (requires sha of current file)
- Env vars needed:
  - `GITHUB_TOKEN` — personal access token with repo scope
  - `GITHUB_REPO` — e.g. "Spyders0311/gary-board"
  - `GITHUB_TASKS_PATH` — "tasks.json"
- On load: fetch from API route
- On change: debounced PUT to API route

### Gary's CLI access
In README, document: Gary can update tasks.json directly via:
```bash
# Read tasks
gh api repos/Spyders0311/gary-board/contents/tasks.json --jq '.content' | base64 -d | jq .

# Gary updates by editing and pushing tasks.json directly in workspace
```

## File Structure
```
gary-board/
├── app/
│   ├── layout.tsx          # dark bg, Inter font, metadata
│   ├── page.tsx            # main kanban board
│   ├── globals.css         # tailwind + custom CSS vars
│   └── api/
│       └── tasks/
│           └── route.ts    # GET + PUT GitHub Contents API
├── components/
│   ├── KanbanBoard.tsx     # main board with 4 columns
│   ├── KanbanColumn.tsx    # individual column with droppable
│   ├── KanbanCard.tsx      # draggable card
│   ├── CardModal.tsx       # edit modal
│   ├── AddCardForm.tsx     # inline add card input
│   └── Toast.tsx           # save status toast
├── lib/
│   ├── types.ts            # Task, Status, Priority types
│   └── github.ts           # GitHub API helpers (fetch/save tasks)
├── tasks.json              # initial tasks (seed data)
├── tailwind.config.ts
├── next.config.mjs
├── package.json
└── README.md
```

## Seed Data (tasks.json)
Pre-populate with real tasks from the current project:
```json
{
  "tasks": [
    {"id":"1","title":"Open Age Runner in Unity and hit Play","description":"Unity 2022.3 LTS downloading. Run Age Runner → Build Scene, then Play.","status":"todo","priority":"high","assignee":"Kyle","createdAt":"2026-02-24T00:00:00Z","updatedAt":"2026-02-24T00:00:00Z","tags":["game"]},
    {"id":"2","title":"Assign audio clips to AudioManager","description":"Source CC0 SFX from freesound.org. See AUDIO_SETUP.md for full list.","status":"backlog","priority":"medium","assignee":"Kyle","createdAt":"2026-02-24T00:00:00Z","updatedAt":"2026-02-24T00:00:00Z","tags":["game"]},
    {"id":"3","title":"First Android APK test","description":"Build to Android device. Need keystore setup first per ANDROID_BUILD_NOTES.md.","status":"backlog","priority":"high","assignee":"Kyle","createdAt":"2026-02-24T00:00:00Z","updatedAt":"2026-02-24T00:00:00Z","tags":["game"]},
    {"id":"4","title":"10-8 software landing page — go live","description":"Currently on GitHub Pages at spyders0311.github.io/10-8-software. Wire contact form to real email.","status":"inprogress","priority":"high","assignee":"Gary","createdAt":"2026-02-24T00:00:00Z","updatedAt":"2026-02-24T00:00:00Z","tags":["website","marketing"]},
    {"id":"5","title":"Integrate software page into Ten8-Clean Next.js site","description":"Add app/software/ route to ten8-clean repo.","status":"inprogress","priority":"high","assignee":"Gary","createdAt":"2026-02-24T00:00:00Z","updatedAt":"2026-02-24T00:00:00Z","tags":["website"]},
    {"id":"6","title":"Provide deployment tokens","description":"Cloudflare, Vercel, Railway, Fly.io tokens. See MEMORY.md for links.","status":"todo","priority":"medium","assignee":"Kyle","createdAt":"2026-02-24T00:00:00Z","updatedAt":"2026-02-24T00:00:00Z","tags":["infra"]},
    {"id":"7","title":"Twitter/X API keys for Age Runner marketing","description":"Need 5 keys from developer.twitter.com to start posting dev updates.","status":"todo","priority":"medium","assignee":"Kyle","createdAt":"2026-02-24T00:00:00Z","updatedAt":"2026-02-24T00:00:00Z","tags":["marketing"]},
    {"id":"8","title":"Ten8-Clean frontend — clone and sandbox","description":"Zip received from Jubalr/Ten8-Clean. Push to Spyders0311 and add software page route.","status":"inprogress","priority":"high","assignee":"Gary","createdAt":"2026-02-24T00:00:00Z","updatedAt":"2026-02-24T00:00:00Z","tags":["website"]},
    {"id":"9","title":"Age Runner marketing — launch strategy","description":"30-day content calendar, press kit, Play Store listing. Pending Twitter API access.","status":"backlog","priority":"medium","assignee":"Gary","createdAt":"2026-02-24T00:00:00Z","updatedAt":"2026-02-24T00:00:00Z","tags":["marketing","game"]},
    {"id":"10","title":"Setup gary-setup-blueprint integrations","description":"himalaya email, BluOS, Notion, Slack — see gary-setup-blueprint.md for full list.","status":"backlog","priority":"low","assignee":"Gary","createdAt":"2026-02-24T00:00:00Z","updatedAt":"2026-02-24T00:00:00Z","tags":["infra"]}
  ]
}
```

## README content
Explain: what it is, how to use the UI, how Gary updates via CLI, env vars needed for Vercel deploy, how to add GITHUB_TOKEN.

## IMPORTANT BUILD RULES
- Write complete, compilable TypeScript — no placeholder comments
- All components fully implemented
- Tailwind only — no inline style objects except for dynamic colors
- dnd-kit for drag and drop — use useDraggable/useDroppable or SortableContext
- The GitHub API route must handle sha correctly for updates
- Error handling on all API calls
- After writing all files: git add -A && git commit -m "feat: Gary Board — collaborative kanban with GitHub persistence"
