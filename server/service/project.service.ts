import { projectRepository } from '../repository/project.repository'
import { columnRepository } from '../repository/column.repository'
import { memberRepository } from '../repository/member.repository'
import { cardRepository } from '../repository/card.repository'
import { ProjectMapper } from '../mapper/project.mapper'
import { scheduleProjectReminder, cancelProjectReminder, cancelCardReminder } from '../utils/queue'
import type {
  CreateProjectRequestDto,
  UpdateProjectRequestDto,
  ProjectResponseDto,
  ProjectDetailResponseDto,
  PaginatedProjectsResponseDto,
  ProjectProgressResponseDto,
} from '../dto/project-management.dto'

export class ProjectService {
  async createProject(data: CreateProjectRequestDto, ownerId: string): Promise<ProjectDetailResponseDto> {
    const dueDate = data.dueDate ? new Date(data.dueDate) : undefined

    // 1. Create project
    const project = await projectRepository.create({
      name: data.name,
      description: data.description,
      dueDate,
      colorCode: data.colorCode,
      ownerId,
    })

    // 2. Create default columns: To Do, In Progress, Done
    await Promise.all([
      columnRepository.create({ name: 'To Do', position: 0, projectId: project.id }),
      columnRepository.create({ name: 'In Progress', position: 1, projectId: project.id }),
      columnRepository.create({ name: 'Done', position: 2, projectId: project.id }),
    ])

    // 3. Create owner as ADMIN member
    await memberRepository.create({
      role: 'ADMIN',
      userId: ownerId,
      projectId: project.id,
      inviteStatus: 'ACCEPTED',
    })

    // 4. Schedule project reminder if due date is provided
    if (dueDate) {
      await scheduleProjectReminder(project.id, dueDate)
    }

    // 5. Return full project details
    const fullProject = await projectRepository.findByIdWithDetails(project.id)
    if (!fullProject) {
      throw createError({ statusCode: 404, statusMessage: 'Project not found after creation' })
    }

    return ProjectMapper.toDetailResponseDto(fullProject)
  }

  async listProjects(
    userId: string,
    options: { page: number; limit: number; isArchived?: boolean },
  ): Promise<PaginatedProjectsResponseDto> {
    const page = options.page || 1
    const limit = options.limit || 20

    const { projects, total } = await projectRepository.findByUserId(userId, options)

    return {
      projects: projects.map((p) => ProjectMapper.toResponseDto(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async getProjectDetail(projectId: string): Promise<ProjectDetailResponseDto> {
    const project = await projectRepository.findByIdWithDetails(projectId)
    if (!project) {
      throw createError({ statusCode: 404, statusMessage: 'Project not found' })
    }
    return ProjectMapper.toDetailResponseDto(project)
  }

  async updateProject(projectId: string, data: UpdateProjectRequestDto): Promise<ProjectResponseDto> {
    const project = await projectRepository.findById(projectId)
    if (!project) {
      throw createError({ statusCode: 404, statusMessage: 'Project not found' })
    }

    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.colorCode !== undefined) updateData.colorCode = data.colorCode
    
    if (data.dueDate !== undefined) {
      if (data.dueDate === null) {
        updateData.dueDate = null
        updateData.dueDateReminderSent = false
        await cancelProjectReminder(projectId)
      } else {
        const dueDate = new Date(data.dueDate)
        updateData.dueDate = dueDate
        updateData.dueDateReminderSent = false
        await scheduleProjectReminder(projectId, dueDate)
      }
    }

    const updated = await projectRepository.update(projectId, updateData)
    return ProjectMapper.toResponseDto(updated)
  }

  async deleteProject(projectId: string): Promise<void> {
    const project = await projectRepository.findByIdWithDetails(projectId)
    if (!project) {
      throw createError({ statusCode: 404, statusMessage: 'Project not found' })
    }

    // Cancel project reminder
    await cancelProjectReminder(projectId)

    // Cancel card reminders for all cards in project
    for (const col of project.columns) {
      for (const card of col.cards) {
        if (card.dueDate) {
          await cancelCardReminder(card.id)
        }
      }
    }

    await projectRepository.delete(projectId)
  }

  async archiveProject(projectId: string): Promise<ProjectResponseDto> {
    const project = await projectRepository.findById(projectId)
    if (!project) {
      throw createError({ statusCode: 404, statusMessage: 'Project not found' })
    }

    const updated = await projectRepository.update(projectId, { isArchived: !project.isArchived })
    return ProjectMapper.toResponseDto(updated)
  }

  async getProjectProgress(projectId: string): Promise<ProjectProgressResponseDto> {
    const project = await projectRepository.findById(projectId)
    if (!project) {
      throw createError({ statusCode: 404, statusMessage: 'Project not found' })
    }

    const { total, completed } = await projectRepository.countCardsByStatus(projectId)
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      projectId,
      totalCards: total,
      completedCards: completed,
      progressPercentage,
    }
  }
}

export const projectService = new ProjectService()
