import { z } from "zod";

export const ridePaymentSchema = z.object({
  country: z.string().min(1, "Country is required"),
  expirationDate: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY format"),
  cvv: z
    .string()
    .trim()
    .regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
  cardNumber: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s+/g, ""))
    .refine((value) => /^\d{12,19}$/.test(value), {
      message: "Card number must be 12 to 19 digits",
    }),
});

export type RidePaymentFormType = z.infer<typeof ridePaymentSchema>;
