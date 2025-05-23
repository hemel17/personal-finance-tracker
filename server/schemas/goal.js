import { z } from "zod";

export const createGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required").trim(),
  targetAmount: z.number().positive("Target amount must be a positive number"),
  currentAmount: z
    .number()
    .min(0, "Current amount cannot be negative")
    .optional(),
  startDate: z.string().transform((str) => new Date(str)),
  targetDate: z.string().transform((str) => new Date(str)),
  category: z.enum(
    ["Vacation", "Emergency Fund", "Education", "Home", "Vehicle", "Other"],
    "Invalid goal category"
  ),
  status: z
    .enum(["In Progress", "Completed", "Cancelled"], "Invalid goal status")
    .optional(),
});

export const updateGoalSchema = createGoalSchema.partial();
