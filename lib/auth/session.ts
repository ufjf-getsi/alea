import "server-only";
import { auth } from "@/lib/auth/auth";
import { cache } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { hasLevel, can, type Permission } from "@/lib/auth/roles";

//this function reads session from headers, role can be outdated
export const getSession = cache(async () => {
  return auth.api.getSession({
    headers: await headers(),
  });
});

//get session from db ignoring cookie cache
export const getFreshSession = cache(async () => {
  return auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
});

export async function requireSession() {
  const session = await getFreshSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requirePermission(permission: Permission) {
  const session = await requireSession();

  if (!can(session.user.roleLevel, permission)) {
    notFound(); //hide protected routes
  }

  return session;
}

// export async function requireRole(minLevel: number) {
//   const session = await requireSession();

//   if (!hasLevel(session.user.roleLevel, minLevel)) {
//     notFound();
//   }

//   return session;
// }
