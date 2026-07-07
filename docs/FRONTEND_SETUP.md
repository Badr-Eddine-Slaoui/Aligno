# Aligno — Frontend Setup (Sprint 0)

> **Sprint 0 — Foundation & Shared Components**
>
> Priority: Highest · Start: 2026-06-10 · Due: 2026-06-11
>
> Tags: `frontend`, `architecture`, `shared-components`, `setup`

---

## Table of Contents

- [Overview](#overview)
- [AL-001 — Nuxt Architecture Setup](#al-001--nuxt-architecture-setup)
- [AL-002 — Authentication Infrastructure](#al-002--authentication-infrastructure)
- [AL-003 — Design System Setup](#al-003--design-system-setup)
- [AL-004 — Notification System](#al-004--notification-system)
- [Project Structure](#project-structure)
- [Design Tokens Reference](#design-tokens-reference)
- [Running the Application](#running-the-application)

---

## Overview

Sprint 0 establishes the complete frontend foundation for Aligno. It configures the Nuxt 4 application architecture, shared services, authentication infrastructure, the **Midnight Obsidian** design system, notification system, and development standards required by all modules.

### Dependencies Added

| Package | Purpose |
|:---|:---|
| `@tailwindcss/vite` | Tailwind CSS v4 Vite plugin |
| `tailwindcss` v4 | Utility-first CSS framework |
| `notivue` | Toast notification library |
| `@fontsource-variable/plus-jakarta-sans` | Display font (headings) |
| `@fontsource-variable/hanken-grotesk` | Body font (paragraphs) |
| `@fontsource/jetbrains-mono` | Monospace font (code) |
| `@nuxt/ui` v4 | Nuxt UI component library |
| `@nuxt/icon` | Icon system (Heroicons) |
| `@nuxt/image` | Optimized image handling |
| `@pinia/nuxt` | State management integration |
| `pinia` | Vue store library |
| `pinia-plugin-persistedstate` | Store persistence plugin |

### Dependencies Removed

| Package | Reason |
|:---|:---|
| `@nuxtjs/tailwindcss` | Incompatible with Nuxt UI v4 (Tailwind v3 vs v4 conflict) |

### Nuxt Modules Configuration

```ts
// nuxt.config.ts
modules: [
  '@nuxt/ui',       // UI component library (manages Tailwind v4)
  '@nuxt/icon',     // Icon system
  '@nuxt/image',    // Image optimization
  '@pinia/nuxt',    // State management
  'nuxt-security',  // Security headers
]
```

---

## AL-001 — Nuxt Architecture Setup

> **Priority:** Highest · **Start:** 2026-06-10 · **Due:** 2026-06-10
>
> Configure the Nuxt 4 application architecture including layouts, stores, composables, middleware, services and API communication layer.

### Runtime Configuration

```ts
// nuxt.config.ts → runtimeConfig
runtimeConfig: {
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  resendApiKey: process.env.RESEND_API_KEY,
  appUrl: process.env.APP_URL,
  public: {
    appUrl: process.env.APP_URL || 'http://localhost:4000',
    apiBase: '/api',
  },
}
```

### TypeScript Types (`app/types/index.ts`)

Shared interfaces mirroring backend DTOs:

| Type | Description |
|:---|:---|
| `User` | User profile (id, firstName, lastName, email, phone, age, profilePictureUrl, emailVerified, timestamps) |
| `ApiResponse<T>` | Envelope: `{ success: boolean, data: T }` |
| `ApiError` | Error envelope: `{ statusCode, statusMessage, data? }` |
| `LoginResponse` | `{ accessToken: string, user: User }` |
| `RegisterResponse` | `{ message: string, user: User }` |

### API Communication Layer

#### `app/composables/useApi.ts` — API Client

A `$fetch.create()` wrapper providing:

- **Auto-attach JWT**: Reads `accessToken` from the auth store and sets `Authorization: Bearer <token>` on every request
- **Token rotation**: Intercepts `X-Access-Token` response header to silently update the in-memory access token
- **401 auto-refresh**: On 401 Unauthorized, attempts a silent refresh via `/api/auth/me` (uses HttpOnly refresh cookie), then retries the original request
- **Typed errors**: Throws structured `ApiError` objects

#### `app/services/api.ts` — Typed API Service

Wraps `useApi()` into domain-grouped methods:

```ts
const apiService = useApiService()

// Auth endpoints
apiService.auth.login({ email, password })
apiService.auth.register({ firstName, lastName, email, password, phone, age })
apiService.auth.logout()
apiService.auth.me()
apiService.auth.forgotPassword(email)
apiService.auth.resetPassword({ token, password })
apiService.auth.verifyEmail({ token })
apiService.auth.updateProfile({ firstName, lastName, ... })
```

### Pinia Auth Store (`app/stores/auth.ts`)

| Property | Type | Description |
|:---|:---|:---|
| `user` | `User \| null` | Current authenticated user |
| `accessToken` | `string \| null` | JWT access token (in-memory only, **never persisted**) |
| `isLoading` | `boolean` | Loading state for auth operations |
| `isAuthenticated` | `computed<boolean>` | `!!user && !!accessToken` |

**Actions:** `setUser()`, `setToken()`, `logout()` (clears state + navigates to `/login`)

### Root Component (`app/app.vue`)

```vue
<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- Global Notivue Toast Container with glass styling -->
    <Notivue v-slot="elements">...</Notivue>
  </div>
</template>
```

---

## AL-002 — Authentication Infrastructure

> **Priority:** Highest · **Start:** 2026-06-10 · **Due:** 2026-06-10
>
> Implement JWT handling, session persistence, refresh token flow and authentication middleware.

### Auth Composable (`app/composables/useAuth.ts`)

High-level composable wrapping the auth store + API service:

| Method | Behavior |
|:---|:---|
| `login(payload)` | Calls API → stores user + token → redirects to `/dashboard` |
| `register(payload)` | Calls API → returns response (caller shows "check email" message) |
| `logout()` | Calls API → clears store → redirects to `/login` |
| `fetchUser()` | Calls `/me` → populates store (or logs out on failure) |

**Reactive refs:** `user`, `isAuthenticated`, `isLoading`

### Session Restore Plugin (`app/plugins/auth.client.ts`)

Client-side plugin that runs on app initialization:

1. Attempts `GET /api/auth/me` (sends HttpOnly `refresh_token` cookie)
2. If successful → populates auth store with user data
3. If failed → user remains unauthenticated (no redirect — middleware handles it)

### Route Guards

#### `app/middleware/auth.global.ts` — Global Auth Guard

Runs on every route change (client-side only):

```
Guest routes: /login, /register, /forgot-password, /reset-password, /verify-email

If NOT authenticated AND route is NOT guest → redirect to /login
If authenticated AND route IS guest → redirect to /dashboard
```

#### `app/middleware/guest.ts` — Named Guest Guard

Available as `definePageMeta({ middleware: 'guest' })` for explicit guest-only pages.

### Layouts

| Layout | File | Description |
|:---|:---|:---|
| `auth` | `app/layouts/auth.vue` | Full-viewport dark background, decorative glow orbs (CSS pseudo-elements), centered content area (max-width 480px), Aligno sparkle logo |
| `default` | `app/layouts/default.vue` | Dashboard shell — collapsible glass sidebar (280px → 80px), topbar with notification bell, user profile in sidebar footer, main content area |
| `blank` | `app/layouts/blank.vue` | Minimal — dark background + `<slot />` |

### Auth Pages

| Page | Layout | Key Features |
|:---|:---|:---|
| `login.vue` | `auth` | Email + password form, "Remember me" toggle, forgot password link, register link, form validation, loading state, API error mapping |
| `register.vue` | `auth` | 6-field form (firstName, lastName, email, password, phone, age), grid layout, validation, success → redirect to login |
| `forgot-password.vue` | `auth` | Email input, submit → shows success message regardless (security: no email enumeration) |
| `reset-password.vue` | `auth` | New password + confirm password, token from `?token=` query param |
| `verify-email.vue` | `auth` | Token input field, submit → verifies email → redirect to login with success message |
| `index.vue` | — | Immediate redirect to `/dashboard` |
| `dashboard.vue` | `default` | Placeholder with 3 module preview cards (Task Management, Time Planner, Financial Tracking) |

### Auth Flow Diagram

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  App Init   │────▶│ auth.client.ts   │────▶│ GET /api/auth/me│
│  (plugin)   │     │ (session restore)│     │ (cookie refresh)│
└─────────────┘     └──────────────────┘     └────────┬────────┘
                                                       │
                              ┌─────────────────────────┤
                              │ Success                 │ Failure
                              ▼                         ▼
                    ┌──────────────────┐     ┌─────────────────┐
                    │ Store user +     │     │ User remains    │
                    │ access token     │     │ unauthenticated │
                    └──────────────────┘     └─────────────────┘
                              │                         │
                              ▼                         ▼
                    ┌──────────────────┐     ┌─────────────────┐
                    │ auth.global.ts   │     │ auth.global.ts  │
                    │ → /dashboard     │     │ → /login        │
                    └──────────────────┘     └─────────────────┘
```

### Token Strategy

- **Access Token**: Stored **in-memory only** (Pinia store, not localStorage). 15-minute expiry.
- **Refresh Token**: HttpOnly cookie set by the backend. Used for silent session refresh.
- **Token Rotation**: The backend auth middleware returns a new access token via `X-Access-Token` response header, which the API client intercepts and stores.

---

## AL-003 — Design System Setup

> **Priority:** High · **Start:** 2026-06-10 · **Due:** 2026-06-11
>
> Create reusable UI foundations, design tokens and common components.

### Midnight Obsidian Theme

The design system is called **Midnight Obsidian** — a dark-first theme with glass-morphism effects, cyan accents, and neon glow highlights.

### Design Tokens (`app/assets/css/main.css`)

Tokens are defined using Tailwind CSS v4's `@theme` directive:

#### Typography

| Token | Font | Usage |
|:---|:---|:---|
| `--font-display` | Plus Jakarta Sans Variable | Headings, logos, emphasis |
| `--font-body` | Hanken Grotesk Variable | Body text, paragraphs |
| `--font-mono` | JetBrains Mono | Code blocks, technical data |

#### Surface Colors

| Token | Hex | Usage |
|:---|:---|:---|
| `--color-surface` | `#08132a` | Main background |
| `--color-surface-dim` | `#08132a` | Dimmed surfaces |
| `--color-surface-bright` | `#2f3952` | Elevated surfaces |
| `--color-surface-container` | `#151f37` | Card backgrounds |
| `--color-surface-container-high` | `#1f2942` | Hover states |
| `--color-surface-container-highest` | `#2a344d` | Active states |
| `--color-on-surface` | `#d9e2ff` | Primary text |
| `--color-on-surface-variant` | `#bac9cc` | Secondary text |

#### Primary (Cyan)

| Token | Hex | Usage |
|:---|:---|:---|
| `--color-primary` | `#c3f5ff` | Primary text |
| `--color-primary-container` | `#00e5ff` | Primary accent |
| `--color-on-primary` | `#00363d` | Text on primary |

#### Error

| Token | Hex | Usage |
|:---|:---|:---|
| `--color-error` | `#ffb4ab` | Error text |
| `--color-error-container` | `#93000a` | Error backgrounds |

#### Border Radius

| Token | Value |
|:---|:---|
| `--radius-sm` | `0.25rem` |
| `--radius-DEFAULT` | `0.5rem` |
| `--radius-md` | `0.75rem` |
| `--radius-lg` | `1rem` |
| `--radius-xl` | `1.5rem` |
| `--radius-full` | `9999px` |

### Glassmorphism Utilities

```css
.glass {
  background: rgba(21, 31, 55, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glow-primary {
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);
}
```

### UI Components

| Component | File | Props | Features |
|:---|:---|:---|:---|
| `AppButton` | `app/components/ui/AppButton.vue` | `variant`, `size`, `loading`, `disabled` | Gradient primary, ghost variant, glow hover effect, loading spinner |
| `AppCard` | `app/components/ui/AppCard.vue` | `hover-effect` | Glass background, `#header` / `#footer` slots, optional 1.02x scale hover |
| `AppInput` | `app/components/ui/AppInput.vue` | `modelValue`, `label`, `type`, `error`, `placeholder`, `required` | Semi-transparent fill, cyan focus glow, error state with red border |
| `AppModal` | `app/components/ui/AppModal.vue` | `modelValue` (v-model) | Glass overlay backdrop, centered card, fade + scale transition |
| `AppBadge` | `app/components/ui/AppBadge.vue` | `variant`, `label` | Pill-shaped, color variants (primary, success, warning, error, info) |
| `AppAvatar` | `app/components/ui/AppAvatar.vue` | `src`, `firstName`, `lastName`, `size` | Circular, fallback initials from name, glow ring, sm/md/lg sizes |

### Layout Components

| Component | File | Description |
|:---|:---|:---|
| `AppNotificationBell` | `app/components/layout/AppNotificationBell.vue` | Bell icon with unread count badge, click handler |

> **Note:** The sidebar and topbar are built inline in `app/layouts/default.vue` for simplicity. They can be extracted into standalone `AppSidebar.vue` and `AppTopbar.vue` components if needed.

---

## AL-004 — Notification System

> **Priority:** High · **Start:** 2026-06-11 · **Due:** 2026-06-11
>
> Configure Notivue and create reusable notification infrastructure.

### Notivue Plugin (`app/plugins/notivue.client.ts`)

Client-side plugin initializing Notivue with:

| Setting | Value |
|:---|:---|
| Position | `top-right` |
| Max visible | `5` |
| Enqueue overflow | `true` |
| Deduplicate | `true` |
| Animation | `notivue-bounce` |

### Notification Composable (`app/composables/useNotifications.ts`)

```ts
const notifications = useNotifications()

notifications.success('Operation completed!')  // Cyan/green toast
notifications.error('Something went wrong')     // Red toast
notifications.warning('Be careful')             // Amber toast
notifications.info('FYI')                       // Blue toast
```

Toast styling uses the `.glass` utility class with Midnight Obsidian colors for a consistent dark-theme appearance.

---

## Project Structure

```
app/
├── app.vue                                 # Root component (NuxtLayout + NuxtPage + Notivue)
├── app.config.ts                           # Nuxt UI theme overrides
├── assets/
│   └── css/
│       └── main.css                        # Tailwind v4 @theme tokens + glassmorphism utilities
├── components/
│   ├── ui/
│   │   ├── AppButton.vue                   # Primary/ghost button with glow hover
│   │   ├── AppCard.vue                     # Glass card with header/footer slots
│   │   ├── AppInput.vue                    # Input with label, error state, focus glow
│   │   ├── AppModal.vue                    # Glass overlay modal with transitions
│   │   ├── AppBadge.vue                    # Pill badge with color variants
│   │   └── AppAvatar.vue                   # Circular avatar with fallback initials
│   └── layout/
│       └── AppNotificationBell.vue         # Bell icon with unread badge
├── composables/
│   ├── useApi.ts                           # $fetch wrapper with JWT + auto-refresh
│   ├── useAuth.ts                          # Auth actions (login, register, logout)
│   └── useNotifications.ts                 # Toast notification helpers
├── layouts/
│   ├── auth.vue                            # Centered auth layout with glow orbs
│   ├── default.vue                         # Dashboard layout (sidebar + topbar)
│   └── blank.vue                           # Minimal blank layout
├── middleware/
│   ├── auth.global.ts                      # Global route guard
│   └── guest.ts                            # Named guest-only guard
├── pages/
│   ├── index.vue                           # Redirect → /dashboard
│   ├── login.vue                           # Login form
│   ├── register.vue                        # Registration form
│   ├── forgot-password.vue                 # Forgot password form
│   ├── reset-password.vue                  # Reset password form
│   ├── verify-email.vue                    # Email verification
│   └── dashboard.vue                       # Dashboard placeholder
├── plugins/
│   ├── auth.client.ts                      # Session restore on app init
│   └── notivue.client.ts                   # Toast notification setup
├── services/
│   └── api.ts                              # Typed API service (auth endpoints)
├── stores/
│   └── auth.ts                             # Pinia auth store (user + token)
└── types/
    └── index.ts                            # Shared TypeScript interfaces
```

---

## Running the Application

### Development

```bash
# Start all services (app + db + redis)
docker compose up -d

# Install dependencies (if needed)
docker compose exec -T app npm install

# Run dev server
docker compose exec -T app npm run dev

# Access at http://localhost:4000
```

### Tests

```bash
# Run full test suite
docker compose exec -T app npx vitest run

# Run specific test file
docker compose exec -T app npx vitest run server/test/auth/login.test.ts
```

### Database

```bash
# Check migration status
docker compose exec -T app npx prisma migrate status

# Apply pending migrations
docker compose exec -T app npx prisma migrate deploy

# Generate Prisma client
docker compose exec -T app npx prisma generate
```
