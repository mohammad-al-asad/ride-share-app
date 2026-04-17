import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name is required")
    .max(20, "Name must be less than 20 chars"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 chars"),
  phone: z.string().length(10, "Phone must be 10 digits"),
});

export const roleSchema = z.enum(["driver", "rider"]);

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 chars"),
});

export const updateProfileInfoSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  phone: z.string().regex(/^01\d{9}$/, "Phone must be 11 digits"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 chars"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "New password must be at least 8 chars"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type RegisterType = z.infer<typeof registerSchema>;
export type LoginType = z.infer<typeof loginSchema>;
export type UpdateProfileInfoType = z.infer<typeof updateProfileInfoSchema>;
export type ChangePasswordType = z.infer<typeof changePasswordSchema>;
export type ResetPasswordType = z.infer<typeof resetPasswordSchema>;

export const supportTicketSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message is too long"),
  againstUserId: z.string().optional().nullable(),
  tripId: z.string().optional().nullable(),
});

export type SupportTicketType = z.infer<typeof supportTicketSchema>;
