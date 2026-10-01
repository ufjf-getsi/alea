export function resetPasswordEmailTemplate({
  name,
  url,
}: {
  name: string;
  url: string;
}) {
  return `
    <div>
      <h1>Olá, ${name}!</h1>

      <p>Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para escolher uma nova senha:</p>

      <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
        Redefinir senha
      </a>

      <p style="color: #666; font-size: 14px;">Ou copie e cole este link no seu navegador:</p>
      <p style="color: #666; font-size: 12px; word-break: break-all;">${url}</p>

      <p style="color: #999; font-size: 12px; margin-top: 30px;">Este link expira em 1 hora.</p>
      <p style="color: #999; font-size: 12px;">Se você não solicitou a redefinição, ignore este e-mail. Sua senha continuará a mesma.</p>
    </div>
  `;
}
