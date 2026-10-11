import { escapeHtml } from "@/lib/email/escapeHtml";
import {
  emailButton,
  emailFallbackLink,
  emailLayout,
} from "@/lib/email/templates/layout";

export function verificationEmailTemplate({
  name,
  url,
}: {
  name: string;
  url: string;
}) {
  const html = emailLayout(`
    <h1 style="font-size:22px;">Olá, ${escapeHtml(name)}!</h1>
    <p>Obrigado por criar sua conta. Para completar seu cadastro, verifique seu endereço de e-mail:</p>
    ${emailButton(url, "Verificar e-mail")}
    ${emailFallbackLink(url)}
    <p style="color:#666;font-size:12px;margin-top:30px;">Este link expira em 1 hora.</p>
    <p style="color:#666;font-size:12px;">Se você não criou esta conta, ignore este e-mail.</p>
  `);

  const text = `Olá, ${name}!

Obrigado por criar sua conta. Para completar seu cadastro, verifique seu e-mail acessando o link:

${url}

Este link expira em 1 hora.
Se você não criou esta conta, ignore este e-mail.`;

  return { html, text };
}
