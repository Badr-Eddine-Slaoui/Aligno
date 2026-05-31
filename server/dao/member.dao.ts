import type { ProjectMember, User } from '@prisma/client'

export interface CreateMemberData {
  role: string
  userId: string
  projectId: string
  invitedByUserId?: string
  inviteStatus?: string
  inviteToken?: string
  inviteExpires?: Date
}

export interface UpdateMemberData {
  role?: string
  inviteStatus?: string
  inviteToken?: string | null
  inviteExpires?: Date | null
}

export type MemberWithUser = ProjectMember & {
  user: User
}

export interface IMemberDAO {
  create(data: CreateMemberData): Promise<ProjectMember>
  findById(id: string): Promise<ProjectMember | null>
  findByIdWithUser(id: string): Promise<MemberWithUser | null>
  findByUserAndProject(userId: string, projectId: string): Promise<ProjectMember | null>
  findByProjectId(projectId: string): Promise<(ProjectMember & { user: User })[]>
  findByInviteToken(token: string): Promise<ProjectMember | null>
  update(id: string, data: UpdateMemberData): Promise<ProjectMember>
  delete(id: string): Promise<ProjectMember>
}
