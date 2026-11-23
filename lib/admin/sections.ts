import type { Permission } from "@/lib/auth/roles";

export type AdminSection = {
  href: string;
  title: string;
  description: string;
  permission: Permission;
};

export const ADMIN_SECTIONS: readonly AdminSection[] = [
  {
    href: "/admin/users",
    title: "Usuários",
    description: "Busque membros e altere o cargo de cada um.",
    permission: "users:manage",
  },
  //   {
  //     href: "/admin/assessments",
  //     title: "Avaliações",
  //     description: "Busque e edite avaliações.",
  //     permission: "users:manage",
  //   },
];
