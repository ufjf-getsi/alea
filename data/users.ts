import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db/db";
import { user } from "@/db/auth-schema";

export async function getUserById(id: string) {
  const result = await db.select().from(user).where(eq(user.id, id)).limit(1);

  return result[0] ?? null;
}
