# Secure Backend Authentication Module — Technical Documentation

A complete, production-ready, and secure authentication system for the **Aligno** Nuxt 4 backend. This document is the single source of truth for the auth module's architecture, file inventory, data model, API contract, security controls, middleware behaviour, validation rules, email templates, testing strategy, CI/CD pipeline, and operational commands.

---

## 1. System Architecture

The module enforces a strict **layered architecture** that decouples HTTP concerns from domain logic and data persistence:

```
[ HTTP Client / Swagger UI ]
             │
             ▼
      [ Route Handler ]    server/api/auth/*            ← HTTP verb, path, OpenAPI spec
             │
             ▼
        [ Controller ]     server/controller/auth.controller.ts  ← Input parsing, Zod validation, cookie management, response envelope
             │
             ▼
          [ Service ]      server/service/auth.service.ts        ← Domain rules, password hashing, token orchestration
             │
             ├──────────►  [ Token Service ]   server/service/token.service.ts   ← JWT sign / verify
             ├──────────►  [ Email Service ]   server/service/email.service.ts   ← Resend transactional emails
             └──────────►  [ Upload Service ]  server/service/upload.service.ts  ← Sharp image processing
             │
             ▼
        [ Repository ]     server/repository/user.repository.ts  ← Prisma queries implementing the DAO
             │
             ▼
           [ DAO ]         server/dao/user.dao.ts                ← Interface contract (IUserDAO)
             │
             ▼
     [ Prisma Client ]     server/utils/prisma.ts                ← PrismaClient + pg adapter pool
```

---

## 2. Complete File Inventory

### Route Handlers (`server/api/auth/`)
| File | Method | Purpose |
| :--- | :--- | :--- |
| `register.post.ts` | `POST` | Registration with `multipart/form-data` and full OpenAPI specification |
| `login.post.ts` | `POST` | Email/password authentication with OpenAPI specification |
| `me.get.ts` | `GET` | Retrieve authenticated user profile |
| `logout.post.ts` | `POST` | Invalidate session and clear cookies |
| `email/validation.post.ts` | `POST` | Verify email address via token |
| `forgot-password.post.ts` | `POST` | Request password reset email |
| `reset-password.post.ts` | `POST` | Execute password reset with token |

### Core Layers
| File | Responsibility |
| :--- | :--- |
| `server/controller/auth.controller.ts` | Request parsing, Zod validation, cookie management, error formatting |
| `server/service/auth.service.ts` | Domain logic: registration, login, logout, email verification, password reset |
| `server/service/token.service.ts` | JWT access/refresh token generation and verification |
| `server/service/email.service.ts` | Transactional email dispatch via Resend (verification + password reset) |
| `server/service/upload.service.ts` | Profile picture processing via Sharp (resize, WebP conversion) |
| `server/repository/user.repository.ts` | Prisma-backed implementation of `IUserDAO` |
| `server/dao/user.dao.ts` | Data access interface contract |
| `server/dto/auth.dto.ts` | TypeScript DTOs for request/response type safety |
| `server/mapper/user.mapper.ts` | Strips sensitive fields from Prisma `User` → `UserResponseDto` |
| `server/validations/auth.zod.ts` | Zod schemas for all endpoint payloads |
| `server/middleware/auth.ts` | Auth middleware (protected routes) and guest middleware (guest-only routes) |

### Email Templates
| File | Description |
| :--- | :--- |
| `server/emails/VerificationEmail.ts` | Vue Email component for account verification (24h expiry) |
| `server/emails/PasswordResetEmail.ts` | Vue Email component for password recovery (1h expiry) |

### Utilities
| File | Description |
| :--- | :--- |
| `server/utils/prisma.ts` | Singleton `PrismaClient` with `@prisma/adapter-pg` connection pool |
| `server/utils/crypto.ts` | `generateSecureToken()` (32-byte hex) and `hashToken()` (SHA-256) |
| `server/utils/logger.ts` | Pino logger with `pino-pretty` for development |
| `server/utils/response.ts` | Typed `successResponse()` and `throwApiError()` envelope helpers |
| `server/utils/sentry.ts` | Sentry SDK wrapper (disabled in test environment) |

### Test Suite (`server/test/auth/`)
| File | Coverage |
| :--- | :--- |
| `helpers.ts` | Shared factories: `createVerifiedUser`, `createUnverifiedUser`, `clearDatabase`, `buildFormData` |
| `register.test.ts` | 8 tests — successful registration, duplicate email/phone, validation errors |
| `login.test.ts` | 5 tests — successful login, wrong password, non-existent user, unverified email, validation |
| `me.test.ts` | 3 tests — valid token profile retrieval, missing token, expired token |
| `logout.test.ts` | 2 tests — successful logout, unauthorized access |
| `validation.test.ts` | 3 tests — valid token verification, invalid token, expired token |
| `forgot-password.test.ts` | 3 tests — existing email, non-existent email, validation |
| `reset-password.test.ts` | 4 tests — valid reset, invalid token, expired token, validation |
| `auth-middleware.test.ts` | 5 tests — valid access token, no credentials 401, silent cookie refresh with `X-Access-Token` header, invalid refresh cookie, refresh token DB mismatch |
| `guest-middleware.test.ts` | 2 tests — block authenticated user from login, block from register |

**Total: 35 integration tests across 9 test files.**

---

## 3. Database Schema

Prisma model defined in `prisma/models/user.prisma`, mapped to the `users` table:

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id @default(cuid())` | Primary key |
| `first_name` | `String` | required | User's first name |
| `last_name` | `String` | required | User's last name |
| `age` | `Int` | required | User's age (13–120) |
| `email` | `String` | `@unique` | Login identifier |
| `phone` | `String` | `@unique` | E.164 phone number |
| `password_hash` | `String` | required | Bcrypt hash (12 rounds) |
| `profile_picture_url` | `String?` | optional | WebP avatar path |
| `email_verified` | `Boolean` | `@default(false)` | Verification status |
| `email_verify_token` | `String?` | optional | SHA-256 hashed verification token |
| `email_verify_expires` | `DateTime?` | optional | Token expiry (24 hours) |
| `refresh_token` | `String?` | optional | SHA-256 hashed refresh token |
| `reset_password_token` | `String?` | optional | SHA-256 hashed reset token |
| `reset_password_expires` | `DateTime?` | optional | Token expiry (1 hour) |
| `created_at` | `DateTime` | `@default(now())` | Record creation timestamp |
| `updated_at` | `DateTime` | `@updatedAt` | Last modification timestamp |

---

## 4. API Endpoint Registry

All endpoints are documented in Swagger UI (`/_swagger`) and OpenAPI JSON (`/_openapi.json`).

| Endpoint | Method | Auth | Content Type | Status Codes | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | ❌ Guest Only | `multipart/form-data` | 201, 400, 403, 409, 422 | Register user, upload avatar, send verification email |
| `/api/auth/login` | `POST` | ❌ Guest Only | `application/json` | 200, 401, 403, 422 | Authenticate and issue token pair |
| `/api/auth/me` | `GET` | ✅ Bearer JWT | — | 200, 401, 404 | Fetch sanitized user profile |
| `/api/auth/logout` | `POST` | ✅ Bearer JWT | — | 200, 401 | Clear session and revoke refresh token |
| `/api/auth/email/validation` | `POST` | ❌ Guest Only | `application/json` | 200, 400, 422 | Verify email via token |
| `/api/auth/forgot-password` | `POST` | ❌ Guest Only | `application/json` | 200, 422 | Request password reset email |
| `/api/auth/reset-password` | `POST` | ❌ Guest Only | `application/json` | 200, 400, 422 | Execute password reset |

### Standard Response Envelope
```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "message": "...", "errors": { "field": ["message"] } }
```

---

## 5. Middleware Behaviour

The global auth middleware (`server/middleware/auth.ts`) enforces two distinct route policies:

### Protected Routes (Auth Required)
Routes: `GET /api/auth/me`, `POST /api/auth/logout`

1. Extract `Authorization: Bearer <token>` from the request header.
2. If the access token is **valid**, set `event.context.userId` and proceed.
3. If the access token is **expired or missing**, attempt **silent cookie refresh**:
   - Read `refresh_token` from the HTTP-only cookie.
   - Verify the refresh JWT signature and check the SHA-256 hash against the database.
   - If valid, generate a **new access token**, set it in the `X-Access-Token` response header, and proceed.
   - If invalid or mismatched, return `401 Authentication required`.
4. If no credentials exist at all, return `401 Authentication required`.

### Guest Routes (Unauthenticated Only)
Routes: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/email/validation`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`

1. If a valid `Authorization: Bearer <token>` is present, return `403 Guests only`.
2. If a valid `refresh_token` cookie exists and its hash matches the database, return `403 Guests only`.
3. If neither condition is met, allow the request through.

---

## 6. Validation Rules

All payloads are validated with **Zod** schemas (`server/validations/auth.zod.ts`). Invalid requests return `422` with field-level errors.

### Registration Schema
| Field | Rules |
| :--- | :--- |
| `firstName` | String, 2–50 chars, trimmed |
| `lastName` | String, 2–50 chars, trimmed |
| `age` | Integer, 13–120 |
| `email` | Valid email, lowercased, trimmed |
| `phone` | E.164 format (`+[1-9]\d{1,14}`) |
| `password` | ≥8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character |
| `confirmPassword` | Must match `password` |

### Login Schema
| Field | Rules |
| :--- | :--- |
| `email` | Valid email, lowercased, trimmed |
| `password` | Non-empty string |

### Forgot Password Schema
| Field | Rules |
| :--- | :--- |
| `email` | Valid email, lowercased, trimmed |

### Reset Password Schema
| Field | Rules |
| :--- | :--- |
| `token` | Non-empty string |
| `password` | Same rules as registration password |
| `confirmPassword` | Must match `password` |

### Email Validation Schema
| Field | Rules |
| :--- | :--- |
| `token` | Non-empty string |

---

## 7. Security Controls

| Control | Implementation |
| :--- | :--- |
| **Password Hashing** | Bcrypt with 12 salt rounds. Plaintext is never stored or compared. |
| **Access Token** | Short-lived JWT (15 minutes), signed with `JWT_SECRET`, sent in `Authorization: Bearer` header. |
| **Refresh Token** | Long-lived JWT (30 days), signed with `JWT_REFRESH_SECRET`, stored as an `HttpOnly`, `Secure`, `SameSite=Strict` cookie. Only the SHA-256 hash is stored in the database. |
| **Token Hardening** | Verification and reset tokens generated with `crypto.randomBytes(32)`. Only SHA-256 hashes are persisted — raw tokens are never stored. |
| **Silent Cookie Refresh** | Expired access tokens trigger automatic refresh via the cookie. A new access token is returned in the `X-Access-Token` response header. |
| **Guest Route Shielding** | Authenticated users are blocked from guest-only routes with `403 Guests only` to prevent double-login issues. |
| **Anti-User Enumeration** | `POST /api/auth/forgot-password` returns an identical success response regardless of whether the email exists. |
| **Image Processing** | Profile pictures are compressed via Sharp, resized to 400×400, converted to WebP at 80% quality, and stored to `public/uploads/avatars/`. |
| **Input Sanitization** | All payloads are validated with Zod. Invalid payloads are rejected immediately with `422`. |
| **Sensitive Field Stripping** | `UserMapper.toResponseDto()` strips `passwordHash`, `refreshToken`, `emailVerifyToken`, `resetPasswordToken`, and expiry fields from all API responses. |

---

## 8. Email System

Transactional emails are rendered as Vue components using `vue-email` and dispatched through the **Resend** API.

| Email | Template | Expiry | Trigger |
| :--- | :--- | :--- | :--- |
| Email Verification | `server/emails/VerificationEmail.ts` | 24 hours | User registration |
| Password Reset | `server/emails/PasswordResetEmail.ts` | 1 hour | Forgot password request |

Both templates feature branded Aligno headers with a gradient design, CTA buttons, and copyright footers. In `NODE_ENV=test`, emails are skipped and logged instead.

---

## 9. Observability

### Pino Logging
Every authentication attempt, failure, database operation, and mailing event is logged using structured JSON via Pino.
* **Development**: Colored console output via `pino-pretty`.
* **Production**: Raw JSON objects for monitoring platform ingestion.

### Sentry Exception Tracking
Sentry SDK is loaded across controllers, middlewares, and services (disabled in test environment) to capture:
* Unhandled runtime exceptions
* Database connection failures
* Authentication and middleware errors

---

## 10. Testing Strategy

### Configuration
Tests run using **Vitest v4** with `@nuxt/test-utils/e2e` for full integration testing against a live Nuxt server and PostgreSQL database.

`vitest.config.ts` enforces **sequential file execution** (`fileParallelism: false`) to prevent database race conditions, since all test files share the same Prisma client and database.

Each test file uses `beforeEach(() => clearDatabase())` to ensure isolated, deterministic test runs.

### Test Coverage Summary (35 tests)

| Test File | Tests | Scenarios Covered |
| :--- | :--- | :--- |
| `register.test.ts` | 8 | Successful registration, duplicate email, duplicate phone, missing firstName, invalid email, short password, password mismatch, missing fields |
| `login.test.ts` | 5 | Successful login, non-existent user, wrong password, unverified email, missing email |
| `me.test.ts` | 3 | Valid token, missing token (401), expired token (401) |
| `logout.test.ts` | 2 | Successful logout, unauthorized (401) |
| `validation.test.ts` | 3 | Valid verification token, invalid token, expired token |
| `forgot-password.test.ts` | 3 | Existing email, non-existent email (same response), missing email |
| `reset-password.test.ts` | 4 | Valid reset, invalid token, expired token, missing password |
| `auth-middleware.test.ts` | 5 | Valid access token, no credentials (401), silent refresh with `X-Access-Token` header, invalid refresh cookie (401), refresh token DB mismatch (401) |
| `guest-middleware.test.ts` | 2 | Block authenticated user from login (403), block from register (403) |

---

## 11. Deployment & Infrastructure

### Docker Compose Services

| Service | Container | Health Check |
| :--- | :--- | :--- |
| Nuxt 4 Application | `nuxt` | `curl -f http://localhost:${NUXT_PORT}/` |
| PostgreSQL 17 | `postgres_db` | `pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}` |
| pgAdmin 4 | `pgadmin` | `wget --spider http://localhost:80/` |

Boot order: `db` → `app` → `pgadmin` (enforced via `depends_on` + `service_healthy`).

### CI/CD Pipeline (`.github/workflows/ci.yml`)
Triggers on pull requests to `main` and `dev`:

1. Spin up PostgreSQL 16 service container
2. Install dependencies (`npm ci`)
3. Generate Prisma client and Nuxt types
4. Apply database migrations (`npx prisma migrate deploy`)
5. Run type checks (`npx vue-tsc --noEmit`)
6. Run full test suite (`npm run test` → `vitest run`)

### Pre-Push Hook (`.husky/pre-push`)
Runs the full test suite inside the Docker container before every `git push`:
```bash
docker compose exec -T app npx vitest run
```

---

## 12. Environment Variables

| Variable | Required | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret key for signing access tokens |
| `JWT_REFRESH_SECRET` | ✅ | Secret key for signing refresh tokens |
| `RESEND_API_KEY` | ✅ | Resend API key for transactional emails |
| `APP_URL` | ❌ | Application base URL (default: `http://localhost:4000`) |
| `NODE_ENV` | ❌ | `development`, `production`, or `test` |
| `LOG_LEVEL` | ❌ | Pino log level (default: `info`) |
| `SENTRY_DSN` | ❌ | Sentry DSN for exception tracking |

---

## 13. Commands & Verification

### Start Development Environment
```bash
docker compose up -d
```

### Run Database Migrations
```bash
docker compose exec -T app npx prisma migrate deploy
```

### Run Type Validation
```bash
docker compose exec -T app npx vue-tsc --noEmit
```

### Run Full Test Suite
```bash
docker compose exec -T app npx vitest run
```

### Run a Single Test File
```bash
docker compose exec -T app npx vitest run server/test/auth/login.test.ts
```

### View Swagger Documentation
```
http://localhost:${NUXT_PORT}/_swagger
```

### View OpenAPI JSON Schema
```
http://localhost:${NUXT_PORT}/_openapi.json
```
