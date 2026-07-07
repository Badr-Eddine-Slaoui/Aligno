# Time Management Backend Module

This document outlines the backend architecture, schemas, and endpoint specifications of the Time Management module in Aligno.

---

## 1. Database Schema (Prisma)

### `DailyTemplate`
Represents a reusable pattern or blueprint for a day's schedule.
* `id` (String, Primary Key)
* `name` (String)
* `description` (String, Optional)
* `isActive` (Boolean, default: true)
* `userId` (String, Foreign Key -> User)

### `TimeBlock`
A specific task or time allocation within a template or actual daily schedule.
* `id` (String, Primary Key)
* `title` (String)
* `description` (String, Optional)
* `startTime` (String, HH:MM format)
* `endTime` (String, HH:MM format)
* `duration` (Int, minutes)
* `category` (TimeCategory: WORK, STUDY, HEALTH, BREAK, PERSONAL, MEETING, OTHER)
* `priority` (Priority: LOW, MEDIUM, HIGH)
* `position` (Int, sorting)
* `isCompleted` (Boolean, default: false)
* `isLocked` (Boolean, default: false)
* `templateId` (String, Optional Foreign Key -> DailyTemplate)
* `scheduleId` (String, Optional Foreign Key -> DailySchedule)
* `userId` (String, Foreign Key -> User)

### `DailySchedule`
An instance of a day's actual scheduled activities.
* `id` (String, Primary Key)
* `date` (DateTime)
* `templateId` (String, Optional Foreign Key -> DailyTemplate)
* `userId` (String, Foreign Key -> User)

---

## 2. API Endpoints

### Daily Template API

* `POST /api/time-management/daily-template` — Create template
* `GET /api/time-management/daily-template` — List user's templates
* `GET /api/time-management/daily-template/:id` — Get template by ID
* `PUT /api/time-management/daily-template/:id` — Update template
* `DELETE /api/time-management/daily-template/:id` — Delete template

### Daily Schedule API

* `POST /api/time-management/daily-schedule` — Create/Activate a schedule for today
* `GET /api/time-management/daily-schedule` — List user's schedules
* `GET /api/time-management/daily-schedule/:id` — Get schedule by ID
* `PUT /api/time-management/daily-schedule/:id` — Update schedule
* `DELETE /api/time-management/daily-schedule/:id` — Delete schedule

### Time Block API

* `POST /api/time-management/time-block` — Create a block
* `GET /api/time-management/time-block` — List user's blocks
* `GET /api/time-management/time-block/:id` — Get block by ID
* `PUT /api/time-management/time-block/:id` — Update block
* `DELETE /api/time-management/time-block/:id` — Delete block
