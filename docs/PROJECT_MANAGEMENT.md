# Project Management Module — Technical Documentation

A complete, production-ready, and collaborative project management (Kanban Board) system for the **Aligno** Nuxt 4 backend. This document serves as the single source of truth for the project management module's architecture, database schema, file inventory, API contract, security controls, role-based access control (RBAC), real-time updates, email notifications, testing strategy, and environment variables.

---

## 1. System Architecture

The module extends the established **layered architecture** of the authentication system, integrating background queues (BullMQ/Redis) and real-time push events (Socket.IO):

```
                       [ HTTP Client / Socket.IO Client ]
                                    │  ▲
                         HTTP / REST│  │Socket.IO
                                    ▼  │
                             [ Route Handler ]     server/api/project-management/*
                                    │
                                    ▼
       [ Middleware ]  ──────► [ Controller ]      server/controller/project-management.controller.ts
     (auth + project-role)          │
                                    ▼
                                [ Service ]        server/service/*.service.ts
                                    │
               ┌────────────────────┼───────────────────┐
               ▼                    ▼                   ▼
       [ Repository ]         [ Redis Client ]     [ Queue Service ]
  server/repository/*.ts      server/utils/redis  server/utils/queue (BullMQ)
               │                    │                   │
               ▼                    ▼                   ▼
         [ DAO/Prisma ]       [ Socket.IO ]       [ Background Worker ]
   server/dao/*.ts            server/utils/socket  (Due Date Reminders)
```

---

## 2. Complete File Inventory

### Route Handlers (`server/api/project-management/`)
All route handlers reside under `server/api/project-management/` and delegateto the controller.

* **Projects CRUD & Archive:**
  * `projects/index.post.ts` — Create a project (auto-creates default columns and ADMIN member)
  * `projects/index.get.ts` — List user's active/archived projects (paginated)
  * `projects/[projectId].get.ts` — Fetch project details (full board: columns, cards, subtasks, labels, members)
  * `projects/[projectId].put.ts` — Update project metadata
  * `projects/[projectId].delete.ts` — Hard delete project (cascading)
  * `projects/[projectId]/archive.put.ts` — Toggle project archive state
  * `projects/[projectId]/progress.get.ts` — Get project progress percentage

* **Collaborative Members & Invites:**
  * `members/invite.post.ts` — Invite user by email (ADMIN only)
  * `members/index.get.ts` — List project members and invite statuses
  * `members/[memberId].put.ts` — Change project member role (ADMIN only)
  * `members/[memberId].delete.ts` — Remove member or leave project
  * `members/accept.post.ts` — Accept invitation via token
  * `members/decline.post.ts` — Decline invitation via token

* **Columns Operations:**
  * `columns/index.post.ts` — Add new column to project
  * `columns/[columnId].put.ts` — Rename column
  * `columns/[columnId].delete.ts` — Delete empty column
  * `columns/reorder.put.ts` — Reorder columns (position updates)

* **Cards Operations:**
  * `cards/index.post.ts` — Create card in column
  * `cards/[cardId].get.ts` — Retrieve card detail with subtasks and labels
  * `cards/[cardId].put.ts` — Update card metadata, assignees, priorities, or due dates
  * `cards/[cardId].delete.ts` — Delete card
  * `cards/move.put.ts` — Move card between columns/reorder
  * `cards/reorder.put.ts` — Reorder cards within column

* **Labels Operations:**
  * `labels/index.post.ts` — Create project-scoped label
  * `labels/[labelId].put.ts` — Update label metadata
  * `labels/[labelId].delete.ts` — Delete label
  * `cards/[cardId]/labels.put.ts` — Assign/unassign labels to card

* **Subtasks Operations:**
  * `subtasks/index.post.ts` — Create subtask for card
  * `subtasks/[subtaskId].put.ts` — Update subtask title / toggle completion
  * `subtasks/[subtaskId].delete.ts` — Delete subtask
  * `subtasks/reorder.put.ts` — Reorder subtasks

* **Notifications:**
  * `notifications/index.get.ts` — List user's notifications (paginated)
  * `notifications/[notificationId]/read.put.ts` — Mark single notification as read
  * `notifications/read-all.put.ts` — Mark all user notifications as read

### Core Logic & Orchestration
| File | Responsibility |
| :--- | :--- |
| `server/controller/project-management.controller.ts` | Entry-point parsing, schema validation, HTTP responses |
| `server/service/project.service.ts` | Project-level operations, defaults, and calculations |
| `server/service/column.service.ts` | Column CRUD, layout safety, reordering |
| `server/service/card.service.ts` | Card lifecycle, movements, and due date job scheduling |
| `server/service/subtask.service.ts` | Subtask checkbox toggling and sequencing |
| `server/service/member.service.ts` | Invitation generation, acceptance token validation, and RBAC membership changes |
| `server/service/notification.service.ts` | Notification logging and WebSockets dispatch |
| `server/middleware/project-role.ts` | Extract target entities, resolve projects, verify RBAC levels |
| `server/dto/project-management.dto.ts` | TypeScript shapes for request/response DTOs |
| `server/mapper/project.mapper.ts` | Maps DB records to sanitised, typed response DTOs |
| `server/validations/project-management.zod.ts` | Zod validation schemas for all inputs |

### Infrastructure & background
| File | Responsibility |
| :--- | :--- |
| `server/utils/redis.ts` | Singleton connection setup to local or cloud Redis instance |
| `server/utils/socket.ts` | Socket.IO server initialization with Redis pub/sub adapter |
| `server/utils/queue.ts` | BullMQ setup and background Workers for due date reminders |
| `server/emails/ProjectInviteEmail.ts` | Template for inviting members |
| `server/emails/ProjectDueDateReminderEmail.ts` | Template for project due dates (1 day before) |
| `server/emails/CardDueDateReminderEmail.ts` | Template for card due dates (1 day before) |
| `server/emails/CardAssignedEmail.ts` | Template when a card gets assigned to a user |
| `server/emails/MemberRemovedEmail.ts` | Template when a member is removed from a project |

---

## 3. Database Schema

Seven new models defined under `prisma/models/` map project management resources:

### `Project` (in `project.prisma`)
* `id` (`String`, `@id @default(cuid())`) — Primary Key
* `name` (`String`) — Project title (2–100 chars)
* `description` (`String?`) — Detailed board overview
* `dueDate` (`DateTime?`) — Project-level completion target
* `colorCode` (`String`, `@default("#6366f1")`) — Color indicator hex
* `isArchived` (`Boolean`, `@default(false)`) — Soft archive status
* `dueDateReminderSent` (`Boolean`, `@default(false)`) — Flag avoiding reminder loops
* `ownerId` (`String`) — FK → User (Creator)
* `createdAt`, `updatedAt`

### `ProjectMember` (in `project-member.prisma`)
* `id` (`String`, `@id`)
* `role` (`String`) — `ADMIN`, `MEMBER`, or `VISITOR`
* `userId` (`String`) — FK → User
* `projectId` (`String`) — FK → Project
* `invitedByUserId` (`String?`) — FK → User
* `inviteStatus` (`String`, `@default("PENDING")`) — `PENDING`, `ACCEPTED`, `DECLINED`
* `inviteToken` (`String?`) — Hash for URL verification
* `inviteExpires` (`DateTime?`) — Validity limits
* `createdAt`, `updatedAt`

### `KanbanColumn` (in `kanban-column.prisma`)
* `id` (`String`, `@id`)
* `name` (`String`) — Column title (2–50 chars)
* `position` (`Int`) — Sort index within the project
* `projectId` (`String`) — FK → Project

### `KanbanCard` (in `kanban-card.prisma`)
* `id` (`String`, `@id`)
* `title` (`String`) — Card title (2–200 chars)
* `description` (`String?`) — Details / description (max 5000 chars)
* `dueDate` (`DateTime?`) — Target card due date
* `priority` (`String`, `@default("MEDIUM")`) — `HIGH`, `MEDIUM`, `LOW`
* `position` (`Int`) — Sort index within the column
* `dueDateReminderSent` (`Boolean`, `@default(false)`)
* `assigneeId` (`String?`) — FK → User
* `columnId` (`String`) — FK → KanbanColumn

### `CardLabel` (in `card-label.prisma`)
* `id` (`String`, `@id`)
* `name` (`String`) — Label name (2–30 chars)
* `color` (`String`) — Label background color hex
* `projectId` (`String`) — FK → Project
* *M:N relation table with KanbanCard*

### `Subtask` (in `subtask.prisma`)
* `id` (`String`, `@id`)
* `title` (`String`) — Checkbox item title (2–200 chars)
* `isCompleted` (`Boolean`, `@default(false)`) — Completed check
* `position` (`Int`) — Sort index
* `cardId` (`String`) — FK → KanbanCard

### `Notification` (in `notification.prisma`)
* `id` (`String`, `@id`)
* `type` (`String`) — Enum of event types (e.g., `PROJECT_INVITE`, `CARD_ASSIGNED`)
* `title` (`String`), `message` (`String`)
* `isRead` (`Boolean`, `@default(false)`)
* `metadata` (`Json?`) — Context keys (projectId, cardId, etc.)
* `userId` (`String`) — FK → User (Recipient)

---

## 4. API Endpoint Registry

All endpoints require a Bearer token authorization and prefix matching under `/api/project-management/`.

| Method | Route | Required Role | Summary |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/project-management/projects` | User (authenticated) | Create a project |
| `GET` | `/api/project-management/projects` | User (authenticated) | List user's projects |
| `GET` | `/api/project-management/projects/:projectId` | `ADMIN`, `MEMBER`, `VISITOR` | Get board details |
| `PUT` | `/api/project-management/projects/:projectId` | `ADMIN` | Update project metadata |
| `DELETE`| `/api/project-management/projects/:projectId` | `ADMIN` | Hard delete project |
| `PUT` | `/api/project-management/projects/:projectId/archive` | `ADMIN` | Toggle project archive state |
| `GET` | `/api/project-management/projects/:projectId/progress`| `ADMIN`, `MEMBER`, `VISITOR` | Get progress percentage |
| `POST` | `/api/project-management/projects/:projectId/members/invite`| `ADMIN` | Invite user by email |
| `GET` | `/api/project-management/projects/:projectId/members` | `ADMIN`, `MEMBER`, `VISITOR` | List members |
| `PUT` | `/api/project-management/members/:memberId` | `ADMIN` | Update member role |
| `DELETE`| `/api/project-management/members/:memberId` | `ADMIN` / Member self | Remove member or leave project |
| `POST` | `/api/project-management/members/invite/accept` | Guest/User (token verify) | Accept project invite |
| `POST` | `/api/project-management/members/invite/decline` | Guest/User (token verify) | Decline project invite |
| `POST` | `/api/project-management/projects/:projectId/columns` | `ADMIN`, `MEMBER` | Create a column |
| `PUT` | `/api/project-management/columns/:columnId` | `ADMIN`, `MEMBER` | Rename a column |
| `DELETE`| `/api/project-management/columns/:columnId` | `ADMIN`, `MEMBER` | Delete column (must be empty) |
| `PUT` | `/api/project-management/projects/:projectId/columns/reorder`| `ADMIN`, `MEMBER` | Reorder columns list |
| `POST` | `/api/project-management/columns/:columnId/cards` | `ADMIN`, `MEMBER` | Create card in column |
| `GET` | `/api/project-management/cards/:cardId` | `ADMIN`, `MEMBER`, `VISITOR` | Get card details |
| `PUT` | `/api/project-management/cards/:cardId` | `ADMIN`, `MEMBER` | Update card metadata / assignee |
| `DELETE`| `/api/project-management/cards/:cardId` | `ADMIN`, `MEMBER` | Delete card |
| `PUT` | `/api/project-management/cards/:cardId/move` | `ADMIN`, `MEMBER` | Move/Drag card to column |
| `PUT` | `/api/project-management/columns/:columnId/cards/reorder` | `ADMIN`, `MEMBER` | Reorder cards in column |
| `POST` | `/api/project-management/projects/:projectId/labels` | `ADMIN`, `MEMBER` | Create project label |
| `PUT` | `/api/project-management/labels/:labelId` | `ADMIN`, `MEMBER` | Update label |
| `DELETE`| `/api/project-management/labels/:labelId` | `ADMIN`, `MEMBER` | Delete label |
| `PUT` | `/api/project-management/cards/:cardId/labels` | `ADMIN`, `MEMBER` | Edit card labels |
| `POST` | `/api/project-management/cards/:cardId/subtasks` | `ADMIN`, `MEMBER` | Create a subtask |
| `PUT` | `/api/project-management/subtasks/:subtaskId` | `ADMIN`, `MEMBER` | Update/Check subtask |
| `DELETE`| `/api/project-management/subtasks/:subtaskId` | `ADMIN`, `MEMBER` | Delete subtask |
| `PUT` | `/api/project-management/cards/:cardId/subtasks/reorder` | `ADMIN`, `MEMBER` | Reorder subtasks list |
| `GET` | `/api/project-management/notifications` | User (authenticated) | List notifications |
| `PUT` | `/api/project-management/notifications/:notificationId/read`| User (authenticated) | Mark single notice as read |
| `PUT` | `/api/project-management/notifications/read-all` | User (authenticated) | Mark all notifications read |

---

## 5. Role-Based Access Control & Middleware

The `server/middleware/project-role.ts` interceptor enforces contextual roles dynamically:

1. **Context Resolution:**
   * Resolves `projectId` from path params.
   * If URL target contains `columnId`, `cardId`, `labelId`, or `subtaskId`, resolves the ID back to the root `projectId` via database relation traversal.
2. **Access Verification:**
   * Checks the user's `ProjectMember` entry for the resolved `projectId` where status is `ACCEPTED`.
   * Throws `403 Forbidden` if not a member, or if the role (`ADMIN`, `MEMBER`, `VISITOR`) lacks permission.
3. **Downstream Injection:**
   * Attaches `event.context.projectRole` and `event.context.projectId` to avoid repeat queries.

---

## 6. Real-time Events (Socket.IO)

Every structural board mutation publishes updates to all members listening on the project's WebSocket room (`project:${projectId}`):

* `board:card:created` — Sent on new card creation.
* `board:card:updated` — Sent on card detail updates.
* `board:card:moved` — Emitted when cards change position or column.
* `board:card:deleted` — Emitted when cards are deleted.
* `board:column:created` / `board:column:updated` / `board:column:deleted` — Column updates.
* `board:column:reordered` — Array of column ordering ids.
* `board:member:joined` / `board:member:removed` — Member list changes.
* `notification:new` — Pushed directly to a user's private room (`user:${userId}`) when any event triggers a database notification.

---

## 7. Email and Notification System

Transactional notifications are triggered by database mutations and integrated into both in-app records and emails:

* **Project Invitations:** Emails `ProjectInviteEmail` with secure cryptographic token link (`/api/project-management/members/invite/accept?token=...`).
* **Due Date Reminders (BullMQ):**
  * Checked by background workers every minute or scheduled as delayed tasks.
  * **1 Day Before Project Due Date:** Dispatches `ProjectDueDateReminderEmail` and in-app `PROJECT_DUE_SOON` to all board members.
  * **1 Day Before Card Due Date:** Dispatches `CardDueDateReminderEmail` and in-app `CARD_DUE_SOON` to the assigned member.
* **Card Assignments:** Dispatches `CardAssignedEmail` and `CARD_ASSIGNED` in-app notifications on assignment.
* **Member Removals:** Sends `MemberRemovedEmail` and `MEMBER_REMOVED` notice.

---

## 8. Verification & Test Strategy

Exhaustive integration testing covers every endpoint, RBAC level, and validation schema using Vitest and Nuxt test utilities.

### Test Coverage Files:
* `projects-and-members.test.ts` — Focuses on project CRUD, role mappings, dynamic updates, and the full invitation cycle (invite → token validation → accept/decline).
* `board-operations.test.ts` — Tests Kanban board interactions (adding columns, creating cards, reordering, custom labels, and checkboxes).

### Commands to Run:

```bash
# Generate client
npx prisma generate

# Apply migrations
npx prisma migrate dev

# Run project management integration tests
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres" REDIS_URL="redis://localhost:6379" npx vitest run server/test/project-management/
```
