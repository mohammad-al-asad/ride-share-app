import { z } from "zod";

export const stripeAccountSchema = z.object({
  stripeAccountId: z.string().trim().min(1, "Stripe account ID is required"),
});

export const vehicleInfoSchema = z
  .object({
    brand: z.string().trim().min(1, "Make is required"),
    model: z.string().trim().min(1, "Model is required"),
    year: z
      .string()
      .trim()
      .regex(/^\d{4}$/, "Year is required"),
    type: z.string().trim().min(1, "Type is required"),
    tier: z.string().trim().min(1, "Tier is required"),
    seats: z
      .string()
      .trim()
      .min(1, "Seats is required")
      .refine((value) => {
        const parsed = Number(value);
        return Number.isInteger(parsed) && parsed > 0;
      }, "Seats must be a positive number"),
    licensePlate: z.string().trim().min(1, "License plate is required"),
  });

export type StripeAccountFormValues = z.infer<typeof stripeAccountSchema>;
export type VehicleInfoFormValues = z.infer<typeof vehicleInfoSchema>;
