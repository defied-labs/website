import dotenv from "dotenv";
import path from "node:path";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const appEnvironment = process.env.APP_ENV ?? "development";

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${appEnvironment}`),
  override: true,
});

dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
  override: true,
});

export const env = createEnv({
  server: {
    INTERNAL_SERVER_URL: z.url(),
    PAYLOAD_SECRET: z.string().min(32),
    DATABASE_URL: z.string().min(1),
    APP_ENV: z
      .enum(["development", "staging", "production"])
      .default("development"),
  },
  client: {
    NEXT_PUBLIC_SERVER_URL: z.url(),
  },
  runtimeEnv: {
    INTERNAL_SERVER_URL: process.env.INTERNAL_SERVER_URL,
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    APP_ENV: process.env.APP_ENV,
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
  },
  emptyStringAsUndefined: true,
});
