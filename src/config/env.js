import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  PORT: z.coerce.number().int().positive().default(3000),

  MONGODB_URI: z.string().min(1),

  JWT_SECRET: z.string().min(32, "JWT_SECRET must contain at least 32 characters"),

  JWT_EXPIRES_IN: z.string().default("1d"),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default(process.env.NODE_ENV === "test" ? "silent" : "info"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment configuration:", result.error.flatten().fieldErrors);

  process.exit(1);
}

const env = result.data;

export default env;
