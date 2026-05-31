import { z } from 'zod'

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

export const cuidSchema = z.string().cuid('Invalid unique identifier')

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name must be at most 100 characters')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .trim()
    .optional(),
  dueDate: z
    .string()
    .datetime({ message: 'Due date must be a valid ISO 8601 string' })
    .refine((val) => new Date(val) > new Date(), {
      message: 'Due date must be in the future',
    })
    .optional(),
  colorCode: z
    .string()
    .regex(hexColorRegex, 'Invalid hex color code')
    .optional(),
})

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name must be at most 100 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .trim()
    .optional(),
  dueDate: z
    .string()
    .datetime({ message: 'Due date must be a valid ISO 8601 string' })
    .nullable()
    .optional(),
  colorCode: z
    .string()
    .regex(hexColorRegex, 'Invalid hex color code')
    .optional(),
})

export const createColumnSchema = z.object({
  name: z
    .string()
    .min(2, 'Column name must be at least 2 characters')
    .max(50, 'Column name must be at most 50 characters')
    .trim(),
})

export const updateColumnSchema = z.object({
  name: z
    .string()
    .min(2, 'Column name must be at least 2 characters')
    .max(50, 'Column name must be at most 50 characters')
    .trim(),
})

export const reorderColumnsSchema = z.object({
  columnIds: z.array(z.string().cuid()).nonempty('Must provide columns list to reorder'),
})

export const createCardSchema = z.object({
  title: z
    .string()
    .min(2, 'Card title must be at least 2 characters')
    .max(200, 'Card title must be at most 200 characters')
    .trim(),
  description: z
    .string()
    .max(5000, 'Description must be at most 5000 characters')
    .trim()
    .optional(),
  dueDate: z
    .string()
    .datetime({ message: 'Due date must be a valid ISO 8601 string' })
    .optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  assigneeId: z.string().cuid().optional(),
})

export const updateCardSchema = z.object({
  title: z
    .string()
    .min(2, 'Card title must be at least 2 characters')
    .max(200, 'Card title must be at most 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(5000, 'Description must be at most 5000 characters')
    .trim()
    .nullable()
    .optional(),
  dueDate: z
    .string()
    .datetime({ message: 'Due date must be a valid ISO 8601 string' })
    .nullable()
    .optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  assigneeId: z.string().cuid().nullable().optional(),
})

export const moveCardSchema = z.object({
  targetColumnId: z.string().cuid('Invalid target column ID'),
  position: z.number().int().nonnegative('Position must be a non-negative integer'),
})

export const reorderCardsSchema = z.object({
  cardIds: z.array(z.string().cuid()).nonempty('Must provide card list to reorder'),
})

export const createLabelSchema = z.object({
  name: z
    .string()
    .min(2, 'Label name must be at least 2 characters')
    .max(30, 'Label name must be at most 30 characters')
    .trim(),
  color: z.string().regex(hexColorRegex, 'Invalid hex color code'),
})

export const updateLabelSchema = z.object({
  name: z
    .string()
    .min(2, 'Label name must be at least 2 characters')
    .max(30, 'Label name must be at most 30 characters')
    .trim()
    .optional(),
  color: z
    .string()
    .regex(hexColorRegex, 'Invalid hex color code')
    .optional(),
})

export const assignLabelsSchema = z.object({
  labelIds: z.array(z.string().cuid()),
})

export const createSubtaskSchema = z.object({
  title: z
    .string()
    .min(2, 'Subtask title must be at least 2 characters')
    .max(200, 'Subtask title must be at most 200 characters')
    .trim(),
})

export const updateSubtaskSchema = z.object({
  title: z
    .string()
    .min(2, 'Subtask title must be at least 2 characters')
    .max(200, 'Subtask title must be at most 200 characters')
    .trim()
    .optional(),
  isCompleted: z.boolean().optional(),
})

export const reorderSubtasksSchema = z.object({
  subtaskIds: z.array(z.string().cuid()).nonempty('Must provide subtask list to reorder'),
})

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  role: z.enum(['MEMBER', 'VISITOR']),
})

export const updateMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER', 'VISITOR']),
})

export const inviteTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isArchived: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
})

export const notificationPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isRead: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
})
