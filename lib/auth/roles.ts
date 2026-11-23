export const ROLE_LEVELS = {
  USER: 10,
  EDITOR: 50,
  ADMIN: 90,
  SUPER_ADMIN: 100,
} as const;

export type RoleName = keyof typeof ROLE_LEVELS;
export type RoleLevel = (typeof ROLE_LEVELS)[RoleName];

export const ROLE_LABELS: Record<RoleName, string> = {
  USER: "Membro",
  EDITOR: "Editor",
  ADMIN: "Administrador",
  SUPER_ADMIN: "Presidente",
};

export const PERMISSIONS = {
  "protected-routes:view": ROLE_LEVELS.USER,
  "maps:view": ROLE_LEVELS.USER,
  "maps:edit": ROLE_LEVELS.USER,

  "teams:edit": ROLE_LEVELS.EDITOR,
  "schedule:edit": ROLE_LEVELS.EDITOR,

  "admin:access": ROLE_LEVELS.ADMIN,
  "users:manage": ROLE_LEVELS.ADMIN,

  "system:configure": ROLE_LEVELS.SUPER_ADMIN,
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasLevel(
  userLevel: number | null | undefined,
  requiredLevel: number,
): boolean {
  return (userLevel ?? 0) >= requiredLevel;
}

export function can(
  userLevel: number | null | undefined,
  permission: Permission,
): boolean {
  return hasLevel(userLevel, PERMISSIONS[permission]);
}

export function isValidRoleLevel(level: unknown): level is RoleLevel {
  return Object.values(ROLE_LEVELS).includes(level as RoleLevel);
}

export function getRoleName(level: number | null | undefined): RoleName {
  const entries = (Object.entries(ROLE_LEVELS) as [RoleName, number][]).sort(
    (a, b) => b[1] - a[1],
  );

  return entries.find(([, value]) => (level ?? 0) >= value)?.[0] ?? "USER";
}

export function getRoleLabel(level: number | null | undefined): string {
  return ROLE_LABELS[getRoleName(level)];
}

export function canManageUser(
  actorLevel: number | null | undefined,
  targetLevel: number | null | undefined,
): boolean {
  return (actorLevel ?? 0) > (targetLevel ?? 0);
}

export function assignableRoles(actorLevel: number | null | undefined) {
  return (Object.keys(ROLE_LEVELS) as RoleName[])
    .filter((name) => ROLE_LEVELS[name] < (actorLevel ?? 0))
    .map((name) => ({
      name,
      level: ROLE_LEVELS[name],
      label: ROLE_LABELS[name],
    }));
}
