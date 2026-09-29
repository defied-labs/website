import dotenv from "dotenv";
import path from "node:path";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const isTestEnvironment = process.env.NODE_ENV === "test";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const appEnvironment = process.env.APP_ENV ?? "development";

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${appEnvironment}`),
  override: true,
});

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    AUTH_SECRET: z.string().min(32),
    AUTH_URL: z.string().url().optional(),
    AUTH_TRUST_HOST: z.string().optional().default("true"),
    AUTH_ZITADEL_ID: isTestEnvironment
      ? z.string().min(1).optional()
      : z.string().min(1),
    AUTH_ZITADEL_SECRET: isTestEnvironment
      ? z.string().min(1).optional()
      : z.string().min(1),
    AUTH_ZITADEL_ISSUER: isTestEnvironment
      ? z.string().url().optional()
      : z.string().url(),
    AUTH_ZITADEL_AUTHORIZATION_ENDPOINT: z.string().url().optional(),
    AUTH_ZITADEL_TOKEN_ENDPOINT: z.string().url().optional(),
    AUTH_ZITADEL_USERINFO_ENDPOINT: z.string().url().optional(),
    STRIPE_SECRET_KEY: z.string().min(1).optional(),
    STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
    CORS_ORIGIN: z.string().url(),
    SERVER_PORT: z.coerce.number().int().min(1).max(65535).default(3005),
    APP_ENV: z
      .enum(["development", "staging", "production"])
      .default("development"),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.string().default("587"),
    SMTP_SECURE: z.string().default("false"),
    SMTP_USER: z.string().min(1),
    SMTP_PASS: z.string().min(1),
    SMTP_FROM: z.string(),
    LOG_LEVEL: z.string().default("info"),
    PINO_PRETTY: z.enum(["true", "false"]).default("true"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

export function logConfigSummary() {
  console.info(
    `[config] environment=${env.APP_ENV} node=${env.NODE_ENV} port=${env.SERVER_PORT} ` +
      `auth=${env.AUTH_ZITADEL_ISSUER ? new URL(env.AUTH_ZITADEL_ISSUER).origin : "unconfigured"} ` +
      `mail=${env.SMTP_HOST} ` +
      `cors=${env.CORS_ORIGIN}`,
  );
}
