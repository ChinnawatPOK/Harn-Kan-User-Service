import { z } from "zod";

const locationSchema = z.object({
  type: z.literal("Point"),

  coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]),
});

const updateUserBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(100, "Name must not exceed 100 characters")
      .optional(),

    phone_number: z.string().trim().min(1, "Phone number is required").optional(),

    location: locationSchema.optional(),

    notification_prefs: z.array(z.string()).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const updateUserSchema = z.object({
  body: updateUserBodySchema,
});
