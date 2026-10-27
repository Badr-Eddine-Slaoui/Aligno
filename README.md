# Aligno — Work, Time & Finance Planner

Aligno is an all-in-one productivity and lifestyle management system engineered with Nuxt 4, Vue 3, Pinia, Tailwind CSS, Prisma, PostgreSQL, Redis, Socket.IO, and BullMQ.

Unlike separate tools, Aligno unifies task planning, daily schedule templates, and financial tracking under a single, premium glassmorphic interface.

---

## 📁 Architecture Overview

Detailed documentations are organized in the `docs/` folder:
* **[Overall Architecture](docs/OVERALL.md)** — High-level topology, topology diagrams, and module mapping.
* **[Backend Architecture & Setup](docs/BACKEND_SETUP.md)** — Docker setup, migrations, and layered API configuration.
* **[Secure Authentication](docs/AUTH.md)** — Dual-token security, recovery, and silent refresh logic.
* **[Project Management Kanban](docs/PROJECT_MANAGEMENT.md)** — Boards, lists, checklist subtasks, and real-time updates.
* **[Time Management](docs/TIME_MANAGEMENT.md)** — Blueprints, templates, and schedule execution.
* **[Financial Tracking](docs/WALLET.md)** — Income channels, budgets, and balance tracking.

---

## 🛠️ Step-by-Step Installation

### 1. Configure local variables
```bash
cp .env.example .env
```

### 2. Build & Launch Docker Services
```bash
docker compose up --build -d
```

### 3. Migrate and Sync Database
```bash
docker compose exec -T app npx prisma migrate dev
docker compose exec -T app npx prisma db push
```

### 4. Seed Seeders
```bash
docker compose exec -T app npx prisma db seed
```

---

## 🧪 Testing and Verifications

Verify all modules:
```bash
docker compose exec -T app npx vitest run
```
