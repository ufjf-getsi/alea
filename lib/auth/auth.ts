import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { nextCookies } from "better-auth/next-js";
import { sendEmail } from "@/lib/email/transporter";
import { verificationEmailTemplate } from "@/lib/email/templates/verificationEmail";
import { resetPasswordEmailTemplate } from "@/lib/email/templates/resetPasswordEmail";

import { db } from "@/db/db";
import * as schema from "@/db/auth-schema";
import { ROLE_LEVELS } from "@/lib/auth/roles";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  advanced: {
    database: {
      joins: true,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
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
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Redefinição de senha",
        html: resetPasswordEmailTemplate({ name: user.name, url }),
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      sendEmail({
        to: user.email,
        subject: "Verifique seu e-mail",
        html: verificationEmailTemplate({
          name: user.name,
          url,
        }),
      });
    },
  },
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [nextCookies()],
});
