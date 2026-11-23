"use server";

import { revalidatePath } from "next/cache";
import { updateUserRoleSchema } from "@/lib/validations/auth";
import { requirePermission } from "@/lib/auth/session";
import { assignableRoles, canManageUser } from "@/lib/auth/roles";
import { getUserById, updateUserRoleLevel } from "@/data/users";
import type { AuthState } from "@/actions/auth/authState";

export async function updateUserRoleAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const session = await requirePermission("users:manage");

  const result = updateUserRoleSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: "Dados inválidos." };

  const { userId, roleLevel } = result.data;
  const actorLevel = session.user.roleLevel ?? 0;

  if (userId === session.user.id) {
    return { error: "Você não pode alterar o seu próprio cargo." };
  }

  if (!assignableRoles(actorLevel).some((r) => r.level === roleLevel)) {
    return { error: "Você não pode atribuir esse cargo." };
  }

  const target = await getUserById(userId);
  if (!target) return { error: "Usuário não encontrado." };

  if (!canManageUser(actorLevel, target.roleLevel)) {
    return { error: "Você não pode alterar este usuário." };
  }

  let updated: boolean;
  try {
    updated = await updateUserRoleLevel(userId, roleLevel, actorLevel);
  } catch {
    return { error: "Não foi possível alterar o cargo." };
  }

  if (!updated) {
    revalidatePath("/admin/users");
    return { error: "Você não pode alterar este usuário." };
  }

  revalidatePath("/admin/users");
  return { success: true };
}
