import { Injectable } from "@nestjs/common";
import { env } from "@defied/env/server";

@Injectable()
export class HealthService {
  app() {
    return { status: "ok", environment: env.APP_ENV };
  }

  async database() {
    try {
      const { default: prisma } = await import("@defied/db");
      await prisma.$queryRaw`SELECT 1`;
      return { status: "ok" };
    } catch (error) {
      return { status: "error", message: errorMessage(error) };
    }
  }

  auth() {
    if (!env.AUTH_ZITADEL_ISSUER) {
      return {
        status: "error",
        provider: "zitadel",
        message: "Auth provider is not configured",
      };
    }

    return {
      status: "ok",
      provider: "zitadel",
      issuer: new URL(env.AUTH_ZITADEL_ISSUER).origin,
    };
  }

  async mail() {
    try {
      const { verifyEmailConnection } = await import("@defied/auth");
      const verified = await verifyEmailConnection();
      return { status: verified ? "ok" : "error", provider: env.SMTP_HOST };
    } catch (error) {
      return {
        status: "error",
        provider: env.SMTP_HOST,
        message: errorMessage(error),
      };
    }
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown provider error";
}
