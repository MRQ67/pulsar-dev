# ⚡ Pulsar Dev

> Your projects, one dashboard.

A real-time DevOps dashboard for small development teams. Monitor GitHub activity, deployments, and infrastructure metrics in one unified interface with live WebSocket updates.

**Built for teams of 3-10 developers** who are tired of switching between GitHub, CI/CD dashboards, and monitoring tools.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [WebSocket Events](#-websocket-events)
- [Setup & Installation](#-setup--installation)
- [Development Workflow](#-development-workflow)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)

---

## 🎯 Overview

### The Problem
Development teams waste time context-switching between multiple tools:
- GitHub for PRs and code reviews
- Vercel/Railway for deployment status
- DataDog/monitoring tools for infrastructure
- Slack for notifications

### The Solution
**Pulsar Dev** aggregates all critical project information into a single, real-time dashboard. Know what's happening across all your projects without switching tabs.

### Key Value Propositions
1. **Real-time updates** - See changes as they happen via WebSocket
2. **Single pane of glass** - All project data in one place
3. **Extensible** - Plugin architecture for adding new integrations
4. **Free & open source** - Self-host or use our hosted version

---

## 🛠 Tech Stack

### Backend
- **Language:** Go 1.21+
- **HTTP Framework:** Chi (lightweight, idiomatic router)
- **WebSocket:** gorilla/websocket
- **Database:** Neon PostgreSQL (serverless)
- **Cache/Pub-Sub:** Redis (Upstash for production)
- **Database Driver:** pgx/v5
- **Migrations:** golang-migrate

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **State Management:** 
  - React Query/TanStack Query (server state)
  - Zustand (UI state)
- **UI Library:** shadcn/ui + Tailwind CSS
- **WebSocket Client:** Native WebSocket API

### Infrastructure
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Railway
- **Database:** Neon (managed PostgreSQL)
- **Redis:** Upstash (serverless Redis)
- **CI/CD:** GitHub Actions
- **Containerization:** Docker + Docker Compose (local dev)

### External Integrations
- **GitHub API** (primary integration)
- **Vercel API** (future)
- **Railway API** (future)
- **Custom webhook support** (future)

---

## 🏗 Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Next.js Frontend (React)                     │   │
│  │  - Dashboard UI                                      │   │
│  │  - WebSocket Client                                  │   │
│  │  - React Query (caching)                             │   │
│  │  - Zustand (UI state)                                │   │
│  └────────────┬─────────────────────────┬────────────────┘   │
└───────────────┼─────────────────────────┼────────────────────┘
                │ HTTP/REST                │ WebSocket
                │                          │
┌───────────────▼─────────────────────────▼────────────────────┐
│                    Go Backend (Railway)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  REST API    │  │  WebSocket   │  │    Auth      │      │
│  │  (Chi)       │  │  Hub         │  │  Middleware  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
│         │                  │                                  │
│  ┌──────▼──────────────────▼──────────────────────────┐     │
│  │           Application Services                      │     │
│  │  - ProjectService                                   │     │
│  │  - IntegrationService                               │     │
│  │  - MetricsService                                   │     │
│  │  - WebSocketService                                 │     │
│  └──────┬──────────────────────────────────────────────┘     │
│         │                                                     │
│  ┌──────▼──────────────────────────────────────────────┐    │
│  │         Background Workers (Go routines)            │    │
│  │  - GitHub Poller (polls every 30-60s)               │    │
│  │  - Deployment Poller (future)                       │    │
│  │  - Custom Integration Pollers                       │    │
│  └──────┬──────────────────────────────────────────────┘    │
└─────────┼──────────────────────────────────────────────────────┘
          │
┌─────────▼──────────────────────────────────────────────────┐
│                    Data Layer                               │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │    Neon      │  │    Redis     │                        │
│  │ PostgreSQL   │  │  (Upstash)   │                        │
│  │              │  │              │                        │
│  │ - Projects   │  │ - Cache      │                        │
│  │ - Users      │  │ - Pub/Sub    │                        │
│  │ - Metrics    │  │ - Sessions   │                        │
│  └──────┬───────┘  └──────┬───────┘                        │
└─────────┼──────────────────┼────────────────────────────────┘
          │                  │
          │         ┌────────▼────────┐
          │         │ Redis Pub/Sub   │
          │         │   Channel       │
          │         └────────┬────────┘
          │                  │
          └──────────────────┘
                    │
          ┌─────────▼─────────┐
          │  External APIs    │
          │  - GitHub         │
          │  - Vercel         │
          │  - Railway        │
          └───────────────────┘
```

### Data Flow: Real-Time Update

This is how a GitHub PR update flows through the system:

```
1. [GitHub Poller Worker]
   └─> Polls GitHub API every 30 seconds
   └─> GET /repos/:owner/:repo/pulls?state=open
   
2. [GitHub Poller Worker]
   └─> Detects new PR #42 opened
   └─> Compares with last known state in PostgreSQL
   
3. [GitHub Poller Worker]
   └─> Saves to Neon PostgreSQL
   └─> INSERT INTO pull_requests (...)
   
4. [GitHub Poller Worker]
   └─> Publishes event to Redis
   └─> PUBLISH "project:123:events" '{"type":"pr_opened","pr_id":42,...}'
   
5. [WebSocket Hub]
   └─> Subscribed to Redis channel
   └─> Receives event via Redis Pub/Sub
   
6. [WebSocket Hub]
   └─> Identifies relevant connected clients
   └─> Filters by project_id and user permissions
   
7. [WebSocket Hub]
   └─> Broadcasts to connected clients
   └─> ws.Send({"type":"pr_opened","data":{...}})
   
8. [Frontend - React]
   └─> WebSocket client receives message
   └─> React Query cache invalidated
   └─> UI re-renders with new PR
   └─> User sees update instantly (< 1 second from GitHub change)
```

### Component Responsibilities

#### Backend Components

**1. HTTP Server (Chi Router)**
- Handle REST API requests
- Serve API endpoints
- Authentication middleware
- CORS handling
- Request validation

**2. WebSocket Hub**
- Manage WebSocket connections
- Route messages to correct clients
- Handle connection lifecycle
- Implement heartbeat (ping/pong)
- User/project-based message filtering

**3. Application Services**
- Business logic layer
- Database operations (CRUD)
- Integration orchestration
- Data transformation
- Permission checks

**4. Background Workers**
- Poll external APIs (GitHub, etc.)
- Process and transform data
- Save to database
- Publish events to Redis
- Handle rate limits and retries

**5. Redis Subscriber**
- Listen to Redis pub/sub channels
- Forward events to WebSocket Hub
- Decouple workers from WebSocket server

#### Frontend Components

**1. Next.js App Router**
- Server-side rendering
- API routes (optional proxy)
- Authentication handling
- Route protection

**2. React Query**
- Server state management
- Automatic caching
- Background refetching
- Optimistic updates
- Cache invalidation on WebSocket events

**3. Zustand Store**
- UI state (modals, filters, etc.)
- WebSocket connection status
- User preferences
- Temporary UI state

**4. WebSocket Client**
- Maintain connection to backend
- Reconnect on disconnect
- Trigger React Query invalidation
- Handle incoming real-time events

---

## ✨ Features

### MVP Features (Phase 1)
- ✅ User authentication (GitHub OAuth)
- ✅ Project management (create, list, view)
- ✅ GitHub integration
  - Repository connection
  - Pull request listing
  - PR status (open, merged, closed)
  - Recent commits
  - Workflow run status
- ✅ Real-time updates via WebSocket
- ✅ Dashboard UI
  - Project overview
  - Activity feed
  - PR queue
  - Build status widgets

### Future Features (Phase 2+)
- 📅 Deployment tracking (Vercel, Railway)
- 📅 Infrastructure metrics (error rates, response times)
- 📅 Team activity analytics
- 📅 Custom webhook support
- 📅 Slack/Discord notifications
- 📅 Plugin system for custom integrations
- 📅 Mobile app (React Native)

---

## 📁 Project Structure

```
pulsar-dev/
├── backend/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go              # Entry point
│   ├── internal/
│   │   ├── api/
│   │   │   ├── handlers/            # HTTP handlers
│   │   │   │   ├── auth.go
│   │   │   │   ├── projects.go
│   │   │   │   ├── integrations.go
│   │   │   │   └── metrics.go
│   │   │   ├── middleware/          # Auth, CORS, logging
│   │   │   └── router.go            # Chi router setup
│   │   ├── websocket/
│   │   │   ├── hub.go               # Connection manager
│   │   │   ├── client.go            # Individual connection
│   │   │   └── message.go           # Message types
│   │   ├── services/
│   │   │   ├── project.go           # Project business logic
│   │   │   ├── integration.go       # Integration logic
│   │   │   ├── metrics.go           # Metrics processing
│   │   │   └── auth.go              # Auth logic
│   │   ├── workers/
│   │   │   ├── github_poller.go     # GitHub API polling
│   │   │   ├── coordinator.go       # Worker management
│   │   │   └── publisher.go         # Redis publishing
│   │   ├── integrations/
│   │   │   ├── github/              # GitHub API client
│   │   │   │   ├── client.go
│   │   │   │   ├── pulls.go
│   │   │   │   └── workflows.go
│   │   │   └── registry.go          # Integration registry
│   │   ├── models/
│   │   │   ├── project.go
│   │   │   ├── user.go
│   │   │   ├── integration.go
│   │   │   └── metric.go
│   │   ├── database/
│   │   │   ├── db.go                # Database connection
│   │   │   └── queries.go           # SQL queries
│   │   └── config/
│   │       └── config.go            # Configuration
│   ├── migrations/
│   │   ├── 000001_init_schema.up.sql
│   │   ├── 000001_init_schema.down.sql
│   │   ├── 000002_add_integrations.up.sql
│   │   └── 000002_add_integrations.down.sql
│   ├── pkg/                         # Public packages (if any)
│   ├── go.mod
│   ├── go.sum
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx             # Landing page
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx         # Dashboard home
│   │   │   │   └── [projectId]/
│   │   │   │       └── page.tsx     # Project detail
│   │   │   └── api/                 # API routes (if needed)
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── dashboard/
│   │   │   │   ├── ProjectCard.tsx
│   │   │   │   ├── PRList.tsx
│   │   │   │   ├── ActivityFeed.tsx
│   │   │   │   └── MetricWidget.tsx
│   │   │   └── layout/
│   │   │       ├── Sidebar.tsx
│   │   │       └── Header.tsx
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts      # WebSocket hook
│   │   │   ├── useProjects.ts       # React Query hooks
│   │   │   └── useAuth.ts
│   │   ├── lib/
│   │   │   ├── api.ts               # API client
│   │   │   ├── websocket.ts         # WebSocket client
│   │   │   └── utils.ts
│   │   └── store/
│   │       └── uiStore.ts           # Zustand store
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── .env.local.example
├── docker-compose.yml               # Local development
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       └── frontend-ci.yml
├── README.md
└── .gitignore
```

---

## 🗄 Database Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    github_id TEXT UNIQUE,
    github_username TEXT,
    avatar_url TEXT,
    access_token TEXT,  -- Encrypted GitHub OAuth token
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_github_id ON users(github_id);
CREATE INDEX idx_users_email ON users(email);
```

#### projects
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_owner ON projects(owner_id);
```

#### integrations
```sql
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL,  -- 'github', 'vercel', 'railway', etc.
    config JSONB NOT NULL,  -- { "repo": "owner/repo", "token": "..." }
    enabled BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(project_id, type)  -- One integration of each type per project
);

CREATE INDEX idx_integrations_project ON integrations(project_id);
CREATE INDEX idx_integrations_type ON integrations(type);
```

#### pull_requests
```sql
CREATE TABLE pull_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    pr_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    state TEXT NOT NULL,  -- 'open', 'closed', 'merged'
    author TEXT NOT NULL,
    author_avatar TEXT,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    merged_at TIMESTAMPTZ,
    
    UNIQUE(integration_id, pr_number)
);

CREATE INDEX idx_prs_project ON pull_requests(project_id);
CREATE INDEX idx_prs_state ON pull_requests(state);
CREATE INDEX idx_prs_updated ON pull_requests(updated_at DESC);
```

#### workflow_runs
```sql
CREATE TABLE workflow_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    run_id BIGINT NOT NULL,  -- GitHub's workflow run ID
    name TEXT NOT NULL,
    status TEXT NOT NULL,  -- 'queued', 'in_progress', 'completed'
    conclusion TEXT,  -- 'success', 'failure', 'cancelled', etc.
    workflow_name TEXT NOT NULL,
    branch TEXT,
    commit_sha TEXT,
    url TEXT NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(integration_id, run_id)
);

CREATE INDEX idx_runs_project ON workflow_runs(project_id);
CREATE INDEX idx_runs_status ON workflow_runs(status);
CREATE INDEX idx_runs_started ON workflow_runs(started_at DESC);
```

#### metrics
```sql
-- Time-series metrics data
CREATE TABLE metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,  -- 'pr_count', 'build_success_rate', etc.
    value JSONB NOT NULL,  -- Flexible storage for different metric shapes
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_metrics_project_type_time 
    ON metrics(project_id, metric_type, timestamp DESC);

-- Optional: Partition by month for better performance
-- CREATE TABLE metrics_2025_02 PARTITION OF metrics
--     FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

#### project_members (for team features - future)
```sql
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',  -- 'owner', 'admin', 'member'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_members_project ON project_members(project_id);
CREATE INDEX idx_members_user ON project_members(user_id);
```

### Database Migrations

Use `golang-migrate` for schema management:

```bash
# Create new migration
migrate create -ext sql -dir migrations -seq add_deployments_table

# Apply migrations
migrate -path ./migrations -database "$DATABASE_URL" up

# Rollback
migrate -path ./migrations -database "$DATABASE_URL" down 1
```

---

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/github                 # Initiate GitHub OAuth
GET    /api/auth/github/callback        # GitHub OAuth callback
POST   /api/auth/logout                 # Logout
GET    /api/auth/me                     # Get current user
```

### Projects

```
GET    /api/projects                    # List user's projects
POST   /api/projects                    # Create new project
GET    /api/projects/:id                # Get project details
PATCH  /api/projects/:id                # Update project
DELETE /api/projects/:id                # Delete project
```

### Integrations

```
GET    /api/projects/:id/integrations                # List project integrations
POST   /api/projects/:id/integrations                # Add integration
GET    /api/projects/:id/integrations/:type          # Get specific integration
PATCH  /api/projects/:id/integrations/:type          # Update integration
DELETE /api/projects/:id/integrations/:type          # Remove integration
POST   /api/projects/:id/integrations/:type/sync     # Trigger manual sync
```

### Metrics & Data

```
GET    /api/projects/:id/pull-requests  # List PRs
GET    /api/projects/:id/workflows      # List workflow runs
GET    /api/projects/:id/metrics        # Get project metrics
GET    /api/projects/:id/activity       # Get activity feed
```

### WebSocket

```
GET    /ws                               # WebSocket upgrade endpoint
                                         # Query params: ?token=<jwt_token>
```

### Example Request/Response

**Create Project:**
```http
POST /api/projects
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "name": "My Awesome Project",
  "description": "Backend services for our app"
}
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "My Awesome Project",
  "description": "Backend services for our app",
  "owner_id": "987fbc97-4bed-5078-9f07-9141ba07c9f3",
  "created_at": "2025-02-18T10:30:00Z",
  "updated_at": "2025-02-18T10:30:00Z"
}
```

**Add GitHub Integration:**
```http
POST /api/projects/:id/integrations
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "type": "github",
  "config": {
    "repo": "owner/repository-name"
  }
}
```

Response:
```json
{
  "id": "456e7890-e89b-12d3-a456-426614174111",
  "project_id": "123e4567-e89b-12d3-a456-426614174000",
  "type": "github",
  "config": {
    "repo": "owner/repository-name"
  },
  "enabled": true,
  "created_at": "2025-02-18T10:35:00Z"
}
```

---

## 🔴 WebSocket Events

### Connection

Client connects to `/ws` with JWT token:
```javascript
const ws = new WebSocket('wss://api.pulsardev.io/ws?token=<jwt_token>');
```

### Server → Client Events

All events follow this structure:
```typescript
interface WebSocketMessage {
  type: string;           // Event type
  project_id: string;     // Associated project
  data: any;              // Event-specific payload
  timestamp: number;      // Unix timestamp
}
```

#### Event Types

**1. Pull Request Events**
```json
{
  "type": "pr_opened",
  "project_id": "123e4567-e89b-12d3-a456-426614174000",
  "data": {
    "pr_number": 42,
    "title": "Add user authentication",
    "author": "johndoe",
    "url": "https://github.com/owner/repo/pull/42"
  },
  "timestamp": 1708257600
}
```

Event types: `pr_opened`, `pr_closed`, `pr_merged`, `pr_updated`

**2. Workflow Events**
```json
{
  "type": "workflow_completed",
  "project_id": "123e4567-e89b-12d3-a456-426614174000",
  "data": {
    "workflow_name": "CI",
    "status": "completed",
    "conclusion": "success",
    "url": "https://github.com/owner/repo/actions/runs/12345"
  },
  "timestamp": 1708257600
}
```

Event types: `workflow_started`, `workflow_completed`, `workflow_failed`

**3. Metric Updates**
```json
{
  "type": "metric_update",
  "project_id": "123e4567-e89b-12d3-a456-426614174000",
  "data": {
    "metric_type": "pr_count",
    "value": {
      "open": 5,
      "merged_today": 3
    }
  },
  "timestamp": 1708257600
}
```

**4. Integration Sync**
```json
{
  "type": "integration_synced",
  "project_id": "123e4567-e89b-12d3-a456-426614174000",
  "data": {
    "integration_type": "github",
    "items_updated": 15,
    "last_synced_at": "2025-02-18T10:45:00Z"
  },
  "timestamp": 1708257600
}
```

### Client → Server Events (Optional)

For future features like marking notifications as read:
```json
{
  "type": "mark_read",
  "data": {
    "notification_id": "abc123"
  }
}
```

### Heartbeat (Ping/Pong)

Server sends ping every 30 seconds. Client must respond with pong to maintain connection.

---

## 🚀 Setup & Installation

### Prerequisites

- **Go 1.21+**
- **Node.js 18+** and npm/yarn/pnpm
- **Docker & Docker Compose** (for local development)
- **Neon account** (free tier)
- **Upstash account** (free tier) or local Redis
- **GitHub OAuth App** credentials

### 1. Clone Repository

```bash
git clone https://github.com/MRQ67/pulsar-dev.git
cd pulsar-dev
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
go mod download

# Copy environment file
cp .env.example .env

# Edit .env with your credentials:
# - DATABASE_URL (Neon connection string)
# - REDIS_URL (Upstash or local Redis)
# - GITHUB_CLIENT_ID
# - GITHUB_CLIENT_SECRET
# - JWT_SECRET

# Run migrations
migrate -path ./migrations -database "$DATABASE_URL" up

# Start backend
go run cmd/server/main.go
```

Backend will run on `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install  # or: yarn / pnpm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:8080
# NEXT_PUBLIC_WS_URL=ws://localhost:8080

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Local Development with Docker Compose

```bash
# From project root
docker-compose up -d

# This starts:
# - PostgreSQL (local, for dev)
# - Redis (local, for dev)
# - Backend (rebuilds on code changes)
# - Frontend (rebuilds on code changes)
```

### 5. GitHub OAuth Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App:
   - Application name: `Pulsar Dev (Local)`
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `http://localhost:8080/api/auth/github/callback`
3. Copy Client ID and Client Secret to backend `.env`

### Environment Variables

**Backend (.env):**
```env
# Server
PORT=8080
ENVIRONMENT=development

# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Redis
REDIS_URL=redis://localhost:6379

# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:8080/api/auth/github/callback

# JWT
JWT_SECRET=your-super-secret-key-change-this

# CORS
CORS_ORIGINS=http://localhost:3000

# Workers
GITHUB_POLL_INTERVAL=30  # seconds
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

---

## 💻 Development Workflow

### Running Locally

**Option 1: Manual (Recommended for development)**
```bash
# Terminal 1: Backend
cd backend
go run cmd/server/main.go

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Redis (if not using Upstash)
redis-server
```

**Option 2: Docker Compose**
```bash
docker-compose up
```

### Making Database Changes

1. Create migration:
```bash
migrate create -ext sql -dir migrations -seq add_new_table
```

2. Write up migration (`migrations/000X_add_new_table.up.sql`)
3. Write down migration (`migrations/000X_add_new_table.down.sql`)
4. Apply migration:
```bash
migrate -path ./migrations -database "$DATABASE_URL" up
```

### Testing

**Backend:**
```bash
cd backend
go test ./...

# With coverage
go test -cover ./...

# Specific package
go test ./internal/services
```

**Frontend:**
```bash
cd frontend
npm test

# Watch mode
npm test -- --watch
```

### Code Quality

**Backend:**
```bash
# Format
go fmt ./...

# Lint
golangci-lint run

# Vet
go vet ./...
```

**Frontend:**
```bash
# Format
npm run format

# Lint
npm run lint

# Type check
npm run type-check
```

---

## 🚢 Deployment

### Backend (Railway)

1. **Create Railway project:**
```bash
railway init
```

2. **Add Neon database:**
   - Link existing Neon database
   - Or create new PostgreSQL instance

3. **Add Redis:**
   - Use Upstash (recommended - serverless)
   - Or Railway Redis plugin

4. **Deploy backend:**
```bash
railway up
```

5. **Set environment variables in Railway dashboard:**
   - All variables from `.env`
   - Update `GITHUB_CALLBACK_URL` to production URL

### Frontend (Vercel)

1. **Connect GitHub repository:**
   - Import project on Vercel dashboard
   - Select `frontend` directory as root

2. **Configure build:**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Set environment variables:**
   - `NEXT_PUBLIC_API_URL`: Railway backend URL
   - `NEXT_PUBLIC_WS_URL`: Railway WebSocket URL (wss://)

4. **Deploy:**
   - Automatic on push to main branch

### Database Migrations in Production

**Using Railway CLI:**
```bash
railway run migrate -path ./migrations -database "$DATABASE_URL" up
```

**Or use Neon branching:**
1. Create branch: `migration-test`
2. Test migration on branch
3. Merge to main if successful

### CI/CD with GitHub Actions

**Backend CI (`.github/workflows/backend-ci.yml`):**
```yaml
name: Backend CI

on:
  push:
    branches: [main, develop]
    paths:
      - 'backend/**'
  pull_request:
    paths:
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v4
        with:
          go-version: '1.21'
      - name: Run tests
        working-directory: ./backend
        run: go test -v ./...
```

**Frontend CI (`.github/workflows/frontend-ci.yml`):**
```yaml
name: Frontend CI

on:
  push:
    branches: [main, develop]
    paths:
      - 'frontend/**'
  pull_request:
    paths:
      - 'frontend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      - name: Run tests
        working-directory: ./frontend
        run: npm test
      - name: Build
        working-directory: ./frontend
        run: npm run build
```

---

## 🗺 Roadmap

### Phase 1: MVP (6-8 weeks)
- [x] Project architecture & planning
- [ ] Backend foundation
  - [ ] Chi HTTP server
  - [ ] WebSocket Hub
  - [ ] Neon PostgreSQL connection
  - [ ] Redis pub/sub
- [ ] GitHub integration
  - [ ] OAuth authentication
  - [ ] Repository connection
  - [ ] PR fetching
  - [ ] Workflow status
  - [ ] Background poller
- [ ] Frontend dashboard
  - [ ] Authentication flow
  - [ ] Project list/create
  - [ ] Dashboard UI
  - [ ] Real-time updates
- [ ] Deployment to Railway + Vercel

### Phase 2: Enhanced Features (4-6 weeks)
- [ ] Vercel integration (deployments)
- [ ] Railway integration (deployments)
- [ ] Team collaboration
  - [ ] Invite team members
  - [ ] Role-based permissions
- [ ] Notifications
  - [ ] In-app notifications
  - [ ] Email notifications (optional)
- [ ] Analytics
  - [ ] PR metrics (cycle time, review time)
  - [ ] Deployment frequency
  - [ ] Build success rates

### Phase 3: Advanced Features (TBD)
- [ ] Custom webhooks
- [ ] Plugin system
- [ ] Slack/Discord integration
- [ ] API for third-party integrations
- [ ] Mobile app (React Native)
- [ ] Self-hosted version with Docker

### GSoC Integration (March-April 2025)
- [ ] Identify target organizations
- [ ] Contribute to related open source projects
- [ ] Submit GSoC proposal based on Pulsar Dev
- [ ] Integrate Pulsar Dev with GSoC org's ecosystem

---

## 📚 Key Implementation Details

### Authentication Flow

1. User clicks "Sign in with GitHub" on frontend
2. Frontend redirects to `/api/auth/github`
3. Backend redirects to GitHub OAuth
4. User authorizes app
5. GitHub redirects to `/api/auth/github/callback`
6. Backend:
   - Exchanges code for access token
   - Fetches user info from GitHub
   - Creates/updates user in database
   - Generates JWT token
   - Redirects to frontend with JWT
7. Frontend stores JWT in localStorage
8. All subsequent requests include JWT in Authorization header

### Worker Coordination

```go
// Simplified coordinator example
type WorkerCoordinator struct {
    db          *sql.DB
    redis       *redis.Client
    workers     map[string]*Worker
    workerPool  chan struct{}  // Limit concurrent workers
}

func (c *WorkerCoordinator) Start() {
    // Fetch all active integrations
    integrations := c.fetchActiveIntegrations()
    
    // Start worker for each integration
    for _, integration := range integrations {
        go c.startWorker(integration)
    }
    
    // Monitor for new integrations
    ticker := time.NewTicker(1 * time.Minute)
    for range ticker.C {
        c.checkForNewIntegrations()
    }
}

func (c *WorkerCoordinator) startWorker(integration Integration) {
    worker := NewGitHubPoller(integration, c.redis)
    c.workers[integration.ID] = worker
    worker.Start()
}
```

### Redis Pub/Sub Pattern

```go
// Publisher (in worker)
func (w *GitHubPoller) publishEvent(eventType string, data interface{}) {
    event := Event{
        Type:      eventType,
        ProjectID: w.projectID,
        Data:      data,
        Timestamp: time.Now().Unix(),
    }
    
    payload, _ := json.Marshal(event)
    channel := fmt.Sprintf("project:%s:events", w.projectID)
    
    w.redis.Publish(ctx, channel, payload)
}

// Subscriber (in WebSocket server)
func subscribeToEvents(hub *Hub, redis *redis.Client) {
    pubsub := redis.Subscribe(ctx, "project:*:events")
    ch := pubsub.Channel()
    
    for msg := range ch {
        var event Event
        json.Unmarshal([]byte(msg.Payload), &event)
        
        // Broadcast to WebSocket clients
        hub.BroadcastToProject(event.ProjectID, event.Type, event.Data)
    }
}
```

### React Query Integration

```typescript
// hooks/useProjects.ts
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// hooks/useWebSocket.ts with React Query integration
export function useWebSocket() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      // Invalidate relevant queries on real-time updates
      if (message.type === 'pr_opened') {
        queryClient.invalidateQueries(['projects', message.project_id, 'prs']);
      }
      
      if (message.type === 'workflow_completed') {
        queryClient.invalidateQueries(['projects', message.project_id, 'workflows']);
      }
    };
    
    return () => ws.close();
  }, [queryClient]);
}
```

---

## 🎓 Learning Resources

### Go Resources
- [Go by Example](https://gobyexample.com/)
- [Effective Go](https://go.dev/doc/effective_go)
- [Chi Router Documentation](https://github.com/go-chi/chi)
- [gorilla/websocket Documentation](https://pkg.go.dev/github.com/gorilla/websocket)

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

### Database Resources
- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [golang-migrate Guide](https://github.com/golang-migrate/migrate)

### Architecture Resources
- [WebSocket Best Practices](https://ably.com/topic/websockets)
- [Redis Pub/Sub Guide](https://redis.io/docs/manual/pubsub/)
- [REST API Design](https://restfulapi.net/)

---

## 🤝 Contributing

This is a personal learning project, but suggestions and feedback are welcome!

### Development Principles
1. **Keep it simple** - Don't over-engineer
2. **Ship fast** - MVP over perfect
3. **Document as you go** - Future you will thank you
4. **Test what matters** - Core logic, not every line
5. **Learn by doing** - Experiment and iterate

---

## 📝 License

MIT License - feel free to use this for learning or building your own projects.

---

## 👤 Author

**Abdellah Qadi**
- GitHub: [@MRQ67](https://github.com/MRQ67)
- Website: [aa3.site](https://aa3.site)
- Twitter: [@HimoNotting](https://twitter.com/HimoNotting)

---

## 🙏 Acknowledgments

Built as a learning project for GSoC 2025 preparation and contract work opportunities.

Special thanks to the Go, React, and open-source communities for excellent tools and documentation.

---

**Ready to build? Start with the backend setup and let's ship this! 🚀**