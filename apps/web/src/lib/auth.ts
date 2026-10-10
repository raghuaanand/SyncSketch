import { prisma } from "@syncsketch/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { sendEmail } from "./email";

const OTP_EXPIRES_IN_SECONDS = 10 * 60;

const googleConfigured =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  // BETTER_AUTH_SECRET is read from the environment. On Vercel previews
  // BETTER_AUTH_URL may be unset, so fall back to the deployment URL.
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
  trustedOrigins: [
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") ?? []),
    ...(process.env.VERCEL_BRANCH_URL ? [`https://${process.env.VERCEL_BRANCH_URL}`] : []),
  ].filter(Boolean),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // An unverified account cannot sign in.
    requireEmailVerification: true,
    autoSignIn: false,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
  },

  socialProviders: googleConfigured
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      }
    : {},

  // Same verified email via Google and email/password resolves to one user.
  account: {
    accountLinking: { enabled: true, trustedProviders: ["google"] },
  },

  rateLimit: { enabled: true, storage: "database" },

  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: OTP_EXPIRES_IN_SECONDS,
      allowedAttempts: 5,
      storeOTP: "hashed",
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      rateLimit: { window: 60, max: 3 },
      async sendVerificationOTP({ email, otp, type }) {
        const purpose =
          type === "forget-password"
            ? "reset your password"
            : "verify your email";
        const minutes = OTP_EXPIRES_IN_SECONDS / 60;
        await sendEmail({
          to: email,
          subject: `${otp} is your SyncSketch code`,
          text: `Use this code to ${purpose}: ${otp}\n\nIt expires in ${minutes} minutes. If you didn't request it, ignore this email.`,
          html: `<p>Use this code to ${purpose}:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${otp}</p><p>It expires in ${minutes} minutes. If you didn't request it, ignore this email.</p>`,
        });
      },
    }),
    // Must be last: lets server actions set the session cookie.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
