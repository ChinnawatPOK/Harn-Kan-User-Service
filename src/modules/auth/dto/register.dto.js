import { z } from "zod";

export const registerSchema = z.object({
  body: z
    .object({
      fullName: z
        .string()
        .trim()
        .min(1, "Full name is required")
        .max(100, "Full name must not exceed 100 characters"),

      phoneNumber: z
        .string()
        .trim()
        .min(1, "Phone number is required")
        .max(32, "Phone number must not exceed 32 characters"),

      password: z
        .string()
        .min(8, "Password must contain at least 8 characters")
        .max(128, "Password must not exceed 128 characters"),
      acceptedTerms: z.literal(true, {
        error: "Terms and Conditions must be accepted",
      }),
    })
    .strict(),
});
