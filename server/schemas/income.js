import { z } from "zod";

export const createIncomeSchema = z.object({
  amount: z.number().positive("Amount must be a positive number"),
  source: z.enum(["Salary", "Freelance", "Investments", "Other"], {
    errorMap: () => ({ message: "Invalid income source" }),
  }),
  date: z.string().transform((str) => new Date(str)),
  paymentMethod: z.enum(["Bank", "Cash", "Credit Card"], {
    errorMap: () => ({ message: "Invalid payment method" }),
  }),
  description: z.string().trim().optional(),
});

export const updateIncomeSchema = createIncomeSchema.partial();
