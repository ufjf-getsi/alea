import { redirect } from "next/navigation";

import AdminPage from "@/components/admin/adminPage/adminPage";
import Input from "@/components/ui/input/input";
import Button, { ButtonLink } from "@/components/ui/button/button";
import Pagination from "@/components/ui/pagination/pagination";
import { requirePermission } from "@/lib/auth/session";
import {
  assignableRoles,
  canManageUser,
  getRoleLabel,
  getRoleName,
  ROLE_LEVELS,
} from "@/lib/auth/roles";
import { buildHref } from "@/lib/url/buildHref";
import { ADMIN_PAGE_SIZE, listUsers } from "@/data/users";
import RoleForm from "@/components/admin/roleForm/roleForm";

import styles from "./page.module.css";

export const metadata = { title: "Usuários" };

const BASE_PATH = "/admin/users";

type SearchParams = Promise<{ page?: string; q?: string }>;

const usersHref = (query: string, page: number) =>
  buildHref(BASE_PATH, { q: query, page: page > 1 ? page : undefined });

export default function AdminUsersPage({
  searchParams,
}: Readonly<{ searchParams: SearchParams }>) {
  return (
    <AdminPage title="Usuários">
      <UsersSection searchParams={searchParams} />
    </AdminPage>
  );
}

async function UsersSection({
  searchParams,
}: Readonly<{ searchParams: SearchParams }>) {
  const session = await requirePermission("users:manage");
  const { page: pageParam, q = "" } = await searchParams;

  const query = q.trim().slice(0, 100);
  const requested = Math.max(1, Number.parseInt(pageParam ?? "", 10) || 1);

  const { users, total } = await listUsers({ page: requested, query });
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  if (requested > totalPages) redirect(usersHref(query, totalPages));

  const actorLevel = session.user.roleLevel;
  const options = assignableRoles(actorLevel);

  return (
    <>
      <form
        action={BASE_PATH}
        method="get"
        role="search"
        className={styles.search}
      >
        <Input
          label="Buscar usuário"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Nome ou email"
          maxLength={100}
          containerClassName={styles.searchField}
        />
        <Button type="submit">Buscar</Button>
        {query && (
          <ButtonLink href={BASE_PATH} variant="ghost">
            Limpar
          </ButtonLink>
        )}
      </form>

      <p className={styles.muted}>
        {total} {total === 1 ? "usuário" : "usuários"}
        {query && ` para “${query}”`}
      </p>

      {users.length === 0 ? (
        <p>Nenhum usuário encontrado.</p>
      ) : (
        <ul className={styles.list}>
          {users.map((u) => {
            const editable =
              u.id !== session.user.id &&
              canManageUser(actorLevel, u.roleLevel);

            return (
              <li key={u.id} className={styles.item}>
                <div className={styles.info}>
                  <strong>{u.name}</strong>
                  <span className={styles.muted}>{u.email}</span>
                  <span className={styles.muted}>
                    Criado em {u.createdAt.toLocaleDateString("pt-BR")}
                  </span>
                </div>

                {editable ? (
                  <RoleForm
                    key={u.roleLevel}
                    userId={u.id}
                    currentLevel={ROLE_LEVELS[getRoleName(u.roleLevel)]}
                    options={options}
                  />
                ) : (
                  <span className={styles.badge}>
                    {getRoleLabel(u.roleLevel)}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Pagination
        page={requested}
        totalPages={totalPages}
        hrefFor={(p) => usersHref(query, p)}
      />
    </>
  );
}
