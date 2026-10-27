import { z } from "zod";

export const createDailyScheduleSchema = z.object({
  date: z.date(),
  userId: z.string(),
  templateId: z.string().optional()
});

export const updateDailyScheduleSchema =
  createDailyScheduleSchema.partial();