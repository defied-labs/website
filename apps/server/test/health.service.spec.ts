import "reflect-metadata";
import { describe, it, expect, beforeEach, vi } from "vitest";

const { mockEnv, mockQueryRaw, mockVerify } = vi.hoisted(() => ({
  mockEnv: {
    APP_ENV: "development",
    SMTP_HOST: "smtp.test",
    AUTH_ZITADEL_ISSUER: "https://auth.test/oauth" as string | undefined,
  },
  mockQueryRaw: vi.fn(),
  mockVerify: vi.fn(),
}));

vi.mock("@defied/env/server", () => ({ env: mockEnv }));
vi.mock("@defied/db", () => ({ default: { $queryRaw: mockQueryRaw } }));
vi.mock("@defied/auth", () => ({ verifyEmailConnection: mockVerify }));

import { HealthService } from "../src/health.service";
import { AppController } from "../src/app.controller";
import { AppService } from "../src/app.service";

describe("HealthService", () => {
  let service: HealthService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.AUTH_ZITADEL_ISSUER = "https://auth.test/oauth";
    service = new HealthService();
  });

  it("app() reports ok with the environment", () => {
    expect(service.app()).toEqual({ status: "ok", environment: "development" });
  });

  it("database() reports ok when the query succeeds", async () => {
    mockQueryRaw.mockResolvedValue([1]);
    expect(await service.database()).toEqual({ status: "ok" });
  });

  it("database() reports the error when the query fails", async () => {
    mockQueryRaw.mockRejectedValue(new Error("connection refused"));
    expect(await service.database()).toEqual({
      status: "error",
      message: "connection refused",
    });
  });

  it("database() handles non-Error rejections", async () => {
    mockQueryRaw.mockRejectedValue("boom");
    expect(await service.database()).toEqual({
      status: "error",
      message: "Unknown provider error",
    });
  });

  it("auth() reports the issuer origin when configured", () => {
    expect(service.auth()).toEqual({
      status: "ok",
      provider: "zitadel",
      issuer: "https://auth.test",
    });
  });

  it("auth() reports an error when not configured", () => {
    mockEnv.AUTH_ZITADEL_ISSUER = undefined;
    expect(service.auth()).toMatchObject({
      status: "error",
      provider: "zitadel",
    });
  });

  it("mail() reports ok when SMTP verifies", async () => {
    mockVerify.mockResolvedValue(true);
    expect(await service.mail()).toEqual({
      status: "ok",
      provider: "smtp.test",
    });
  });

  it("mail() reports error when SMTP does not verify", async () => {
    mockVerify.mockResolvedValue(false);
    expect(await service.mail()).toEqual({
      status: "error",
      provider: "smtp.test",
    });
  });

  it("mail() reports the error when verification throws", async () => {
    mockVerify.mockRejectedValue(new Error("auth failed"));
    expect(await service.mail()).toEqual({
      status: "error",
      provider: "smtp.test",
      message: "auth failed",
    });
  });
});

describe("AppController health endpoints", () => {
  it("delegates to HealthService", async () => {
    const health = new HealthService();
    const controller = new AppController(new AppService(), health);
    mockQueryRaw.mockResolvedValue([1]);
    mockVerify.mockResolvedValue(true);

    expect(controller.health()).toEqual(health.app());
    expect(await controller.databaseHealth()).toEqual({ status: "ok" });
    expect(controller.authHealth()).toEqual(health.auth());
    expect(await controller.mailHealth()).toMatchObject({ status: "ok" });
  });
});
