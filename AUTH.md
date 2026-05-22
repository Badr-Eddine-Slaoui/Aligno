# Secure Backend Authentication API — Technical Documentation

A complete, production-ready, high-performance, and secure authentication system designed specifically for the Aligno Nuxt 4 backend.

---

## 1. System Architecture

The authentication backend enforces a strict layered pattern that decouples route orchestration from domain logic and data mapping:

```
[ HTTP Client / Swagger UI ]
             │
             ▼
      [ Route Handler ] (server/api/auth/*)
             │
             ▼
        [ Controller ]  (server/controller/auth.controller.ts)
             │
             ▼
          [ Service ]    (server/service/auth.service.ts)
             │
             ├──────────► [ Token Service ]   (server/service/token.service.ts)
             ├──────────► [ Email Service ]   (server/service/email.service.ts)
             └──────────► [ Upload Service ]  (server/service/upload.service.ts)
             │
             ▼
        [ Repository ]   (server/repository/user.repository.ts)
             │
             ▼
           [ DAO ]       (server/dao/user.dao.ts)
             │
             ▼
     [ Prisma Client ]   (Database)
```

### Layer Responsibilities
* **Route Handlers (`server/api/auth/`)**: Define the HTTP verbs, paths, OpenAPI specification, and delegate requests to the controller.
* **Controller (`server/controller/auth.controller.ts`)**: Handles request input parsing, validates payload against Zod schemas, sets HTTP-only cookies, standardizes HTTP status codes, and formats API error envelopes.
* **Service (`server/service/auth.service.ts`)**: Enforces core domain rules, coordinates transaction flows, handles password hashing, and dispatches external mailers/upload workers.
* **Repository (`server/repository/user.repository.ts`)**: Interacts directly with database models through Prisma, completely abstracting the persistence layer from the services.
* **DAO Contract (`server/dao/user.dao.ts`)**: Declares standard data-access interfaces to decouple business operations from the specific ORM tool.
* **Mapper (`server/mapper/user.mapper.ts`)**: Automatically transforms models to sanitize outputs, stripping sensitive database attributes (e.g., password hashes, tokens).

## 2. API Endpoint Registry

All endpoints are fully documented in the Swagger UI (`/_swagger`) and OpenAPI schema (`/_openapi.json`).

| Endpoint | Method | Authentication | Payload Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | ❌ Guest Only | `multipart/form-data` | Registers a new user, processes avatar uploads, and sends verification email. |
| `/api/auth/login` | `POST` | ❌ Guest Only | `application/json` | Authenticates credentials, returns an Access Token, and sets a Refresh Token cookie. |
| `/api/auth/me` | `GET` | ✅ Bearer JWT | None | Retrieves the sanitized user profile. Employs silent cookie refresh if expired. |
| `/api/auth/logout` | `POST` | ✅ Bearer JWT | None | Clears the session state, invalidates active refresh tokens, and deletes cookies. |
| `/api/auth/email/validation` | `POST` | ❌ Guest Only | `application/json` | Verifies the registration token and activates the user account. |
| `/api/auth/forgot-password` | `POST` | ❌ Guest Only | `application/json` | Registers a secure reset token and sends an email via Resend. |
| `/api/auth/reset-password` | `POST` | ❌ Guest Only | `application/json` | Confirms the validity of the reset token and updates the user's password. |

---

## 3. Core Security Controls

* **Cryptographic Hashing:** Uses `bcrypt` (10 rounds) to hash all passwords. Plain text is never stored or compared in-memory directly.
* **Token Pair Architecture:**
  * **Access Token:** Short-lived (15 minutes), signed JWT, passed in the `Authorization: Bearer` header.
  * **Refresh Token:** Long-lived (30 days), stored securely inside the database, and transmitted via an `HttpOnly`, `Secure`, `SameSite=Strict` cookie.
* **Database Token Hardening:** Verification and reset tokens are generated using cryptographically secure random bytes, and their SHA-256 hashes are stored in the database to prevent database leakage exploitation.
* **Silent Cookie Refresh:** When an access token expires, the system automatically checks the refresh cookie, validates it against the database, issues a new access token, and sets it on the response headers.
* **Guest Route Shielding:** Prevents authenticated clients (with valid active Bearer tokens or active refresh cookies) from accessing guest-only routes like register, login, password recovery, and verification, immediately returning a `403 Forbidden` ("Guests only") error to avoid double-login issues.
* **Anti-User Enumeration:** Forgot-password queries return identical success responses regardless of whether the email exists in the database.
* **Sharp Compression:** Profile pictures are compressed via Sharp, converted to WebP format, downscaled, and stored locally.
* **Input Sanitization:** Every request payload is validated using Zod, rejecting invalid fields immediately with 422 HTTP responses.

---

## 4. Systems Monitoring & Observability

### High-Performance Pino Logging
Every transition, authentication attempt, failure, database sync, and mailing operation is logged using JSON-structured, production-ready Pino configurations:
* Standard console output is automatically colored via `pino-pretty` during development.
* Production logs are emitted as structured JSON objects for ingestion by monitoring platforms.

### Sentry Exception Tracking
Sentry SDK is loaded automatically across controllers, middlewares, and services to capture and report:
* Unhandled runtime exceptions.
* Database query connection failures.
* Authentication and registration middleware issues.

---

## 5. Deployment & Health Checks

The dockerized environment features automated container health checks and dependency boot ordering:

* **PostgreSQL (`postgres_db`)**: Monitors database readiness using `pg_isready`.
* **Nuxt Application (`nuxt`)**: Monitors server responsiveness using `curl` and delays execution until the database is fully initialized and healthy.
* **pgAdmin (`pgadmin`)**: Monitors administration board status and boots up sequentially.

---

## 6. Commands & Verification

### Running Type Validation
```bash
docker compose exec -T app npx vue-tsc --noEmit
```

### Running Test Suites

Run the full modular suite (sequentially via `vitest.config.ts` to avoid database races):
```bash
docker compose exec -T app npx vitest run
```

Run a specific endpoint's test file:
```bash
docker compose exec -T app npx vitest run server/test/auth/login.test.ts
```

