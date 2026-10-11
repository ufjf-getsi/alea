import { escapeHtml } from "@/lib/email/escapeHtml";
import {
  emailButton,
  emailFallbackLink,
  emailLayout,
} from "@/lib/email/templates/layout";

export function resetPasswordEmailTemplate({
  name,
  url,
}: {
  name: string;
  url: string;
}) {
  const html = emailLayout(`
    <h1 style="font-size:22px;">Olá, ${escapeHtml(name)}!</h1>
    <p>Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para escolher uma nova senha:</p>
    ${emailButton(url, "Redefinir senha")}
    ${emailFallbackLink(url)}
    <p style="color:#666;font-size:12px;margin-top:30px;">Este link expira em 1 hora.</p>
    <p style="color:#666;font-size:12px;">Se você não solicitou a redefinição, ignore este e-mail. Sua senha continuará a mesma.</p>
  `);

  const text = `Olá, ${name}!

Recebemos uma solicitação para redefinir a senha da sua conta. Acesse o link para escolher uma nova senha:

${url}

Este link expira em 1 hora.
Se você não solicitou a redefinição, ignore este e-mail. Sua senha continuará a mesma.`;

  return { html, text };
}
