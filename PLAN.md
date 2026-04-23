# prowplus — Project Management System

## Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind + framer-motion + lucide-react
- **Backend**: Node.js + Express + Mongoose + JWT (httpOnly cookie + Bearer fallback)
- **DB**: MongoDB local (`mongodb://localhost:27017/prowplus`)
- **Design**: Follows `DESIGN_SYSTEM.md` (Linear-inspired, slate + indigo accent)

## Roles
| Role    | Can do                                                                 |
|---------|------------------------------------------------------------------------|
| admin   | Full CRUD on users, clients, projects, tasks. Dashboard view of all.   |
| team    | View assigned projects. Create/update tasks. Comment. Log bugs.        |
| client  | View own projects. Comment on tasks. Approve task completion.          |

## Data Models

### User
`{ name, email (unique), password (hashed), role: 'admin'|'team'|'client', designation, company, phone, avatar, isActive, createdBy, createdAt }`

### Project
`{ name, description, techStack[], startDate, deadline, status, priority, progress (0-100), client (User), teamMembers[User], createdBy, budget, tags[], createdAt }`
- `status`: `planning | in-progress | testing | completed | on-hold`

### Task
`{ project, title, description, type: 'task|bug|feature|improvement', status: 'todo|in-progress|review|done|blocked', priority, assignedTo[User], createdBy, dueDate, completedAt, clientApproved, clientApprovedAt, subtasks[{title, done}], attachments[] }`

### Comment
`{ task, project, author, content, mentions[], createdAt }`

### Activity (audit log)
`{ project, task, user, action, details, createdAt }`

## API Surface (v1)

**Auth**
- `POST /api/auth/login` — email + password → JWT + user
- `POST /api/auth/logout`
- `GET  /api/auth/me`

**Users (admin only)**
- `GET/POST/PATCH/DELETE /api/users`
- `GET /api/users?role=team|client`

**Projects**
- `GET /api/projects` — filtered by role (admin: all, team: assigned, client: own)
- `POST /api/projects` — admin only
- `GET/PATCH/DELETE /api/projects/:id`

**Tasks**
- `GET /api/projects/:id/tasks`
- `POST /api/projects/:id/tasks` — admin + team
- `PATCH /api/tasks/:id` — status update, assignment, etc.
- `POST /api/tasks/:id/approve` — client only (approves completion)

**Comments**
- `GET/POST /api/tasks/:id/comments`

## Build Order (as requested)

1. ✅ **Foundation** — folder structure, backend skeleton, DB, models
2. ✅ **Auth layer** — JWT, bcrypt, login endpoint, seed admin
3. ✅ **Login page** — shared for all 3 roles, role-based redirect
4. ✅ **Admin dashboard** — stats, recent activity, quick actions
5. **Admin → Team management** — CRUD team members with creds
6. **Admin → Client management** — CRUD clients with creds
7. **Admin → Project management** — create, assign client + team
8. **Project detail page** — tasks, comments, activity feed, progress
9. **Team dashboard** — assigned projects, my tasks
10. **Client dashboard** — own projects, approve completed tasks
11. **Activity log + notifications**
12. **Polish** — empty states, loading, errors, responsive

## Default Admin (seeded)
- Email: `admin@prowplus.com`
- Password: `Admin@123` (change on first login)
