import prisma from "@defied/db";
import { env } from "@defied/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { magicLink } from "better-auth/plugins/magic-link";
import { sendEmail } from "./lib/email";

export const auth = betterAuth({
  baseUrl: env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),

  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
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
      sendMagicLink: async ({ email, token, url, metadata }, _ctx) => {
        console.log("Sending magic link email to:", email);

        // Send the actual email with magic link
        await sendEmail({
          to: email,
          subject: "Your Magic Link is Ready",
          html: `
            <div>
              <h2>Magic Link Login</h2>
              <p>Click the button below to login:</p>
              <a href="${url}" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Login with Magic Link</a>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
          `,
        });

        console.log(`Magic link sent to ${email}`);
      },
    }),
  ],
});
