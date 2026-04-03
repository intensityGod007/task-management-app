# Momentum — Task Management System

> Stay focused. Move forward.

A full-stack task management system built with **Node.js + TypeScript + Prisma** (backend) and **Next.js + TypeScript + Tailwind** (frontend).

---

## Project Structure

```
momentum/
├── backend/          # Express API (Node.js + TypeScript + Prisma + SQLite)
└── frontend/         # Next.js 14 App Router (TypeScript + Tailwind CSS)
```

---

## Backend Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Steps

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Copy and configure environment
cp .env.example .env
# Edit .env and set strong JWT secrets

# 3. Generate Prisma client + run migrations
npx prisma generate
npx prisma db push

# 4. Start dev server
npm run dev
# API runs at http://localhost:3001
```

### Environment Variables (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | SQLite file path | `file:./dev.db` |
| `PORT` | Server port | `3001` |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens | **(required)** |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | **(required)** |
| `JWT_ACCESS_EXPIRY` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token lifetime | `7d` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:3000` |

---

## Frontend Setup

### Steps

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Copy and configure environment
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL if backend is not on port 3001

# 3. Start dev server
npm run dev
# App runs at http://localhost:3000
```

### Environment Variables (`frontend/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` |

---

## API Reference

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Create account | — |
| `POST` | `/auth/login` | Sign in | — |
| `POST` | `/auth/refresh` | Rotate tokens (cookie) | Cookie |
| `POST` | `/auth/logout` | Invalidate session | Cookie |

### Tasks

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/tasks` | List tasks (paginated, filterable) | Bearer |
| `POST` | `/tasks` | Create task | Bearer |
| `GET` | `/tasks/:id` | Get single task | Bearer |
| `PATCH` | `/tasks/:id` | Update task | Bearer |
| `DELETE` | `/tasks/:id` | Delete task | Bearer |
| `PATCH` | `/tasks/:id/toggle` | Toggle completion | Bearer |

#### `GET /tasks` Query Parameters

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 50) |
| `status` | `PENDING` \| `IN_PROGRESS` \| `COMPLETED` | Filter by status |
| `priority` | `LOW` \| `MEDIUM` \| `HIGH` | Filter by priority |
| `search` | string | Search by title (case-insensitive) |

#### Task Schema

```json
{
  "title": "string (required, max 200)",
  "description": "string (optional, max 1000)",
  "status": "PENDING | IN_PROGRESS | COMPLETED",
  "priority": "LOW | MEDIUM | HIGH",
  "dueDate": "ISO 8601 datetime (optional)"
}
```

---

## Features

### Backend
- ✅ JWT authentication with **access token** (15m) + **refresh token** (7d)
- ✅ Refresh token rotation on every refresh
- ✅ httpOnly cookie for refresh token storage
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Zod input validation with structured errors
- ✅ Pagination, filtering by status/priority, and title search
- ✅ All tasks scoped to authenticated user
- ✅ Standard HTTP status codes throughout

### Frontend
- ✅ Login & Register pages with password strength meter
- ✅ Auto token refresh (transparent to user, with request queuing)
- ✅ Dashboard with stats overview
- ✅ Create, edit, delete, and toggle tasks
- ✅ Filter by status/priority, search by title
- ✅ Pagination
- ✅ Toast notifications for all operations
- ✅ Confirm dialog for destructive actions
- ✅ Responsive design (mobile + desktop)
- ✅ Overdue task highlighting

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend runtime | Node.js 18+ |
| Backend framework | Express.js |
| Language | TypeScript |
| ORM | Prisma |
| Database | SQLite (swappable to Postgres) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | Zod |
| Frontend framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| HTTP client | Axios |
| Toasts | react-hot-toast |
| Icons | Lucide React |
| Fonts | DM Sans + Fraunces + JetBrains Mono |

---

## Switching to PostgreSQL

Update `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Update `DATABASE_URL` in `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/momentum"
```

Then run:
```bash
npx prisma migrate dev --name init
```
