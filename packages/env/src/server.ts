import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    AUTH_SECRET: z.string().min(16),
    AUTH_URL: z.string().url().optional(),
    AUTH_TRUST_HOST: z.string().optional().default("true"),
    AUTH_ZITADEL_ID: z.string().optional(),
    AUTH_ZITADEL_SECRET: z.string().optional(),
    AUTH_ZITADEL_ISSUER: z.string().optional(),
    BETTER_AUTH_SECRET: z.string().optional(),
    BETTER_AUTH_URL: z.string().url().optional(),
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    CORS_ORIGIN: z.string().url(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.string().default("587"),
    SMTP_SECURE: z.string().default("false"),
    SMTP_USER: z.string().min(1),
    SMTP_PASS: z.string().min(1),
    SMTP_FROM: z.string(),
    NEXTAUTH_URL: z.string().url().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});


