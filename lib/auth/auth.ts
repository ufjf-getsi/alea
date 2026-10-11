import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { nextCookies } from "better-auth/next-js";
import { sendEmail } from "@/lib/email/transporter";
import { verificationEmailTemplate } from "@/lib/email/templates/verificationEmail";
import { resetPasswordEmailTemplate } from "@/lib/email/templates/resetPasswordEmail";
import { ROLE_LEVELS } from "@/lib/auth/roles";
import { waitUntil } from "@vercel/functions";
import { db } from "@/db/db";
import * as schema from "@/db/auth-schema";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  advanced: {
    database: {
      joins: true,
    },
    backgroundTasks: { handler: waitUntil },
  },
  user: {
    additionalFields: {
      roleLevel: {
        type: "number",
        required: false,
        defaultValue: ROLE_LEVELS.USER,
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => {
      waitUntil(
        sendEmail({
          to: user.email,
          subject: "Redefinição de senha",
          ...resetPasswordEmailTemplate({ name: user.name, url }),
        }).catch((err) =>
          console.error("Falha ao enviar e-mail de reset:", err),
        ),
      );
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      waitUntil(
        sendEmail({
          to: user.email,
          subject: "Verifique seu e-mail",
          ...verificationEmailTemplate({
            name: user.name,
            url,
          }),
        }).catch((err) =>
          console.error("Falha ao enviar e-mail de verificação:", err),
        ),
      );
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  plugins: [nextCookies()],
});
