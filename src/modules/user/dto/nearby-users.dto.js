import { z } from "zod";

const nearbyUsersQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),

  lng: z.coerce.number().min(-180).max(180),

  radiusMeters: z.coerce.number().positive().max(50000).default(500),

  maxAgeMinutes: z.coerce.number().int().positive().default(1440),

  limit: z.coerce.number().int().positive().max(1000).default(500),

  cursor: z.string().min(1).optional(),
});

export const nearbyUsersSchema = z.object({
  query: nearbyUsersQuerySchema,
});
