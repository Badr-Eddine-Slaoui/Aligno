import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { clearProjectData, createTestUsers, getAuthToken, testAdmin, testMember, testVisitor } from './helpers'
import { prisma } from '../../utils/prisma'

describe('Project Management API — Board Operations', async () => {
  await setup({})

  let adminToken: string
  let memberToken: string
  let visitorToken: string
  let projectId: string
  let todoColId: string
  let inProgressColId: string

  beforeEach(async () => {
    await clearProjectData()
    const { admin, member, visitor } = await createTestUsers()

    adminToken = await getAuthToken(testAdmin.email)
    memberToken = await getAuthToken(testMember.email)
    visitorToken = await getAuthToken(testVisitor.email)

    // Setup active project
    const project = await prisma.project.create({
      data: {
        name: 'Active Project',
        ownerId: admin.id,
      },
    })
    projectId = project.id

    // Setup admin membership
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: admin.id,
        role: 'ADMIN',
        inviteStatus: 'ACCEPTED',
      },
    })

    // Setup member membership
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: member.id,
        role: 'MEMBER',
        inviteStatus: 'ACCEPTED',
      },
    })

    // Setup visitor membership
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: visitor.id,
        role: 'VISITOR',
        inviteStatus: 'ACCEPTED',
      },
    })

    // Setup columns
    const col1 = await prisma.kanbanColumn.create({
      data: { name: 'To Do', position: 0, projectId: project.id },
    })
    todoColId = col1.id

    const col2 = await prisma.kanbanColumn.create({
      data: { name: 'In Progress', position: 1, projectId: project.id },
    })
    inProgressColId = col2.id
  })

  it('should run all column, card, label, and subtask mutations successfully', async () => {
    // 1. Create a custom column
    const createColRes = await $fetch(`/api/project-management/projects/${projectId}/columns`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${memberToken}` },
      body: { name: 'Q&A testing' },
    })
    expect((createColRes as any).success).toBe(true)
    const qaCol = (createColRes as any).data
    expect(qaCol.name).toBe('Q&A testing')

    // 2. Create a Card
    const createCardRes = await $fetch(`/api/project-management/columns/${todoColId}/cards`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${memberToken}` },
      body: {
        title: 'Fix styling alignment',
        description: 'Fix visual styles in home component',
        priority: 'HIGH',
      },
    })
    expect((createCardRes as any).success).toBe(true)
    const card = (createCardRes as any).data
    expect(card.title).toBe('Fix styling alignment')

    // 3. Move Card
    const moveCardRes = await $fetch(`/api/project-management/cards/${card.id}/move`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${memberToken}` },
      body: {
        targetColumnId: inProgressColId,
        position: 0,
      },
    })
    expect((moveCardRes as any).success).toBe(true)
    expect((moveCardRes as any).data.columnId).toBe(inProgressColId)

    // 4. Labels CRUD scoped to project
    const createLabelRes = await $fetch(`/api/project-management/projects/${projectId}/labels`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${memberToken}` },
      body: { name: 'Urgent', color: '#ef4444' },
    })
    expect((createLabelRes as any).success).toBe(true)
    const label = (createLabelRes as any).data

    // Assign labels
    const assignLabelsRes = await $fetch(`/api/project-management/cards/${card.id}/labels`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${memberToken}` },
      body: { labelIds: [label.id] },
    })
    expect((assignLabelsRes as any).success).toBe(true)
    expect((assignLabelsRes as any).data.labels.length).toBe(1)

    // 5. Subtasks CRUD
    const createSubtaskRes = await $fetch(`/api/project-management/cards/${card.id}/subtasks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${memberToken}` },
      body: { title: 'Implement flexbox layout' },
    })
    expect((createSubtaskRes as any).success).toBe(true)
    const subtask = (createSubtaskRes as any).data
    expect(subtask.title).toBe('Implement flexbox layout')
    expect(subtask.isCompleted).toBe(false)

    // Update subtask
    const updateSubtaskRes = await $fetch(`/api/project-management/subtasks/${subtask.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${memberToken}` },
      body: { isCompleted: true },
    })
    expect((updateSubtaskRes as any).success).toBe(true)
    expect((updateSubtaskRes as any).data.isCompleted).toBe(true)

    // 6. Role Enforcement: Visitor should be blocked from mutations
    const visitorFailRes = await $fetch(`/api/project-management/columns/${todoColId}/cards`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${visitorToken}` },
      body: { title: 'Visitor task attempts' },
      ignoreResponseError: true,
    })
    expect((visitorFailRes as any).statusCode || 403).toBe(403)
  })
})
