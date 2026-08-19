import prisma from "@defied/db";
import { env } from "@defied/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { magicLink } from "better-auth/plugins/magic-link";
import { sendEmail } from "./lib/email";

const sendMagicLink = async (
  {
    email,
    token,
    url,
    metadata,
  }: { email: string; token: string; url: string; metadata?: any },
  _ctx: any,
) => {
  console.log("Sending magic link email to:", email);

  // Rewrite the URL to go through the web app proxy instead of directly to the server
  // The original URL is like http://localhost:3000/api/auth/magic-link/verify?token=xxx
  // We need to rewrite it to use the web app URL which proxies to the server
  const urlObj = new URL(url);
  const proxyUrl = `${env.CORS_ORIGIN}/api/auth/magic-link/success?${urlObj.searchParams.toString()}`;

  // Send the actual email with magic link
  await sendEmail({
    to: email,
    subject: "Your Magic Link is Ready",
    html: `
            <div>
              <h2>Magic Link Login</h2>
              <p>Click the button below to login:</p>
              <a href="${proxyUrl}" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Login with Magic Link</a>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
          `,
  });

  console.log(`Magic link sent to ${email}`);
};
      
export const auth = betterAuth({
  baseUrl: env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),

  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
  magicLink: {
    enabled: true,
  },
  session: {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [
    organization(),
    magicLink({
      sendMagicLink,
    }),
  ],
});

