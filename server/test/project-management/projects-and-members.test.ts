import 'dotenv/config'
import { describe, it, expect, beforeEach } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { clearProjectData, createTestUsers, getAuthToken, testAdmin, testMember, testVisitor } from './helpers'
import { prisma } from '../../utils/prisma'

describe('Project Management API — Projects and Members', async () => {
  await setup({})

  beforeEach(async () => {
    await clearProjectData()
    await createTestUsers()
  })

  it('should manage projects and roles successfully', async () => {
    // 1. Get tokens
    const adminToken = await getAuthToken(testAdmin.email)
    const memberToken = await getAuthToken(testMember.email)
    const visitorToken = await getAuthToken(testVisitor.email)

    // 2. Create Project
    const createRes = await $fetch('/api/project-management/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        name: 'Website Redesign',
        description: 'Modern corporate website redesign',
        colorCode: '#6366f1',
      },
    })

    expect((createRes as any).success).toBe(true)
    const project = (createRes as any).data
    expect(project.name).toBe('Website Redesign')
    expect(project.isArchived).toBe(false)

    // Verify 3 default columns were created
    const dbColumns = await prisma.kanbanColumn.findMany({
      where: { projectId: project.id },
      orderBy: { position: 'asc' },
    })
    expect(dbColumns.length).toBe(3)
    expect(dbColumns[0]!.name).toBe('To Do')
    expect(dbColumns[1]!.name).toBe('In Progress')
    expect(dbColumns[2]!.name).toBe('Done')

    // 3. List Projects
    const listRes = await $fetch('/api/project-management/projects', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    expect((listRes as any).success).toBe(true)
    expect((listRes as any).data.projects.length).toBe(1)

    // 4. Update Project Details
    const updateRes = await $fetch(`/api/project-management/projects/${project.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { name: 'Updated Website Title', colorCode: '#10b981' },
    })
    expect((updateRes as any).success).toBe(true)
    expect((updateRes as any).data.name).toBe('Updated Website Title')

    // 5. Member Invite Flow
    const inviteRes = await $fetch(`/api/project-management/projects/${project.id}/members/invite`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { email: testMember.email, role: 'MEMBER' },
    })
    expect((inviteRes as any).success).toBe(true)
    const inviteData = (inviteRes as any).data
    expect(inviteData.inviteToken).toBeDefined()

    // Accept Invite
    const acceptRes = await $fetch('/api/project-management/members/invite/accept', {
      method: 'POST',
      headers: { Authorization: `Bearer ${memberToken}` },
      body: { token: inviteData.inviteToken },
    })
    expect((acceptRes as any).success).toBe(true)
    expect((acceptRes as any).data.inviteStatus).toBe('ACCEPTED')

    // 6. Project Details Verification
    const detailRes = await $fetch(`/api/project-management/projects/${project.id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${memberToken}` },
    })
    expect((detailRes as any).success).toBe(true)
    expect((detailRes as any).data.members.length).toBe(2)

    // 7. Progress Verification (0 cards = 0%)
    const progressRes = await $fetch(`/api/project-management/projects/${project.id}/progress`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${memberToken}` },
    })
    expect((progressRes as any).success).toBe(true)
    expect((progressRes as any).data.progressPercentage).toBe(0)

    // 8. Archive Project
    const archiveRes = await $fetch(`/api/project-management/projects/${project.id}/archive`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    expect((archiveRes as any).success).toBe(true)
    expect((archiveRes as any).data.isArchived).toBe(true)

    // 9. Notifications Verification
    const notifRes = await $fetch('/api/project-management/notifications', {
      method: 'GET',
      headers: { Authorization: `Bearer ${memberToken}` },
    })
    expect((notifRes as any).success).toBe(true)
    expect((notifRes as any).data.notifications.length).toBeGreaterThanOrEqual(1)

    // 10. Delete Project
    const deleteRes = await $fetch(`/api/project-management/projects/${project.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    expect((deleteRes as any).success).toBe(true)
  })
})
