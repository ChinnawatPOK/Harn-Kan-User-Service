import { z } from "zod";

const updateLocationBodySchema = z
  .object({
    latitude: z.number().min(-90).max(90),

    longitude: z.number().min(-180).max(180),
  })
  .strict();

export const updateLocationSchema = z.object({
  body: updateLocationBodySchema,
});
