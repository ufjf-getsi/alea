import clsx from "clsx";
import Link from "next/link";
import { UserMenu } from "@/components/layout/userMenu/userMenu";
import styles from "./navBar.module.css";
import { getSession } from "@/lib/auth/requireSession";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/about", label: "Sobre" },
];

export async function NavBar() {
  const session = await getSession();
  const user = session?.user;

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={clsx(styles.container, "layout")}>
          <Link href="/" className={styles.home}>
            Home
          </Link>

          <ul className={styles.links}>
            {navLinks.map((link) => (
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
              <Link href="/login" className={styles.login}>
                Entrar
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
