import { subtaskRepository } from '../repository/subtask.repository'
import { cardRepository } from '../repository/card.repository'
import { columnRepository } from '../repository/column.repository'
import { SubtaskMapper } from '../mapper/project.mapper'
import { emitToProject } from '../utils/socket'
import type { CreateSubtaskRequestDto, UpdateSubtaskRequestDto, SubtaskResponseDto } from '../dto/project-management.dto'

export class SubtaskService {
  async createSubtask(cardId: string, data: CreateSubtaskRequestDto): Promise<SubtaskResponseDto> {
    const card = await cardRepository.findById(cardId)
    if (!card) {
      throw createError({ statusCode: 404, statusMessage: 'Card not found' })
    }

    const col = await columnRepository.findById(card.columnId)
    if (!col) {
      throw createError({ statusCode: 404, statusMessage: 'Column not found' })
    }

    const existing = await subtaskRepository.findByCardId(cardId)
    const position = existing.length

    const subtask = await subtaskRepository.create({
      title: data.title,
      position,
      cardId,
    })

    const response = SubtaskMapper.toResponseDto(subtask)

    // Notify project board about card update
    const updatedCard = await cardRepository.findByIdWithDetails(cardId)
    if (updatedCard) {
      emitToProject(col.projectId, 'board:card:updated', { card: updatedCard })
    }

    return response
  }

  async updateSubtask(subtaskId: string, data: UpdateSubtaskRequestDto): Promise<SubtaskResponseDto> {
    const sub = await subtaskRepository.findById(subtaskId)
    if (!sub) {
      throw createError({ statusCode: 404, statusMessage: 'Subtask not found' })
    }

    const card = await cardRepository.findById(sub.cardId)
    if (!card) {
      throw createError({ statusCode: 404, statusMessage: 'Card not found' })
    }

    const col = await columnRepository.findById(card.columnId)
    if (!col) {
      throw createError({ statusCode: 404, statusMessage: 'Column not found' })
    }

    const updated = await subtaskRepository.update(subtaskId, data)
    const response = SubtaskMapper.toResponseDto(updated)

    // Notify project board about card update
    const updatedCard = await cardRepository.findByIdWithDetails(sub.cardId)
    if (updatedCard) {
      emitToProject(col.projectId, 'board:card:updated', { card: updatedCard })
    }

    return response
  }

  async deleteSubtask(subtaskId: string): Promise<void> {
    const sub = await subtaskRepository.findById(subtaskId)
    if (!sub) {
      throw createError({ statusCode: 404, statusMessage: 'Subtask not found' })
    }

    const card = await cardRepository.findById(sub.cardId)
    if (!card) {
      throw createError({ statusCode: 404, statusMessage: 'Card not found' })
    }

    const col = await columnRepository.findById(card.columnId)
    if (!col) {
      throw createError({ statusCode: 404, statusMessage: 'Column not found' })
    }

    await subtaskRepository.delete(subtaskId)

    // Reorder remaining subtasks
    const existing = await subtaskRepository.findByCardId(sub.cardId)
    const updates = existing.map((s, index) => ({ id: s.id, position: index }))
    await subtaskRepository.updatePositions(updates)

    // Notify project board about card update
    const updatedCard = await cardRepository.findByIdWithDetails(sub.cardId)
    if (updatedCard) {
      emitToProject(col.projectId, 'board:card:updated', { card: updatedCard })
    }
  }

  async reorderSubtasks(cardId: string, subtaskIds: string[]): Promise<SubtaskResponseDto[]> {
    const card = await cardRepository.findById(cardId)
    if (!card) {
      throw createError({ statusCode: 404, statusMessage: 'Card not found' })
    }

    const col = await columnRepository.findById(card.columnId)
    if (!col) {
      throw createError({ statusCode: 404, statusMessage: 'Column not found' })
    }

    const existing = await subtaskRepository.findByCardId(cardId)
    const existingIds = existing.map((s) => s.id)

    const isValid = subtaskIds.every((id) => existingIds.includes(id)) && subtaskIds.length === existingIds.length
    if (!isValid) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid subtask list provided for reordering' })
    }

    const updates = subtaskIds.map((id, index) => ({ id, position: index }))
    await subtaskRepository.updatePositions(updates)

    const updated = await subtaskRepository.findByCardId(cardId)
    
    // Notify project board about card update
    const updatedCard = await cardRepository.findByIdWithDetails(cardId)
    if (updatedCard) {
      emitToProject(col.projectId, 'board:card:updated', { card: updatedCard })
    }

    return updated.map((s) => SubtaskMapper.toResponseDto(s))
  }
}

export const subtaskService = new SubtaskService()
