import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@defied/db";
import Zitadel from "@auth/core/providers/zitadel";
import Email from "@auth/core/providers/email";
import type { AuthConfig } from "@auth/core";

export const authConfig: AuthConfig = {
  session: {
    strategy: "database",
    maxAge: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  trustHost: process.env.AUTH_TRUST_HOST === "true" || true,
  providers: [
    Zitadel({
      clientId: process.env.AUTH_ZITADEL_ID,
      clientSecret: process.env.AUTH_ZITADEL_SECRET,
      issuer: process.env.AUTH_ZITADEL_ISSUER,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),
    Email({
      server: {
        host: process.env.SMTP_HOST || "localhost",
        port: Number(process.env.SMTP_PORT || 587),
        auth: {
          user: process.env.SMTP_USER || "",
          pass: process.env.SMTP_PASS || "",
        },
      },
      from: process.env.SMTP_FROM || "noreply@defied.dev",
    }),
  ],
  callbacks: {
    session: ({ session, user }) => {
      if (session?.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
    signIn: async ({ profile }) => {
      if (profile) {
        if (!profile.sub || !profile.email) {
          return false;
        }
        if (profile.email_verified === false) {
          return false;
        }
      }
      return true;
    },
  },
};
