import { createTransport } from "nodemailer";
import { env } from "@defied/env/server";

/**
 * Send magic link email
 */
export async function sendMagicLinkEmail(email: string, magicLink: string) {
  const transporter = createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: env.SMTP_FROM,
    to: email,
    subject: "Sign in to Defied",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sign in to Defied</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background-color: #f9fafb;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 1px solid #e5e7eb;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #6366f1;
            }
            .content {
              padding: 30px 0;
            }
            .message {
              font-size: 16px;
              color: #374151;
              line-height: 1.6;
              margin-bottom: 30px;
            }
            .magic-link {
              display: inline-block;
              padding: 12px 24px;
              background-color: #6366f1;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
            }
            .magic-link:hover {
              background-color: #4f46e5;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 14px;
              color: #6b7280;
            }
            .note {
              font-size: 14px;
              color: #6b7280;
              margin-top: 20px;
              padding: 15px;
              background-color: #f3f4f6;
              border-radius: 6px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Defied</div>
            </div>
            <div class="content">
              <p class="message">Hi there,</p>
              <p class="message">You've requested to sign in to your Defied account. Click the button below to complete the sign-in process:</p>
              <div style="text-align: center;">
                <a href="${magicLink}" class="magic-link">Sign in with Magic Link</a>
              </div>
              <div class="note">
                <p><strong>Important:</strong></p>
                <ul>
                  <li>This link will expire in 15 minutes</li>
                  <li>If you didn't request this, you can safely ignore this email</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Defied. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending magic link email:", error);
    return { success: false, error };
  }
}
