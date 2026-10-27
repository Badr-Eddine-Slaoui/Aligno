import type { Project } from '@prisma/client'
import type { IProjectDAO, CreateProjectData, UpdateProjectData, ProjectWithDetails } from '../dao/project.dao'
import { prisma } from '../utils/prisma'

export class ProjectRepository implements IProjectDAO {
  async create(data: CreateProjectData): Promise<Project> {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        dueDate: data.dueDate,
        colorCode: data.colorCode,
        ownerId: data.ownerId,
      },
    })
  }

  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({ where: { id } })
  }

  async findByIdWithDetails(id: string): Promise<ProjectWithDetails | null> {
    return prisma.project.findUnique({
      where: { id },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
        columns: {
          include: {
            cards: {
              include: {
                assignee: true,
                subtasks: true,
                labels: true,
              },
            },
          },
        },
        labels: true,
      },
    }) as Promise<ProjectWithDetails | null>
  }

  async findByUserId(
    userId: string,
    options: { page: number; limit: number; isArchived?: boolean },
  ): Promise<{ projects: Project[]; total: number }> {
    const page = options.page || 1
    const limit = options.limit || 20
    const skip = (page - 1) * limit

    const whereClause: any = {}
    
    if (options.isArchived !== undefined) {
      whereClause.isArchived = options.isArchived
    }

    // The user must be the owner OR an accepted member of the project
    whereClause.OR = [
      { ownerId: userId },
      {
        members: {
          some: {
            userId,
            inviteStatus: 'ACCEPTED',
          },
        },
      },
    ]

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.project.count({
        where: whereClause,
      }),
    ])

    return { projects, total }
  }

  async update(id: string, data: UpdateProjectData): Promise<Project> {
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate
    if (data.colorCode !== undefined) updateData.colorCode = data.colorCode
    if (data.isArchived !== undefined) updateData.isArchived = data.isArchived

    return prisma.project.update({
      where: { id },
      data: updateData,
    })
  }

  async delete(id: string): Promise<Project> {
    return prisma.project.delete({ where: { id } })
  }

  async countCardsByStatus(id: string): Promise<{ total: number; completed: number }> {
    const columns = await prisma.kanbanColumn.findMany({
      where: { projectId: id },
      orderBy: { position: 'asc' },
    })

    if (columns.length === 0) {
      return { total: 0, completed: 0 }
    }

    const doneColumn = columns.find((c) => c.name.toLowerCase() === 'done') || columns[columns.length - 1]!

    const total = await prisma.kanbanCard.count({
      where: {
        column: {
          projectId: id,
        },
      },
    })

    const completed = await prisma.kanbanCard.count({
      where: {
        columnId: doneColumn.id,
      },
    })

    return { total, completed }
  }
}

export const projectRepository = new ProjectRepository()
