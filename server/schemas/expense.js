import { z } from "zod";

export const createExpenseSchema = z.object({
  amount: z.number().positive("Amount must be a positive number"),
  description: z.string().min(1, "Description is required").trim(),
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
  date: z.string().transform((str) => new Date(str)),
  paymentMethod: z.enum(
    ["Bank", "Cash", "Credit Card"],
    "Invalid payment method"
  ),
});

export const updateExpenseSchema = createExpenseSchema.partial();
