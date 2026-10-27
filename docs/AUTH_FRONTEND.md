# Frontend Authentication Module Documentation

This document describes the frontend implementation of the secure authentication system for **Aligno**. It serves as the source of truth for the architecture, views, validation rules, state management, and route protection mechanisms on the client side.

---

## 1. Directory Structure

The frontend auth module spans the following files:

```
app/
├── app.vue                                # Global restore-session loading screen
├── layouts/
│   ├── auth.vue                           # Layout with Obsidian styling for login/register
│   └── default.vue                        # Layout with sidebar navigation & profile link
├── pages/
│   ├── login.vue                          # Login page (password toggle, verification handling)
│   ├── register.vue                       # Registration page (avatar preview, confirm password)
│   ├── forgot-password.vue                # Forgot password request with 60s countdown
│   ├── reset-password.vue                 # Reset password page with validity checking
│   ├── verify-email.vue                   # Verification auto-validation / manual fallback
│   └── profile.vue                        # New: Profile page with avatar change and details update
├── components/
│   └── ui/
│       ├── PasswordStrength.vue           # New: Reusable visual password strength check
│       └── AppInput.vue                   # Updated: Built-in password visibility toggle support
├── composables/
│   ├── useAuth.ts                         # Handles user credentials, updates, login/logout
│   └── useNotifications.ts                # Toast alerts using Notivue
└── services/
    └── api.ts                             # Low-level $fetch wrapper supporting FormData payloads
```

---

## 2. Shared Components & Capabilities

### Password Strength Indicator (`PasswordStrength.vue`)
- Evaluates password strength dynamically based on 5 parameters:
  1. Length >= 8 characters
  2. One uppercase letter
  3. One lowercase letter
  4. One numeric digit
  5. One special character
- Color-coded progress segments representing Very Weak, Weak, Medium, or Strong levels.

### Upgraded Form Inputs (`AppInput.vue`)
- Automatically renders a password toggle icon (eye/eye-off) when `type="password"`.
- Modifies local state reactively between `password` and `text` types without changing parent attributes.

---

## 3. Page Overview

### 1. Login (`login.vue`)
- Form with built-in validation.
- Captures status code `403` to alert user if their email validation is pending.
- Automatically preserves the original URL under `?redirect=...` to return the user exactly where they were headed.

### 2. Register (`register.vue`)
- Multi-field register form matching Zod rules.
- Supported file preview for local avatar image.
- Serializes fields as `FormData` to accommodate backend upload capabilities.

### 3. Forgot Password (`forgot-password.vue`)
- Form requesting recovery email.
- Activates a 60-second reactive countdown timer upon submission to prevent request flooding.

### 4. Reset Password (`reset-password.vue`)
- Real-time token validation. If no token is provided, renders an warning view requesting user to start over.
- Fully integrated with `PasswordStrength` rules.

### 5. Verify Email (`verify-email.vue`)
- Triggers automatic validation when mounted if a token exists in query.
- Shows distinct loading, success, and error states with a fallback text input for entering the validation code manually.

### 6. Profile Management (`profile.vue`)
- Card-based layout linked in default sidebar.
- Handles changing local avatar file, compression warning, and updates backend through FormData payload.

---

## 4. Route Protection & State Persistence

1. **Global Auth Middleware** (`auth.global.ts`):
   Intercepts protected route navigation. If the user is unauthenticated, redirect to `/login?redirect=<target_route>`.
   
2. **Session Restore Protection** (`app.vue`):
   Displays a clean fullscreen loader screen while the client plugin verifies the refresh cookie against `/api/auth/me`. This eliminates flashes of login page content during page reloads.
