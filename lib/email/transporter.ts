import nodemailer from "nodemailer";
import "server-only";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

if (process.env.NODE_ENV === "development") {
  transporter.verify().then(
    () => console.log("Email service ready"),
    (err) => console.error("Email service error:", err),
  );
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const { EMAIL_USER, EMAIL_PASSWORD } = process.env;
  if (!EMAIL_USER || !EMAIL_PASSWORD) {
    throw new Error("EMAIL_USER e EMAIL_PASSWORD precisam estar definidos");
  }

  return transporter.sendMail({
    from: `${process.env.APP_NAME} <${EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  });
}
