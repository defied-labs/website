import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@defied/db";
import { env } from "@defied/env/server";
import Zitadel from "@auth/core/providers/zitadel";
import Email from "@auth/core/providers/email";
import type { AuthConfig } from "@auth/core";

type IdentityClaims = Record<string, unknown>;

function decodeIdentityClaims(
  idToken: string | null | undefined,
): IdentityClaims {
  if (!idToken) return {};

  try {
    const payload = idToken.split(".")[1];
    if (!payload) return {};
    return JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as IdentityClaims;
  } catch {
    return {};
  }
}

function identityValue(claims: IdentityClaims, key: string): string | null {
  const value = claims[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function identityName(claims: IdentityClaims) {
  return (
    identityValue(claims, "name") ||
    [identityValue(claims, "given_name"), identityValue(claims, "family_name")]
      .filter(Boolean)
      .join(" ") ||
    identityValue(claims, "preferred_username") ||
    null
  );
}

function nameFromEmail(email: string | null | undefined) {
  if (!email) return null;

  const localPart = email
    .split("@", 1)[0]
    ?.replace(/[._-]+/g, " ")
    .trim();
  if (!localPart) return null;

  return localPart.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function fetchIdentityClaims(accessToken: string | null | undefined) {
  if (!accessToken) return {};

  try {
    const response = await fetch(
      env.AUTH_ZITADEL_USERINFO_ENDPOINT ??
        `${env.AUTH_ZITADEL_ISSUER}/oidc/v1/userinfo`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!response.ok) return {};

    const claims: unknown = await response.json();
    return claims && typeof claims === "object"
      ? (claims as IdentityClaims)
      : {};
  } catch {
    return {};
  }
}

export const authConfig: AuthConfig = {
  session: {
    strategy: "database",
    maxAge: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  adapter: PrismaAdapter(prisma),
  secret: env.AUTH_SECRET,
  trustHost: env.AUTH_TRUST_HOST === "true",
  providers: [
    Zitadel({
      clientId: env.AUTH_ZITADEL_ID,
      clientSecret: env.AUTH_ZITADEL_SECRET,
      issuer: env.AUTH_ZITADEL_ISSUER,
      client: {
        token_endpoint_auth_method: "client_secret_basic",
      },
      authorization: {
        url:
          env.AUTH_ZITADEL_AUTHORIZATION_ENDPOINT ??
          `${env.AUTH_ZITADEL_ISSUER}/oauth/v2/authorize`,
        params: {
          scope: "openid profile email",
          prompt: "login",
        },
      },
      token:
        env.AUTH_ZITADEL_TOKEN_ENDPOINT ??
        `${env.AUTH_ZITADEL_ISSUER}/oauth/v2/token`,
      userinfo:
        env.AUTH_ZITADEL_USERINFO_ENDPOINT ??
        `${env.AUTH_ZITADEL_ISSUER}/oidc/v1/userinfo`,
      profile: (profile) => ({
        id: profile.sub,
        name:
          profile.name ||
          [profile.given_name, profile.family_name].filter(Boolean).join(" ") ||
          profile.preferred_username ||
          null,
        email: profile.email ?? null,
        image: profile.picture ?? null,
      }),
    }),
    Email({
      server: {
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT),
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      },
      from: env.SMTP_FROM,
    }),
  ],
  callbacks: {
    redirect: async ({ url, baseUrl }) => {
      const publicOrigin = env.CORS_ORIGIN.replace(/\/$/, "");

      if (url.startsWith("/")) return `${publicOrigin}${url}`;

      try {
        const target = new URL(url);
        if (target.origin === baseUrl || target.origin === publicOrigin) {
          return url;
        }
      } catch {
        return publicOrigin;
      }

      return publicOrigin;
    },
    session: async ({ session, user }) => {
      if (session?.user && user) {
        const account = await prisma.account.findFirst({
          where: { userId: user.id, provider: "zitadel" },
          select: { id_token: true, access_token: true },
        });
        const tokenClaims = decodeIdentityClaims(account?.id_token);
        const hasProfileClaims = Boolean(
          identityName(tokenClaims) ||
          identityValue(tokenClaims, "email") ||
          identityValue(tokenClaims, "picture"),
        );
        const claims = {
          ...tokenClaims,
          ...(!hasProfileClaims
            ? await fetchIdentityClaims(account?.access_token)
            : {}),
        };
        const email = user.email ?? identityValue(claims, "email");
        const name = user.name ?? identityName(claims) ?? nameFromEmail(email);
        const image = user.image ?? identityValue(claims, "picture");

        session.user.id = user.id;
        session.user.name = name;
        session.user.email = email;
        session.user.image = image;
        (session.user as typeof session.user & { role: string }).role = (
          user as typeof user & { role: string }
        ).role;

        if (name || email || image) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              name: name ?? undefined,
              email: email ?? undefined,
              image: image ?? undefined,
            },
          });
        }
      }
      return session;
    },
    signIn: async ({ profile }) => {
      if (profile) {
        if (!profile.sub) {
          return false;
        }
        if (env.APP_ENV === "production" && profile.email_verified !== true) {
          return false;
        }
      }
      return true;
    },
  },
  events: {
    async signIn({ user, profile, account }) {
      if (!user.id) return;

      const tokenClaims = decodeIdentityClaims(account?.id_token);
      const profileClaims = (profile ?? {}) as IdentityClaims;
      const hasProfileClaims = Boolean(
        identityName({ ...tokenClaims, ...profileClaims }) ||
        identityValue({ ...tokenClaims, ...profileClaims }, "email") ||
        identityValue({ ...tokenClaims, ...profileClaims }, "picture"),
      );
      const claims = {
        ...tokenClaims,
        ...(!hasProfileClaims
          ? await fetchIdentityClaims(account?.access_token)
          : {}),
        ...profileClaims,
      } as IdentityClaims;
      const name = identityName(claims);
      const email = identityValue(claims, "email") ?? user.email;
      const image = identityValue(claims, "picture") ?? user.image;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name ?? nameFromEmail(email) ?? undefined,
          email: email ?? undefined,
          image: image ?? undefined,
          emailVerified:
            claims.email_verified === true ? new Date() : undefined,
        },
      });
    },
  },
};
