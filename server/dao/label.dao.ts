import type { CardLabel } from '@prisma/client'

export interface CreateLabelData {
  name: string
  color: string
  projectId: string
}

export interface UpdateLabelData {
  name?: string
  color?: string
}

export interface ILabelDAO {
  create(data: CreateLabelData): Promise<CardLabel>
  findById(id: string): Promise<CardLabel | null>
  findByProjectId(projectId: string): Promise<CardLabel[]>
  update(id: string, data: UpdateLabelData): Promise<CardLabel>
  delete(id: string): Promise<CardLabel>
  assignToCard(cardId: string, labelId: string): Promise<void>
  removeFromCard(cardId: string, labelId: string): Promise<void>
  setCardLabels(cardId: string, labelIds: string[]): Promise<void>
}
