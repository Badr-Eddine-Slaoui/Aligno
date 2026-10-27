import { memberRepository } from '../repository/member.repository'
import { projectRepository } from '../repository/project.repository'
import { notificationRepository } from '../repository/notification.repository'
import { userRepository } from '../repository/user.repository'
import { MemberMapper } from '../mapper/project.mapper'
import { generateSecureToken, hashToken } from '../utils/crypto'
import { emailService } from './email.service'
import { emitToProject, emitToUser } from '../utils/socket'
import type {
  InviteMemberRequestDto,
  UpdateMemberRoleRequestDto,
  MemberResponseDto,
  InviteResponseDto,
} from '../dto/project-management.dto'

export class MemberService {
  async inviteMember(
    projectId: string,
    data: InviteMemberRequestDto,
    inviterId: string,
  ): Promise<InviteResponseDto> {
    const project = await projectRepository.findById(projectId)
    if (!project) {
      throw createError({ statusCode: 404, statusMessage: 'Project not found' })
    }

    const inviter = await prisma.user.findUnique({ where: { id: inviterId } })
    if (!inviter) {
      throw createError({ statusCode: 404, statusMessage: 'Inviter not found' })
    }

    // 1. Find the invitee by email
    const invitee = await userRepository.findByEmail(data.email)
    if (!invitee) {
      throw createError({ statusCode: 404, statusMessage: `User with email ${data.email} not found` })
    }

    // 2. Check if already a member or pending invite
    const existing = await memberRepository.findByUserAndProject(invitee.id, projectId)
    if (existing) {
      if (existing.inviteStatus === 'ACCEPTED') {
        throw createError({ statusCode: 409, statusMessage: 'User is already a member of this project' })
      }
      // If already pending, we can re-generate the token or tell the user
      throw createError({ statusCode: 409, statusMessage: 'User has a pending invitation already' })
    }

    // 3. Generate secure token
    const token = generateSecureToken()
    const hashed = hashToken(token)
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const member = await memberRepository.create({
      role: data.role,
      userId: invitee.id,
      projectId,
      invitedByUserId: inviterId,
      inviteStatus: 'PENDING',
      inviteToken: hashed,
      inviteExpires: expires,
    })

    // 4. Send email invitation
    await emailService.sendProjectInviteEmail(
      data.email,
      invitee.firstName,
      inviter.firstName,
      project.name,
      data.role,
      token,
    )

    // 5. Create in-app notification
    const notif = await notificationRepository.create({
      type: 'PROJECT_INVITE',
      title: 'Project Invitation',
      message: `${inviter.firstName} has invited you to collaborate on the project "${project.name}" as a ${data.role.toUpperCase()}.`,
      metadata: { projectId, memberId: member.id, inviteToken: token },
      userId: invitee.id,
    })
    emitToUser(invitee.id, 'notification:new', { notification: notif })

    return {
      memberId: member.id,
      inviteToken: token,
    }
  }

  async listMembers(projectId: string): Promise<MemberResponseDto[]> {
    const members = await memberRepository.findByProjectId(projectId)
    return members.map((m) => MemberMapper.toResponseDto(m, m.user))
  }

  async updateMemberRole(
    memberId: string,
    data: UpdateMemberRoleRequestDto,
    updaterId: string,
  ): Promise<MemberResponseDto> {
    const member = await memberRepository.findByIdWithUser(memberId)
    if (!member) {
      throw createError({ statusCode: 404, statusMessage: 'Member not found' })
    }

    // Enforce sole admin check: cannot demote self if sole admin
    if (member.userId === updaterId && member.role === 'ADMIN' && data.role !== 'ADMIN') {
      const allMembers = await memberRepository.findByProjectId(member.projectId)
      const admins = allMembers.filter((m) => m.role === 'ADMIN' && m.inviteStatus === 'ACCEPTED')
      if (admins.length <= 1) {
        throw createError({ statusCode: 403, statusMessage: 'Cannot demote yourself. You are the sole administrator.' })
      }
    }

    const updated = await memberRepository.update(memberId, { role: data.role })
    const response = MemberMapper.toResponseDto(updated, member.user)

    emitToProject(member.projectId, 'board:member:joined', { member: response })

    return response
  }

  async removeMember(memberId: string, removerId: string): Promise<void> {
    const member = await memberRepository.findByIdWithUser(memberId)
    if (!member) {
      throw createError({ statusCode: 404, statusMessage: 'Member not found' })
    }

    // Admin sole check
    if (member.userId === removerId) {
      const allMembers = await memberRepository.findByProjectId(member.projectId)
      const admins = allMembers.filter((m) => m.role === 'ADMIN' && m.inviteStatus === 'ACCEPTED')
      if (member.role === 'ADMIN' && admins.length <= 1) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Cannot leave project as the sole administrator. Promote another member or delete project.',
        })
      }
    }

    const project = await projectRepository.findById(member.projectId)
    if (!project) {
      throw createError({ statusCode: 404, statusMessage: 'Project not found' })
    }

    await memberRepository.delete(memberId)

    // Notify if removed by someone else
    if (member.userId !== removerId) {
      const remover = await prisma.user.findUnique({ where: { id: removerId } })
      if (remover) {
        const removerName = `${remover.firstName} ${remover.lastName}`
        await emailService.sendMemberRemovedEmail(
          member.user.email,
          member.user.firstName,
          project.name,
          removerName,
        )

        const notif = await notificationRepository.create({
          type: 'MEMBER_REMOVED',
          title: 'Removed from Project',
          message: `You have been removed from the project "${project.name}" by ${removerName}.`,
          metadata: { projectId: project.id },
          userId: member.userId,
        })
        emitToUser(member.userId, 'notification:new', { notification: notif })
      }
    }

    emitToProject(member.projectId, 'board:member:removed', { memberId })
  }

  async acceptInvitation(token: string): Promise<MemberResponseDto> {
    const hashed = hashToken(token)
    const member = await memberRepository.findByInviteToken(hashed)
    
    if (!member) {
      throw createError({ statusCode: 404, statusMessage: 'Invitation not found or invalid' })
    }

    if (member.inviteExpires && member.inviteExpires < new Date()) {
      throw createError({ statusCode: 400, statusMessage: 'Invitation has expired' })
    }

    const updated = await memberRepository.update(member.id, {
      inviteStatus: 'ACCEPTED',
      inviteToken: null,
      inviteExpires: null,
    })

    const memberWithUser = await memberRepository.findByIdWithUser(member.id)
    if (!memberWithUser) {
      throw createError({ statusCode: 404, statusMessage: 'Member not found' })
    }

    const response = MemberMapper.toResponseDto(updated, memberWithUser.user)

    // Notify inviter and project
    if (member.invitedByUserId) {
      const project = await projectRepository.findById(member.projectId)
      if (project) {
        const notif = await notificationRepository.create({
          type: 'INVITE_ACCEPTED',
          title: 'Invitation Accepted',
          message: `${memberWithUser.user.firstName} accepted your invitation to "${project.name}".`,
          metadata: { projectId: project.id, memberId: member.id },
          userId: member.invitedByUserId,
        })
        emitToUser(member.invitedByUserId, 'notification:new', { notification: notif })
      }
    }

    emitToProject(member.projectId, 'board:member:joined', { member: response })

    return response
  }

  async declineInvitation(token: string): Promise<void> {
    const hashed = hashToken(token)
    const member = await memberRepository.findByInviteToken(hashed)
    
    if (!member) {
      throw createError({ statusCode: 404, statusMessage: 'Invitation not found or invalid' })
    }

    const memberWithUser = await memberRepository.findByIdWithUser(member.id)
    await memberRepository.delete(member.id)

    // Notify inviter
    if (member.invitedByUserId && memberWithUser) {
      const project = await projectRepository.findById(member.projectId)
      if (project) {
        const notif = await notificationRepository.create({
          type: 'INVITE_DECLINED',
          title: 'Invitation Declined',
          message: `${memberWithUser.user.firstName} declined your invitation to "${project.name}".`,
          metadata: { projectId: project.id },
          userId: member.invitedByUserId,
        })
        emitToUser(member.invitedByUserId, 'notification:new', { notification: notif })
      }
    }
  }
}

import { prisma } from '../utils/prisma'

export const memberService = new MemberService()
