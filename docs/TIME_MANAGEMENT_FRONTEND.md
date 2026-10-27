# Time Management Frontend Module

This document outlines the frontend pages, state management, and implementation details of the Time Management module in Aligno.

---

## 1. Core Architecture

The Time Management module utilizes Nuxt's file-based routing and a Pinia store (`timeManagement.ts`) integrated via a composable (`useTimeManagement.ts`).

---

## 2. File and Component Structure

### Pages
* `/time-management` — List of all schedule templates.
* `/time-management/templates/[id]` — Editor for a template's details and constituent time blocks.
* `/time-management/schedule` — The daily timeline execution view for today's active schedule.

### Components
* `TimeCreateTemplateModal.vue` — Form to create a new template.
* `TimeEditTemplateModal.vue` — Form to edit template settings.
* `TimeTimeBlockCard.vue` — Visual card showing block details, category colors, and status toggle.
* `TimeTimeBlockModal.vue` — Form to create or edit time blocks (autocalculates duration from start/end times).

---

## 3. State Management

The `useTimeManagementStore` Pinia store manages state for:
* `templates`: All templates.
* `currentTemplate`: Currently active template in the editor.
* `todaySchedule`: The schedule instance for today.
* `timeBlocks`: The list of blocks associated with the active editor or active schedule.
* `isLoading` / `error`: Unified request states.
