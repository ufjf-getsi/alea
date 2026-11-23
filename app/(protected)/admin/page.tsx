import Link from "next/link";
import { LuChevronRight } from "react-icons/lu";

import AdminPage from "@/components/admin/adminPage/adminPage";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { ADMIN_SECTIONS } from "@/lib/admin/sections";

import styles from "./page.module.css";

export const metadata = { title: "Administração" };

export default function AdminPageRoot() {
  return (
    <AdminPage
      root
      title="Administração"
      description="O que você quer administrar?"
    >
      <Sections />
    </AdminPage>
  );
}

async function Sections() {
  const session = await requirePermission("admin:access");

  const sections = ADMIN_SECTIONS.filter((section) =>
    can(session.user.roleLevel, section.permission),
  );

  if (sections.length === 0) {
    return <p>Nenhuma área disponível para o seu cargo.</p>;
  }

  return (
    <ul className={styles.list}>
      {sections.map((section) => (
        <li key={section.href}>
          <Link href={section.href} className={styles.item}>
            <div className={styles.text}>
              <strong className={styles.title}>{section.title}</strong>
              <span className={styles.muted}>{section.description}</span>
            </div>
            <LuChevronRight
              className={styles.chevron}
              size={20}
              aria-hidden="true"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
