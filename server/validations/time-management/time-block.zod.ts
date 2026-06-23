import { z } from "zod";
import {
  TimeCategoryEnum,
  PriorityEnum,
  RepeatTypeEnum
} from "./enums";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const baseTimeBlockSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),

  startTime: z.string().regex(timeRegex),
  endTime: z.string().regex(timeRegex),

  duration: z.number().int().positive(),

  category: z.enum(TimeCategoryEnum),
  priority: z.enum(PriorityEnum).default("MEDIUM"),

  position: z.number().default(0),

  isCompleted: z.boolean().default(false),
  isLocked: z.boolean().default(false),

  repeatType: z.enum(RepeatTypeEnum).default("ONCE"),
  repeatDays: z.string().optional(),
  repeatEnd: z.coerce.date().optional(),

  templateId: z.string().optional(),
  scheduleId: z.string().optional(),
});

export const createTimeBlockSchema = baseTimeBlockSchema.refine(
  (data) => data.startTime < data.endTime,
  {
    message: "startTime doit être inférieur à endTime",
    path: ["endTime"]
  }
);

export const updateTimeBlockSchema = baseTimeBlockSchema.partial();