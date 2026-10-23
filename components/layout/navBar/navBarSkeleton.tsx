import clsx from "clsx";
import styles from "./navBar.module.css";

export function NavBarSkeleton() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Carregando navegação">
        <div className={clsx(styles.container, "layout")}>
          <div
            className={clsx(styles.skeleton, styles.skeletonHome)}
            aria-hidden="true"
          />

          <ul className={styles.links} aria-hidden="true">
            {Array.from({ length: 3 }, (_, index) => (
              <li key={index}>
                <div className={clsx(styles.skeleton, styles.skeletonLink)} />
              </li>
            ))}
          </ul>

          <div className={styles.user} aria-hidden="true">
            <div className={clsx(styles.skeleton, styles.skeletonLogin)} />
          </div>
        </div>
      </nav>
    </header>
  );
}
