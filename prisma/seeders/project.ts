import { PrismaClient } from '@prisma/client'

export async function seedProjects(prisma: PrismaClient) {
  // Find users
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@example.com' } })
  const janeUser = await prisma.user.findUnique({ where: { email: 'jane.doe@example.com' } })

  if (!adminUser || !janeUser) {
    console.error('❌ Could not find users for project seeding.')
    return
  }

  // Clear existing project data to prevent duplicates / conflicts
  await prisma.subtask.deleteMany({})
  await prisma.kanbanCard.deleteMany({})
  await prisma.kanbanColumn.deleteMany({})
  await prisma.cardLabel.deleteMany({})
  await prisma.projectMember.deleteMany({})
  await prisma.project.deleteMany({})

  console.log('🧹 Cleared existing project management data')

  // --- Project 1: Website Redesign ---
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Revamping the core corporate website with modern aesthetics and dynamic scroll effects.',
      colorCode: '#6366f1',
      ownerId: adminUser.id,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    },
  })

  // Add Project Members
  await prisma.projectMember.create({
    data: {
      projectId: project1.id,
      userId: adminUser.id,
      role: 'ADMIN',
      inviteStatus: 'ACCEPTED',
    },
  })

  await prisma.projectMember.create({
    data: {
      projectId: project1.id,
      userId: janeUser.id,
      role: 'MEMBER',
      inviteStatus: 'ACCEPTED',
      invitedByUserId: adminUser.id,
    },
  })

  // Create default columns
  const todoCol = await prisma.kanbanColumn.create({
    data: {
      name: 'To Do',
      position: 0,
      projectId: project1.id,
    },
  })

  const inProgressCol = await prisma.kanbanColumn.create({
    data: {
      name: 'In Progress',
      position: 1,
      projectId: project1.id,
    },
  })

  const doneCol = await prisma.kanbanColumn.create({
    data: {
      name: 'Done',
      position: 2,
      projectId: project1.id,
    },
  })

  // Create Labels
  const urgentLabel = await prisma.cardLabel.create({
    data: {
      name: 'Urgent',
      color: '#ef4444',
      projectId: project1.id,
    },
  })

  const designLabel = await prisma.cardLabel.create({
    data: {
      name: 'Design',
      color: '#3b82f6',
      projectId: project1.id,
    },
  })

  // Cards for Project 1
  // To Do
  const card1 = await prisma.kanbanCard.create({
    data: {
      title: 'Design high-fidelity wireframes',
      description: 'Develop full interactive wireframes for desktop and mobile layouts.',
      position: 0,
      columnId: todoCol.id,
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      labels: { connect: [{ id: designLabel.id }, { id: urgentLabel.id }] },
    },
  })

  await prisma.kanbanCard.create({
    data: {
      title: 'Write SEO meta descriptions',
      description: 'Define meta titles and descriptions for all core landing pages.',
      position: 1,
      columnId: todoCol.id,
      priority: 'LOW',
    },
  })

  // In Progress
  const card3 = await prisma.kanbanCard.create({
    data: {
      title: 'Setup Nuxt layout & global styles',
      description: 'Initialize tailwind / custom css themes and global layout structures.',
      position: 0,
      columnId: inProgressCol.id,
      priority: 'MEDIUM',
      assigneeId: janeUser.id,
    },
  })

  await prisma.kanbanCard.create({
    data: {
      title: 'Implement Auth middleware',
      description: 'Verify JWT and implement silent refresh flow on Nitro backend.',
      position: 1,
      columnId: inProgressCol.id,
      priority: 'HIGH',
      assigneeId: adminUser.id,
    },
  })

  // Done
  await prisma.kanbanCard.create({
    data: {
      title: 'Define Project Schema',
      description: 'Draft the initial schema.prisma addition and get it approved.',
      position: 0,
      columnId: doneCol.id,
      priority: 'MEDIUM',
    },
  })

  await prisma.kanbanCard.create({
    data: {
      title: 'Setup PostgreSQL docker container',
      description: 'Add postgresql Alpine service to compose with environment configurations.',
      position: 1,
      columnId: doneCol.id,
      priority: 'HIGH',
      assigneeId: adminUser.id,
    },
  })

  // Subtasks on card 1
  await prisma.subtask.createMany({
    data: [
      { title: 'Create homepage layout mockups', position: 0, cardId: card1.id, isCompleted: true },
      { title: 'Design user settings page', position: 1, cardId: card1.id, isCompleted: false },
      { title: 'Verify typography readability', position: 2, cardId: card1.id, isCompleted: false },
    ],
  })

  // Subtasks on card 3
  await prisma.subtask.createMany({
    data: [
      { title: 'Install Google Fonts (Inter)', position: 0, cardId: card3.id, isCompleted: true },
      { title: 'Configure color variables in HSL', position: 1, cardId: card3.id, isCompleted: false },
    ],
  })

  // --- Project 2: Mobile App MVP ---
  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App MVP',
      description: 'Hybrid iOS & Android build focusing on the core balance dashboard.',
      colorCode: '#10b981',
      ownerId: adminUser.id,
    },
  })

  // Add Project Members
  await prisma.projectMember.create({
    data: {
      projectId: project2.id,
      userId: adminUser.id,
      role: 'ADMIN',
      inviteStatus: 'ACCEPTED',
    },
  })

  // Create default columns for Project 2
  const todoCol2 = await prisma.kanbanColumn.create({
    data: {
      name: 'To Do',
      position: 0,
      projectId: project2.id,
    },
  })

  const inProgressCol2 = await prisma.kanbanColumn.create({
    data: {
      name: 'In Progress',
      position: 1,
      projectId: project2.id,
    },
  })

  const doneCol2 = await prisma.kanbanColumn.create({
    data: {
      name: 'Done',
      position: 2,
      projectId: project2.id,
    },
  })

  // Create Label
  const mobileLabel = await prisma.cardLabel.create({
    data: {
      name: 'Mobile',
      color: '#8b5cf6',
      projectId: project2.id,
    },
  })

  // Cards for Project 2
  await prisma.kanbanCard.create({
    data: {
      title: 'Initialize React Native Expo repo',
      description: 'Setup base repository, add typescript, and configure expo dev client.',
      position: 0,
      columnId: todoCol2.id,
      priority: 'HIGH',
      labels: { connect: [{ id: mobileLabel.id }] },
    },
  })

  await prisma.kanbanCard.create({
    data: {
      title: 'Design Dashboard mockups',
      description: 'Balance gauge mockups, graph visualization styles.',
      position: 1,
      columnId: todoCol2.id,
      priority: 'MEDIUM',
    },
  })

  await prisma.kanbanCard.create({
    data: {
      title: 'Setup deep links handling',
      description: 'Ensure deep link URLs trigger correct onboarding screens.',
      position: 0,
      columnId: inProgressCol2.id,
      priority: 'HIGH',
    },
  })

  await prisma.kanbanCard.create({
    data: {
      title: 'Define navigation router options',
      description: 'Test Expo Router vs React Navigation library styles.',
      position: 0,
      columnId: doneCol2.id,
      priority: 'LOW',
    },
  })

  console.log('✅ Seeded projects, columns, cards, labels, and subtasks successfully.')
}
