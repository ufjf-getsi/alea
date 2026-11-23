import Link from "next/link";
import { LuChevronRight } from "react-icons/lu";

import styles from "./breadcrumbs.module.css";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = Readonly<{
  items: readonly BreadcrumbItem[];
  className?: string;
}>;

export default function Breadcrumbs({ items, className }: Props) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Trilha de navegação"
      className={[styles.nav, className].filter(Boolean).join(" ")}
    >
      <ol className={styles.list}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;

          return (
            <li key={`${i}-${item.label}`} className={styles.item}>
              {isLast || !item.href ? (
                <span
                  className={styles.current}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              )}
              {!isLast && (
                <LuChevronRight
                  className={styles.separator}
                  size={14}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
