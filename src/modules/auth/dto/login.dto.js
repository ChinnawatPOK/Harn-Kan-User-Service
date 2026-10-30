import { z } from "zod";

export const loginSchema = z.object({
  body: z
    .object({
      phoneNumber: z.string().trim().min(1, "Phone number is required"),

      password: z.string().min(1, "Password is required"),
    })
    .strict(),
});
