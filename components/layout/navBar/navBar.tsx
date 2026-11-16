import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { UserMenu } from "@/components/layout/userMenu/userMenu";
import styles from "./navBar.module.css";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { NAV_ROUTES } from "@/lib/auth/routesPermissions";
import logo from "@/assets/images/logo/logo.svg";

export async function NavBar() {
  const session = await getSession();
  const user = session?.user;

  const visibleLinks = NAV_ROUTES.filter(
    (link) => !link.permission || can(user?.roleLevel, link.permission),
  );

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={clsx(styles.container, "layout")}>
          <Link href="/" className={styles.home} aria-label="Página inicial">
            <Image
              src={logo}
              alt="Logo do projeto"
              className={styles.logo}
              priority
            />
          </Link>

          <ul className={styles.links}>
            {visibleLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.link}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.user}>
            {user ? (
              <UserMenu image={user.image} />
            ) : (
              <>
                <Link href="/login" className={styles.login}>
                  Entrar
                </Link>
                <Link href="/signUp" className={styles.signUp}>
                  Criar conta
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
