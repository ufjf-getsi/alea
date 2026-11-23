import "server-only";

import { and, count, desc, eq, ilike, lt, or } from "drizzle-orm";
import { db } from "@/db/db";
import { user } from "@/db/schema";

export const ADMIN_PAGE_SIZE = 10;

export async function getUserById(id: string) {
  const result = await db.select().from(user).where(eq(user.id, id)).limit(1);

  return result[0] ?? null;
}

const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&");

export async function listUsers({
  page,
  query,
}: {
  page: number;
  query: string;
}) {
  const term = `%${escapeLike(query)}%`;
  const filter = query
    ? or(ilike(user.name, term), ilike(user.email, term))
    : undefined;

  const [users, [{ total }]] = await Promise.all([
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        roleLevel: user.roleLevel,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(filter)
      .orderBy(desc(user.createdAt), desc(user.id))
      .limit(ADMIN_PAGE_SIZE)
      .offset((page - 1) * ADMIN_PAGE_SIZE),
    db.select({ total: count() }).from(user).where(filter),
  ]);

  return { users, total };
}

// DO NOT remove this condition inside the where
// it ensures the target role level is lower than the actor's, preventing race conditions
export async function updateUserRoleLevel(
  id: string,
  roleLevel: number,
  actorLevel: number,
) {
  const rows = await db
    .update(user)
    .set({ roleLevel })
    .where(and(eq(user.id, id), lt(user.roleLevel, actorLevel)))
    .returning({ id: user.id });

  return rows.length > 0;
}
