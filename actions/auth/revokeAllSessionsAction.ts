"use server";

import { auth } from "@/lib/auth/auth";
import { requireSession } from "@/lib/auth/session";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function revokeAllSessionsAction() {
  await requireSession();

  const requestHeaders = await headers();

  await auth.api.revokeSessions({ headers: requestHeaders });

  try {
    await auth.api.signOut({ headers: requestHeaders });
  } catch {}

  redirect("/login");
}
