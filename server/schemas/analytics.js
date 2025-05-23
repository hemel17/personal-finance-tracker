import { z } from "zod";

export const analyticsQuerySchema = z.object({
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  category: z
    .enum([
      "Food",
      "Transport",
      "Entertainment",
      "Bills",
      "Healthcare",
      "Shopping",
      "Other",
    ])
    .optional(),
  groupBy: z
    .enum(["day", "week", "month", "category", "paymentMethod"])
    .optional(),
});
