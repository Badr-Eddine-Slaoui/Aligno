import { columnRepository } from '../repository/column.repository'
import { ColumnMapper } from '../mapper/project.mapper'
import { emitToProject } from '../utils/socket'
import type { CreateColumnRequestDto, UpdateColumnRequestDto, ColumnResponseDto } from '../dto/project-management.dto'

export class ColumnService {
  async createColumn(projectId: string, data: CreateColumnRequestDto): Promise<ColumnResponseDto> {
    const existing = await columnRepository.findByProjectId(projectId)
    const position = existing.length

    const column = await columnRepository.create({
      name: data.name,
      position,
      projectId,
    })

    const response = ColumnMapper.toResponseDto(column)
    emitToProject(projectId, 'board:column:created', { column: response })

    return response
  }

  async updateColumn(columnId: string, data: UpdateColumnRequestDto): Promise<ColumnResponseDto> {
    const col = await columnRepository.findById(columnId)
    if (!col) {
      throw createError({ statusCode: 404, statusMessage: 'Column not found' })
    }

    const updated = await columnRepository.update(columnId, { name: data.name })
    const response = ColumnMapper.toResponseDto(updated)
    
    emitToProject(col.projectId, 'board:column:updated', { column: response })

    return response
  }

  async deleteColumn(columnId: string): Promise<void> {
    const col = await columnRepository.findById(columnId)
    if (!col) {
      throw createError({ statusCode: 404, statusMessage: 'Column not found' })
    }

    const existingColumns = await columnRepository.findByProjectId(col.projectId)
    
    // Check if column is empty by loading columns with cards or using database count
    const fullProjectCol = await columnRepository.findById(columnId)
    // Wait, let's load all cards for this column to verify if empty
    const cards = await prisma.kanbanCard.count({ where: { columnId } })
    if (cards > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot delete column that contains tasks. Move tasks first.',
      })
    }

    await columnRepository.delete(columnId)

    // Reorder remaining columns to be contiguous
    const remaining = existingColumns.filter((c) => c.id !== columnId)
    const updates = remaining.map((c, index) => ({ id: c.id, position: index }))
    await columnRepository.updatePositions(updates)

    emitToProject(col.projectId, 'board:column:deleted', { columnId })
  }

  async reorderColumns(projectId: string, columnIds: string[]): Promise<ColumnResponseDto[]> {
    const existing = await columnRepository.findByProjectId(projectId)
    
    // Validate that all columnIds belong to the project
    const existingIds = existing.map((c) => c.id)
    const isValid = columnIds.every((id) => existingIds.includes(id)) && columnIds.length === existingIds.length
    if (!isValid) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid column list provided for reordering' })
    }

    const updates = columnIds.map((id, index) => ({ id, position: index }))
    await columnRepository.updatePositions(updates)

    const updatedColumns = await columnRepository.findByProjectId(projectId)
    const responses = updatedColumns.map((c) => ColumnMapper.toResponseDto(c))

    emitToProject(projectId, 'board:column:reordered', { columns: responses })

    return responses
  }
}

// In case Prisma is needed directly in file
import { prisma } from '../utils/prisma'

export const columnService = new ColumnService()
