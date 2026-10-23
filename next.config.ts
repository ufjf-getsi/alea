import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

//Content Security Policy
const csp = [
  "default-src 'self'",

  //'unsafe-inline' is an XSS risk, but enabled just in case some features need it
  //Remove this if nothing breaks without it
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,

  "style-src 'self' 'unsafe-inline'",

  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://tile.openstreetmap.org https://*.google.com https://*.tile.opentopomap.org https://server.arcgisonline.com",

  "font-src 'self'",

  //external APIs needs to be authorized manually
  "connect-src 'self'",

  "object-src 'none'",

  "base-uri 'self'",

  "form-action 'self'",

  "frame-ancestors 'none'",

  ...(!isDev ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },

  { key: "X-Content-Type-Options", value: "nosniff" },

  { key: "X-Frame-Options", value: "DENY" },

  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },

  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },

  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },

  ...(!isDev
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
