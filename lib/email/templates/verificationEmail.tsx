export function verificationEmailTemplate({
  name,
  url,
}: {
  name: string;
  url: string;
}) {
  return `
    <div>
      <h1>Olá, ${name}!</h1>

      <p>
        Obrigado por criar sua conta.
      </p>

      <p>Obrigado por se registrar. Para completar seu cadastro, verifique seu endereço de email clicando no link abaixo:</p>
          <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Verificar Email
          </a>
          <p style="color: #666; font-size: 14px;">Ou copie e cole este link no seu navegador:</p>
          <p style="color: #666; font-size: 12px; word-break: break-all;">${url}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">Este link expirará em 1 hora.</p>
    </div>
  `;
}
