import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

export async function seedUsers(prisma: PrismaClient) {
  const hashedPassword = await bcrypt.hash('SuperSecurePassword123!', 12)

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
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    })
  }

  console.log(`✅ Seeded ${users.length} users`)
}
