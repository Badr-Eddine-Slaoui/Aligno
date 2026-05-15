# Nuxt 4 + Prisma + PostgreSQL + pgAdmin + Docker Starter

A full-stack starter template using:

- Nuxt 4
- Prisma ORM
- PostgreSQL
- pgAdmin
- Docker & Docker Compose
- JWT Authentication Ready
- Prisma Seeders
- Socket.IO Ready
- Redis Ready

---

# 📦 Stack

- :contentReference[oaicite:0]{index=0}
- :contentReference[oaicite:1]{index=1}
- :contentReference[oaicite:2]{index=2}
- :contentReference[oaicite:3]{index=3}
- :contentReference[oaicite:4]{index=4}
- :contentReference[oaicite:5]{index=5}
- :contentReference[oaicite:6]{index=6}

---

# 📁 Project Structure

```bash
.
├── prisma
│   ├── migrations
│   ├── schema.prisma
│   ├── seeders
│   │   ├── seed.ts
│   │   └── user.ts
│
├── server
│   └── utils
│       └── prisma.ts
│
├── docker-compose.yml
├── Dockerfile
├── prisma.config.ts
├── nuxt.config.ts
├── package.json
└── .env
```

---

# ⚙️ Requirements

Install:

- Docker
- Docker Compose

Recommended:

- Node.js LTS
- VSCode

---

# 🚀 Setup From A to Z

---

# 1️⃣ Clone The Project

```bash
git clone <your-repository-url>

cd <project-folder>
```

---

# 2️⃣ Create Environment File

Copy:

```bash
cp .env.example .env
```

---

# 3️⃣ Environment Variables

Your `.env` file:

```env
NUXT_PORT=4000

DATABASE_URL="postgresql://postgres:postgres@db:5432/postgres"

POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

PGADMIN_DEFAULT_EMAIL="admin@example.com"
PGADMIN_DEFAULT_PASSWORD=password
PGADMIN_PORT=5555

JWT_SECRET="your_super_secret_key"
```

---

# 4️⃣ Build Containers

```bash
docker compose build
```

---

# 5️⃣ Start Containers

```bash
docker compose up -d
```

---

# 6️⃣ Check Running Containers

```bash
docker ps
```

You should see:

- nuxt
- postgres_db
- pgadmin

---

# 🌍 Access Applications

## Nuxt App

```txt
http://localhost:4000
```

## pgAdmin

```txt
http://localhost:5555
```

Login using:

```txt
Email: admin@example.com
Password: password
```

---

# 🛢️ Connect pgAdmin To PostgreSQL

Inside pgAdmin:

## Create Server

### General

```txt
Name: Local PostgreSQL
```

### Connection

```txt
Host: db
Port: 5432
Username: postgres
Password: postgres
```

Click:

```txt
Save
```

---

# 🔥 Prisma Setup

---

# 7️⃣ Generate Prisma Client

Run inside container:

```bash
docker compose exec app npx prisma generate
```

This generates:

```ts
import { PrismaClient } from '@prisma/client'
```

---

# 8️⃣ Run Database Migration

Create migration:

```bash
docker compose exec app npx prisma migrate dev --name init
```

This will:

- Create tables
- Generate migration files
- Sync Prisma Client

---

# 9️⃣ Run Seeders

Run:

```bash
docker compose exec app npx prisma db seed
```

This executes:

```ts
prisma/seeders/seed.ts
```

---

# 👤 Default Seeded User

The seeder creates:

```txt
Email: admin@example.com
Password: SuperSecurePassword123!
```

---

# 🧠 Prisma Schema

Current schema:

```prisma
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
}
```

---

# ➕ Create New Migration After Schema Changes

Whenever you edit:

```txt
prisma/schema.prisma
```

Run:

```bash
docker compose exec app npx prisma migrate dev --name your_migration_name
```

Example:

```bash
docker compose exec app npx prisma migrate dev --name add_profile_table
```

---

# 🔄 Reset Database

⚠️ This deletes all data.

```bash
docker compose exec app npx prisma migrate reset
```

Prisma will:

- Drop database
- Recreate database
- Run all migrations
- Run seeders

---

# 🧬 Prisma Client Usage

---

# Prisma Client Singleton

File:

```txt
server/utils/prisma.ts
```

```ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
})

const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({
  adapter
})
```

---

# Example API Route

Create:

```txt
server/api/users/index.get.ts
```

```ts
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async () => {
  const users = await prisma.user.findMany()

  return users
})
```

---

# Example Create User

```ts
await prisma.user.create({
  data: {
    username: 'badr',
    email: 'badr@example.com',
    password: 'hashed-password'
  }
})
```

---

# Example Find User

```ts
const user = await prisma.user.findUnique({
  where: {
    email: 'badr@example.com'
  }
})
```

---

# Example Update User

```ts
await prisma.user.update({
  where: {
    email: 'badr@example.com'
  },
  data: {
    username: 'newUsername'
  }
})
```

---

# Example Delete User

```ts
await prisma.user.delete({
  where: {
    email: 'badr@example.com'
  }
})
```

---

# 🐳 Docker Commands

---

# Stop Containers

```bash
docker compose down
```

---

# Stop + Remove Volumes

⚠️ Deletes database data.

```bash
docker compose down -v
```

---

# Rebuild Containers

```bash
docker compose up --build -d
```

---

# Open Nuxt Container Shell

```bash
docker compose exec app sh
```

---

# Open PostgreSQL Shell

```bash
docker compose exec db psql -U postgres
```

---

# 📡 Socket.IO

Already installed:

```bash
socket.io
socket.io-client
```

---

# 🔐 JWT

Already installed:

```bash
jsonwebtoken
```

Example:

```ts
import jwt from 'jsonwebtoken'

const token = jwt.sign(
  { id: user.id },
  process.env.JWT_SECRET!,
  { expiresIn: '7d' }
)
```

---

# 🔒 Password Hashing

Using bcrypt:

```ts
import bcrypt from 'bcrypt'

const hashed = await bcrypt.hash(password, 10)

const valid = await bcrypt.compare(password, hashed)
```

---

# 🧹 Useful Prisma Commands

## Generate Client

```bash
npx prisma generate
```

## Open Prisma Studio

```bash
npx prisma studio
```

## Push Schema Without Migration

```bash
npx prisma db push
```

## Pull Existing Database

```bash
npx prisma db pull
```

---

# 🧠 Notes

## Why Database Host Is `db`

Inside Docker Compose, services communicate using service names.

So:

```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/postgres"
```

`db` refers to:

```yml
services:
  db:
```

---

# ⚠️ Important

Do NOT use:

```env
localhost
```

inside Docker containers for database connection.

Use:

```env
db
```

instead.

---

# ❤️ Recommended Next Features

- Authentication system
- Access & Refresh Tokens
- Email Verification
- OAuth Login
- Role Permissions
- Realtime Chat
- Notifications
- File Uploads
- Redis Cache
- Rate Limiting
- Queue System

---

# 📜 License

MIT License