import bcrypt from 'bcrypt'
import { prisma } from '../../utils/prisma'
import { $fetch } from '@nuxt/test-utils/e2e'

export const testAdmin = {
  firstName: 'Admin',
  lastName: 'User',
  age: 30,
  email: 'admin@example.com',
  phone: '+212600000001',
  password: 'SuperSecurePassword123!',
}

export const testMember = {
  firstName: 'Jane',
  lastName: 'Doe',
  age: 25,
  email: 'jane.doe@example.com',
  phone: '+212600000002',
  password: 'SuperSecurePassword123!',
}

export const testVisitor = {
  firstName: 'Mohamed',
  lastName: 'Slaoui',
  age: 28,
  email: 'mohamed.slaoui@example.com',
  phone: '+212600000003',
  password: 'SuperSecurePassword123!',
}

export async function clearProjectData() {
  await prisma.subtask.deleteMany({})
  await prisma.kanbanCard.deleteMany({})
  await prisma.kanbanColumn.deleteMany({})
  await prisma.cardLabel.deleteMany({})
  await prisma.projectMember.deleteMany({})
  await prisma.notification.deleteMany({})
  await prisma.project.deleteMany({})
  await prisma.user.deleteMany({})
}

export async function createTestUsers() {
  const hashedPassword = await bcrypt.hash('SuperSecurePassword123!', 10)

  const admin = await prisma.user.create({
    data: {
      firstName: testAdmin.firstName,
      lastName: testAdmin.lastName,
      age: testAdmin.age,
      email: testAdmin.email,
      phone: testAdmin.phone,
      passwordHash: hashedPassword,
      emailVerified: true,
    },
  })

  const member = await prisma.user.create({
    data: {
      firstName: testMember.firstName,
      lastName: testMember.lastName,
      age: testMember.age,
      email: testMember.email,
      phone: testMember.phone,
      passwordHash: hashedPassword,
      emailVerified: true,
    },
  })

  const visitor = await prisma.user.create({
    data: {
      firstName: testVisitor.firstName,
      lastName: testVisitor.lastName,
      age: testVisitor.age,
      email: testVisitor.email,
      phone: testVisitor.phone,
      passwordHash: hashedPassword,
      emailVerified: true,
    },
  })

  return { admin, member, visitor }
}

export async function getAuthToken(email: string) {
  const res = await $fetch('/api/auth/login', {
    method: 'POST',
    body: { email, password: 'SuperSecurePassword123!' },
  })
  return (res as any).data.accessToken as string
}
