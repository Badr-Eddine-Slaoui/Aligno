import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

export async function seedUsers(prisma: PrismaClient) {
  const hashedPassword = await bcrypt.hash('SuperSecurePassword123!', 12)

  // ── Cleanup in cascade order (children → parents) ─────────────────────────
  // Wallet tables
  await prisma.subscription.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.budget.deleteMany()
  await prisma.bankAccount.deleteMany()

  // Project tables
  await prisma.subtask.deleteMany()
  await prisma.kanbanCard.deleteMany()
  await prisma.kanbanColumn.deleteMany()
  await prisma.cardLabel.deleteMany()
  await prisma.projectMember.deleteMany()
  await prisma.project.deleteMany()

  // Users (all email-verification tokens will cascade-delete too)
  await prisma.user.deleteMany()

  console.log('🧹  Cleared all existing seed data')

  const users = [
    {
      firstName: 'Admin',
      lastName: 'User',
      age: 30,
      email: 'admin@example.com',
      phone: '+212600000001',
      passwordHash: hashedPassword,
      emailVerified: true,
      profilePictureUrl: null,
    },
    {
      firstName: 'Jane',
      lastName: 'Doe',
      age: 25,
      email: 'jane.doe@example.com',
      phone: '+212600000002',
      passwordHash: hashedPassword,
      emailVerified: true,
      profilePictureUrl: null,
    },
    {
      firstName: 'Mohamed',
      lastName: 'Slaoui',
      age: 28,
      email: 'mohamed.slaoui@example.com',
      phone: '+212600000003',
      passwordHash: hashedPassword,
      emailVerified: false,
      profilePictureUrl: null,
    },
  ]

  for (const user of users) {
    await prisma.user.create({ data: user })
  }

  console.log(`✅  Seeded ${users.length} users`)
}
