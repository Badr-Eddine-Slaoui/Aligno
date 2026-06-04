import { z } from "zod";

export const createDailyScheduleSchema = z.object({
  date: z.coerce.date(),
  userId: z.string(),
  templateId: z.string().optional()
});

export const updateDailyScheduleSchema =
  createDailyScheduleSchema.partial();