import type { ProjectMember } from '@prisma/client'
import type { IMemberDAO, CreateMemberData, UpdateMemberData, MemberWithUser } from '../dao/member.dao'
import { prisma } from '../utils/prisma'

export class MemberRepository implements IMemberDAO {
  async create(data: CreateMemberData): Promise<ProjectMember> {
    return prisma.projectMember.create({
      data: {
        role: data.role,
        userId: data.userId,
        projectId: data.projectId,
        invitedByUserId: data.invitedByUserId,
        inviteStatus: data.inviteStatus || 'PENDING',
        inviteToken: data.inviteToken,
        inviteExpires: data.inviteExpires,
      },
    })
  }

  async findById(id: string): Promise<ProjectMember | null> {
    return prisma.projectMember.findUnique({ where: { id } })
  }

  async findByIdWithUser(id: string): Promise<MemberWithUser | null> {
    return prisma.projectMember.findUnique({
      where: { id },
      include: {
        user: true,
      },
    }) as Promise<MemberWithUser | null>
  }

  async findByUserAndProject(userId: string, projectId: string): Promise<ProjectMember | null> {
    return prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    })
  }

  async findByProjectId(projectId: string): Promise<(ProjectMember & { user: import('@prisma/client').User })[]> {
    return prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'asc' },
    })
  }

  async findByInviteToken(token: string): Promise<ProjectMember | null> {
    return prisma.projectMember.findFirst({
      where: { inviteToken: token },
    })
  }

  async update(id: string, data: UpdateMemberData): Promise<ProjectMember> {
    return prisma.projectMember.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<ProjectMember> {
    return prisma.projectMember.delete({ where: { id } })
  }
}

export const memberRepository = new MemberRepository()
