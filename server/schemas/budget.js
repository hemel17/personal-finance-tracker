import { z } from "zod";

export const createBudgetSchema = z.object({
  category: z.enum(
    [
      "Food",
      "Transport",
      "Entertainment",
      "Bills",
      "Healthcare",
      "Shopping",
      "Other",
    ],
    "Invalid category"
  ),
  amount: z.number().positive("Amount must be a positive number"),
  month: z.string().transform((str) => new Date(str)),
});

export const updateBudgetSchema = createBudgetSchema.partial();
