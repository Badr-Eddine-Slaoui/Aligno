import { z } from "zod";

export const createTimeBlockSchema = z.object({
  title: z
    .string()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(100),

  description: z
    .string()
    .optional(),

  startTime: z.string(),

  endTime: z.string(),

  duration: z
    .number()
    .positive(),

  category: z.enum([
    "WORK",
    "STUDY",
    "HEALTH",
    "BREAK",
    "PERSONAL",
    "MEETING",
    "OTHER"
  ]),

  priority: z.enum([
    "LOW",
    "MEDIUM",
    "HIGH"
  ]).default("MEDIUM"),

  position: z.number().default(0),

  repeatType: z.enum([
    "NONE",
    "ONCE",
    "DAILY",
    "WEEKLY",
    "MONTHLY"
  ]).default("ONCE"),

  repeatDays: z.string().optional(),

  repeatEnd: z.coerce.date().optional(),

  scheduleId: z.string().optional(),

  templateId: z.string().optional()
});