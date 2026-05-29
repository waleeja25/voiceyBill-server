import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
});

export type UpdateUserType = z.infer<typeof updateUserSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const deleteAccountSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be a 6-digit code"),
});

export type ChangePasswordType = z.infer<typeof changePasswordSchema>;
export type DeleteAccountType = z.infer<typeof deleteAccountSchema>;
