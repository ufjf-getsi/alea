"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  await auth.api.signOut({
    headers: await headers(), //this is used to identify the user
  });

  redirect("/");
}
