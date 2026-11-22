import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockEnv, mockPrisma } = vi.hoisted(() => ({
  mockEnv: {
    AUTH_SECRET: "test-secret",
    AUTH_TRUST_HOST: "true",
    AUTH_ZITADEL_ID: "zitadel-id",
    AUTH_ZITADEL_SECRET: "zitadel-secret",
    AUTH_ZITADEL_ISSUER: "https://auth.defied.dev",
    CORS_ORIGIN: "https://defied.dev/",
    APP_ENV: "production",
    SMTP_HOST: "localhost",
    SMTP_PORT: "587",
    SMTP_USER: "user",
    SMTP_PASS: "pass",
    SMTP_FROM: "noreply@defied.dev",
  } as Record<string, string | undefined>,
  mockPrisma: {
    account: { findFirst: vi.fn() },
    user: { update: vi.fn() },
  },
}));

vi.mock("@defied/env/server", () => ({ env: mockEnv }));
vi.mock("@defied/db", () => ({ default: mockPrisma }));
vi.mock("@auth/prisma-adapter", () => ({ PrismaAdapter: () => ({}) }));

import { authConfig } from "../src/auth.config";

const callbacks = authConfig.callbacks!;
const events = authConfig.events!;

function fakeIdToken(claims: Record<string, unknown>) {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none" })}.${encode(claims)}.signature`;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockEnv.APP_ENV = "production";
  mockPrisma.account.findFirst.mockResolvedValue(null);
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
});

describe("redirect callback", () => {
  const redirect = (url: string) =>
    callbacks.redirect!({ url, baseUrl: "https://api.defied.dev" });

  it("resolves relative paths against the public origin", async () => {
    await expect(redirect("/blog/post")).resolves.toBe(
      "https://defied.dev/blog/post",
    );
  });

  it("allows absolute URLs on the public origin or the auth base URL", async () => {
    await expect(redirect("https://defied.dev/dashboard")).resolves.toBe(
      "https://defied.dev/dashboard",
    );
    await expect(redirect("https://api.defied.dev/callback")).resolves.toBe(
      "https://api.defied.dev/callback",
    );
  });

  it.each([
    "https://evil.com/phish",
    "https://defied.dev.evil.com/",
    "https://evil.com@defied.dev.evil.com/",
    "http://defied.dev/downgrade",
    "javascript:alert(1)",
    "not a url",
  ])("falls back to the public origin for %s", async (url) => {
    await expect(redirect(url)).resolves.toBe("https://defied.dev");
  });

  it("keeps protocol-relative and backslash paths on the public origin", async () => {
    for (const url of ["//evil.com", "/\\evil.com"]) {
      const result = new URL(await redirect(url));
      expect(result.origin).toBe("https://defied.dev");
    }
  });
});

describe("signIn callback", () => {
  const signIn = (profile?: Record<string, unknown>) =>
    callbacks.signIn!({ profile, user: { id: "u1" } } as never);

  it("allows magic-link sign-ins, which have no OIDC profile", async () => {
    await expect(signIn(undefined)).resolves.toBe(true);
  });

  it("rejects profiles without a subject", async () => {
    await expect(signIn({ email_verified: true })).resolves.toBe(false);
  });

  it("rejects unverified emails in production", async () => {
    await expect(signIn({ sub: "1", email_verified: false })).resolves.toBe(
      false,
    );
    await expect(signIn({ sub: "1", email_verified: "true" })).resolves.toBe(
      false,
    );
  });

  it("accepts verified emails in production", async () => {
    await expect(signIn({ sub: "1", email_verified: true })).resolves.toBe(
      true,
    );
  });

  it("does not require verification outside production", async () => {
    mockEnv.APP_ENV = "development";
    await expect(signIn({ sub: "1" })).resolves.toBe(true);
  });
});

describe("session callback", () => {
  const session = (user: Record<string, unknown>) =>
    callbacks.session!({
      session: { user: {}, expires: "" },
      user: { id: "u1", role: "ADMIN", ...user },
    } as never) as unknown as Promise<{ user: Record<string, unknown> }>;

  it("fills missing profile fields from the stored id_token", async () => {
    mockPrisma.account.findFirst.mockResolvedValue({
      id_token: fakeIdToken({
        given_name: "Ada",
        family_name: "Lovelace",
        email: "ada@defied.dev",
        picture: "https://img/ada.png",
      }),
      access_token: "at",
    });

    const result = await session({ email: null, name: null, image: null });

    expect(result.user).toMatchObject({
      id: "u1",
      role: "ADMIN",
      name: "Ada Lovelace",
      email: "ada@defied.dev",
      image: "https://img/ada.png",
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("derives a display name from the email when no claims exist", async () => {
    const result = await session({
      email: "grace.hopper@defied.dev",
      name: null,
      image: null,
    });
    expect(result.user.name).toBe("Grace Hopper");
  });

  it("survives a malformed id_token and a failing userinfo endpoint", async () => {
    mockPrisma.account.findFirst.mockResolvedValue({
      id_token: "garbage",
      access_token: "at",
    });

    const result = await session({ email: null, name: null, image: null });

    expect(fetch).toHaveBeenCalledOnce();
    expect(result.user).toMatchObject({ name: null, email: null });
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });
});

describe("signIn event", () => {
  it("only marks the email verified when the provider says so", async () => {
    await events.signIn!({
      user: { id: "u1", email: "a@defied.dev" },
      profile: { sub: "1", name: "A", email_verified: false },
      account: null,
    } as never);
    expect(mockPrisma.user.update.mock.calls[0]![0].data.emailVerified).toBe(
      undefined,
    );

    await events.signIn!({
      user: { id: "u1", email: "a@defied.dev" },
      profile: { sub: "1", name: "A", email_verified: true },
      account: null,
    } as never);
    expect(
      mockPrisma.user.update.mock.calls[1]![0].data.emailVerified,
    ).toBeInstanceOf(Date);
  });
});

describe("signIn event role sync", () => {
  const ROLES = "urn:zitadel:iam:org:project:roles";
  const zitadel = { provider: "zitadel", type: "oidc" };

  async function signInWith(
    profile: Record<string, unknown>,
    account: unknown = zitadel,
  ) {
    await events.signIn!({
      user: { id: "u1", email: "a@defied.dev" },
      profile: { sub: "1", name: "A", ...profile },
      account,
    } as never);
    return mockPrisma.user.update.mock.calls.at(-1)![0].data.role;
  }

  it("requests the Zitadel project roles scope", () => {
    const zitadelProvider = authConfig.providers.find(
      (p) => typeof p === "object" && "id" in p && p.id === "zitadel",
    ) as { authorization?: { params?: { scope?: string } } } | undefined;
    const scope =
      zitadelProvider?.authorization?.params?.scope ??
      // Provider factories keep user options under `options`.
      (
        zitadelProvider as unknown as {
          options?: { authorization?: { params?: { scope?: string } } };
        }
      )?.options?.authorization?.params?.scope;
    expect(scope?.split(" ")).toContain(ROLES);
  });

  it("grants site_admin when Zitadel grants the role", async () => {
    await expect(
      signInWith({ [ROLES]: { site_admin: { "123": "defied.dev" } } }),
    ).resolves.toBe("site_admin");
  });

  it("demotes to user when the role is not granted", async () => {
    await expect(
      signInWith({ [ROLES]: { editor: { "123": "defied.dev" } } }),
    ).resolves.toBe("user");
  });

  it("demotes to user when the roles claim is missing or malformed", async () => {
    await expect(signInWith({})).resolves.toBe("user");
    await expect(signInWith({ [ROLES]: ["site_admin"] })).resolves.toBe("user");
    await expect(signInWith({ [ROLES]: "site_admin" })).resolves.toBe("user");
  });

  it("ignores roles that only appear in the userinfo response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ [ROLES]: { site_admin: { "123": "defied.dev" } } }),
        ),
      ),
    );
    await expect(
      signInWith({ name: undefined }, { ...zitadel, access_token: "t" }),
    ).resolves.toBe("user");
  });

  it("leaves the stored role untouched for magic-link logins", async () => {
    await expect(
      signInWith(
        { [ROLES]: { site_admin: { "123": "defied.dev" } } },
        { provider: "email", type: "email" },
      ),
    ).resolves.toBeUndefined();
  });
});
