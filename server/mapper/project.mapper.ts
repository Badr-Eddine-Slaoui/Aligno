import type {
  Project,
  KanbanColumn,
  KanbanCard,
  CardLabel,
  Subtask,
  ProjectMember,
  Notification,
  User,
} from '@prisma/client'
import { UserMapper } from './user.mapper'
import type {
  ProjectResponseDto,
  ProjectDetailResponseDto,
  ColumnResponseDto,
  CardResponseDto,
  CardDetailResponseDto,
  LabelResponseDto,
  SubtaskResponseDto,
  MemberResponseDto,
  NotificationResponseDto,
} from '../dto/project-management.dto'

export class ProjectMapper {
  static toResponseDto(project: Project): ProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      dueDate: project.dueDate,
      colorCode: project.colorCode,
      isArchived: project.isArchived,
      ownerId: project.ownerId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }
  }

  static toDetailResponseDto(
    project: Project & {
      owner: User
      members: (ProjectMember & { user: User })[]
      columns: (KanbanColumn & { cards: (KanbanCard & { assignee: User | null; subtasks: Subtask[]; labels: CardLabel[] })[] })[]
      labels: CardLabel[]
    },
  ): ProjectDetailResponseDto {
    return {
      ...this.toResponseDto(project),
      owner: UserMapper.toResponseDto(project.owner),
      members: project.members.map((m) => MemberMapper.toResponseDto(m, m.user)),
      columns: project.columns
        .sort((a, b) => a.position - b.position)
        .map((c) => ColumnMapper.toResponseDto(c, c.cards)),
      labels: project.labels.map((l) => LabelMapper.toResponseDto(l)),
    }
  }
}

export class ColumnMapper {
  static toResponseDto(
    column: KanbanColumn,
    cards: (KanbanCard & { assignee: User | null; subtasks: Subtask[]; labels: CardLabel[] })[] = [],
  ): ColumnResponseDto {
    return {
      id: column.id,
      name: column.name,
      position: column.position,
      projectId: column.projectId,
      createdAt: column.createdAt,
      updatedAt: column.updatedAt,
      cards: cards
        .sort((a, b) => a.position - b.position)
        .map((c) => CardMapper.toDetailResponseDto(c, c.assignee, c.subtasks, c.labels)),
    }
  }
}

export class CardMapper {
  static toResponseDto(card: KanbanCard): CardResponseDto {
    return {
      id: card.id,
      title: card.title,
      description: card.description,
      dueDate: card.dueDate,
      priority: card.priority,
      position: card.position,
      assigneeId: card.assigneeId,
      columnId: card.columnId,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    }
  }

  static toDetailResponseDto(
    card: KanbanCard,
    assignee: User | null,
    subtasks: Subtask[] = [],
    labels: CardLabel[] = [],
  ): CardDetailResponseDto {
    return {
      ...this.toResponseDto(card),
      assignee: assignee ? UserMapper.toResponseDto(assignee) : null,
      subtasks: subtasks
        .sort((a, b) => a.position - b.position)
        .map((s) => SubtaskMapper.toResponseDto(s)),
      labels: labels.map((l) => LabelMapper.toResponseDto(l)),
    }
  }
}

export class LabelMapper {
  static toResponseDto(label: CardLabel): LabelResponseDto {
    return {
      id: label.id,
      name: label.name,
      color: label.color,
      projectId: label.projectId,
      createdAt: label.createdAt,
      updatedAt: label.updatedAt,
    }
  }
}

export class SubtaskMapper {
  static toResponseDto(subtask: Subtask): SubtaskResponseDto {
    return {
      id: subtask.id,
      title: subtask.title,
      isCompleted: subtask.isCompleted,
      position: subtask.position,
      cardId: subtask.cardId,
      createdAt: subtask.createdAt,
      updatedAt: subtask.updatedAt,
    }
  }
}

export class MemberMapper {
  static toResponseDto(member: ProjectMember, user?: User): MemberResponseDto {
    return {
      id: member.id,
      role: member.role,
      userId: member.userId,
      projectId: member.projectId,
      invitedByUserId: member.invitedByUserId,
      inviteStatus: member.inviteStatus,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      user: user ? UserMapper.toResponseDto(user) : undefined,
    }
  }
}

export class NotificationMapper {
  static toResponseDto(notif: Notification): NotificationResponseDto {
    return {
      id: notif.id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      isRead: notif.isRead,
      metadata: notif.metadata,
      userId: notif.userId,
      createdAt: notif.createdAt,
    }
  }
}
