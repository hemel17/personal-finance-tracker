import { z } from "zod";

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters")
      .optional(),
    email: z.string().email("Invalid email format").optional(),
    currentPassword: z
      .string()
      .min(8, "Current password must be at least 8 characters")
      .optional(),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      )
      .optional(),
  })
  .refine((data) => {
    if (data.newPassword && !data.currentPassword) {
      throw new Error("Current password is required to set new password");
    }
    return true;
  });
