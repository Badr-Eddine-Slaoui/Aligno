# Aligno Backend Service

Aligno is a full-stack, production-ready backend productivity API engineered with Nuxt 4, Prisma, PostgreSQL, Redis, Socket.IO, and BullMQ. 

Aligno helps users balance time, task, and finances. The backend services power a collaborative workspace offering JWT session management, robust role-based access control, real-time board updates, automated email notifications, and background scheduled worker queues.

---

## 🚀 Key Modules & Architecture

Aligno's backend is divided into two primary, fully-implemented modules following a clean, decoupled layered architecture:

### 1. [Secure Authentication Module (AUTH.md)](file:///home/badr-eddine-slaoui/Documents/Aligno/AUTH.md)
* **Secure Session Handshake**: Double-token protocol leveraging short-lived JWT Access Tokens (Header-scoped) alongside long-lived `HttpOnly`, `Secure`, `SameSite=Strict` Refresh Cookies.
* **Verification & Recoveries**: Multi-phase secure registration with profile picture optimizations, account email verification CTAs, and secure password reset token hashing.
* **Silent Cookie Refresh**: Automatic, frictionless background token exchanges.

### 2. [Project Management Kanban Module (PROJECT_MANAGEMENT.md)](file:///home/badr-eddine-slaoui/Documents/Aligno/PROJECT_MANAGEMENT.md)
* **Collaborative Boards & Roles**: Projects scoped by roles: `ADMIN` (board owners/managers), `MEMBER` (collaborators with card manipulation rights), and `VISITOR` (read-only view access).
* **Board Mutations**: CRUD on lists, cards, checklist subtasks, and custom labels.
* **Drag-and-Drop / Move Updates**: Cards can be dynamically sequenced or moved across columns.
* **Real-time Event Broadcasts**: Structural changes broadcast instantaneously to project rooms using Socket.IO.
* **Automated Due Date Reminders**: Background jobs handled by BullMQ and Redis that send email alerts 1 day prior to card/project deadlines.

---

## 📁 Project Structure

```bash
.
├── .github/workflows/ci.yml       # GitHub Actions CI Workflow
├── .husky/                        # Husky git hooks
├── prisma/
│   ├── migrations/                # Schema migration logs
│   ├── models/                    # Segmented multi-file Prisma models
│   │   ├── card-label.prisma
│   │   ├── kanban-card.prisma
│   │   ├── kanban-column.prisma
│   │   ├── notification.prisma
│   │   ├── project-member.prisma
│   │   ├── project.prisma
│   │   ├── subtask.prisma
│   │   └── user.prisma
│   ├── schema.prisma              # Combined Datasource generator schema
│   └── seeders/                   # Seed fixtures
│       ├── project.ts
│       ├── seed.ts
│       └── user.ts
├── server/
│   ├── api/                       # API HTTP Route Handlers
│   │   ├── auth/                  # Authentication endpoints
│   │   └── project-management/    # Kanban boards & notification endpoints
│   ├── controller/                # Request validation and envelope mapping
│   ├── dao/                       # Data access interface contracts
│   ├── dto/                       # TypeScript request/response structures
│   ├── emails/                    # vue-email branded templates
│   ├── mapper/                    # Entity-to-DTO sanitizers
│   ├── middleware/                # Route security and contextual role controllers
│   ├── repository/                # Prisma-backed query implementations
│   ├── service/                   # Core business logic orchestrators
│   ├── utils/                     # Database, logger, Socket.IO, Redis & queue instances
│   └── test/                      # E2E & integration test suites
│       ├── auth/
│       └── project-management/
├── docker-compose.yml             # Docker infrastructure setup
├── Dockerfile                     # Nuxt server execution target
├── package.json                   # Dependencies listing
└── tsconfig.json                  # Workspace compiler configuration
```

---

## ⚙️ Prerequisites

Ensure you have the following installed locally:
* **Docker & Docker Compose** (Recommended)
* **Node.js LTS** (v20+ or v22+) & `npm`

---

## 🛠️ Step-by-Step Setup

### 1. Configuration Setup
Copy the template variables into your local environment:
```bash
cp .env.example .env
```

Review and adjust `.env` parameters if necessary (default values are ready to connect out-of-the-box inside Docker):
```env
NUXT_PORT=4000
DATABASE_URL="postgresql://postgres:postgres@db:5432/postgres"
REDIS_URL="redis://redis:6379"
REDIS_PORT=6379
JWT_SECRET="super_secret_session_token"
JWT_REFRESH_SECRET="super_secret_refresh_token"
RESEND_API_KEY="re_sampleKey"
```

### 2. Build & Launch Docker Services
Spin up the application server, PostgreSQL 17, Redis, and pgAdmin containers in the background:
```bash
docker compose up --build -d
```

Ensure everything started successfully:
```bash
docker compose ps
```
You should see `nuxt`, `postgres_db`, and `redis` containers running.

### 3. Apply Schema Migrations
Apply the initial table migrations inside the application container:
```bash
docker compose exec -T app npx prisma migrate dev
```

Generate the typed Prisma Client mapping:
```bash
docker compose exec -T app npx prisma generate
```

*(Optional)* If you are working outside the Docker container in a local editor and encounter typing issues, run the local compiler generator once:
```bash
npx prisma generate
```

### 4. Database Seeding
Populate the database with default test users, projects, columns, custom tasks, checklist subtasks, and labels:
```bash
docker compose exec -T app npx prisma db seed
```

Default credentials created:
* **Admin Account**: `admin@example.com` / `SuperSecurePassword123!`
* **Member Account**: `jane.doe@example.com` / `SuperSecurePassword123!`
* **Visitor Account**: `mohamed.slaoui@example.com` / `SuperSecurePassword123!`

---

## 🧪 Running Verifications & Tests

To ensure the backend service layer and integrations are working exactly as expected, run the following verification steps:

### Type Checks
Validate the workspace against TypeScript compiler errors:
```bash
docker compose exec -T app npx vue-tsc --noEmit
```

### Run Tests
Execute the entire integration test suite (covering user login sessions, token exchanges, collaborative permissions, and board operations):
```bash
docker compose exec -T app npx vitest run
```

---

## 🌐 API Exploration

Once the Docker containers are running, explore the backend services locally:
* **API Documentation (Swagger UI)**: Navigate to `http://localhost:4000/_swagger`
* **JSON OpenAPI Specification**: Available at `http://localhost:4000/_openapi.json`
* **pgAdmin Database View**: Access pgAdmin at `http://localhost:5555`