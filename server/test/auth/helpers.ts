import bcrypt from 'bcrypt'
import { prisma } from '../../utils/prisma'

export const validUser = {
  firstName: 'Test',
  lastName: 'User',
  age: '25',
  email: 'testuser@example.com',
  phone: '+212600000099',
  password: 'Str0ng!Pass',
  confirmPassword: 'Str0ng!Pass',
}

export function buildFormData(fields: Record<string, string>) {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    fd.append(key, value)
  }
  return fd
}

export async function createVerifiedUser(overrides: Partial<typeof validUser> = {}) {
  const data = { ...validUser, ...overrides }
  const passwordHash = await bcrypt.hash(data.password, 10)
  return prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      age: Number(data.age),
      email: data.email,
      phone: data.phone,
      passwordHash,
      emailVerified: true,
    },
  })
}

export async function createUnverifiedUser(overrides: Partial<typeof validUser> = {}) {
  const data = { ...validUser, ...overrides }
  const passwordHash = await bcrypt.hash(data.password, 10)
  return prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      age: Number(data.age),
      email: data.email,
      phone: data.phone,
      passwordHash,
      emailVerified: false,
    },
  })
}

export async function clearDatabase() {
  await prisma.user.deleteMany()
}
