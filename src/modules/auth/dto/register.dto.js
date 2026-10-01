import { z } from "zod";

export const registerSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(1, "Name is required")
        .max(100, "Name must not exceed 100 characters"),

      phone_number: z.string().trim().min(1, "Phone number is required"),

      password: z
        .string()
        .min(8, "Password must contain at least 8 characters")
        .max(128, "Password must not exceed 128 characters"),
    })
    .strict(),
});
