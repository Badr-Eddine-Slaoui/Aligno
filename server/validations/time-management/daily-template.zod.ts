import { z } from "zod";

export const createDailyTemplateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  userId: z.string()
});

export const updateDailyTemplateSchema =
  createDailyTemplateSchema.partial();