# prowplus — Setup

Two folders: `backend/` (Node + Express + MongoDB) and `frontend/` (Next.js 14).

## Prerequisites
- Node.js 18+
- MongoDB running locally at `mongodb://localhost:27017` (`brew services start mongodb-community` on mac / `mongod` on Linux / `net start MongoDB` on Windows)

## 1. Backend

```bash
cd backend
cp .env.example .env        # edit JWT_SECRET — use a long random string
npm install
npm run seed                # creates default admin → admin@prowplus.com / Admin@123
npm run dev                 # starts on :5000
```

Health check: `curl http://localhost:5000/api/health`

## 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local   # default points to http://localhost:5000
npm install
npm run dev                         # starts on :3000
```

Open http://localhost:3000 → redirects to `/login` → sign in with seeded admin.

## Default Admin
- **Email:** `admin@prowplus.com`
- **Password:** `Admin@123`

Change these via `.env` before running `npm run seed`, or update the password from the admin settings page after first login.

## What's Built

**Backend**
- JWT auth (cookie + Bearer), bcrypt, rate-limited login
- Models: User, Project, Task (with subtasks, approval), Comment, Activity
- Role-scoped queries: admin sees all, team sees assigned projects, client sees own
- Auto progress recalc when task status changes
- Activity log for projects/tasks/comments/approvals
- Seed script for default admin

**Frontend (Next.js 14 App Router)**
- Shared `/login` with split brand+form layout and role-based redirect
- **Admin**: dashboard (stats + recent projects + live activity + quick actions), Team CRUD (table view), Clients CRUD (card view), Projects list with filter, Project create, Activity, Settings
- **Team**: dashboard (assigned projects + my open tasks), Projects list, Project detail, My Tasks
- **Client**: dashboard (portfolio), Projects list, Project detail with **approve completed tasks** flow
- **Project detail** (shared for all roles):
  - Hero panel with status/priority/progress/deadline
  - Client + team panels
  - Tabs: Task board (5 columns — todo/in-progress/review/done/blocked), Overview (stats + recent), Activity feed
  - Task drawer: edit status/priority/due date, assignees, subtasks, comments thread, delete, client approval button
  - Role-aware controls (clients get comment + approve only)
- Enterprise design tokens wired from `DESIGN_SYSTEM.md`
- Framer-motion entrance animations, toasts via react-hot-toast

## Possible Next Polish
- File attachments on tasks/comments
- Email notifications when assigned / commented / status changed
- Export project report as PDF
- Dark mode
- WebSocket for live activity across tabs
