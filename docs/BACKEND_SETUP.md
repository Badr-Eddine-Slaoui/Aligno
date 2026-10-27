# Backend Setup and Layered Architecture

This document describes the design patterns, environment setup, and deployment configurations of the Aligno backend.

---

## 1. Directory Layout & Layered Architecture

The backend code is structured in `server/` following a clean architecture pattern:

* **DTOs (`dto/`)**: Define typescript contracts for inputs.
* **Validations (`validations/`)**: Input schema verification using Zod.
* **Controllers (`controller/`)**: Parse HTTP context, invoke business services, and output clean JSON envelopes.
* **Services (`service/`)**: Central business logic orchestrators.
* **Repositories (`repository/`)**: Database query operations via Prisma.
* **Mappers (`mapper/`)**: Clear mappings between database entities and application-layer models.

---

## 2. Infrastructure Setup (Docker & Services)

Infrastructure runs via Docker Compose with the following services:
* **`postgres_db`**: PostgreSQL v17 database engine.
* **`redis`**: Redis caching, notifications broker, and BullMQ backend.
* **`pgadmin`**: Database UI dashboard.
* **`app`**: Nuxt Dev server running on port `4000`.

---

## 3. Deployment commands

* Build and launch: `docker compose up --build -d`
* Apply database migrations: `docker compose exec -T app npx prisma migrate dev`
* Run database seed: `docker compose exec -T app npx prisma db seed`
