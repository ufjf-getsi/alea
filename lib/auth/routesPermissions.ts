import type { Permission } from "@/lib/auth/roles";

type RouteConfig = {
  path: string;
  access: "public" | "protected";
  permission?: Permission;
  navLabel?: string;
};

export const ROUTES = {
  home: {
    path: "/",
    access: "public",
    navLabel: "Home",
  },
  about: {
    path: "/about",
    access: "public",
    navLabel: "Sobre",
  },
  support: {
    path: "/support",
    access: "public",
    navLabel: "Suporte",
  },
  signUp: {
    path: "/signUp",
    access: "public",
  },
  login: {
    path: "/login",
    access: "public",
  },
  resetPassword: {
    path: "/resetPassword",
    access: "public",
  },
  maps: {
    path: "/maps",
    access: "protected",
    permission: "maps:view",
    navLabel: "Mapas",
  },
  profile: {
    path: "/profile",
    access: "protected",
    permission: "profile:view",
  },
  teams: {
    path: "/teams",
    access: "protected",
    permission: "teams:view",
    navLabel: "Equipes",
  },
  schedule: {
    path: "/schedule",
    access: "protected",
    permission: "schedule:view",
    navLabel: "Agenda",
  },
  admin: {
    path: "/admin",
    access: "protected",
    permission: "admin:access",
    navLabel: "Admin",
  },
} as const satisfies Record<string, RouteConfig>;

const routeList = Object.values(ROUTES);

export const PUBLIC_ROUTES = routeList
  .filter((route) => route.access === "public")
  .map((route) => route.path);

export const PROTECTED_ROUTES = routeList
  .filter(
    (
      route,
    ): route is (typeof routeList)[number] & {
      access: "protected";
      permission: Permission;
    } => route.access === "protected" && "permission" in route,
  )
  .map(({ path, permission }) => ({
    prefix: path,
    permission,
  }));

export const NAV_ROUTES = routeList
  .filter((route) => "navLabel" in route) //remove auth routes for navbar
  .map((route) => ({
    href: route.path,
    label: route.navLabel,
    ...("permission" in route ? { permission: route.permission } : {}),
  }));
