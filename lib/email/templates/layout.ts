import { escapeHtml } from "@/lib/email/escapeHtml";

export function emailLayout(content: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#222;line-height:1.5;">
    <div style="max-width:560px;margin:0 auto;">${content}</div>
  </body>
</html>`;
}

export function emailButton(href: string, label: string) {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 24px;background-color:#007bff;color:#ffffff;text-decoration:none;border-radius:4px;margin:20px 0;">${escapeHtml(label)}</a>`;
}

export function emailFallbackLink(url: string) {
  return `
    <p style="color:#666;font-size:14px;">Ou copie e cole este link no seu navegador:</p>
    <p style="color:#666;font-size:12px;word-break:break-all;">${escapeHtml(url)}</p>`;
}
